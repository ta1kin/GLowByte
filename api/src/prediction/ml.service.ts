import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { AppLogger } from '../common/logger/logger.service';

@Injectable()
export class MlService {
  private readonly logger = new AppLogger();
  private readonly CONTEXT = 'MlService';
  private readonly client: AxiosInstance;
  private readonly mlServiceUrl: string;

  constructor() {
    this.mlServiceUrl = process.env.ML_SERVICE_URL || 'http://localhost:8000';
    this.client = axios.create({
      baseURL: this.mlServiceUrl,
      timeout: 30000,
    });
  }

  async predict(shtabelId: number) {
    try {
      const response = await this.client.post('/predict', {
        shtabel_id: shtabelId,
      });

      return response.data;
    } catch (error) {
      this.logger.error(
        `ML Service prediction error for shtabel ${shtabelId}`,
        error.stack,
        this.CONTEXT,
      );
      throw error;
    }
  }

  async batchPredict(shtabelIds: number[]) {
    try {
      const response = await this.client.post('/predict/batch', {
        shtabel_ids: shtabelIds,
      });

      return response.data;
    } catch (error) {
      this.logger.error('ML Service batch prediction error', error.stack, this.CONTEXT);
      throw error;
    }
  }

  async getMetrics() {
    try {
      const response = await this.client.get('/metrics');
      return response.data;
    } catch (error) {
      this.logger.error('ML Service metrics error', error.stack, this.CONTEXT);
      throw error;
    }
  }

  async healthCheck() {
    try {
      const response = await this.client.get('/health');
      return response.data;
    } catch (error) {
      this.logger.error('ML Service health check error', error.stack, this.CONTEXT);
      return { status: 'unhealthy' };
    }
  }
}

