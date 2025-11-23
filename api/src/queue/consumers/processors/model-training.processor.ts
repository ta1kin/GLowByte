import { Injectable } from '@nestjs/common'
import axios from 'axios'
import { PrismaService } from '../../../../prisma/prisma.service'
import { AppLogger } from '../../../common/logger/logger.service'
import { MlService } from '../../../prediction/ml.service'

@Injectable()
export class ModelTrainingProcessor {
	private readonly logger = new AppLogger()
	private readonly CONTEXT = 'ModelTrainingProcessor'
	private readonly mlServiceUrl =
		process.env.ML_SERVICE_URL || 'http://localhost:8000'

	constructor(
		private prisma: PrismaService,
		private mlService: MlService
	) {}

	async processTraining(
		modelName: string,
		modelVersion: string,
		config?: any
	): Promise<void> {
		try {
			let modelArtifact = await this.prisma.modelArtifact.findFirst({
				where: {
					name: modelName,
					version: modelVersion,
				},
			})

			if (!modelArtifact) {
				modelArtifact = await this.prisma.modelArtifact.create({
					data: {
						name: modelName,
						version: modelVersion,
						status: 'TRAINING',
						path: '',
						trainingData: config,
					},
				})
			} else {
				modelArtifact = await this.prisma.modelArtifact.update({
					where: { id: modelArtifact.id },
					data: {
						status: 'TRAINING',
						trainingData: config,
					},
				})
			}

			this.logger.log(
				`Начало обучения модели: ${modelName} v${modelVersion}`,
				this.CONTEXT,
				{ modelArtifactId: modelArtifact.id, config }
			)

			const response = await axios.post(
				`${this.mlServiceUrl}/train`,
				{
					model_name: modelName,
					model_version: modelVersion,
					config: config || {},
				},
				{
					timeout: 7200000,
				}
			)

			const trainingResult = response.data

			await this.prisma.modelArtifact.update({
				where: { id: modelArtifact.id },
				data: {
					status: trainingResult.success ? 'ACTIVE' : 'FAILED',
					path: trainingResult.model_path || '',
					fileSize: trainingResult.file_size
						? BigInt(trainingResult.file_size)
						: null,
					trainedAt: new Date(),
					trainedBy: 'system',
					trainingData: {
						...config,
						trainingResult,
					},
					hyperparams: trainingResult.hyperparams,
					trainMetrics: trainingResult.train_metrics,
					valMetrics: trainingResult.val_metrics,
					testMetrics: trainingResult.test_metrics,
					meta: trainingResult.meta,
				},
			})

			if (trainingResult.metrics) {
				await this.prisma.metric.create({
					data: {
						modelName,
						modelVersion,
						periodStart: new Date(trainingResult.metrics.period_start),
						periodEnd: new Date(trainingResult.metrics.period_end),
						mae_days: trainingResult.metrics.mae_days,
						rmse_days: trainingResult.metrics.rmse_days,
						mape: trainingResult.metrics.mape,
						accuracy_within_2d: trainingResult.metrics.accuracy_within_2d,
						accuracy_within_3d: trainingResult.metrics.accuracy_within_3d,
						accuracy_within_5d: trainingResult.metrics.accuracy_within_5d,
						c_index: trainingResult.metrics.c_index,
						precision: trainingResult.metrics.precision,
						recall: trainingResult.metrics.recall,
						f1_score: trainingResult.metrics.f1_score,
						raw: trainingResult.metrics.raw,
					},
				})
			}

			this.logger.log(
				`Обучение модели завершено: ${modelName} v${modelVersion}`,
				this.CONTEXT,
				{
					modelArtifactId: modelArtifact.id,
					success: trainingResult.success,
					metrics: trainingResult.metrics,
				}
			)
		} catch (error) {
			try {
				await this.prisma.modelArtifact.updateMany({
					where: {
						name: modelName,
						version: modelVersion,
					},
					data: {
						status: 'FAILED',
					},
				})
			} catch (updateError) {
				this.logger.error(
					'Не удалось обновить статус артефакта модели',
					updateError instanceof Error
						? updateError.stack
						: String(updateError),
					this.CONTEXT
				)
			}

			this.logger.error(
				`Обучение модели завершилось ошибкой: ${modelName} v${modelVersion}`,
				error instanceof Error ? error.stack : String(error),
				this.CONTEXT,
				{ modelName, modelVersion, error }
			)

			throw error
		}
	}
}
