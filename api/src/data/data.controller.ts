import { Controller, Get, Post, Param, UseInterceptors, UploadedFile, ParseIntPipe } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { DataService } from './data.service';

@ApiTags('Data')
@Controller('data')
export class DataController {
  constructor(private readonly dataService: DataService) {}

  @Post('upload')
  @ApiOperation({ summary: 'Upload CSV file' })
  @ApiConsumes('multipart/form-data')
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
    @UploadedFile() file: Express.Multer.File,
    @Body('fileType') fileType: string,
    // @Request() req: any, // TODO: Add auth guard
  ) {
    // TODO: Validate file type and process
    return this.dataService.createUpload(file.originalname, fileType as any);
  }

  @Get('uploads')
  @ApiOperation({ summary: 'Get all uploads' })
  async getUploads() {
    return this.dataService.getUploads();
  }

  @Get('uploads/:id')
  @ApiOperation({ summary: 'Get upload by ID' })
  async getUploadById(@Param('id', ParseIntPipe) id: number) {
    return this.dataService.getUploadById(id);
  }
}

