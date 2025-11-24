import {
	Controller,
	Get,
	Post,
	Param,
	Query,
	Body,
	ParseIntPipe,
} from '@nestjs/common'
import {
	ApiTags,
	ApiOperation,
	ApiQuery,
	ApiParam,
	ApiBearerAuth,
} from '@nestjs/swagger'
import { PredictionService } from './prediction.service'
import { CreatePredictionDto, DirectPredictionDto } from './dto'

@ApiTags('Predictions')
@Controller('predictions')
export class PredictionController {
	constructor(private readonly predictionService: PredictionService) {}

	@Get()
	@ApiOperation({ summary: 'Get all predictions' })
	@ApiQuery({ name: 'shtabelId', required: false, type: Number })
	@ApiQuery({ name: 'skladId', required: false, type: Number })
	@ApiQuery({ name: 'riskLevel', required: false, type: String })
	@ApiQuery({ name: 'limit', required: false, type: Number })
	async getPredictions(
		@Query('shtabelId') shtabelId?: number,
		@Query('skladId') skladId?: number,
		@Query('riskLevel') riskLevel?: string,
		@Query('limit') limit?: number,
	) {
		return this.predictionService.getPredictions(
			shtabelId ? parseInt(shtabelId.toString()) : undefined,
			skladId ? parseInt(skladId.toString()) : undefined,
			riskLevel,
			limit ? parseInt(limit.toString()) : 100,
		)
	}

	@Get(':id')
	@ApiOperation({ summary: 'Get prediction by ID' })
	@ApiParam({ name: 'id', type: Number })
	async getPredictionById(@Param('id', ParseIntPipe) id: number) {
		return this.predictionService.getPredictionById(id)
	}

	@Post()
	@ApiOperation({ summary: 'Create prediction for stockpile (queued)' })
	@ApiBearerAuth()
	async createPrediction(@Body() dto: CreatePredictionDto) {
		return this.predictionService.createPrediction(dto.shtabelId, dto.horizonDays)
	}

	@Post('batch/calculate')
	@ApiOperation({ summary: 'Queue batch predictions for all active stockpiles' })
	@ApiBearerAuth()
	async batchPredict() {
		return this.predictionService.batchPredict()
	}

	@Post('calculate')
	@ApiOperation({ 
		summary: 'Calculate fire risk prediction synchronously (for client)',
		description: 'Синхронный расчет риска самовозгорания для штабеля. Возвращает результат сразу без сохранения в БД. Используется для клиентского приложения.'
	})
	async calculatePrediction(@Body() dto: CreatePredictionDto) {
		return this.predictionService.calculatePredictionSync(dto.shtabelId, dto.horizonDays)
	}

	@Post('calculate/direct')
	@ApiOperation({ 
		summary: 'Calculate fire risk from form parameters (for client form)',
		description: 'Расчет риска самовозгорания на основе параметров из формы клиента. Принимает параметры напрямую без необходимости наличия штабеля в БД. Используется для формы расчета риска на клиенте.'
	})
	async calculateDirectPrediction(@Body() dto: DirectPredictionDto) {
		return this.predictionService.calculateDirectPrediction(dto)
	}
}
