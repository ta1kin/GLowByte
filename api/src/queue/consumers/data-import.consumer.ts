import { Injectable, OnModuleInit } from '@nestjs/common';
import { QueueService } from '../queue.service';
import { DataImportProcessor } from './processors/data-import.processor';
import { AppLogger } from '../../common/logger/logger.service';

@Injectable()
export class DataImportConsumer implements OnModuleInit {
  private readonly logger = new AppLogger();
  private readonly CONTEXT = 'DataImportConsumer';

  constructor(
    private queueService: QueueService,
    private dataImportProcessor: DataImportProcessor,
  ) {}

  async onModuleInit() {
    await this.queueService.consume('data.import', async (message, msg) => {
      this.logger.log(
        `Processing data import: ${message.uploadId}`,
        this.CONTEXT,
        { uploadId: message.uploadId, fileType: message.fileType },
      );

      try {
        await this.dataImportProcessor.processImport(
          message.uploadId,
          message.filename,
          message.fileType,
        );
        this.logger.log(
          `Data import completed: ${message.uploadId}`,
          this.CONTEXT,
        );
      } catch (error) {
        this.logger.error(
          `Data import failed: ${message.uploadId}`,
          error.stack,
          this.CONTEXT,
          { uploadId: message.uploadId, error },
        );
        throw error; // Will trigger retry or DLQ
      }
    });

    this.logger.log('Data import consumer started', this.CONTEXT);
  }
}

