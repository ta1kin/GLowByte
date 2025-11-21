import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import * as amqp from 'amqplib'
import { AppLogger } from '../common/logger/logger.service'

@Injectable()
export class QueueService implements OnModuleInit, OnModuleDestroy {
	private connection: any = null
	private channel: any = null
	private readonly logger = new AppLogger()
	private readonly CONTEXT = 'QueueService'
	private readonly rabbitmqUrl =
		process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672'

	async onModuleInit() {
		try {
			this.connection = await amqp.connect(this.rabbitmqUrl)
			this.channel = await this.connection.createChannel()
			this.logger.log('RabbitMQ connected', this.CONTEXT)

			// Setup exchanges and queues
			await this.setupExchanges()
			await this.setupQueues()
		} catch (error: any) {
			this.logger.error(
				'Failed to connect to RabbitMQ',
				error?.stack || String(error),
				this.CONTEXT
			)
		}
	}

	async onModuleDestroy() {
		try {
			if (this.channel) {
				await this.channel.close()
			}
			if (this.connection) {
				await this.connection.close()
			}
		} catch (error: any) {
			this.logger.error(
				'Error closing RabbitMQ connection',
				error?.stack || String(error),
				this.CONTEXT
			)
		}
	}

	private async setupExchanges() {
		if (!this.channel) {
			throw new Error('Channel not initialized')
		}

		// Main exchange for routing
		await this.channel.assertExchange('coalfire', 'direct', {
			durable: true,
		})

		// Dead letter exchange for failed messages
		await this.channel.assertExchange('coalfire.dlx', 'direct', {
			durable: true,
		})

		this.logger.log('Exchanges declared', this.CONTEXT)
	}

	private async setupQueues() {
		if (!this.channel) {
			throw new Error('Channel not initialized')
		}

		const queues = [
			{
				name: 'data.import',
				exchange: 'coalfire',
				routingKey: 'data.import',
				options: {
					durable: true,
					arguments: {
						'x-dead-letter-exchange': 'coalfire.dlx',
						'x-dead-letter-routing-key': 'data.import.failed',
						'x-message-ttl': 3600000, // 1 hour
					},
				},
			},
			{
				name: 'prediction.calculate',
				exchange: 'coalfire',
				routingKey: 'prediction.calculate',
				options: {
					durable: true,
					arguments: {
						'x-dead-letter-exchange': 'coalfire.dlx',
						'x-dead-letter-routing-key': 'prediction.calculate.failed',
						'x-message-ttl': 1800000, // 30 minutes
					},
				},
			},
			{
				name: 'prediction.batch',
				exchange: 'coalfire',
				routingKey: 'prediction.batch',
				options: {
					durable: true,
					arguments: {
						'x-dead-letter-exchange': 'coalfire.dlx',
						'x-dead-letter-routing-key': 'prediction.batch.failed',
						'x-message-ttl': 3600000, // 1 hour
					},
				},
			},
			{
				name: 'model.train',
				exchange: 'coalfire',
				routingKey: 'model.train',
				options: {
					durable: true,
					arguments: {
						'x-dead-letter-exchange': 'coalfire.dlx',
						'x-dead-letter-routing-key': 'model.train.failed',
						'x-message-ttl': 7200000, // 2 hours
					},
				},
			},
			// Dead letter queues
			{
				name: 'data.import.failed',
				exchange: 'coalfire.dlx',
				routingKey: 'data.import.failed',
				options: { durable: true },
			},
			{
				name: 'prediction.calculate.failed',
				exchange: 'coalfire.dlx',
				routingKey: 'prediction.calculate.failed',
				options: { durable: true },
			},
			{
				name: 'prediction.batch.failed',
				exchange: 'coalfire.dlx',
				routingKey: 'prediction.batch.failed',
				options: { durable: true },
			},
			{
				name: 'model.train.failed',
				exchange: 'coalfire.dlx',
				routingKey: 'model.train.failed',
				options: { durable: true },
			},
		]

		for (const queueConfig of queues) {
			await this.channel.assertQueue(queueConfig.name, queueConfig.options)
			await this.channel.bindQueue(
				queueConfig.name,
				queueConfig.exchange,
				queueConfig.routingKey
			)
			this.logger.log(
				`Queue declared and bound: ${queueConfig.name}`,
				this.CONTEXT
			)
		}
	}

	async publish(
		routingKey: string,
		message: any,
		options?: amqp.Options.Publish
	): Promise<boolean> {
		if (!this.channel) {
			this.logger.error('Channel not initialized', '', this.CONTEXT)
			return false
		}

		try {
			const messageBuffer = Buffer.from(JSON.stringify(message))
			return this.channel.publish('coalfire', routingKey, messageBuffer, {
				persistent: true,
				...options,
			})
		} catch (error: any) {
			this.logger.error(
				`Failed to publish message to ${routingKey}`,
				error?.stack || String(error),
				this.CONTEXT
			)
			return false
		}
	}

	async consume(
		queue: string,
		callback: (message: any, msg: amqp.ConsumeMessage) => Promise<void>,
		options?: amqp.Options.Consume
	): Promise<void> {
		if (!this.channel) {
			throw new Error('Channel not initialized')
		}

		// Устанавливаем prefetch для ограничения одновременной обработки
		await this.channel.prefetch(10)

		await this.channel.consume(
			queue,
			async (msg: amqp.ConsumeMessage | null) => {
				if (msg && this.channel) {
					try {
						const content = JSON.parse(msg.content.toString())
						await callback(content, msg)
						this.channel.ack(msg)
					} catch (error: any) {
						this.logger.error(
							`Error processing message from ${queue}`,
							error?.stack || String(error),
							this.CONTEXT,
							{ error, queue }
						)
						// Reject and requeue (up to max retries)
						const retryCount =
							(msg.properties.headers?.['x-retry-count'] as number) || 0
						if (retryCount < 3) {
							// Увеличиваем счетчик попыток
							const headers = {
								...msg.properties.headers,
								'x-retry-count': retryCount + 1,
							}
							// Requeue с обновленными headers
							this.channel.publish(
								'coalfire',
								queue.replace('.failed', ''),
								msg.content,
								{ headers, persistent: true }
							)
							this.channel.ack(msg) // Подтверждаем оригинальное сообщение
						} else {
							this.logger.warn(
								`Message sent to DLQ after ${retryCount} retries`,
								this.CONTEXT,
								{ queue, retryCount }
							)
							this.channel.nack(msg, false, false) // Send to DLQ
						}
					}
				}
			},
			{
				noAck: false,
				...options,
			}
		)
	}

	getChannel(): any {
		return this.channel
	}

	getConnection(): any {
		return this.connection
	}
}
