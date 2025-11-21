import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { QueueService } from '../queue/queue.service';
import { AppLogger } from '../common/logger/logger.service';
import { successResponse, errorResponse } from '../common/helpers/api.response.helper';

@Injectable()
export class MlService {
  private readonly logger = new AppLogger();
  private readonly CONTEXT = 'MlService';

  constructor(
    private prisma: PrismaService,
    private queueService: QueueService,
  ) {}

  async trainModel(modelName: string, modelVersion: string, config?: any) {
    try {
      // Queue model training
      await this.queueService.publish('model.train', {
        modelName,
        modelVersion,
        config: config || {},
      });

      return successResponse(
        { modelName, modelVersion, queued: true },
        'Model training queued',
      );
    } catch (error) {
      this.logger.error('Error queuing model training', error.stack, this.CONTEXT);
      return errorResponse('Failed to queue model training', error);
    }
  }

  async getModels() {
    try {
      const models = await this.prisma.modelArtifact.findMany({
        orderBy: { createdAt: 'desc' },
      });

      return successResponse(models, 'Models retrieved');
    } catch (error) {
      this.logger.error('Error getting models', error.stack, this.CONTEXT);
      return errorResponse('Failed to get models', error);
    }
  }

  async getModelMetrics(modelName: string, limit = 10) {
    try {
      const metrics = await this.prisma.metric.findMany({
        where: { modelName },
        orderBy: { periodStart: 'desc' },
        take: limit,
      });

      return successResponse(metrics, 'Model metrics retrieved');
    } catch (error) {
      this.logger.error('Error getting model metrics', error.stack, this.CONTEXT);
      return errorResponse('Failed to get model metrics', error);
    }
  }
}

