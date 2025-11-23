import { Injectable } from '@nestjs/common'
import * as fs from 'fs/promises'
import * as fsSync from 'fs'
import * as path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { PrismaService } from '../../prisma/prisma.service'
import { FileType } from '../common/enums/prisma-enums'
import {
	errorResponse,
	successResponse,
} from '../common/helpers/api.response.helper'
import { AppLogger } from '../common/logger/logger.service'
import { QueueService } from '../queue/queue.service'

@Injectable()
export class DataService {
	private readonly logger = new AppLogger()
	private readonly CONTEXT = 'DataService'
	private readonly uploadsDir: string

	constructor(
		private prisma: PrismaService,
		private queueService: QueueService
	) {
		this.uploadsDir = process.env.UPLOADS_DIR || './uploads'
		this.ensureUploadsDir()
	}

	private async ensureUploadsDir() {
		try {
			await fs.access(this.uploadsDir)
		} catch {
			await fs.mkdir(this.uploadsDir, { recursive: true })
			this.logger.log(
				`Created uploads directory: ${this.uploadsDir}`,
				this.CONTEXT
			)
		}
	}

	async createUpload(
		file: Express.Multer.File,
		fileType: FileType,
		userId?: number
	) {
		try {
			const maxSize = 50 * 1024 * 1024
			if (file.size > maxSize) {
				return errorResponse(
					`Размер файла превышает максимально допустимый размер ${maxSize / 1024 / 1024}MB`
				)
			}

			if (!file.mimetype.includes('csv') && !file.originalname.endsWith('.csv')) {
				return errorResponse('Разрешены только CSV файлы')
			}

			const fileExtension = path.extname(file.originalname)
			const uniqueFilename = `${uuidv4()}${fileExtension}`
			const filePath = path.join(this.uploadsDir, uniqueFilename)

			await this.ensureUploadsDir()
			await fs.writeFile(filePath, file.buffer)

			this.logger.log(
				`Файл сохранен: ${uniqueFilename} (${file.size} байт)`,
				this.CONTEXT,
				{ originalName: file.originalname, fileType, userId }
			)

			const upload = await this.prisma.upload.create({
				data: {
					filename: uniqueFilename,
					fileType,
					uploadedBy: userId,
					status: 'PENDING',
					metadata: {
						originalName: file.originalname,
						mimeType: file.mimetype,
						size: file.size,
					},
				},
			})

			await this.queueService.publish('data.import', {
				uploadId: upload.id,
				filename: uniqueFilename,
				fileType,
			})

			this.logger.log(`Загрузка создана и поставлена в очередь: ${upload.id}`, this.CONTEXT, {
				uploadId: upload.id,
				fileType,
			})

			return successResponse(upload, 'Загрузка создана и поставлена в очередь на обработку')
		} catch (error) {
			this.logger.error(
				'Ошибка при создании загрузки',
				error instanceof Error ? error.stack : String(error),
				this.CONTEXT,
				{
					fileName: file.originalname,
					fileType,
					error,
				}
			)
			return errorResponse('Не удалось создать загрузку', error)
		}
	}

	async getUploads(userId?: number, limit = 50) {
		try {
			const uploads = await this.prisma.upload.findMany({
				where: userId ? { uploadedBy: userId } : undefined,
				orderBy: { createdAt: 'desc' },
				take: limit,
				include: {
					user: {
						select: {
							id: true,
							telegramId: true,
							fullName: true,
						},
					},
				},
			})

			return successResponse(uploads, 'Загрузки получены')
		} catch (error) {
			this.logger.error(
				'Ошибка при получении загрузок',
				error instanceof Error ? error.stack : String(error),
				this.CONTEXT
			)
			return errorResponse('Не удалось получить загрузки', error)
		}
	}

	async getUploadById(id: number) {
		try {
			const upload = await this.prisma.upload.findUnique({
				where: { id },
				include: {
					user: {
						select: {
							id: true,
							telegramId: true,
							fullName: true,
						},
					},
				},
			})

			if (!upload) {
				return errorResponse('Загрузка не найдена')
			}

			return successResponse(upload, 'Загрузка получена')
		} catch (error) {
			this.logger.error(
				'Ошибка при получении загрузки',
				error instanceof Error ? error.stack : String(error),
				this.CONTEXT
			)
			return errorResponse('Не удалось получить загрузку', error)
		}
	}
}
