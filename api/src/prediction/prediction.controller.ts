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
import { CreatePredictionDto } from './dto'

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
}
