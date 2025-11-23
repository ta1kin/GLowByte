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
exports.AppService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const logger_service_1 = require("./common/logger/logger.service");
let AppService = class AppService {
    prisma;
    logger = new logger_service_1.AppLogger();
    CONTEXT = 'AppService';
    constructor(prisma) {
        this.prisma = prisma;
    }
    getRoot() {
        return {
            service: 'Coal Fire Predictor API',
            version: '1.0.0',
            status: 'running',
            docs: '/api/docs',
        };
    }
    async getHealth() {
        try {
            await this.prisma.$queryRaw `SELECT 1`;
            return {
                status: 'healthy',
                service: 'coalfire-api',
                version: '1.0.0',
                database: 'connected',
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            this.logger.error('Health check failed', error instanceof Error
                ? error instanceof Error
                    ? error.stack
                    : String(error)
                : String(error), this.CONTEXT);
            return {
                status: 'unhealthy',
                service: 'coalfire-api',
                database: 'disconnected',
                error: error instanceof Error ? error.message : String(error),
                timestamp: new Date().toISOString(),
            };
        }
    }
};
exports.AppService = AppService;
exports.AppService = AppService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AppService);
//# sourceMappingURL=app.service.js.map