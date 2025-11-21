import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { MlService } from './ml.service';

@ApiTags('ML')
@Controller('ml')
export class MlController {
  constructor(private readonly mlService: MlService) {}

  @Post('train')
  @ApiOperation({ summary: 'Queue model training' })
  async trainModel(
    @Body() body: { modelName: string; modelVersion: string; config?: any },
  ) {
    return this.mlService.trainModel(
      body.modelName,
      body.modelVersion,
      body.config,
    );
  }

  @Get('models')
  @ApiOperation({ summary: 'Get all models' })
  async getModels() {
    return this.mlService.getModels();
  }

  @Get('metrics')
  @ApiOperation({ summary: 'Get model metrics' })
  @ApiQuery({ name: 'modelName', required: true, type: String })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getModelMetrics(
    @Query('modelName') modelName: string,
    @Query('limit') limit?: number,
  ) {
    return this.mlService.getModelMetrics(
      modelName,
      limit ? parseInt(limit.toString()) : 10,
    );
  }
}

