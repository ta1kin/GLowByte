import {
	BadRequestException,
	Body,
	Controller,
	Get,
	Param,
	ParseIntPipe,
	Post,
	Req,
	UploadedFile,
	UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import {
	ApiBearerAuth,
	ApiBody,
	ApiConsumes,
	ApiOperation,
	ApiTags,
} from '@nestjs/swagger'
import { Request } from 'express'
import { DataService } from './data.service'
import { UploadFileDto } from './dto'

@ApiTags('Data')
@Controller('data')
export class DataController {
	constructor(private readonly dataService: DataService) {}

	@Post('upload')
	@ApiOperation({ summary: 'Upload CSV file' })
	@ApiConsumes('multipart/form-data')
	@ApiBearerAuth()
	@ApiBody({
		schema: {
			type: 'object',
			properties: {
				file: {
					type: 'string',
					format: 'binary',
				},
				fileType: {
					type: 'string',
					enum: ['SUPPLIES', 'FIRES', 'TEMPERATURE', 'WEATHER'],
				},
			},
		},
	})
	@UseInterceptors(FileInterceptor('file'))
	async uploadFile(
		@UploadedFile() file: Express.Multer.File | undefined,
		@Body() uploadDto: UploadFileDto,
		@Req() req: Request & { user?: { id: number } }
	) {
		if (!file) {
			throw new BadRequestException('File is required')
		}

		// Validate file extension
		if (!file.originalname.toLowerCase().endsWith('.csv')) {
			throw new BadRequestException('Only CSV files are allowed')
		}

		// Validate file size (max 50MB)
		const maxSize = 50 * 1024 * 1024 // 50MB
		if (file.size > maxSize) {
			throw new BadRequestException('File size exceeds maximum limit of 50MB')
		}

		// Validate file is not empty
		if (file.size === 0) {
			throw new BadRequestException('File cannot be empty')
		}

		const userId = req.user?.id

		return this.dataService.createUpload(file, uploadDto.fileType, userId)
	}

	@Get('uploads')
	@ApiOperation({ summary: 'Get all uploads' })
	@ApiBearerAuth()
	async getUploads(@Req() req: Request & { user?: { id: number } }) {
		const userId = req.user?.id
		return this.dataService.getUploads(userId)
	}

	@Get('uploads/:id')
	@ApiOperation({ summary: 'Get upload by ID' })
	@ApiBearerAuth()
	async getUploadById(@Param('id', ParseIntPipe) id: number) {
		return this.dataService.getUploadById(id)
	}
}
