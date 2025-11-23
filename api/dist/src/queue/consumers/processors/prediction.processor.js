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
exports.PredictionProcessor = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../prisma/prisma.service");
const logger_service_1 = require("../../../common/logger/logger.service");
const notification_service_1 = require("../../../notification/notification.service");
const ml_service_1 = require("../../../prediction/ml.service");
let PredictionProcessor = class PredictionProcessor {
    prisma;
    mlService;
    notificationService;
    logger = new logger_service_1.AppLogger();
    CONTEXT = 'PredictionProcessor';
    constructor(prisma, mlService, notificationService) {
        this.prisma = prisma;
        this.mlService = mlService;
        this.notificationService = notificationService;
    }
    async processPrediction(shtabelId, horizonDays) {
        try {
            const stockpile = await this.prisma.shtabel.findUnique({
                where: { id: shtabelId },
                include: {
                    sklad: true,
                },
            });
            if (!stockpile) {
                throw new Error(`Stockpile not found: ${shtabelId}`);
            }
            if (stockpile.status !== 'ACTIVE') {
                this.logger.warn(`Skipping prediction for inactive stockpile: ${shtabelId}`, this.CONTEXT);
                return;
            }
            const prediction = await this.mlService.predict(shtabelId, horizonDays);
            const saved = await this.prisma.prediction.create({
                data: {
                    ts: new Date(),
                    skladId: stockpile.skladId,
                    shtabelId,
                    modelName: prediction.model_name || 'xgboost_v1',
                    modelVersion: prediction.model_version,
                    predictedDate: prediction.predicted_date
                        ? new Date(prediction.predicted_date)
                        : null,
                    probEvent: prediction.prob_event,
                    riskLevel: prediction.risk_level,
                    horizonDays: prediction.horizon_days || 7,
                    intervalLow: prediction.interval_low
                        ? new Date(prediction.interval_low)
                        : null,
                    intervalHigh: prediction.interval_high
                        ? new Date(prediction.interval_high)
                        : null,
                    confidence: prediction.confidence,
                    meta: prediction.meta,
                },
            });
            if (prediction.risk_level === 'CRITICAL' ||
                prediction.risk_level === 'HIGH') {
                await this.sendRiskNotifications(saved.id, stockpile.id, prediction.risk_level);
            }
            this.logger.log(`Prediction saved: ${saved.id} for shtabel ${shtabelId}`, this.CONTEXT, { predictionId: saved.id, riskLevel: prediction.risk_level });
        }
        catch (error) {
            this.logger.error(`Prediction processing failed for shtabel ${shtabelId}`, error instanceof Error
                ? error instanceof Error
                    ? error.stack
                    : String(error)
                : String(error), this.CONTEXT, { shtabelId, error });
            throw error;
        }
    }
    async processBatchPredictions(shtabelIds) {
        this.logger.log(`Processing batch predictions for ${shtabelIds.length} stockpiles`, this.CONTEXT);
        const results = {
            success: 0,
            failed: 0,
            errors: [],
        };
        for (const shtabelId of shtabelIds) {
            try {
                await this.processPrediction(shtabelId);
                results.success++;
            }
            catch (error) {
                results.failed++;
                results.errors.push({
                    shtabelId,
                    error: error instanceof Error ? error.message : String(error),
                });
            }
        }
        this.logger.log(`Batch prediction completed: ${results.success} success, ${results.failed} failed`, this.CONTEXT, results);
    }
    async sendRiskNotifications(predictionId, shtabelId, riskLevel) {
        try {
            const users = await this.prisma.user.findMany({
                where: {
                    status: 'ACTIVE',
                    userSettings: {
                        OR: [
                            { notifyCritical: riskLevel === 'CRITICAL' },
                            { notifyHigh: riskLevel === 'HIGH' },
                        ],
                    },
                },
                include: {
                    userSettings: true,
                },
            });
            for (const user of users) {
                await this.notificationService.createNotification({
                    userId: user.id,
                    type: riskLevel === 'CRITICAL' ? 'CRITICAL_RISK' : 'HIGH_RISK',
                    title: `⚠️ ${riskLevel === 'CRITICAL' ? 'Критический' : 'Высокий'} риск возгорания`,
                    message: `Штабель #${shtabelId} имеет ${riskLevel === 'CRITICAL' ? 'критический' : 'высокий'} риск самовозгорания`,
                    predictionId,
                    shtabelId,
                });
            }
        }
        catch (error) {
            this.logger.error('Failed to send risk notifications', error instanceof Error ? error.stack : String(error), this.CONTEXT);
        }
    }
};
exports.PredictionProcessor = PredictionProcessor;
exports.PredictionProcessor = PredictionProcessor = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        ml_service_1.MlService,
        notification_service_1.NotificationService])
], PredictionProcessor);
//# sourceMappingURL=prediction.processor.js.map