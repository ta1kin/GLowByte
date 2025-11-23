"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueueService = void 0;
const common_1 = require("@nestjs/common");
const amqp = __importStar(require("amqplib"));
const logger_service_1 = require("../common/logger/logger.service");
let QueueService = class QueueService {
    connection = null;
    channel = null;
    logger = new logger_service_1.AppLogger();
    CONTEXT = 'QueueService';
    rabbitmqUrl = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';
    async onModuleInit() {
        try {
            let retries = 5;
            let delay = 1000;
            while (retries > 0) {
                try {
                    this.connection = await amqp.connect(this.rabbitmqUrl);
                    this.channel = await this.connection.createChannel();
                    this.logger.log('RabbitMQ connected', this.CONTEXT);
                    await this.setupExchanges();
                    await this.setupQueues();
                    return;
                }
                catch (error) {
                    retries--;
                    if (retries === 0) {
                        throw error;
                    }
                    this.logger.log(`RabbitMQ connection failed, retrying in ${delay}ms... (${retries} retries left)`, this.CONTEXT);
                    await new Promise(resolve => setTimeout(resolve, delay));
                    delay *= 2;
                }
            }
        }
        catch (error) {
            this.logger.error('Failed to connect to RabbitMQ after retries', error?.stack || String(error), this.CONTEXT);
        }
    }
    async onModuleDestroy() {
        try {
            if (this.channel) {
                await this.channel.close();
            }
            if (this.connection) {
                await this.connection.close();
            }
        }
        catch (error) {
            this.logger.error('Error closing RabbitMQ connection', error?.stack || String(error), this.CONTEXT);
        }
    }
    async setupExchanges() {
        if (!this.channel) {
            throw new Error('Channel not initialized');
        }
        await this.channel.assertExchange('coalfire', 'direct', {
            durable: true,
        });
        await this.channel.assertExchange('coalfire.dlx', 'direct', {
            durable: true,
        });
        this.logger.log('Exchanges declared', this.CONTEXT);
    }
    async setupQueues() {
        if (!this.channel) {
            throw new Error('Channel not initialized');
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
        ];
        for (const queueConfig of queues) {
            await this.channel.assertQueue(queueConfig.name, queueConfig.options);
            await this.channel.bindQueue(queueConfig.name, queueConfig.exchange, queueConfig.routingKey);
            this.logger.log(`Queue declared and bound: ${queueConfig.name}`, this.CONTEXT);
        }
    }
    async publish(routingKey, message, options) {
        if (!this.channel) {
            this.logger.error('Channel not initialized', '', this.CONTEXT);
            return false;
        }
        try {
            const messageBuffer = Buffer.from(JSON.stringify(message));
            return this.channel.publish('coalfire', routingKey, messageBuffer, {
                persistent: true,
                ...options,
            });
        }
        catch (error) {
            this.logger.error(`Failed to publish message to ${routingKey}`, error?.stack || String(error), this.CONTEXT);
            return false;
        }
    }
    async consume(queue, callback, options) {
        let retries = 30;
        while (!this.channel && retries > 0) {
            await new Promise(resolve => setTimeout(resolve, 500));
            retries--;
        }
        if (!this.channel) {
            this.logger.error('Channel not initialized after waiting', '', this.CONTEXT, { queue });
            throw new Error('Channel not initialized');
        }
        await this.channel.prefetch(10);
        await this.channel.consume(queue, async (msg) => {
            if (msg && this.channel) {
                try {
                    const content = JSON.parse(msg.content.toString());
                    await callback(content, msg);
                    this.channel.ack(msg);
                }
                catch (error) {
                    this.logger.error(`Error processing message from ${queue}`, error?.stack || String(error), this.CONTEXT, { error, queue });
                    const retryCount = msg.properties.headers?.['x-retry-count'] || 0;
                    if (retryCount < 3) {
                        const headers = {
                            ...msg.properties.headers,
                            'x-retry-count': retryCount + 1,
                        };
                        this.channel.publish('coalfire', queue.replace('.failed', ''), msg.content, { headers, persistent: true });
                        this.channel.ack(msg);
                    }
                    else {
                        this.logger.warn(`Message sent to DLQ after ${retryCount} retries`, this.CONTEXT, { queue, retryCount });
                        this.channel.nack(msg, false, false);
                    }
                }
            }
        }, {
            noAck: false,
            ...options,
        });
    }
    getChannel() {
        return this.channel;
    }
    getConnection() {
        return this.connection;
    }
};
exports.QueueService = QueueService;
exports.QueueService = QueueService = __decorate([
    (0, common_1.Injectable)()
], QueueService);
//# sourceMappingURL=queue.service.js.map