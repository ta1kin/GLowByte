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
exports.PredictionConsumer = void 0;
const common_1 = require("@nestjs/common");
const queue_service_1 = require("../queue.service");
const prediction_processor_1 = require("./processors/prediction.processor");
const logger_service_1 = require("../../common/logger/logger.service");
let PredictionConsumer = class PredictionConsumer {
    queueService;
    predictionProcessor;
    logger = new logger_service_1.AppLogger();
    CONTEXT = 'PredictionConsumer';
    constructor(queueService, predictionProcessor) {
        this.queueService = queueService;
        this.predictionProcessor = predictionProcessor;
    }
    async onModuleInit() {
        await new Promise(resolve => setTimeout(resolve, 2000));
        try {
            await this.queueService.consume('prediction.calculate', async (message, msg) => {
                this.logger.log(`Processing prediction: shtabel ${message.shtabelId}`, this.CONTEXT, { shtabelId: message.shtabelId });
                try {
                    await this.predictionProcessor.processPrediction(message.shtabelId, message.horizonDays);
                    this.logger.log(`Prediction completed: shtabel ${message.shtabelId}`, this.CONTEXT);
                }
                catch (error) {
                    this.logger.error(`Prediction failed: shtabel ${message.shtabelId}`, error instanceof Error ? (error instanceof Error ? error.stack : String(error)) : String(error), this.CONTEXT, { shtabelId: message.shtabelId, error });
                    throw error;
                }
            });
            await this.queueService.consume('prediction.batch', async (message, msg) => {
                this.logger.log(`Processing batch prediction: ${message.shtabelIds?.length || 0} stockpiles`, this.CONTEXT, { count: message.shtabelIds?.length });
                try {
                    await this.predictionProcessor.processBatchPredictions(message.shtabelIds || []);
                    this.logger.log('Batch prediction completed', this.CONTEXT);
                }
                catch (error) {
                    this.logger.error('Batch prediction failed', error instanceof Error ? (error instanceof Error ? error.stack : String(error)) : String(error), this.CONTEXT, { error });
                    throw error;
                }
            });
            this.logger.log('Prediction consumers started', this.CONTEXT);
        }
        catch (error) {
            this.logger.error('Failed to start prediction consumers', (error instanceof Error ? error.stack : String(error)), this.CONTEXT, { error });
        }
    }
};
exports.PredictionConsumer = PredictionConsumer;
exports.PredictionConsumer = PredictionConsumer = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [queue_service_1.QueueService,
        prediction_processor_1.PredictionProcessor])
], PredictionConsumer);
//# sourceMappingURL=prediction.consumer.js.map