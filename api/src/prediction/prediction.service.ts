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
}
