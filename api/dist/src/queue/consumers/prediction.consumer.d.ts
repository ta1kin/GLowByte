import { OnModuleInit } from '@nestjs/common';
import { QueueService } from '../queue.service';
import { PredictionProcessor } from './processors/prediction.processor';
export declare class PredictionConsumer implements OnModuleInit {
    private queueService;
    private predictionProcessor;
    private readonly logger;
    private readonly CONTEXT;
    constructor(queueService: QueueService, predictionProcessor: PredictionProcessor);
    onModuleInit(): Promise<void>;
}
