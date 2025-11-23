import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import {
	errorResponse,
	successResponse,
} from '../common/helpers/api.response.helper'
import { AppLogger } from '../common/logger/logger.service'
import { QueueService } from '../queue/queue.service'

@Injectable()
export class MlService {
	private readonly logger = new AppLogger()
	private readonly CONTEXT = 'MlService'

	constructor(
		private prisma: PrismaService,
		private queueService: QueueService
	) {}

	async trainModel(modelName: string, modelVersion: string, config?: any) {
		try {
			await this.queueService.publish('model.train', {
				modelName,
				modelVersion,
				config: config || {},
			})

			return successResponse(
				{ modelName, modelVersion, queued: true },
				'Обучение модели поставлено в очередь'
			)
		} catch (error) {
			this.logger.error(
				'Ошибка при постановке обучения модели в очередь',
				error instanceof Error ? error.stack : String(error),
				this.CONTEXT
			)
			return errorResponse('Не удалось поставить обучение модели в очередь', error)
		}
	}

	async getModels() {
		try {
			const models = await this.prisma.modelArtifact.findMany({
				orderBy: { createdAt: 'desc' },
			})

			return successResponse(models, 'Модели получены')
		} catch (error) {
			this.logger.error(
				'Ошибка при получении моделей',
				error instanceof Error ? error.stack : String(error),
				this.CONTEXT
			)
			return errorResponse('Не удалось получить модели', error)
		}
	}

	async getModelMetrics(modelName: string, limit = 10) {
		try {
			const metrics = await this.prisma.metric.findMany({
				where: { modelName },
				orderBy: { periodStart: 'desc' },
				take: limit,
			})

			return successResponse(metrics, 'Метрики модели получены')
		} catch (error) {
			this.logger.error(
				'Ошибка при получении метрик модели',
				error instanceof Error ? error.stack : String(error),
				this.CONTEXT
			)
			return errorResponse('Не удалось получить метрики модели', error)
		}
	}
}
