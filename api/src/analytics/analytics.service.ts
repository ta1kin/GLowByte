import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AppLogger } from '../common/logger/logger.service';
import { successResponse, errorResponse } from '../common/helpers/api.response.helper';

@Injectable()
export class AnalyticsService {
  private readonly logger = new AppLogger();
  private readonly CONTEXT = 'AnalyticsService';

  constructor(private prisma: PrismaService) {}

  async getModelMetrics(modelName?: string, periodDays = 30) {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - periodDays);

      const metrics = await this.prisma.metric.findMany({
        where: {
          ...(modelName && { modelName }),
          periodStart: {
            gte: startDate,
          },
        },
        orderBy: { periodStart: 'desc' },
      });

      return successResponse(metrics, 'Model metrics retrieved');
    } catch (error) {
      this.logger.error('Error getting model metrics', error.stack, this.CONTEXT);
      return errorResponse('Failed to get model metrics', error);
    }
  }

  async getPredictionAccuracy() {
    try {
      const predictions = await this.prisma.prediction.findMany({
        where: {
          actualFireDate: { not: null },
          accuracy_days: { not: null },
        },
        select: {
          accuracy_days: true,
          isAccurate: true,
        },
      });

      const total = predictions.length;
      const accurate = predictions.filter((p) => p.isAccurate).length;
      const accuracy = total > 0 ? accurate / total : 0;

      return successResponse(
        {
          total,
          accurate,
          accuracy,
          accuracyPercent: (accuracy * 100).toFixed(2),
        },
        'Prediction accuracy calculated',
      );
    } catch (error) {
      this.logger.error('Error calculating accuracy', error.stack, this.CONTEXT);
      return errorResponse('Failed to calculate accuracy', error);
    }
  }

  async getDashboardStats() {
    try {
      const [
        totalStockpiles,
        activeStockpiles,
        totalPredictions,
        criticalPredictions,
        totalFires,
      ] = await Promise.all([
        this.prisma.shtabel.count(),
        this.prisma.shtabel.count({ where: { status: 'ACTIVE' } }),
        this.prisma.prediction.count(),
        this.prisma.prediction.count({ where: { riskLevel: 'CRITICAL' } }),
        this.prisma.fireRecord.count(),
      ]);

      return successResponse(
        {
          stockpiles: {
            total: totalStockpiles,
            active: activeStockpiles,
          },
          predictions: {
            total: totalPredictions,
            critical: criticalPredictions,
          },
          fires: {
            total: totalFires,
          },
        },
        'Dashboard stats retrieved',
      );
    } catch (error) {
      this.logger.error('Error getting dashboard stats', error.stack, this.CONTEXT);
      return errorResponse('Failed to get dashboard stats', error);
    }
  }
}

