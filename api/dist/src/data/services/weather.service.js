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
exports.WeatherService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma/prisma.service");
const logger_service_1 = require("../../common/logger/logger.service");
let WeatherService = class WeatherService {
    prisma;
    logger = new logger_service_1.AppLogger();
    CONTEXT = 'WeatherService';
    constructor(prisma) {
        this.prisma = prisma;
    }
    async processCSV(data, uploadId) {
        let processed = 0;
        let failed = 0;
        const errors = [];
        this.logger.log(`Processing ${data.length} weather records`, this.CONTEXT, {
            uploadId,
            totalRows: data.length,
        });
        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            const rowNumber = i + 2;
            try {
                if (!row.date) {
                    failed++;
                    errors.push({
                        row: rowNumber,
                        error: 'Missing required field: date',
                    });
                    continue;
                }
                const ts = this.parseDate(row.date);
                if (!ts) {
                    failed++;
                    errors.push({
                        row: rowNumber,
                        error: `Invalid date format: ${row.date}`,
                    });
                    continue;
                }
                const parseFloatOrNull = (value) => {
                    if (!value || value.trim() === '' || value.toLowerCase() === 'null') {
                        return null;
                    }
                    const parsed = parseFloat(value.replace(/,/g, '.'));
                    return isNaN(parsed) ? null : parsed;
                };
                const parseIntOrNull = (value) => {
                    if (!value || value.trim() === '' || value.toLowerCase() === 'null') {
                        return null;
                    }
                    const parsed = parseInt(value, 10);
                    return isNaN(parsed) ? null : parsed;
                };
                const existing = await this.prisma.weather.findUnique({
                    where: { ts },
                });
                if (existing) {
                    await this.prisma.weather.update({
                        where: { ts },
                        data: {
                            t: parseFloatOrNull(row.t),
                            p: parseFloatOrNull(row.p),
                            humidity: parseFloatOrNull(row.humidity),
                            precipitation: parseFloatOrNull(row.precipitation),
                            wind_dir: parseIntOrNull(row.wind_dir),
                            v_avg: parseFloatOrNull(row.v_avg),
                            v_max: parseFloatOrNull(row.v_max),
                            cloudcover: parseFloatOrNull(row.cloudcover),
                            visibility: parseFloatOrNull(row.visibility),
                            weather_code: parseIntOrNull(row.weather_code),
                        },
                    });
                    processed++;
                    continue;
                }
                await this.prisma.weather.create({
                    data: {
                        ts: ts,
                        t: parseFloatOrNull(row.t),
                        p: parseFloatOrNull(row.p),
                        humidity: parseFloatOrNull(row.humidity),
                        precipitation: parseFloatOrNull(row.precipitation),
                        wind_dir: parseIntOrNull(row.wind_dir),
                        v_avg: parseFloatOrNull(row.v_avg),
                        v_max: parseFloatOrNull(row.v_max),
                        cloudcover: parseFloatOrNull(row.cloudcover),
                        visibility: parseFloatOrNull(row.visibility),
                        weather_code: parseIntOrNull(row.weather_code),
                    },
                });
                processed++;
            }
            catch (error) {
                failed++;
                errors.push({
                    row: rowNumber,
                    error: error instanceof Error ? error.message : String(error),
                });
                this.logger.warn(`Failed to process weather row ${rowNumber}`, this.CONTEXT, { error: error instanceof Error ? error.message : String(error), row });
            }
        }
        this.logger.log(`Weather processing completed: ${processed} processed, ${failed} failed`, this.CONTEXT, { uploadId, processed, failed });
        return { processed, failed, errors: errors.slice(0, 100) };
    }
    parseDate(dateString) {
        if (!dateString)
            return null;
        const dateStr = dateString.trim();
        if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
            const date = new Date(dateStr);
            if (!isNaN(date.getTime()))
                return date;
        }
        if (/^\d{2}\.\d{2}\.\d{4}/.test(dateStr)) {
            const [day, month, year] = dateStr.split('.');
            const date = new Date(`${year}-${month}-${day}`);
            if (!isNaN(date.getTime()))
                return date;
        }
        if (/^\d{2}\/\d{2}\/\d{4}/.test(dateStr)) {
            const [day, month, year] = dateStr.split('/');
            const date = new Date(`${year}-${month}-${day}`);
            if (!isNaN(date.getTime()))
                return date;
        }
        if (/^\d+$/.test(dateStr)) {
            const timestamp = parseInt(dateStr, 10);
            if (timestamp > 0) {
                const date = timestamp < 10000000000
                    ? new Date(timestamp * 1000)
                    : new Date(timestamp);
                if (!isNaN(date.getTime()))
                    return date;
            }
        }
        const date = new Date(dateStr);
        if (!isNaN(date.getTime()))
            return date;
        return null;
    }
};
exports.WeatherService = WeatherService;
exports.WeatherService = WeatherService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WeatherService);
//# sourceMappingURL=weather.service.js.map