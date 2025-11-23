import { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import * as amqp from 'amqplib';
export declare class QueueService implements OnModuleInit, OnModuleDestroy {
    private connection;
    private channel;
    private readonly logger;
    private readonly CONTEXT;
    private readonly rabbitmqUrl;
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    private setupExchanges;
    private setupQueues;
    publish(routingKey: string, message: any, options?: amqp.Options.Publish): Promise<boolean>;
    consume(queue: string, callback: (message: any, msg: amqp.ConsumeMessage) => Promise<void>, options?: amqp.Options.Consume): Promise<void>;
    getChannel(): any;
    getConnection(): any;
}
