import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { AppLogger } from './common/logger/logger.service'

@Injectable()
export class AppService {
	private readonly logger = new AppLogger()
	private readonly CONTEXT = 'AppService'

	constructor(private prisma: PrismaService) {}

	getRoot() {
		return {
			service: 'Coal Fire Predictor API',
			version: '1.0.0',
			status: 'running',
			docs: '/api/docs',
		}
	}

	async getHealth() {
		try {
			await this.prisma.$queryRaw`SELECT 1`

			return {
				status: 'healthy',
				service: 'coalfire-api',
				version: '1.0.0',
				database: 'connected',
				timestamp: new Date().toISOString(),
			}
		} catch (error) {
			this.logger.error(
				'Проверка здоровья завершилась ошибкой',
				error instanceof Error ? error.stack : String(error),
				this.CONTEXT
			)
			return {
				status: 'unhealthy',
				service: 'coalfire-api',
				database: 'disconnected',
				error: error instanceof Error ? error.message : String(error),
				timestamp: new Date().toISOString(),
			}
		}
	}
}
