import { IsInt, IsString, IsOptional, IsDateString, IsNumber, Min, IsEnum } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { ShtabelStatus } from '../../common/enums/prisma-enums'

export { ShtabelStatus }

export class CreateStockpileDto {
	@ApiProperty({ description: 'ID склада', example: 1 })
	@IsInt()
	skladId: number

	@ApiProperty({ description: 'Номер/код штабеля', example: 'ШТ-001' })
	@IsString()
	label: string

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
}

