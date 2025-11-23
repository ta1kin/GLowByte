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
exports.AnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const api_response_helper_1 = require("../common/helpers/api.response.helper");
const logger_service_1 = require("../common/logger/logger.service");
let AnalyticsService = class AnalyticsService {
    prisma;
    logger = new logger_service_1.AppLogger();
    CONTEXT = 'AnalyticsService';
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getModelMetrics(modelName, periodDays = 30) {
        try {
            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - periodDays);
            const metrics = await this.prisma.metric.findMany({
                where: {
                    ...(modelName && { modelName }),
                    periodStart: {
                        gte: startDate,
                    },
                },
                orderBy: { periodStart: 'desc' },
            });
            return (0, api_response_helper_1.successResponse)(metrics, 'Model metrics retrieved');
        }
        catch (error) {
            this.logger.error('Error getting model metrics', error instanceof Error ? error.stack : String(error), this.CONTEXT);
            return (0, api_response_helper_1.errorResponse)('Failed to get model metrics', error);
        }
    }
    async getPredictionAccuracy() {
        try {
            const predictions = await this.prisma.prediction.findMany({
                where: {
                    actualFireDate: { not: null },
                    accuracy_days: { not: null },
                },
                select: {
                    accuracy_days: true,
                    isAccurate: true,
                    riskLevel: true,
                    modelName: true,
                },
            });
            const total = predictions.length;
            const accurate = predictions.filter((p) => p.isAccurate).length;
            const accuracy = total > 0 ? accurate / total : 0;
            const byRiskLevel = predictions.reduce((acc, p) => {
                const level = p.riskLevel || 'UNKNOWN';
                if (!acc[level]) {
                    acc[level] = { total: 0, accurate: 0 };
                }
                acc[level].total++;
                if (p.isAccurate)
                    acc[level].accurate++;
                return acc;
            }, {});
            const byModel = predictions.reduce((acc, p) => {
                const model = p.modelName || 'UNKNOWN';
                if (!acc[model]) {
                    acc[model] = { total: 0, accurate: 0 };
                }
                acc[model].total++;
                if (p.isAccurate)
                    acc[model].accurate++;
                return acc;
            }, {});
            return (0, api_response_helper_1.successResponse)({
                total,
                accurate,
                accuracy,
                accuracyPercent: (accuracy * 100).toFixed(2),
                byRiskLevel: Object.entries(byRiskLevel).map(([level, data]) => ({
                    riskLevel: level,
                    total: data.total,
                    accurate: data.accurate,
                    accuracy: data.total > 0 ? (data.accurate / data.total) * 100 : 0,
                })),
                byModel: Object.entries(byModel).map(([model, data]) => ({
                    modelName: model,
                    total: data.total,
                    accurate: data.accurate,
                    accuracy: data.total > 0 ? (data.accurate / data.total) * 100 : 0,
                })),
            }, 'Prediction accuracy calculated');
        }
        catch (error) {
            this.logger.error('Error calculating accuracy', error instanceof Error ? error.stack : String(error), this.CONTEXT);
            return (0, api_response_helper_1.errorResponse)('Failed to calculate accuracy', error);
        }
    }
    async getDashboardStats() {
        try {
            const [totalStockpiles, activeStockpiles, totalPredictions, criticalPredictions, highPredictions, totalFires, recentFires, totalSklads,] = await Promise.all([
                this.prisma.shtabel.count(),
                this.prisma.shtabel.count({ where: { status: 'ACTIVE' } }),
                this.prisma.prediction.count(),
                this.prisma.prediction.count({ where: { riskLevel: 'CRITICAL' } }),
                this.prisma.prediction.count({ where: { riskLevel: 'HIGH' } }),
                this.prisma.fireRecord.count(),
                this.prisma.fireRecord.count({
                    where: {
                        startDate: {
                            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                        },
                    },
                }),
                this.prisma.sklad.count(),
            ]);
            const recentPredictions = await this.prisma.prediction.findMany({
                where: {
                    ts: {
                        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                    },
                },
                orderBy: { ts: 'desc' },
                take: 10,
                include: {
                    shtabel: {
                        include: {
                            sklad: true,
                        },
                    },
                },
            });
            return (0, api_response_helper_1.successResponse)({
                stockpiles: {
                    total: totalStockpiles,
                    active: activeStockpiles,
                },
                sklads: {
                    total: totalSklads,
                },
                predictions: {
                    total: totalPredictions,
                    critical: criticalPredictions,
                    high: highPredictions,
                    recent: recentPredictions,
                },
                fires: {
                    total: totalFires,
                    recent: recentFires,
                },
            }, 'Dashboard stats retrieved');
        }
        catch (error) {
            this.logger.error('Error getting dashboard stats', error instanceof Error ? error.stack : String(error), this.CONTEXT);
            return (0, api_response_helper_1.errorResponse)('Failed to get dashboard stats', error);
        }
    }
    async getRiskDistribution() {
        try {
            const predictions = await this.prisma.prediction.findMany({
                where: {
                    ts: {
                        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                    },
                },
                select: {
                    riskLevel: true,
                },
            });
            const distribution = predictions.reduce((acc, p) => {
                const level = p.riskLevel || 'UNKNOWN';
                acc[level] = (acc[level] || 0) + 1;
                return acc;
            }, {});
            return (0, api_response_helper_1.successResponse)(distribution, 'Risk distribution retrieved');
        }
        catch (error) {
            this.logger.error('Error getting risk distribution', error instanceof Error ? error.stack : String(error), this.CONTEXT);
            return (0, api_response_helper_1.errorResponse)('Failed to get risk distribution', error);
        }
    }
    async getTemperatureTrends(shtabelId, days = 30) {
        try {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);
            const temps = await this.prisma.tempRecord.findMany({
                where: {
                    ...(shtabelId && { shtabelId }),
                    recordDate: {
                        gte: startDate,
                    },
                },
                orderBy: { recordDate: 'asc' },
                select: {
                    maxTemp: true,
                    recordDate: true,
                    shtabelId: true,
                    riskLevel: true,
                },
            });
            const trends = temps.reduce((acc, temp) => {
                const date = temp.recordDate.toISOString().split('T')[0];
                if (!acc[date]) {
                    acc[date] = {
                        date,
                        count: 0,
                        avgTemp: 0,
                        maxTemp: 0,
                        criticalCount: 0,
                    };
                }
                acc[date].count++;
                acc[date].avgTemp += temp.maxTemp || 0;
                acc[date].maxTemp = Math.max(acc[date].maxTemp, temp.maxTemp || 0);
                if (temp.riskLevel === 'CRITICAL')
                    acc[date].criticalCount++;
                return acc;
            }, {});
            const trendsArray = Object.values(trends);
            trendsArray.forEach(trend => {
                trend.avgTemp = trend.avgTemp / trend.count;
            });
            return (0, api_response_helper_1.successResponse)({
                trends: trendsArray,
                totalRecords: temps.length,
            }, 'Temperature trends retrieved');
        }
        catch (error) {
            this.logger.error('Error getting temperature trends', error instanceof Error ? error.stack : String(error), this.CONTEXT);
            return (0, api_response_helper_1.errorResponse)('Failed to get temperature trends', error);
        }
    }
};
exports.AnalyticsService = AnalyticsService;
exports.AnalyticsService = AnalyticsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AnalyticsService);
//# sourceMappingURL=analytics.service.js.map