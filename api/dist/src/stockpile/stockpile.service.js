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
exports.StockpileService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const prisma_enums_1 = require("../common/enums/prisma-enums");
const api_response_helper_1 = require("../common/helpers/api.response.helper");
const logger_service_1 = require("../common/logger/logger.service");
let StockpileService = class StockpileService {
    prisma;
    logger = new logger_service_1.AppLogger();
    CONTEXT = 'StockpileService';
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getSklads() {
        try {
            const sklads = await this.prisma.sklad.findMany({
                orderBy: { number: 'asc' },
                include: {
                    _count: {
                        select: {
                            shtabels: true,
                            fires: true,
                        },
                    },
                },
            });
            return (0, api_response_helper_1.successResponse)(sklads, 'Sklads retrieved');
        }
        catch (error) {
            this.logger.error('Error getting sklads', error instanceof Error ? error.stack : String(error), this.CONTEXT);
            return (0, api_response_helper_1.errorResponse)('Failed to get sklads', error);
        }
    }
    async getSkladById(id) {
        try {
            const sklad = await this.prisma.sklad.findUnique({
                where: { id },
                include: {
                    _count: {
                        select: {
                            shtabels: true,
                            fires: true,
                            supplies: true,
                            temps: true,
                        },
                    },
                },
            });
            if (!sklad) {
                return (0, api_response_helper_1.errorResponse)('Sklad not found');
            }
            return (0, api_response_helper_1.successResponse)(sklad, 'Sklad retrieved');
        }
        catch (error) {
            this.logger.error('Error getting sklad', error instanceof Error ? error.stack : String(error), this.CONTEXT);
            return (0, api_response_helper_1.errorResponse)('Failed to get sklad', error);
        }
    }
    async createSklad(dto) {
        try {
            const existing = await this.prisma.sklad.findUnique({
                where: { number: dto.number },
            });
            if (existing) {
                return (0, api_response_helper_1.errorResponse)(`Sklad with number ${dto.number} already exists`);
            }
            const sklad = await this.prisma.sklad.create({
                data: {
                    number: dto.number,
                    name: dto.name || `Склад ${dto.number}`,
                    locationRaw: dto.locationRaw,
                    description: dto.description,
                },
            });
            this.logger.log(`Sklad created: ${sklad.id}`, this.CONTEXT, {
                skladId: sklad.id,
            });
            return (0, api_response_helper_1.successResponse)(sklad, 'Sklad created');
        }
        catch (error) {
            this.logger.error('Error creating sklad', error instanceof Error ? error.stack : String(error), this.CONTEXT, { dto });
            return (0, api_response_helper_1.errorResponse)('Failed to create sklad', error);
        }
    }
    async updateSklad(id, dto) {
        try {
            const sklad = await this.prisma.sklad.findUnique({ where: { id } });
            if (!sklad) {
                return (0, api_response_helper_1.errorResponse)('Sklad not found');
            }
            if (dto.number && dto.number !== sklad.number) {
                const existing = await this.prisma.sklad.findUnique({
                    where: { number: dto.number },
                });
                if (existing) {
                    return (0, api_response_helper_1.errorResponse)(`Sklad with number ${dto.number} already exists`);
                }
            }
            const updated = await this.prisma.sklad.update({
                where: { id },
                data: {
                    ...(dto.number && { number: dto.number }),
                    ...(dto.name !== undefined && { name: dto.name }),
                    ...(dto.locationRaw !== undefined && {
                        locationRaw: dto.locationRaw,
                    }),
                    ...(dto.description !== undefined && {
                        description: dto.description,
                    }),
                },
            });
            this.logger.log(`Sklad updated: ${id}`, this.CONTEXT, { skladId: id });
            return (0, api_response_helper_1.successResponse)(updated, 'Sklad updated');
        }
        catch (error) {
            this.logger.error('Error updating sklad', error instanceof Error ? error.stack : String(error), this.CONTEXT, { id, dto });
            return (0, api_response_helper_1.errorResponse)('Failed to update sklad', error);
        }
    }
    async getStockpiles(skladId, status, limit = 100) {
        try {
            const stockpiles = await this.prisma.shtabel.findMany({
                where: {
                    ...(skladId && { skladId }),
                    ...(status && { status: status }),
                },
                include: {
                    sklad: true,
                    temps: {
                        orderBy: { recordDate: 'desc' },
                        take: 1,
                    },
                    predictions: {
                        orderBy: { ts: 'desc' },
                        take: 1,
                    },
                    _count: {
                        select: {
                            supplies: true,
                            fires: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                take: limit,
            });
            return (0, api_response_helper_1.successResponse)(stockpiles, 'Stockpiles retrieved');
        }
        catch (error) {
            this.logger.error('Error getting stockpiles', error instanceof Error ? error.stack : String(error), this.CONTEXT);
            return (0, api_response_helper_1.errorResponse)('Failed to get stockpiles', error);
        }
    }
    async getStockpileById(id) {
        try {
            const stockpile = await this.prisma.shtabel.findUnique({
                where: { id },
                include: {
                    sklad: true,
                    supplies: {
                        orderBy: { dateIn: 'desc' },
                        take: 20,
                    },
                    temps: {
                        orderBy: { recordDate: 'desc' },
                        take: 50,
                    },
                    predictions: {
                        orderBy: { ts: 'desc' },
                        take: 10,
                    },
                    fires: {
                        orderBy: { startDate: 'desc' },
                        take: 10,
                    },
                },
            });
            if (!stockpile) {
                return (0, api_response_helper_1.errorResponse)('Stockpile not found');
            }
            return (0, api_response_helper_1.successResponse)(stockpile, 'Stockpile retrieved');
        }
        catch (error) {
            this.logger.error('Error getting stockpile', error instanceof Error ? error.stack : String(error), this.CONTEXT);
            return (0, api_response_helper_1.errorResponse)('Failed to get stockpile', error);
        }
    }
    async createStockpile(dto) {
        try {
            const sklad = await this.prisma.sklad.findUnique({
                where: { id: dto.skladId },
            });
            if (!sklad) {
                return (0, api_response_helper_1.errorResponse)(`Sklad with id ${dto.skladId} not found`);
            }
            const existing = await this.prisma.shtabel.findUnique({
                where: {
                    skladId_label: {
                        skladId: dto.skladId,
                        label: dto.label,
                    },
                },
            });
            if (existing) {
                return (0, api_response_helper_1.errorResponse)(`Stockpile with label "${dto.label}" already exists in sklad ${dto.skladId}`);
            }
            const stockpile = await this.prisma.shtabel.create({
                data: {
                    skladId: dto.skladId,
                    label: dto.label,
                    mark: dto.mark,
                    formedAt: dto.formedAt ? new Date(dto.formedAt) : null,
                    height_m: dto.height_m,
                    width_m: dto.width_m,
                    length_m: dto.length_m,
                    mass_t: dto.mass_t,
                    currentMass: dto.mass_t,
                    status: dto.status || prisma_enums_1.ShtabelStatus.ACTIVE,
                },
                include: {
                    sklad: true,
                },
            });
            this.logger.log(`Stockpile created: ${stockpile.id}`, this.CONTEXT, {
                stockpileId: stockpile.id,
                skladId: dto.skladId,
            });
            return (0, api_response_helper_1.successResponse)(stockpile, 'Stockpile created');
        }
        catch (error) {
            this.logger.error('Error creating stockpile', error instanceof Error ? error.stack : String(error), this.CONTEXT, { dto });
            return (0, api_response_helper_1.errorResponse)('Failed to create stockpile', error);
        }
    }
    async updateStockpile(id, dto) {
        try {
            const stockpile = await this.prisma.shtabel.findUnique({ where: { id } });
            if (!stockpile) {
                return (0, api_response_helper_1.errorResponse)('Stockpile not found');
            }
            if ((dto.skladId || dto.label) &&
                (dto.skladId !== stockpile.skladId || dto.label !== stockpile.label)) {
                const newSkladId = dto.skladId || stockpile.skladId;
                const newLabel = dto.label || stockpile.label;
                if (dto.skladId) {
                    const sklad = await this.prisma.sklad.findUnique({
                        where: { id: dto.skladId },
                    });
                    if (!sklad) {
                        return (0, api_response_helper_1.errorResponse)(`Sklad with id ${dto.skladId} not found`);
                    }
                }
                const existing = await this.prisma.shtabel.findUnique({
                    where: {
                        skladId_label: {
                            skladId: newSkladId,
                            label: newLabel,
                        },
                    },
                });
                if (existing && existing.id !== id) {
                    return (0, api_response_helper_1.errorResponse)(`Stockpile with label "${newLabel}" already exists in sklad ${newSkladId}`);
                }
            }
            const updated = await this.prisma.shtabel.update({
                where: { id },
                data: {
                    ...(dto.skladId && { skladId: dto.skladId }),
                    ...(dto.label && { label: dto.label }),
                    ...(dto.mark !== undefined && { mark: dto.mark }),
                    ...(dto.formedAt && { formedAt: new Date(dto.formedAt) }),
                    ...(dto.height_m !== undefined && { height_m: dto.height_m }),
                    ...(dto.width_m !== undefined && { width_m: dto.width_m }),
                    ...(dto.length_m !== undefined && { length_m: dto.length_m }),
                    ...(dto.mass_t !== undefined && { mass_t: dto.mass_t }),
                    ...(dto.currentMass !== undefined && {
                        currentMass: dto.currentMass,
                    }),
                    ...(dto.lastTemp !== undefined && { lastTemp: dto.lastTemp }),
                    ...(dto.lastTempDate !== undefined && {
                        lastTempDate: dto.lastTempDate
                            ? new Date(dto.lastTempDate)
                            : null,
                    }),
                    ...(dto.status && { status: dto.status }),
                },
                include: {
                    sklad: true,
                },
            });
            this.logger.log(`Stockpile updated: ${id}`, this.CONTEXT, {
                stockpileId: id,
            });
            return (0, api_response_helper_1.successResponse)(updated, 'Stockpile updated');
        }
        catch (error) {
            this.logger.error('Error updating stockpile', error instanceof Error ? error.stack : String(error), this.CONTEXT, { id, dto });
            return (0, api_response_helper_1.errorResponse)('Failed to update stockpile', error);
        }
    }
    async deleteStockpile(id) {
        try {
            const stockpile = await this.prisma.shtabel.findUnique({ where: { id } });
            if (!stockpile) {
                return (0, api_response_helper_1.errorResponse)('Stockpile not found');
            }
            const [suppliesCount, tempsCount, predictionsCount, firesCount] = await Promise.all([
                this.prisma.supply.count({ where: { shtabelId: id } }),
                this.prisma.tempRecord.count({ where: { shtabelId: id } }),
                this.prisma.prediction.count({ where: { shtabelId: id } }),
                this.prisma.fireRecord.count({ where: { shtabelId: id } }),
            ]);
            if (suppliesCount > 0 ||
                tempsCount > 0 ||
                predictionsCount > 0 ||
                firesCount > 0) {
                const archived = await this.prisma.shtabel.update({
                    where: { id },
                    data: { status: prisma_enums_1.ShtabelStatus.ARCHIVED },
                });
                this.logger.log(`Stockpile archived: ${id}`, this.CONTEXT, {
                    stockpileId: id,
                });
                return (0, api_response_helper_1.successResponse)(archived, 'Stockpile archived (has related data)');
            }
            await this.prisma.shtabel.delete({ where: { id } });
            this.logger.log(`Stockpile deleted: ${id}`, this.CONTEXT, {
                stockpileId: id,
            });
            return (0, api_response_helper_1.successResponse)(null, 'Stockpile deleted');
        }
        catch (error) {
            this.logger.error('Error deleting stockpile', error instanceof Error ? error.stack : String(error), this.CONTEXT, { id });
            return (0, api_response_helper_1.errorResponse)('Failed to delete stockpile', error);
        }
    }
    async getStockpileTemperatureHistory(shtabelId, days = 30) {
        try {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);
            const temps = await this.prisma.tempRecord.findMany({
                where: {
                    shtabelId,
                    recordDate: {
                        gte: startDate,
                    },
                },
                orderBy: { recordDate: 'asc' },
            });
            return (0, api_response_helper_1.successResponse)(temps, 'Temperature history retrieved');
        }
        catch (error) {
            this.logger.error('Error getting temperature history', error instanceof Error ? error.stack : String(error), this.CONTEXT);
            return (0, api_response_helper_1.errorResponse)('Failed to get temperature history', error);
        }
    }
};
exports.StockpileService = StockpileService;
exports.StockpileService = StockpileService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], StockpileService);
//# sourceMappingURL=stockpile.service.js.map