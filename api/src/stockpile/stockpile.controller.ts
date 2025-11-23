import {
	Controller,
	Get,
	Post,
	Put,
	Delete,
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
import { StockpileService } from './stockpile.service'
import { CreateStockpileDto, UpdateStockpileDto, CreateSkladDto } from './dto'

@ApiTags('Stockpiles')
@Controller('stockpiles')
export class StockpileController {
	constructor(private readonly stockpileService: StockpileService) {}

	// ============================================
	// Склады (Sklad)
	// ============================================

	@Get('sklads')
	@ApiOperation({ summary: 'Get all sklads' })
	async getSklads() {
		return this.stockpileService.getSklads()
	}

	@Get('sklads/:id')
	@ApiOperation({ summary: 'Get sklad by ID' })
	@ApiParam({ name: 'id', type: Number })
	async getSkladById(@Param('id', ParseIntPipe) id: number) {
		return this.stockpileService.getSkladById(id)
	}

	@Post('sklads')
	@ApiOperation({ summary: 'Create new sklad' })
	@ApiBearerAuth()
	async createSklad(@Body() dto: CreateSkladDto) {
		return this.stockpileService.createSklad(dto)
	}

	@Put('sklads/:id')
	@ApiOperation({ summary: 'Update sklad' })
	@ApiBearerAuth()
	@ApiParam({ name: 'id', type: Number })
	async updateSklad(
		@Param('id', ParseIntPipe) id: number,
		@Body() dto: Partial<CreateSkladDto>,
	) {
		return this.stockpileService.updateSklad(id, dto)
	}

	// ============================================
	// Штабели (Shtabel)
	// ============================================

	@Get()
	@ApiOperation({ summary: 'Get all stockpiles' })
	@ApiQuery({ name: 'skladId', required: false, type: Number })
	@ApiQuery({ name: 'status', required: false, type: String })
	@ApiQuery({ name: 'limit', required: false, type: Number })
	async getStockpiles(
		@Query('skladId') skladId?: number,
		@Query('status') status?: string,
		@Query('limit') limit?: number,
	) {
		return this.stockpileService.getStockpiles(
			skladId ? parseInt(skladId.toString()) : undefined,
			status,
			limit ? parseInt(limit.toString()) : 100,
		)
	}

	@Get(':id')
	@ApiOperation({ summary: 'Get stockpile by ID' })
	@ApiParam({ name: 'id', type: Number })
	async getStockpileById(@Param('id', ParseIntPipe) id: number) {
		return this.stockpileService.getStockpileById(id)
	}

	@Post()
	@ApiOperation({ summary: 'Create new stockpile' })
	@ApiBearerAuth()
	async createStockpile(@Body() dto: CreateStockpileDto) {
		return this.stockpileService.createStockpile(dto)
	}

	@Put(':id')
	@ApiOperation({ summary: 'Update stockpile' })
	@ApiBearerAuth()
	@ApiParam({ name: 'id', type: Number })
	async updateStockpile(
		@Param('id', ParseIntPipe) id: number,
		@Body() dto: UpdateStockpileDto,
	) {
		return this.stockpileService.updateStockpile(id, dto)
	}

	@Delete(':id')
	@ApiOperation({ summary: 'Delete stockpile (or archive if has related data)' })
	@ApiBearerAuth()
	@ApiParam({ name: 'id', type: Number })
	async deleteStockpile(@Param('id', ParseIntPipe) id: number) {
		return this.stockpileService.deleteStockpile(id)
	}

	@Get(':id/temperature')
	@ApiOperation({ summary: 'Get temperature history for stockpile' })
	@ApiParam({ name: 'id', type: Number })
	@ApiQuery({ name: 'days', required: false, type: Number })
	async getTemperatureHistory(
		@Param('id', ParseIntPipe) id: number,
		@Query('days') days?: number,
	) {
		return this.stockpileService.getStockpileTemperatureHistory(
			id,
			days ? parseInt(days.toString()) : 30,
		)
	}
}
