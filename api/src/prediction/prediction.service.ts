import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import {
	errorResponse,
	successResponse,
} from '../common/helpers/api.response.helper'
import { AppLogger } from '../common/logger/logger.service'
import { QueueService } from '../queue/queue.service'
import { MlService } from './ml.service'

@Injectable()
export class PredictionService {
	private readonly logger = new AppLogger()
	private readonly CONTEXT = 'PredictionService'

	constructor(
		private prisma: PrismaService,
		private queueService: QueueService,
		private mlService: MlService
	) {}

	async getPredictions(
		shtabelId?: number,
		skladId?: number,
		riskLevel?: string,
		limit = 100
	) {
		try {
			const predictions = await this.prisma.prediction.findMany({
				where: {
					...(shtabelId && { shtabelId }),
					...(skladId && { skladId }),
					...(riskLevel && { riskLevel: riskLevel as any }),
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
			})

			return successResponse(predictions, 'Прогнозы получены')
		} catch (error: any) {
			this.logger.error(
				'Ошибка при получении прогнозов',
				error instanceof Error ? error.stack : String(error),
				this.CONTEXT
			)
			return errorResponse('Не удалось получить прогнозы', error)
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
			})

			if (!prediction) {
				return errorResponse('Прогноз не найден')
			}

			return successResponse(prediction, 'Прогноз получен')
		} catch (error: any) {
			this.logger.error(
				'Ошибка при получении прогноза',
				error instanceof Error ? error.stack : String(error),
				this.CONTEXT
			)
			return errorResponse('Не удалось получить прогноз', error)
		}
	}

	async createPrediction(shtabelId: number, horizonDays = 7) {
		try {
			const stockpile = await this.prisma.shtabel.findUnique({
				where: { id: shtabelId },
				include: {
					sklad: true,
				},
			})

			if (!stockpile) {
				return errorResponse('Штабель не найден')
			}

			if (stockpile.status !== 'ACTIVE') {
				return errorResponse(
					'Прогнозы можно создавать только для активных штабелей'
				)
			}

			await this.queueService.publish('prediction.calculate', {
				shtabelId,
				horizonDays,
			})

			this.logger.log(
				`Прогноз поставлен в очередь для штабеля ${shtabelId}`,
				this.CONTEXT,
				{
					shtabelId,
					horizonDays,
				}
			)

			return successResponse(
				{ shtabelId, horizonDays, queued: true },
				'Прогноз поставлен в очередь на обработку'
			)
		} catch (error: any) {
			this.logger.error(
				'Ошибка при постановке прогноза в очередь',
				error instanceof Error ? error.stack : String(error),
				this.CONTEXT,
				{
					shtabelId,
				}
			)
			return errorResponse('Не удалось поставить прогноз в очередь', error)
		}
	}

	async batchPredict() {
		try {
			const stockpiles = await this.prisma.shtabel.findMany({
				where: { status: 'ACTIVE' },
			})

			await this.queueService.publish('prediction.batch', {
				shtabelIds: stockpiles.map((s: any) => s.id),
			})

			return successResponse(
				{ queued: stockpiles.length },
				'Прогнозы поставлены в очередь на обработку'
			)
		} catch (error: any) {
			this.logger.error(
				'Ошибка при пакетном прогнозировании',
				error instanceof Error ? error.stack : String(error),
				this.CONTEXT
			)
			return errorResponse('Не удалось поставить прогнозы в очередь', error)
		}
	}

	/**
	 * Синхронный расчет прогноза для клиента
	 * Возвращает результат сразу без сохранения в БД
	 */
	async calculatePredictionSync(shtabelId: number, horizonDays = 7) {
		try {
			const stockpile = await this.prisma.shtabel.findUnique({
				where: { id: shtabelId },
				include: {
					sklad: true,
				},
			})

			if (!stockpile) {
				return errorResponse('Штабель не найден')
			}

			if (stockpile.status !== 'ACTIVE') {
				return errorResponse(
					'Прогнозы можно создавать только для активных штабелей'
				)
			}

			// Вызываем ML Service напрямую для синхронного расчета
			const prediction = await this.mlService.predict(shtabelId, horizonDays)

			// Формируем ответ для клиента
			const result = {
				shtabelId: stockpile.id,
				skladId: stockpile.skladId,
				skladName: stockpile.sklad?.name || null,
				stockpileLabel: stockpile.label,
				stockpileMark: stockpile.mark,
				modelName: prediction.model_name || 'xgboost_v1',
				modelVersion: prediction.model_version,
				predictedDate: prediction.predicted_date,
				probEvent: prediction.prob_event,
				riskLevel: prediction.risk_level,
				horizonDays: prediction.horizon_days || horizonDays,
				intervalLow: prediction.interval_low,
				intervalHigh: prediction.interval_high,
				confidence: prediction.confidence,
				features: prediction.meta?.features || null,
			}

			this.logger.log(
				`Синхронный прогноз рассчитан для штабеля ${shtabelId}`,
				this.CONTEXT,
				{
					shtabelId,
					riskLevel: prediction.risk_level,
					probEvent: prediction.prob_event,
				}
			)

			return successResponse(result, 'Прогноз рассчитан')
		} catch (error: any) {
			this.logger.error(
				'Ошибка при синхронном расчете прогноза',
				error instanceof Error ? error.stack : String(error),
				this.CONTEXT,
				{
					shtabelId,
				}
			)
			return errorResponse('Не удалось рассчитать прогноз', error)
		}
	}

	/**
	 * Прямой расчет прогноза из параметров формы клиента
	 * Принимает параметры напрямую без необходимости наличия штабеля в БД
	 */
	async calculateDirectPrediction(dto: {
		max_temp: number
		age_days: number
		temp_air?: number
		humidity?: number
		precip?: number
		temp_delta_3d?: number
		horizonDays?: number
	}) {
		try {
			// Вызываем ML Service напрямую с параметрами из формы
			const prediction = await this.mlService.predictDirect({
				max_temp: dto.max_temp,
				age_days: dto.age_days,
				temp_air: dto.temp_air,
				humidity: dto.humidity,
				precip: dto.precip,
				temp_delta_3d: dto.temp_delta_3d,
				horizon_days: dto.horizonDays,
			})

			// Формируем ответ для клиента
			const result = {
				riskLevel: prediction.risk_level,
				probEvent: prediction.prob_event,
				predictedDate: prediction.predicted_date,
				intervalLow: prediction.interval_low,
				intervalHigh: prediction.interval_high,
				confidence: prediction.confidence,
				horizonDays: prediction.horizon_days,
				modelName: prediction.model_name,
				modelVersion: prediction.model_version,
				features: prediction.meta?.features || null,
			}

			this.logger.log(
				`Прямой прогноз рассчитан: risk=${prediction.risk_level}, prob=${prediction.prob_event}`,
				this.CONTEXT,
				{
					riskLevel: prediction.risk_level,
					probEvent: prediction.prob_event,
				}
			)

			return successResponse(result, 'Прогноз рассчитан')
		} catch (error: any) {
			this.logger.error(
				'Ошибка при прямом расчете прогноза',
				error instanceof Error ? error.stack : String(error),
				this.CONTEXT
			)
			return errorResponse('Не удалось рассчитать прогноз', error)
		}
	}
}
