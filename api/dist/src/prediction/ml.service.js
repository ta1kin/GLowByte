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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MlService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = __importDefault(require("axios"));
const logger_service_1 = require("../common/logger/logger.service");
let MlService = class MlService {
    logger = new logger_service_1.AppLogger();
    CONTEXT = 'MlService';
    client;
    mlServiceUrl;
    constructor() {
        this.mlServiceUrl = process.env.ML_SERVICE_URL || 'http://localhost:8000';
        this.client = axios_1.default.create({
            baseURL: this.mlServiceUrl,
            timeout: 30000,
        });
    }
    async predict(shtabelId, horizonDays) {
        try {
            const response = await this.client.post('/predict', {
                shtabel_id: shtabelId,
                horizon_days: horizonDays || 7,
            });
            return response.data;
        }
        catch (error) {
            this.logger.error(`ML Service prediction error for shtabel ${shtabelId}`, error instanceof Error ? (error instanceof Error ? error.stack : String(error)) : String(error), this.CONTEXT);
            throw error;
        }
    }
    async batchPredict(shtabelIds) {
        try {
            const response = await this.client.post('/predict/batch', {
                shtabel_ids: shtabelIds,
            });
            return response.data;
        }
        catch (error) {
            this.logger.error('ML Service batch prediction error', error instanceof Error ? (error instanceof Error ? error.stack : String(error)) : String(error), this.CONTEXT);
            throw error;
        }
    }
    async getMetrics() {
        try {
            const response = await this.client.get('/metrics');
            return response.data;
        }
        catch (error) {
            this.logger.error('ML Service metrics error', error instanceof Error ? (error instanceof Error ? error.stack : String(error)) : String(error), this.CONTEXT);
            throw error;
        }
    }
    async healthCheck() {
        try {
            const response = await this.client.get('/health');
            return response.data;
        }
        catch (error) {
            this.logger.error('ML Service health check error', error instanceof Error ? (error instanceof Error ? error.stack : String(error)) : String(error), this.CONTEXT);
            return { status: 'unhealthy' };
        }
    }
};
exports.MlService = MlService;
exports.MlService = MlService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], MlService);
//# sourceMappingURL=ml.service.js.map