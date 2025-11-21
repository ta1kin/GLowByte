import { Controller, Get, Post, Param, Query, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { PredictionService } from './prediction.service';

@ApiTags('Predictions')
@Controller('predictions')
export class PredictionController {
  constructor(private readonly predictionService: PredictionService) {}

  @Get()
  @ApiOperation({ summary: 'Get all predictions' })
  @ApiQuery({ name: 'shtabelId', required: false, type: Number })
  @ApiQuery({ name: 'skladId', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getPredictions(
    @Query('shtabelId') shtabelId?: number,
    @Query('skladId') skladId?: number,
    @Query('limit') limit?: number,
  ) {
    return this.predictionService.getPredictions(
      shtabelId ? parseInt(shtabelId.toString()) : undefined,
      skladId ? parseInt(skladId.toString()) : undefined,
      limit ? parseInt(limit.toString()) : 100,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get prediction by ID' })
  async getPredictionById(@Param('id', ParseIntPipe) id: number) {
    return this.predictionService.getPredictionById(id);
  }

  @Post(':shtabelId')
  @ApiOperation({ summary: 'Create prediction for stockpile (queued)' })
  async createPrediction(@Param('shtabelId', ParseIntPipe) shtabelId: number) {
    return this.predictionService.createPrediction(shtabelId);
  }

  @Post('batch/calculate')
  @ApiOperation({ summary: 'Queue batch predictions for all active stockpiles' })
  async batchPredict() {
    return this.predictionService.batchPredict();
  }
}
