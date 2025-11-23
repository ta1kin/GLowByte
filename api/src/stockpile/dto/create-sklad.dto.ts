import { IsInt, IsString, IsOptional } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateSkladDto {
	@ApiProperty({ description: 'Номер склада', example: 1 })
	@IsInt()
	number: number

	@ApiPropertyOptional({ description: 'Название склада', example: 'Склад №1' })
	@IsOptional()
	@IsString()
	name?: string

	@ApiPropertyOptional({
		description: 'Описание местоположения',
		example: 'Северная часть территории',
	})
	@IsOptional()
	@IsString()
	locationRaw?: string

	@ApiPropertyOptional({ description: 'Дополнительное описание' })
	@IsOptional()
	@IsString()
	description?: string
}

