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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const analytics_service_1 = require("./analytics.service");
let AnalyticsController = class AnalyticsController {
    analyticsService;
    constructor(analyticsService) {
        this.analyticsService = analyticsService;
    }
    async getModelMetrics(modelName, periodDays) {
        return this.analyticsService.getModelMetrics(modelName, periodDays ? parseInt(periodDays.toString()) : 30);
    }
    async getPredictionAccuracy() {
        return this.analyticsService.getPredictionAccuracy();
    }
    async getDashboardStats() {
        return this.analyticsService.getDashboardStats();
    }
    async getRiskDistribution() {
        return this.analyticsService.getRiskDistribution();
    }
    async getTemperatureTrends(shtabelId, days) {
        return this.analyticsService.getTemperatureTrends(shtabelId ? parseInt(shtabelId.toString()) : undefined, days ? parseInt(days.toString()) : 30);
    }
};
exports.AnalyticsController = AnalyticsController;
__decorate([
    (0, common_1.Get)('metrics'),
    (0, swagger_1.ApiOperation)({ summary: 'Get model metrics' }),
    (0, swagger_1.ApiQuery)({ name: 'modelName', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'periodDays', required: false, type: Number }),
    __param(0, (0, common_1.Query)('modelName')),
    __param(1, (0, common_1.Query)('periodDays')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getModelMetrics", null);
__decorate([
    (0, common_1.Get)('accuracy'),
    (0, swagger_1.ApiOperation)({ summary: 'Get prediction accuracy statistics' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getPredictionAccuracy", null);
__decorate([
    (0, common_1.Get)('dashboard'),
    (0, swagger_1.ApiOperation)({ summary: 'Get dashboard statistics' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getDashboardStats", null);
__decorate([
    (0, common_1.Get)('risk-distribution'),
    (0, swagger_1.ApiOperation)({ summary: 'Get risk level distribution for last 30 days' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getRiskDistribution", null);
__decorate([
    (0, common_1.Get)('temperature-trends'),
    (0, swagger_1.ApiOperation)({ summary: 'Get temperature trends' }),
    (0, swagger_1.ApiQuery)({ name: 'shtabelId', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'days', required: false, type: Number }),
    __param(0, (0, common_1.Query)('shtabelId')),
    __param(1, (0, common_1.Query)('days')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getTemperatureTrends", null);
exports.AnalyticsController = AnalyticsController = __decorate([
    (0, swagger_1.ApiTags)('Analytics'),
    (0, common_1.Controller)('analytics'),
    __metadata("design:paramtypes", [analytics_service_1.AnalyticsService])
], AnalyticsController);
//# sourceMappingURL=analytics.controller.js.map