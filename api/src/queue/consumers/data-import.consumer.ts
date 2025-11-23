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
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    try {
      await this.queueService.consume('data.import', async (message, msg) => {
      this.logger.log(
        `Обработка импорта данных: ${message.uploadId}`,
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
          `Импорт данных завершен: ${message.uploadId}`,
          this.CONTEXT,
        );
      } catch (error) {
        this.logger.error(
          `Импорт данных завершился ошибкой: ${message.uploadId}`,
          (error instanceof Error ? error.stack : String(error)),
          this.CONTEXT,
          { uploadId: message.uploadId, error },
        );
        throw error;
      }
    });

    this.logger.log('Потребитель импорта данных запущен', this.CONTEXT);
    } catch (error) {
      this.logger.error(
        'Не удалось запустить потребитель импорта данных',
        (error instanceof Error ? error.stack : String(error)),
        this.CONTEXT,
        { error }
      );
    }
  }
}

