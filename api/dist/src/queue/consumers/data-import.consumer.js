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
exports.DataImportConsumer = void 0;
const common_1 = require("@nestjs/common");
const queue_service_1 = require("../queue.service");
const data_import_processor_1 = require("./processors/data-import.processor");
const logger_service_1 = require("../../common/logger/logger.service");
let DataImportConsumer = class DataImportConsumer {
    queueService;
    dataImportProcessor;
    logger = new logger_service_1.AppLogger();
    CONTEXT = 'DataImportConsumer';
    constructor(queueService, dataImportProcessor) {
        this.queueService = queueService;
        this.dataImportProcessor = dataImportProcessor;
    }
    async onModuleInit() {
        await new Promise(resolve => setTimeout(resolve, 2000));
        try {
            await this.queueService.consume('data.import', async (message, msg) => {
                this.logger.log(`Processing data import: ${message.uploadId}`, this.CONTEXT, { uploadId: message.uploadId, fileType: message.fileType });
                try {
                    await this.dataImportProcessor.processImport(message.uploadId, message.filename, message.fileType);
                    this.logger.log(`Data import completed: ${message.uploadId}`, this.CONTEXT);
                }
                catch (error) {
                    this.logger.error(`Data import failed: ${message.uploadId}`, (error instanceof Error ? error.stack : String(error)), this.CONTEXT, { uploadId: message.uploadId, error });
                    throw error;
                }
            });
            this.logger.log('Data import consumer started', this.CONTEXT);
        }
        catch (error) {
            this.logger.error('Failed to start data import consumer', (error instanceof Error ? error.stack : String(error)), this.CONTEXT, { error });
        }
    }
};
exports.DataImportConsumer = DataImportConsumer;
exports.DataImportConsumer = DataImportConsumer = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [queue_service_1.QueueService,
        data_import_processor_1.DataImportProcessor])
], DataImportConsumer);
//# sourceMappingURL=data-import.consumer.js.map