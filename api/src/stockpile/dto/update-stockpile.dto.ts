import { PartialType } from '@nestjs/mapped-types'
import { CreateStockpileDto, ShtabelStatus } from './create-stockpile.dto'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsNumber, Min, IsString, IsDateString, IsInt, IsEnum } from 'class-validator'

export class UpdateStockpileDto extends PartialType(CreateStockpileDto) {
	@ApiPropertyOptional({ description: 'ID склада', example: 1 })
	@IsOptional()
	@IsInt()
	skladId?: number

	@ApiPropertyOptional({ description: 'Номер/код штабеля', example: 'ШТ-001' })
	@IsOptional()
	@IsString()
	label?: string

	@ApiPropertyOptional({ description: 'Марка угля', example: 'A1' })
	@IsOptional()
	@IsString()
	mark?: string

	@ApiPropertyOptional({ description: 'Дата начала формирования' })
	@IsOptional()
	@IsDateString()
	formedAt?: string

	@ApiPropertyOptional({ description: 'Высота (метры)', example: 5.5 })
	@IsOptional()
	@IsNumber()
	@Min(0)
	height_m?: number

	@ApiPropertyOptional({ description: 'Ширина (метры)', example: 10.0 })
	@IsOptional()
	@IsNumber()
	@Min(0)
	width_m?: number

	@ApiPropertyOptional({ description: 'Длина (метры)', example: 20.0 })
	@IsOptional()
	@IsNumber()
	@Min(0)
	length_m?: number

	@ApiPropertyOptional({ description: 'Масса (тонны)', example: 1000.0 })
	@IsOptional()
	@IsNumber()
	@Min(0)
	mass_t?: number

	@ApiPropertyOptional({
		description: 'Статус штабеля',
		enum: ShtabelStatus,
		example: ShtabelStatus.ACTIVE,
	})
	@IsOptional()
	@IsEnum(ShtabelStatus)
	status?: ShtabelStatus

	@ApiPropertyOptional({ description: 'Текущая масса (тонны)', example: 950.0 })
	@IsOptional()
	@IsNumber()
	@Min(0)
	currentMass?: number

	@ApiPropertyOptional({ description: 'Последняя температура', example: 45.5 })
	@IsOptional()
	@IsNumber()
	lastTemp?: number

	@ApiPropertyOptional({ description: 'Дата последнего температурного замера' })
	@IsOptional()
	@IsDateString()
	lastTempDate?: string
}

