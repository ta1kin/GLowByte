import { Controller, Get } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { AppService } from './app.service'

@ApiTags('System')
@Controller()
export class AppController {
	constructor(private readonly appService: AppService) {}

	// Корневой endpoint убран, так как корневой путь должен обрабатываться фронтендом
	// Используйте /api/health для проверки здоровья API

	@Get('health')
	@ApiOperation({ summary: 'Health check' })
	getHealth() {
		return this.appService.getHealth()
	}
}
