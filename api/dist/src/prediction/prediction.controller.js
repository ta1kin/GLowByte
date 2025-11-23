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
exports.PredictionController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const prediction_service_1 = require("./prediction.service");
const dto_1 = require("./dto");
let PredictionController = class PredictionController {
    predictionService;
    constructor(predictionService) {
        this.predictionService = predictionService;
    }
    async getPredictions(shtabelId, skladId, riskLevel, limit) {
        return this.predictionService.getPredictions(shtabelId ? parseInt(shtabelId.toString()) : undefined, skladId ? parseInt(skladId.toString()) : undefined, riskLevel, limit ? parseInt(limit.toString()) : 100);
    }
    async getPredictionById(id) {
        return this.predictionService.getPredictionById(id);
    }
    async createPrediction(dto) {
        return this.predictionService.createPrediction(dto.shtabelId, dto.horizonDays);
    }
    async batchPredict() {
        return this.predictionService.batchPredict();
    }
};
exports.PredictionController = PredictionController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all predictions' }),
    (0, swagger_1.ApiQuery)({ name: 'shtabelId', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'skladId', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'riskLevel', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    __param(0, (0, common_1.Query)('shtabelId')),
    __param(1, (0, common_1.Query)('skladId')),
    __param(2, (0, common_1.Query)('riskLevel')),
    __param(3, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String, Number]),
    __metadata("design:returntype", Promise)
], PredictionController.prototype, "getPredictions", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get prediction by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: Number }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], PredictionController.prototype, "getPredictionById", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create prediction for stockpile (queued)' }),
    (0, swagger_1.ApiBearerAuth)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreatePredictionDto]),
    __metadata("design:returntype", Promise)
], PredictionController.prototype, "createPrediction", null);
__decorate([
    (0, common_1.Post)('batch/calculate'),
    (0, swagger_1.ApiOperation)({ summary: 'Queue batch predictions for all active stockpiles' }),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PredictionController.prototype, "batchPredict", null);
exports.PredictionController = PredictionController = __decorate([
    (0, swagger_1.ApiTags)('Predictions'),
    (0, common_1.Controller)('predictions'),
    __metadata("design:paramtypes", [prediction_service_1.PredictionService])
], PredictionController);
//# sourceMappingURL=prediction.controller.js.map