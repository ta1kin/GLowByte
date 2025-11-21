import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';

@ApiTags('Analytics')
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('metrics')
  @ApiOperation({ summary: 'Get model metrics' })
  @ApiQuery({ name: 'modelName', required: false, type: String })
  @ApiQuery({ name: 'periodDays', required: false, type: Number })
  async getModelMetrics(
    @Query('modelName') modelName?: string,
    @Query('periodDays') periodDays?: number,
  ) {
    return this.analyticsService.getModelMetrics(
      modelName,
      periodDays ? parseInt(periodDays.toString()) : 30,
    );
  }

  @Get('accuracy')
  @ApiOperation({ summary: 'Get prediction accuracy statistics' })
  async getPredictionAccuracy() {
    return this.analyticsService.getPredictionAccuracy();
  }

  @Get('dashboard')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  async getDashboardStats() {
    return this.analyticsService.getDashboardStats();
  }
}

