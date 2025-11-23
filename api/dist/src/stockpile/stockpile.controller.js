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
exports.StockpileController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const stockpile_service_1 = require("./stockpile.service");
const dto_1 = require("./dto");
let StockpileController = class StockpileController {
    stockpileService;
    constructor(stockpileService) {
        this.stockpileService = stockpileService;
    }
    async getSklads() {
        return this.stockpileService.getSklads();
    }
    async getSkladById(id) {
        return this.stockpileService.getSkladById(id);
    }
    async createSklad(dto) {
        return this.stockpileService.createSklad(dto);
    }
    async updateSklad(id, dto) {
        return this.stockpileService.updateSklad(id, dto);
    }
    async getStockpiles(skladId, status, limit) {
        return this.stockpileService.getStockpiles(skladId ? parseInt(skladId.toString()) : undefined, status, limit ? parseInt(limit.toString()) : 100);
    }
    async getStockpileById(id) {
        return this.stockpileService.getStockpileById(id);
    }
    async createStockpile(dto) {
        return this.stockpileService.createStockpile(dto);
    }
    async updateStockpile(id, dto) {
        return this.stockpileService.updateStockpile(id, dto);
    }
    async deleteStockpile(id) {
        return this.stockpileService.deleteStockpile(id);
    }
    async getTemperatureHistory(id, days) {
        return this.stockpileService.getStockpileTemperatureHistory(id, days ? parseInt(days.toString()) : 30);
    }
};
exports.StockpileController = StockpileController;
__decorate([
    (0, common_1.Get)('sklads'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all sklads' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], StockpileController.prototype, "getSklads", null);
__decorate([
    (0, common_1.Get)('sklads/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get sklad by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: Number }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], StockpileController.prototype, "getSkladById", null);
__decorate([
    (0, common_1.Post)('sklads'),
    (0, swagger_1.ApiOperation)({ summary: 'Create new sklad' }),
    (0, swagger_1.ApiBearerAuth)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateSkladDto]),
    __metadata("design:returntype", Promise)
], StockpileController.prototype, "createSklad", null);
__decorate([
    (0, common_1.Put)('sklads/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update sklad' }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiParam)({ name: 'id', type: Number }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], StockpileController.prototype, "updateSklad", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all stockpiles' }),
    (0, swagger_1.ApiQuery)({ name: 'skladId', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    __param(0, (0, common_1.Query)('skladId')),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, Number]),
    __metadata("design:returntype", Promise)
], StockpileController.prototype, "getStockpiles", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get stockpile by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: Number }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], StockpileController.prototype, "getStockpileById", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create new stockpile' }),
    (0, swagger_1.ApiBearerAuth)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateStockpileDto]),
    __metadata("design:returntype", Promise)
], StockpileController.prototype, "createStockpile", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update stockpile' }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiParam)({ name: 'id', type: Number }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, dto_1.UpdateStockpileDto]),
    __metadata("design:returntype", Promise)
], StockpileController.prototype, "updateStockpile", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete stockpile (or archive if has related data)' }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiParam)({ name: 'id', type: Number }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], StockpileController.prototype, "deleteStockpile", null);
__decorate([
    (0, common_1.Get)(':id/temperature'),
    (0, swagger_1.ApiOperation)({ summary: 'Get temperature history for stockpile' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'days', required: false, type: Number }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('days')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], StockpileController.prototype, "getTemperatureHistory", null);
exports.StockpileController = StockpileController = __decorate([
    (0, swagger_1.ApiTags)('Stockpiles'),
    (0, common_1.Controller)('stockpiles'),
    __metadata("design:paramtypes", [stockpile_service_1.StockpileService])
], StockpileController);
//# sourceMappingURL=stockpile.controller.js.map