import { IsInt, IsOptional, IsNumber, Min, Max } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreatePredictionDto {
	@ApiProperty({ description: 'ID штабеля', example: 1 })
	@IsInt()
	shtabelId: number

	@ApiPropertyOptional({
		description: 'Горизонт прогнозирования (дни)',
		example: 7,
		default: 7,
	})
	@IsOptional()
	@IsNumber()
	@Min(1)
	@Max(30)
	horizonDays?: number
}

