import { IsBoolean, IsOptional } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'

export class UpdateUserSettingsDto {
	@ApiPropertyOptional({
		description: 'Уведомления о критическом риске',
		example: true,
	})
	@IsOptional()
	@IsBoolean()
	notifyCritical?: boolean

	@ApiPropertyOptional({
		description: 'Уведомления о высоком риске',
		example: true,
	})
	@IsOptional()
	@IsBoolean()
	notifyHigh?: boolean

	@ApiPropertyOptional({
		description: 'Уведомления о готовности прогноза',
		example: false,
	})
	@IsOptional()
	@IsBoolean()
	notifyPredictions?: boolean

	@ApiPropertyOptional({
		description: 'Уведомления об импорте данных',
		example: true,
	})
	@IsOptional()
	@IsBoolean()
	notifyDataImport?: boolean
}

