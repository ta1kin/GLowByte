import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';
import { AppLogger } from '../common/logger/logger.service';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis;
  private readonly logger = new AppLogger();

  constructor() {
    this.client = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD || undefined,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });

    this.client.on('error', (err) => {
      this.logger.error('Redis Client Error', err.stack, 'RedisService');
    });

    this.client.on('connect', () => {
      this.logger.log('Redis Client Connected', 'RedisService');
    });
  }

  async onModuleInit() {
    // Connection is established in constructor
  }

  async onModuleDestroy() {
    await this.client.quit();
  }

  async getKey(key: string): Promise<string | null> {
    return await this.client.get(key);
  }

  async setKey(key: string, value: string, ttl?: number): Promise<void> {
    if (ttl) {
      await this.client.setex(key, ttl, value);
    } else {
      await this.client.set(key, value);
    }
  }

  async deleteKey(key: string): Promise<number> {
    return await this.client.del(key);
  }

  async exists(key: string): Promise<boolean> {
    const result = await this.client.exists(key);
    return result === 1;
  }

  getClient(): Redis {
    return this.client;
  }
}

