import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import {
	errorResponse,
	successResponse,
} from '../common/helpers/api.response.helper'
import { AppLogger } from '../common/logger/logger.service'

@Injectable()
export class AnalyticsService {
	private readonly logger = new AppLogger()
	private readonly CONTEXT = 'AnalyticsService'

	constructor(private prisma: PrismaService) {}

	async getModelMetrics(modelName?: string, periodDays = 30) {
		try {
			const endDate = new Date()
			const startDate = new Date()
			startDate.setDate(startDate.getDate() - periodDays)

			const metrics = await this.prisma.metric.findMany({
				where: {
					...(modelName && { modelName }),
					periodStart: {
						gte: startDate,
					},
				},
				orderBy: { periodStart: 'desc' },
			})

			return successResponse(metrics, 'Model metrics retrieved')
		} catch (error) {
			this.logger.error(
				'Error getting model metrics',
				error instanceof Error ? error.stack : String(error),
				this.CONTEXT
			)
			return errorResponse('Failed to get model metrics', error)
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
					riskLevel: true,
					modelName: true,
				},
			})

			const total = predictions.length
			const accurate = predictions.filter(
				(p: { isAccurate: boolean | null }) => p.isAccurate
			).length
			const accuracy = total > 0 ? accurate / total : 0

			const byRiskLevel = predictions.reduce(
				(
					acc: Record<string, { total: number; accurate: number }>,
					p: { riskLevel: string | null; isAccurate: boolean | null }
				) => {
					const level = p.riskLevel || 'UNKNOWN'
					if (!acc[level]) {
						acc[level] = { total: 0, accurate: 0 }
					}
					acc[level].total++
					if (p.isAccurate) acc[level].accurate++
					return acc
				},
				{} as Record<string, { total: number; accurate: number }>
			)

			const byModel = predictions.reduce(
				(
					acc: Record<string, { total: number; accurate: number }>,
					p: { modelName: string | null; isAccurate: boolean | null }
				) => {
					const model = p.modelName || 'UNKNOWN'
					if (!acc[model]) {
						acc[model] = { total: 0, accurate: 0 }
					}
					acc[model].total++
					if (p.isAccurate) acc[model].accurate++
					return acc
				},
				{} as Record<string, { total: number; accurate: number }>
			)

			return successResponse(
				{
					total,
					accurate,
					accuracy,
					accuracyPercent: (accuracy * 100).toFixed(2),
					byRiskLevel: (
						Object.entries(byRiskLevel) as [
							string,
							{ total: number; accurate: number },
						][]
					).map(([level, data]) => ({
						riskLevel: level,
						total: data.total,
						accurate: data.accurate,
						accuracy: data.total > 0 ? (data.accurate / data.total) * 100 : 0,
					})),
					byModel: (
						Object.entries(byModel) as [
							string,
							{ total: number; accurate: number },
						][]
					).map(([model, data]) => ({
						modelName: model,
						total: data.total,
						accurate: data.accurate,
						accuracy: data.total > 0 ? (data.accurate / data.total) * 100 : 0,
					})),
				},
				'Prediction accuracy calculated'
			)
		} catch (error) {
			this.logger.error(
				'Error calculating accuracy',
				error instanceof Error ? error.stack : String(error),
				this.CONTEXT
			)
			return errorResponse('Failed to calculate accuracy', error)
		}
	}

	async getDashboardStats() {
		try {
			const [
				totalStockpiles,
				activeStockpiles,
				totalPredictions,
				criticalPredictions,
				highPredictions,
				totalFires,
				recentFires,
				totalSklads,
			] = await Promise.all([
				this.prisma.shtabel.count(),
				this.prisma.shtabel.count({ where: { status: 'ACTIVE' } }),
				this.prisma.prediction.count(),
				this.prisma.prediction.count({ where: { riskLevel: 'CRITICAL' } }),
				this.prisma.prediction.count({ where: { riskLevel: 'HIGH' } }),
				this.prisma.fireRecord.count(),
				this.prisma.fireRecord.count({
					where: {
						startDate: {
							gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
						},
					},
				}),
				this.prisma.sklad.count(),
			])

			const recentPredictions = await this.prisma.prediction.findMany({
				where: {
					ts: {
						gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
					},
				},
				orderBy: { ts: 'desc' },
				take: 10,
				include: {
					shtabel: {
						include: {
							sklad: true,
						},
					},
				},
			})

			return successResponse(
				{
					stockpiles: {
						total: totalStockpiles,
						active: activeStockpiles,
					},
					sklads: {
						total: totalSklads,
					},
					predictions: {
						total: totalPredictions,
						critical: criticalPredictions,
						high: highPredictions,
						recent: recentPredictions,
					},
					fires: {
						total: totalFires,
						recent: recentFires,
					},
				},
				'Dashboard stats retrieved'
			)
		} catch (error) {
			this.logger.error(
				'Error getting dashboard stats',
				error instanceof Error ? error.stack : String(error),
				this.CONTEXT
			)
			return errorResponse('Failed to get dashboard stats', error)
		}
	}

	async getRiskDistribution() {
		try {
			const predictions = await this.prisma.prediction.findMany({
				where: {
					ts: {
						gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
					},
				},
				select: {
					riskLevel: true,
				},
			})

			const distribution = predictions.reduce(
				(acc: Record<string, number>, p: { riskLevel: string | null }) => {
					const level = p.riskLevel || 'UNKNOWN'
					acc[level] = (acc[level] || 0) + 1
					return acc
				},
				{} as Record<string, number>
			)

			return successResponse(distribution, 'Risk distribution retrieved')
		} catch (error) {
			this.logger.error(
				'Error getting risk distribution',
				error instanceof Error ? error.stack : String(error),
				this.CONTEXT
			)
			return errorResponse('Failed to get risk distribution', error)
		}
	}

	async getTemperatureTrends(shtabelId?: number, days = 30) {
		try {
			const startDate = new Date()
			startDate.setDate(startDate.getDate() - days)

			const temps = await this.prisma.tempRecord.findMany({
				where: {
					...(shtabelId && { shtabelId }),
					recordDate: {
						gte: startDate,
					},
				},
				orderBy: { recordDate: 'asc' },
				select: {
					maxTemp: true,
					recordDate: true,
					shtabelId: true,
					riskLevel: true,
				},
			})

			type TrendData = {
				date: string
				count: number
				avgTemp: number
				maxTemp: number
				criticalCount: number
			}

			const trends = temps.reduce(
				(
					acc: Record<string, TrendData>,
					temp: {
						recordDate: Date
						maxTemp: number | null
						riskLevel: string | null
					}
				) => {
					const date = temp.recordDate.toISOString().split('T')[0]
					if (!acc[date]) {
						acc[date] = {
							date,
							count: 0,
							avgTemp: 0,
							maxTemp: 0,
							criticalCount: 0,
						}
					}
					acc[date].count++
					acc[date].avgTemp += temp.maxTemp || 0
					acc[date].maxTemp = Math.max(acc[date].maxTemp, temp.maxTemp || 0)
					if (temp.riskLevel === 'CRITICAL') acc[date].criticalCount++
					return acc
				},
				{} as Record<string, TrendData>
			)

			const trendsArray: TrendData[] = Object.values(trends)
			trendsArray.forEach(trend => {
				trend.avgTemp = trend.avgTemp / trend.count
			})

			return successResponse(
				{
					trends: trendsArray,
					totalRecords: temps.length,
				},
				'Temperature trends retrieved'
			)
		} catch (error) {
			this.logger.error(
				'Error getting temperature trends',
				error instanceof Error ? error.stack : String(error),
				this.CONTEXT
			)
			return errorResponse('Failed to get temperature trends', error)
		}
	}
}
