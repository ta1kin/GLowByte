import { OnModuleInit } from '@nestjs/common';
import { QueueService } from '../queue.service';
import { ModelTrainingProcessor } from './processors/model-training.processor';
export declare class ModelTrainingConsumer implements OnModuleInit {
    private queueService;
    private modelTrainingProcessor;
    private readonly logger;
    private readonly CONTEXT;
    constructor(queueService: QueueService, modelTrainingProcessor: ModelTrainingProcessor);
    onModuleInit(): Promise<void>;
}
