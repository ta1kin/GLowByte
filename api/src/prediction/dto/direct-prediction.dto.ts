import { IsNumber, IsOptional, Min, Max } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class DirectPredictionDto {
	@ApiProperty({ 
		description: 'Максимальная температура штабеля (°C)', 
		example: 45.5 
	})
	@IsNumber()
	@Min(0)
	@Max(200)
	max_temp: number

	@ApiProperty({ 
		description: 'Возраст штабеля в днях', 
		example: 30 
	})
	@IsNumber()
	@Min(0)
	age_days: number

	@ApiPropertyOptional({ 
		description: 'Температура воздуха (°C)', 
		example: 20.0,
		default: 20.0
	})
	@IsOptional()
	@IsNumber()
	@Min(-50)
	@Max(50)
	temp_air?: number

	@ApiPropertyOptional({ 
		description: 'Влажность (%)', 
		example: 60.0,
		default: 60.0
	})
	@IsOptional()
	@IsNumber()
	@Min(0)
	@Max(100)
	humidity?: number

	@ApiPropertyOptional({ 
		description: 'Осадки (мм)', 
		example: 0.0,
		default: 0.0
	})
	@IsOptional()
	@IsNumber()
	@Min(0)
	precip?: number

	@ApiPropertyOptional({ 
		description: 'Изменение температуры за 3 дня (°C)', 
		example: 2.5,
		default: 0.0
	})
	@IsOptional()
	@IsNumber()
	temp_delta_3d?: number

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

