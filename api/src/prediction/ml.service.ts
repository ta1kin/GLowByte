import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { AppLogger } from '../common/logger/logger.service';

@Injectable()
export class MlService {
  private readonly logger = new AppLogger();
  private readonly CONTEXT = 'MlService';
  private readonly client: AxiosInstance;
  private readonly mlServiceUrl: string;
  private readonly maxRetries: number;
  private readonly retryDelay: number;

  constructor() {
    this.mlServiceUrl = process.env.ML_SERVICE_URL || 'http://localhost:8000';
    this.maxRetries = parseInt(process.env.ML_SERVICE_MAX_RETRIES || '3', 10);
    this.retryDelay = parseInt(process.env.ML_SERVICE_RETRY_DELAY || '1000', 10);
    
    this.client = axios.create({
      baseURL: this.mlServiceUrl,
      timeout: 60000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
          this.logger.error(
            `ML Service request timeout: ${error.config?.url}`,
            error.stack,
            this.CONTEXT
          );
          throw new Error(`ML Service request timeout after ${error.config?.timeout}ms`);
        }
        throw error;
      }
    );
  }

  /**
   * Механизм повторных попыток с экспоненциальной задержкой
   */
  private async retryWithBackoff<T>(
    fn: () => Promise<T>,
    operationName: string
  ): Promise<T> {
    let lastError: Error | unknown;
    
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        
        if (axios.isAxiosError(error) && error.response?.status && error.response.status >= 400 && error.response.status < 500) {
          this.logger.warn(
            `ML Service ${operationName} завершился ошибкой клиента (${error.response.status}), повтор не выполняется`,
            this.CONTEXT,
            { status: error.response.status, statusText: error.response.statusText }
          );
          throw error;
        }
        
        if (attempt === this.maxRetries) {
          this.logger.error(
            `ML Service ${operationName} завершился ошибкой после ${this.maxRetries} попыток`,
            error instanceof Error ? error.stack : String(error),
            this.CONTEXT,
            { attempts: attempt + 1 }
          );
          throw error;
        }
        
        const delay = this.retryDelay * Math.pow(2, attempt);
        
        this.logger.warn(
          `ML Service ${operationName} завершился ошибкой, повтор через ${delay}ms (попытка ${attempt + 1}/${this.maxRetries})`,
          this.CONTEXT,
          { 
            attempt: attempt + 1,
            maxRetries: this.maxRetries,
            delay,
            error: error instanceof Error ? error.message : String(error)
          }
        );
        
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError;
  }

  async predict(shtabelId: number, horizonDays?: number) {
    return this.retryWithBackoff(
      async () => {
        const response = await this.client.post('/predict', {
          shtabel_id: shtabelId,
          horizon_days: horizonDays || 7,
        });
        return response.data;
      },
      `predict for shtabel ${shtabelId}`
    );
  }

  async batchPredict(shtabelIds: number[]) {
    return this.retryWithBackoff(
      async () => {
        const response = await this.client.post('/predict/batch', {
          shtabel_ids: shtabelIds,
        });
        return response.data;
      },
      `batchPredict for ${shtabelIds.length} stockpiles`
    );
  }

  async getMetrics() {
    return this.retryWithBackoff(
      async () => {
        const response = await this.client.get('/metrics');
        return response.data;
      },
      'getMetrics'
    );
  }

  async healthCheck() {
    try {
      const response = await this.client.get('/health');
      return response.data;
    } catch (error) {
      this.logger.error(
        'ML Service health check error',
        error instanceof Error ? error.stack : String(error),
        this.CONTEXT
      );
      return { status: 'unhealthy' };
    }
  }
}

