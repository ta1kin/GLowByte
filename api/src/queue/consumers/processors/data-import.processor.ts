import { Injectable } from '@nestjs/common'
import { parse } from 'csv-parse/sync'
import * as fs from 'fs/promises'
import * as fsSync from 'fs'
import * as path from 'path'
import { PrismaService } from '../../../../prisma/prisma.service'
import { FileType, UploadStatus } from '../../../common/enums/prisma-enums'
import { AppLogger } from '../../../common/logger/logger.service'
import { FiresService } from '../../../data/services/fires.service'
import { SuppliesService } from '../../../data/services/supplies.service'
import { TemperatureService } from '../../../data/services/temperature.service'
import { WeatherService } from '../../../data/services/weather.service'
import { QueueService } from '../../queue.service'

@Injectable()
export class DataImportProcessor {
	private readonly logger = new AppLogger()
	private readonly CONTEXT = 'DataImportProcessor'
	private readonly uploadsDir = process.env.UPLOADS_DIR || './uploads'

	constructor(
		private prisma: PrismaService,
		private suppliesService: SuppliesService,
		private firesService: FiresService,
		private temperatureService: TemperatureService,
		private weatherService: WeatherService,
		private queueService: QueueService
	) {}

	async processImport(
		uploadId: number,
		filename: string,
		fileType: FileType
	): Promise<void> {
		const filePath = path.join(this.uploadsDir, filename)
		try {
			await this.prisma.upload.update({
				where: { id: uploadId },
				data: { status: 'PROCESSING' },
			})
			if (!fsSync.existsSync(filePath)) {
				throw new Error(`Файл не найден: ${filePath}`)
			}

			const fileContent = await fs.readFile(filePath, 'utf-8')
			const records = parse(fileContent, {
				columns: true,
				skip_empty_lines: true,
				trim: true,
			})

			this.logger.log(
				`Обработка ${records.length} записей из ${filename}`,
				this.CONTEXT,
				{ uploadId, fileType, recordCount: records.length }
			)

			let processed = 0
			let failed = 0
			let errors: any[] = []
			switch (fileType) {
				case 'SUPPLIES':
					{
						const result = await this.suppliesService.processCSV(
							records,
							uploadId
						)
						processed = result.processed
						failed = result.failed
						errors = result.errors || []
					}
					break
				case 'FIRES':
					{
						const result = await this.firesService.processCSV(records, uploadId)
						processed = result.processed
						failed = result.failed
						errors = result.errors || []
					}
					break
				case 'TEMPERATURE':
					{
						const result = await this.temperatureService.processCSV(
							records,
							uploadId
						)
						processed = result.processed
						failed = result.failed
						errors = result.errors || []
					}
					break
				case 'WEATHER':
					{
						const result = await this.weatherService.processCSV(
							records,
							uploadId
						)
						processed = result.processed
						failed = result.failed
						errors = result.errors || []
					}
					break
				default:
					throw new Error(`Unknown file type: ${fileType}`)
			}

			const status: UploadStatus =
				failed === 0
					? UploadStatus.COMPLETED
					: failed < records.length
						? UploadStatus.PARTIAL
						: UploadStatus.FAILED

			await this.prisma.upload.update({
				where: { id: uploadId },
				data: {
					status,
					rowsTotal: records.length,
					rowsProcessed: processed,
					rowsFailed: failed,
					errors: errors.length > 0 ? errors : undefined,
				},
			})

			this.logger.log(
				`Импорт завершен: ${processed} обработано, ${failed} ошибок`,
				this.CONTEXT,
				{ uploadId, processed, failed, status }
			)

			await this.cleanupFile(filePath)
		} catch (error) {
			await this.prisma.upload.update({
				where: { id: uploadId },
				data: {
					status: 'FAILED',
					errors: {
						error: error instanceof Error ? error.message : String(error),
						stack: error instanceof Error ? error.stack : String(error),
					},
				},
			})

			this.logger.error(
				`Импорт завершился ошибкой для загрузки ${uploadId}`,
				error instanceof Error ? error.stack : String(error),
				this.CONTEXT,
				{ uploadId, filename, fileType, error }
			)

			try {
				await this.cleanupFile(filePath)
			} catch (cleanupError) {
				this.logger.warn(
					`Не удалось очистить файл ${filePath} после ошибки`,
					this.CONTEXT,
					{ uploadId, filename, cleanupError }
				)
			}

			throw error
		}
	}

	/**
	 * Очистка загруженного файла после обработки
	 */
	private async cleanupFile(filePath: string): Promise<void> {
		try {
			await fs.unlink(filePath)
			this.logger.log(
				`Файл очищен: ${filePath}`,
				this.CONTEXT,
				{ filePath }
			)
		} catch (error) {
			if ((error as any).code !== 'ENOENT') {
				this.logger.warn(
					`Не удалось очистить файл: ${filePath}`,
					this.CONTEXT,
					{ filePath, error }
				)
			}
		}
	}
}
