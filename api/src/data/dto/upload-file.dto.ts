import { IsEnum, IsNotEmpty, IsString } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { FileType } from '../../common/enums/prisma-enums'

export class UploadFileDto {
	@ApiProperty({
		description: 'Тип загружаемого файла',
		enum: FileType,
		example: FileType.SUPPLIES,
	})
	@IsEnum(FileType, {
		message: 'fileType must be one of: SUPPLIES, FIRES, TEMPERATURE, WEATHER',
	})
	@IsNotEmpty({ message: 'fileType is required' })
	fileType: FileType
}

