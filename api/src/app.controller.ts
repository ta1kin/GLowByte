import { Controller, Get } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { AppService } from './app.service'

@ApiTags('System')
@Controller()
export class AppController {
	constructor(private readonly appService: AppService) {}

	@Get()
	@ApiOperation({ summary: 'Root endpoint' })
	getRoot() {
		return this.appService.getRoot()
	}

	@Get('health')
	@ApiOperation({ summary: 'Health check' })
	getHealth() {
		return this.appService.getHealth()
	}
}
