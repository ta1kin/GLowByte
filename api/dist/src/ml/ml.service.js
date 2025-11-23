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
exports.MlService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const api_response_helper_1 = require("../common/helpers/api.response.helper");
const logger_service_1 = require("../common/logger/logger.service");
const queue_service_1 = require("../queue/queue.service");
let MlService = class MlService {
    prisma;
    queueService;
    logger = new logger_service_1.AppLogger();
    CONTEXT = 'MlService';
    constructor(prisma, queueService) {
        this.prisma = prisma;
        this.queueService = queueService;
    }
    async trainModel(modelName, modelVersion, config) {
        try {
            await this.queueService.publish('model.train', {
                modelName,
                modelVersion,
                config: config || {},
            });
            return (0, api_response_helper_1.successResponse)({ modelName, modelVersion, queued: true }, 'Model training queued');
        }
        catch (error) {
            this.logger.error('Error queuing model training', error instanceof Error ? error.stack : String(error), this.CONTEXT);
            return (0, api_response_helper_1.errorResponse)('Failed to queue model training', error);
        }
    }
    async getModels() {
        try {
            const models = await this.prisma.modelArtifact.findMany({
                orderBy: { createdAt: 'desc' },
            });
            return (0, api_response_helper_1.successResponse)(models, 'Models retrieved');
        }
        catch (error) {
            this.logger.error('Error getting models', error instanceof Error ? error.stack : String(error), this.CONTEXT);
            return (0, api_response_helper_1.errorResponse)('Failed to get models', error);
        }
    }
    async getModelMetrics(modelName, limit = 10) {
        try {
            const metrics = await this.prisma.metric.findMany({
                where: { modelName },
                orderBy: { periodStart: 'desc' },
                take: limit,
            });
            return (0, api_response_helper_1.successResponse)(metrics, 'Model metrics retrieved');
        }
        catch (error) {
            this.logger.error('Error getting model metrics', error instanceof Error ? error.stack : String(error), this.CONTEXT);
            return (0, api_response_helper_1.errorResponse)('Failed to get model metrics', error);
        }
    }
};
exports.MlService = MlService;
exports.MlService = MlService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        queue_service_1.QueueService])
], MlService);
//# sourceMappingURL=ml.service.js.map