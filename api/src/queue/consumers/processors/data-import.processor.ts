import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { AppLogger } from '../../../common/logger/logger.service';
import { FileType, UploadStatus } from '@prisma/client';
import { SuppliesService } from '../../../data/services/supplies.service';
import { FiresService } from '../../../data/services/fires.service';
import { TemperatureService } from '../../../data/services/temperature.service';
import { WeatherService } from '../../../data/services/weather.service';
import { QueueService } from '../../queue.service';
import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';

@Injectable()
export class DataImportProcessor {
  private readonly logger = new AppLogger();
  private readonly CONTEXT = 'DataImportProcessor';
  private readonly uploadsDir = process.env.UPLOADS_DIR || './uploads';

  constructor(
    private prisma: PrismaService,
    private suppliesService: SuppliesService,
    private firesService: FiresService,
    private temperatureService: TemperatureService,
    private weatherService: WeatherService,
    private queueService: QueueService,
  ) {}

  async processImport(
    uploadId: number,
    filename: string,
    fileType: FileType,
  ): Promise<void> {
    try {
      // Update upload status to PROCESSING
      await this.prisma.upload.update({
        where: { id: uploadId },
        data: { status: 'PROCESSING' },
      });

      // Read CSV file
      const filePath = path.join(this.uploadsDir, filename);
      if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
      }

      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      });

      this.logger.log(
        `Processing ${records.length} records from ${filename}`,
        this.CONTEXT,
        { uploadId, fileType, recordCount: records.length },
      );

      let processed = 0;
      let failed = 0;
      const errors: any[] = [];

      // Process based on file type
      switch (fileType) {
        case 'SUPPLIES':
          ({ processed, failed } = await this.suppliesService.processCSV(
            records,
            uploadId,
          ));
          break;
        case 'FIRES':
          ({ processed, failed } = await this.firesService.processCSV(
            records,
            uploadId,
          ));
          break;
        case 'TEMPERATURE':
          ({ processed, failed } = await this.temperatureService.processCSV(
            records,
            uploadId,
          ));
          break;
        case 'WEATHER':
          ({ processed, failed } = await this.weatherService.processCSV(
            records,
            uploadId,
          ));
          break;
        default:
          throw new Error(`Unknown file type: ${fileType}`);
      }

      // Update upload status
      const status: UploadStatus =
        failed === 0 ? 'COMPLETED' : failed < records.length ? 'PARTIAL' : 'FAILED';

      await this.prisma.upload.update({
        where: { id: uploadId },
        data: {
          status,
          rowsTotal: records.length,
          rowsProcessed: processed,
          rowsFailed: failed,
          errors: errors.length > 0 ? errors : null,
        },
      });

      this.logger.log(
        `Import completed: ${processed} processed, ${failed} failed`,
        this.CONTEXT,
        { uploadId, processed, failed, status },
      );
    } catch (error) {
      // Update upload status to FAILED
      await this.prisma.upload.update({
        where: { id: uploadId },
        data: {
          status: 'FAILED',
          errors: { error: error.message, stack: error.stack },
        },
      });

      this.logger.error(
        `Import failed for upload ${uploadId}`,
        error.stack,
        this.CONTEXT,
        { uploadId, filename, fileType, error },
      );

      throw error;
    }
  }
}

