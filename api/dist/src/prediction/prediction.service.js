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
exports.PredictionService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const api_response_helper_1 = require("../common/helpers/api.response.helper");
const logger_service_1 = require("../common/logger/logger.service");
const queue_service_1 = require("../queue/queue.service");
const ml_service_1 = require("./ml.service");
let PredictionService = class PredictionService {
    prisma;
    queueService;
    mlService;
    logger = new logger_service_1.AppLogger();
    CONTEXT = 'PredictionService';
    constructor(prisma, queueService, mlService) {
        this.prisma = prisma;
        this.queueService = queueService;
        this.mlService = mlService;
    }
    async getPredictions(shtabelId, skladId, riskLevel, limit = 100) {
        try {
            const predictions = await this.prisma.prediction.findMany({
                where: {
                    ...(shtabelId && { shtabelId }),
                    ...(skladId && { skladId }),
                    ...(riskLevel && { riskLevel: riskLevel }),
                },
                include: {
                    shtabel: {
                        include: {
                            sklad: true,
                        },
                    },
                },
                orderBy: { ts: 'desc' },
                take: limit,
            });
            return (0, api_response_helper_1.successResponse)(predictions, 'Predictions retrieved');
        }
        catch (error) {
            this.logger.error('Error getting predictions', error instanceof Error ? error.stack : String(error), this.CONTEXT);
            return (0, api_response_helper_1.errorResponse)('Failed to get predictions', error);
        }
    }
    async getPredictionById(id) {
        try {
            const prediction = await this.prisma.prediction.findUnique({
                where: { id },
                include: {
                    shtabel: {
                        include: {
                            sklad: true,
                        },
                    },
                },
            });
            if (!prediction) {
                return (0, api_response_helper_1.errorResponse)('Prediction not found');
            }
            return (0, api_response_helper_1.successResponse)(prediction, 'Prediction retrieved');
        }
        catch (error) {
            this.logger.error('Error getting prediction', error instanceof Error ? error.stack : String(error), this.CONTEXT);
            return (0, api_response_helper_1.errorResponse)('Failed to get prediction', error);
        }
    }
    async createPrediction(shtabelId, horizonDays = 7) {
        try {
            const stockpile = await this.prisma.shtabel.findUnique({
                where: { id: shtabelId },
                include: {
                    sklad: true,
                },
            });
            if (!stockpile) {
                return (0, api_response_helper_1.errorResponse)('Stockpile not found');
            }
            if (stockpile.status !== 'ACTIVE') {
                return (0, api_response_helper_1.errorResponse)('Can only create predictions for active stockpiles');
            }
            await this.queueService.publish('prediction.calculate', {
                shtabelId,
                horizonDays,
            });
            this.logger.log(`Prediction queued for shtabel ${shtabelId}`, this.CONTEXT, {
                shtabelId,
                horizonDays,
            });
            return (0, api_response_helper_1.successResponse)({ shtabelId, horizonDays, queued: true }, 'Prediction queued for processing');
        }
        catch (error) {
            this.logger.error('Error queuing prediction', error instanceof Error ? error.stack : String(error), this.CONTEXT, {
                shtabelId,
            });
            return (0, api_response_helper_1.errorResponse)('Failed to queue prediction', error);
        }
    }
    async batchPredict() {
        try {
            const stockpiles = await this.prisma.shtabel.findMany({
                where: { status: 'ACTIVE' },
            });
            await this.queueService.publish('prediction.batch', {
                shtabelIds: stockpiles.map((s) => s.id),
            });
            return (0, api_response_helper_1.successResponse)({ queued: stockpiles.length }, 'Predictions queued for processing');
        }
        catch (error) {
            this.logger.error('Error batch predicting', error instanceof Error ? error.stack : String(error), this.CONTEXT);
            return (0, api_response_helper_1.errorResponse)('Failed to queue predictions', error);
        }
    }
};
exports.PredictionService = PredictionService;
exports.PredictionService = PredictionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        queue_service_1.QueueService,
        ml_service_1.MlService])
], PredictionService);
//# sourceMappingURL=prediction.service.js.map