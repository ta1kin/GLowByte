import { Controller, Get, Param, Query, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { StockpileService } from './stockpile.service';

@ApiTags('Stockpiles')
@Controller('stockpiles')
export class StockpileController {
  constructor(private readonly stockpileService: StockpileService) {}

  @Get()
  @ApiOperation({ summary: 'Get all stockpiles' })
  @ApiQuery({ name: 'skladId', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, type: String })
  async getStockpiles(
    @Query('skladId') skladId?: number,
    @Query('status') status?: string,
  ) {
    return this.stockpileService.getStockpiles(
      skladId ? parseInt(skladId.toString()) : undefined,
      status,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get stockpile by ID' })
  async getStockpileById(@Param('id', ParseIntPipe) id: number) {
    return this.stockpileService.getStockpileById(id);
  }

  @Get(':id/temperature')
  @ApiOperation({ summary: 'Get temperature history for stockpile' })
  @ApiQuery({ name: 'days', required: false, type: Number })
  async getTemperatureHistory(
    @Param('id', ParseIntPipe) id: number,
    @Query('days') days?: number,
  ) {
    return this.stockpileService.getStockpileTemperatureHistory(
      id,
      days ? parseInt(days.toString()) : 30,
    );
  }
}

