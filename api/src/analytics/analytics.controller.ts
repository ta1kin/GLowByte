import { Controller, Get, Query, ParseIntPipe } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger'
import { AnalyticsService } from './analytics.service'

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
		)
	}

	@Get('accuracy')
	@ApiOperation({ summary: 'Get prediction accuracy statistics' })
	async getPredictionAccuracy() {
		return this.analyticsService.getPredictionAccuracy()
	}

	@Get('dashboard')
	@ApiOperation({ summary: 'Get dashboard statistics' })
	async getDashboardStats() {
		return this.analyticsService.getDashboardStats()
	}

	@Get('risk-distribution')
	@ApiOperation({ summary: 'Get risk level distribution for last 30 days' })
	async getRiskDistribution() {
		return this.analyticsService.getRiskDistribution()
	}

	@Get('temperature-trends')
	@ApiOperation({ summary: 'Get temperature trends' })
	@ApiQuery({ name: 'shtabelId', required: false, type: Number })
	@ApiQuery({ name: 'days', required: false, type: Number })
	async getTemperatureTrends(
		@Query('shtabelId') shtabelId?: number,
		@Query('days') days?: number,
	) {
		return this.analyticsService.getTemperatureTrends(
			shtabelId ? parseInt(shtabelId.toString()) : undefined,
			days ? parseInt(days.toString()) : 30,
		)
	}
}

