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
exports.MlController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const ml_service_1 = require("./ml.service");
let MlController = class MlController {
    mlService;
    constructor(mlService) {
        this.mlService = mlService;
    }
    async trainModel(body) {
        return this.mlService.trainModel(body.modelName, body.modelVersion, body.config);
    }
    async getModels() {
        return this.mlService.getModels();
    }
    async getModelMetrics(modelName, limit) {
        return this.mlService.getModelMetrics(modelName, limit ? parseInt(limit.toString()) : 10);
    }
};
exports.MlController = MlController;
__decorate([
    (0, common_1.Post)('train'),
    (0, swagger_1.ApiOperation)({ summary: 'Queue model training' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MlController.prototype, "trainModel", null);
__decorate([
    (0, common_1.Get)('models'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all models' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MlController.prototype, "getModels", null);
__decorate([
    (0, common_1.Get)('metrics'),
    (0, swagger_1.ApiOperation)({ summary: 'Get model metrics' }),
    (0, swagger_1.ApiQuery)({ name: 'modelName', required: true, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    __param(0, (0, common_1.Query)('modelName')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], MlController.prototype, "getModelMetrics", null);
exports.MlController = MlController = __decorate([
    (0, swagger_1.ApiTags)('ML'),
    (0, common_1.Controller)('ml'),
    __metadata("design:paramtypes", [ml_service_1.MlService])
], MlController);
//# sourceMappingURL=ml.controller.js.map