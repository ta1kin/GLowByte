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
			let retries = 5
			let delay = 1000
			while (retries > 0) {
				try {
					this.connection = await amqp.connect(this.rabbitmqUrl)
					this.channel = await this.connection.createChannel()
					this.logger.log('RabbitMQ подключен', this.CONTEXT)

					await this.setupExchanges()
					await this.setupQueues()
					return
				} catch (error: any) {
					retries--
					if (retries === 0) {
						throw error
					}
					this.logger.log(
						`Ошибка подключения к RabbitMQ, повтор через ${delay}ms... (осталось попыток: ${retries})`,
						this.CONTEXT
					)
					await new Promise(resolve => setTimeout(resolve, delay))
					delay *= 2
				}
			}
		} catch (error: any) {
			this.logger.error(
				'Не удалось подключиться к RabbitMQ после всех попыток',
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
				'Ошибка при закрытии подключения к RabbitMQ',
				error?.stack || String(error),
				this.CONTEXT
			)
		}
	}

	private async setupExchanges() {
		if (!this.channel) {
			throw new Error('Channel not initialized')
		}

		await this.channel.assertExchange('coalfire', 'direct', {
			durable: true,
		})

		await this.channel.assertExchange('coalfire.dlx', 'direct', {
			durable: true,
		})

		this.logger.log('Exchange объявлены', this.CONTEXT)
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
						'x-message-ttl': 3600000,
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
						'x-message-ttl': 1800000,
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
						'x-message-ttl': 3600000,
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
						'x-message-ttl': 7200000,
					},
				},
			},
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
				`Очередь объявлена и привязана: ${queueConfig.name}`,
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
			this.logger.error('Канал не инициализирован', '', this.CONTEXT)
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
				`Не удалось опубликовать сообщение в ${routingKey}`,
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
		let retries = 30
		while (!this.channel && retries > 0) {
			await new Promise(resolve => setTimeout(resolve, 500))
			retries--
		}

		if (!this.channel) {
			this.logger.error(
				'Канал не инициализирован после ожидания',
				'',
				this.CONTEXT,
				{ queue }
			)
			throw new Error('Канал не инициализирован')
		}

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
							`Ошибка обработки сообщения из ${queue}`,
							error?.stack || String(error),
							this.CONTEXT,
							{ error, queue }
						)
						const retryCount =
							(msg.properties.headers?.['x-retry-count'] as number) || 0
						if (retryCount < 3) {
							const headers = {
								...(msg.properties.headers || {}),
								'x-retry-count': retryCount + 1,
							}
							const routingKey = queue.endsWith('.failed') 
								? queue.replace('.failed', '')
								: queue
							
							this.channel.publish(
								'coalfire',
								routingKey,
								msg.content,
								{ 
									headers, 
									persistent: true,
									expiration: String(5000 * (retryCount + 1))
								}
							)
							this.channel.ack(msg)
							this.logger.warn(
								`Сообщение возвращено в очередь (попытка ${retryCount + 1}/3)`,
								this.CONTEXT,
								{ queue, retryCount: retryCount + 1 }
							)
						} else {
							this.logger.warn(
								`Сообщение отправлено в DLQ после ${retryCount} попыток`,
								this.CONTEXT,
								{ queue, retryCount }
							)
							this.channel.nack(msg, false, false)
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
