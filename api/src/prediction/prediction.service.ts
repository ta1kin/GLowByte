import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { QueueService } from '../queue/queue.service';
import { MlService } from './ml.service';
import { AppLogger } from '../common/logger/logger.service';
import { successResponse, errorResponse } from '../common/helpers/api.response.helper';

@Injectable()
export class PredictionService {
  private readonly logger = new AppLogger();
  private readonly CONTEXT = 'PredictionService';

  constructor(
    private prisma: PrismaService,
    private queueService: QueueService,
    private mlService: MlService,
  ) {}

  async getPredictions(shtabelId?: number, skladId?: number, limit = 100) {
    try {
      const predictions = await this.prisma.prediction.findMany({
        where: {
          ...(shtabelId && { shtabelId }),
          ...(skladId && { skladId }),
        },
        include: {
          shtabel: {
            include: {
              sklad: true,
            },
          },
        },
        orderBy: { ts: 'desc' },
        take: limit,
      });

      return successResponse(predictions, 'Predictions retrieved');
    } catch (error) {
      this.logger.error('Error getting predictions', error.stack, this.CONTEXT);
      return errorResponse('Failed to get predictions', error);
    }
  }

  async getPredictionById(id: number) {
    try {
      const prediction = await this.prisma.prediction.findUnique({
        where: { id },
        include: {
          shtabel: {
            include: {
              sklad: true,
            },
          },
        },
      });

      if (!prediction) {
        return errorResponse('Prediction not found');
      }

      return successResponse(prediction, 'Prediction retrieved');
    } catch (error) {
      this.logger.error('Error getting prediction', error.stack, this.CONTEXT);
      return errorResponse('Failed to get prediction', error);
    }
  }

  async createPrediction(shtabelId: number) {
    try {
      const stockpile = await this.prisma.shtabel.findUnique({
        where: { id: shtabelId },
        include: {
          sklad: true,
        },
      });

      if (!stockpile) {
        return errorResponse('Stockpile not found');
      }

      // Queue prediction for processing
      await this.queueService.publish('prediction.calculate', {
        shtabelId,
      });

      return successResponse(
        { shtabelId, queued: true },
        'Prediction queued for processing',
      );
    } catch (error) {
      this.logger.error('Error queuing prediction', error.stack, this.CONTEXT);
      return errorResponse('Failed to queue prediction', error);
    }
  }

  async batchPredict() {
    try {
      // Get all active stockpiles
      const stockpiles = await this.prisma.shtabel.findMany({
        where: { status: 'ACTIVE' },
      });

      // Queue predictions for processing
      await this.queueService.publish('prediction.batch', {
        shtabelIds: stockpiles.map((s) => s.id),
      });

      return successResponse(
        { queued: stockpiles.length },
        'Predictions queued for processing',
      );
    } catch (error) {
      this.logger.error('Error batch predicting', error.stack, this.CONTEXT);
      return errorResponse('Failed to queue predictions', error);
    }
  }
}

