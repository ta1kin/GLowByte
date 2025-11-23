import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../../../prisma/prisma.service'
import { AppLogger } from '../../../common/logger/logger.service'
import { NotificationService } from '../../../notification/notification.service'
import { MlService } from '../../../prediction/ml.service'

@Injectable()
export class PredictionProcessor {
	private readonly logger = new AppLogger()
	private readonly CONTEXT = 'PredictionProcessor'

	constructor(
		private prisma: PrismaService,
		private mlService: MlService,
		private notificationService: NotificationService
	) {}

	async processPrediction(
		shtabelId: number,
		horizonDays?: number
	): Promise<void> {
		try {
			const stockpile = await this.prisma.shtabel.findUnique({
				where: { id: shtabelId },
				include: {
					sklad: true,
				},
			})

			if (!stockpile) {
				throw new Error(`Штабель не найден: ${shtabelId}`)
			}

			if (stockpile.status !== 'ACTIVE') {
				this.logger.warn(
					`Пропуск прогноза для неактивного штабеля: ${shtabelId}`,
					this.CONTEXT
				)
				return
			}

			const prediction = await this.mlService.predict(shtabelId, horizonDays)

			const saved = await this.prisma.prediction.create({
				data: {
					ts: new Date(),
					skladId: stockpile.skladId,
					shtabelId,
					modelName: prediction.model_name || 'xgboost_v1',
					modelVersion: prediction.model_version,
					predictedDate: prediction.predicted_date
						? new Date(prediction.predicted_date)
						: null,
					probEvent: prediction.prob_event,
					riskLevel: prediction.risk_level,
					horizonDays: prediction.horizon_days || 7,
					intervalLow: prediction.interval_low
						? new Date(prediction.interval_low)
						: null,
					intervalHigh: prediction.interval_high
						? new Date(prediction.interval_high)
						: null,
					confidence: prediction.confidence,
					meta: prediction.meta,
				},
			})

			if (
				prediction.risk_level === 'CRITICAL' ||
				prediction.risk_level === 'HIGH'
			) {
				await this.sendRiskNotifications(
					saved.id,
					stockpile.id,
					prediction.risk_level
				)
			}

			this.logger.log(
				`Прогноз сохранен: ${saved.id} для штабеля ${shtabelId}`,
				this.CONTEXT,
				{ predictionId: saved.id, riskLevel: prediction.risk_level }
			)
		} catch (error) {
			this.logger.error(
				`Ошибка обработки прогноза для штабеля ${shtabelId}`,
				error instanceof Error ? error.stack : String(error),
				this.CONTEXT,
				{ shtabelId, error }
			)
			throw error
		}
	}

	async processBatchPredictions(shtabelIds: number[]): Promise<void> {
		this.logger.log(
			`Обработка пакетных прогнозов для ${shtabelIds.length} штабелей`,
			this.CONTEXT
		)

		const results = {
			success: 0,
			failed: 0,
			errors: [] as any[],
		}

		for (const shtabelId of shtabelIds) {
			try {
				await this.processPrediction(shtabelId)
				results.success++
			} catch (error) {
				results.failed++
				results.errors.push({
					shtabelId,
					error: error instanceof Error ? error.message : String(error),
				})
			}
		}

		this.logger.log(
			`Пакетный прогноз завершен: ${results.success} успешно, ${results.failed} ошибок`,
			this.CONTEXT,
			results
		)
	}

	private async sendRiskNotifications(
		predictionId: number,
		shtabelId: number,
		riskLevel: string
	): Promise<void> {
		try {
			const users = await this.prisma.user.findMany({
				where: {
					status: 'ACTIVE',
					userSettings: {
						OR: [
							{ notifyCritical: riskLevel === 'CRITICAL' },
							{ notifyHigh: riskLevel === 'HIGH' },
						],
					},
				},
				include: {
					userSettings: true,
				},
			})

			for (const user of users) {
				await this.notificationService.createNotification({
					userId: user.id,
					type: riskLevel === 'CRITICAL' ? 'CRITICAL_RISK' : 'HIGH_RISK',
					title: `⚠️ ${riskLevel === 'CRITICAL' ? 'Критический' : 'Высокий'} риск возгорания`,
					message: `Штабель #${shtabelId} имеет ${riskLevel === 'CRITICAL' ? 'критический' : 'высокий'} риск самовозгорания`,
					predictionId,
					shtabelId,
				})
			}
		} catch (error) {
			this.logger.error(
				'Не удалось отправить уведомления о риске',
				error instanceof Error ? error.stack : String(error),
				this.CONTEXT
			)
		}
	}
}
