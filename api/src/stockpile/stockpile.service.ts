import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AppLogger } from '../common/logger/logger.service';
import { successResponse, errorResponse } from '../common/helpers/api.response.helper';

@Injectable()
export class StockpileService {
  private readonly logger = new AppLogger();
  private readonly CONTEXT = 'StockpileService';

  constructor(private prisma: PrismaService) {}

  async getStockpiles(skladId?: number, status?: string) {
    try {
      const stockpiles = await this.prisma.shtabel.findMany({
        where: {
          ...(skladId && { skladId }),
          ...(status && { status: status as any }),
        },
        include: {
          sklad: true,
          temps: {
            orderBy: { recordDate: 'desc' },
            take: 1,
          },
          predictions: {
            orderBy: { ts: 'desc' },
            take: 1,
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return successResponse(stockpiles, 'Stockpiles retrieved');
    } catch (error) {
      this.logger.error('Error getting stockpiles', error.stack, this.CONTEXT);
      return errorResponse('Failed to get stockpiles', error);
    }
  }

  async getStockpileById(id: number) {
    try {
      const stockpile = await this.prisma.shtabel.findUnique({
        where: { id },
        include: {
          sklad: true,
          supplies: {
            orderBy: { dateIn: 'desc' },
          },
          temps: {
            orderBy: { recordDate: 'desc' },
            take: 50,
          },
          predictions: {
            orderBy: { ts: 'desc' },
          },
          fires: true,
        },
      });

      if (!stockpile) {
        return errorResponse('Stockpile not found');
      }

      return successResponse(stockpile, 'Stockpile retrieved');
    } catch (error) {
      this.logger.error('Error getting stockpile', error.stack, this.CONTEXT);
      return errorResponse('Failed to get stockpile', error);
    }
  }

  async getStockpileTemperatureHistory(shtabelId: number, days = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const temps = await this.prisma.tempRecord.findMany({
        where: {
          shtabelId,
          recordDate: {
            gte: startDate,
          },
        },
        orderBy: { recordDate: 'asc' },
      });

      return successResponse(temps, 'Temperature history retrieved');
    } catch (error) {
      this.logger.error('Error getting temperature history', error.stack, this.CONTEXT);
      return errorResponse('Failed to get temperature history', error);
    }
  }
}

