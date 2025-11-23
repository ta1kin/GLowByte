"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelTrainingConsumer = void 0;
const common_1 = require("@nestjs/common");
const queue_service_1 = require("../queue.service");
const model_training_processor_1 = require("./processors/model-training.processor");
const logger_service_1 = require("../../common/logger/logger.service");
let ModelTrainingConsumer = class ModelTrainingConsumer {
    queueService;
    modelTrainingProcessor;
    logger = new logger_service_1.AppLogger();
    CONTEXT = 'ModelTrainingConsumer';
    constructor(queueService, modelTrainingProcessor) {
        this.queueService = queueService;
        this.modelTrainingProcessor = modelTrainingProcessor;
    }
    async onModuleInit() {
        await new Promise(resolve => setTimeout(resolve, 2000));
        try {
            await this.queueService.consume('model.train', async (message, msg) => {
                this.logger.log(`Processing model training: ${message.modelName || 'default'}`, this.CONTEXT, {
                    modelName: message.modelName,
                    modelVersion: message.modelVersion,
                    config: message.config,
                });
                try {
                    await this.modelTrainingProcessor.processTraining(message.modelName, message.modelVersion, message.config);
                    this.logger.log(`Model training completed: ${message.modelName}`, this.CONTEXT);
                }
                catch (error) {
                    this.logger.error(`Model training failed: ${message.modelName}`, (error instanceof Error ? error.stack : String(error)), this.CONTEXT, { modelName: message.modelName, error });
                    throw error;
                }
            });
            this.logger.log('Model training consumer started', this.CONTEXT);
        }
        catch (error) {
            this.logger.error('Failed to start model training consumer', (error instanceof Error ? error.stack : String(error)), this.CONTEXT, { error });
        }
    }
};
exports.ModelTrainingConsumer = ModelTrainingConsumer;
exports.ModelTrainingConsumer = ModelTrainingConsumer = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [queue_service_1.QueueService,
        model_training_processor_1.ModelTrainingProcessor])
], ModelTrainingConsumer);
//# sourceMappingURL=model-training.consumer.js.map