import { OnModuleInit } from '@nestjs/common';
import { QueueService } from '../queue.service';
import { DataImportProcessor } from './processors/data-import.processor';
export declare class DataImportConsumer implements OnModuleInit {
    private queueService;
    private dataImportProcessor;
    private readonly logger;
    private readonly CONTEXT;
    constructor(queueService: QueueService, dataImportProcessor: DataImportProcessor);
    onModuleInit(): Promise<void>;
}
