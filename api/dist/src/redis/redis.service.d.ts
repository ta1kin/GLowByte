import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';
export declare class RedisService implements OnModuleInit, OnModuleDestroy {
    private client;
    private readonly logger;
    constructor();
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    getKey(key: string): Promise<string | null>;
    setKey(key: string, value: string, ttl?: number): Promise<void>;
    deleteKey(key: string): Promise<number>;
    exists(key: string): Promise<boolean>;
    getClient(): Redis;
}
