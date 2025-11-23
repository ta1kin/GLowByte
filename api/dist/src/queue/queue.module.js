"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueueModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../../prisma/prisma.module");
const data_module_1 = require("../data/data.module");
const notification_module_1 = require("../notification/notification.module");
const prediction_module_1 = require("../prediction/prediction.module");
const data_import_consumer_1 = require("./consumers/data-import.consumer");
const model_training_consumer_1 = require("./consumers/model-training.consumer");
const prediction_consumer_1 = require("./consumers/prediction.consumer");
const data_import_processor_1 = require("./consumers/processors/data-import.processor");
const model_training_processor_1 = require("./consumers/processors/model-training.processor");
const prediction_processor_1 = require("./consumers/processors/prediction.processor");
const queue_service_1 = require("./queue.service");
let QueueModule = class QueueModule {
};
exports.QueueModule = QueueModule;
exports.QueueModule = QueueModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_module_1.PrismaModule,
            (0, common_1.forwardRef)(() => data_module_1.DataModule),
            (0, common_1.forwardRef)(() => prediction_module_1.PredictionModule),
            notification_module_1.NotificationModule,
        ],
        providers: [
            queue_service_1.QueueService,
            data_import_consumer_1.DataImportConsumer,
            prediction_consumer_1.PredictionConsumer,
            model_training_consumer_1.ModelTrainingConsumer,
            data_import_processor_1.DataImportProcessor,
            prediction_processor_1.PredictionProcessor,
            model_training_processor_1.ModelTrainingProcessor,
        ],
        exports: [queue_service_1.QueueService],
    })
], QueueModule);
//# sourceMappingURL=queue.module.js.map