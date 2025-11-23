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
exports.FiresService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma/prisma.service");
const logger_service_1 = require("../../common/logger/logger.service");
let FiresService = class FiresService {
    prisma;
    logger = new logger_service_1.AppLogger();
    CONTEXT = 'FiresService';
    constructor(prisma) {
        this.prisma = prisma;
    }
    async processCSV(data, uploadId) {
        let processed = 0;
        let failed = 0;
        const errors = [];
        this.logger.log(`Processing ${data.length} fire records`, this.CONTEXT, {
            uploadId,
            totalRows: data.length,
        });
        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            const rowNumber = i + 2;
            try {
                if (!row.Склад || !row['Дата начала'] || !row['Дата составления']) {
                    failed++;
                    errors.push({
                        row: rowNumber,
                        error: 'Missing required fields: Склад, Дата начала, or Дата составления',
                    });
                    continue;
                }
                const skladNumber = parseInt(row.Склад, 10);
                if (isNaN(skladNumber)) {
                    failed++;
                    errors.push({
                        row: rowNumber,
                        error: `Invalid sklad number: ${row.Склад}`,
                    });
                    continue;
                }
                const reportDate = this.parseDate(row['Дата составления']);
                const startDate = this.parseDate(row['Дата начала']);
                if (!reportDate || !startDate) {
                    failed++;
                    errors.push({
                        row: rowNumber,
                        error: `Invalid date format: ${row['Дата составления']} or ${row['Дата начала']}`,
                    });
                    continue;
                }
                const endDate = row['Дата окончания']
                    ? this.parseDate(row['Дата окончания'])
                    : null;
                const formedAt = row['Нач.форм.штабеля']
                    ? this.parseDate(row['Нач.форм.штабеля'])
                    : null;
                const weight_t = row['Вес по акту, тн']
                    ? parseFloat(row['Вес по акту, тн'].replace(/,/g, '.'))
                    : null;
                const duration_hours = endDate && startDate
                    ? (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60)
                    : null;
                let sklad = await this.prisma.sklad.findUnique({
                    where: { number: skladNumber },
                });
                if (!sklad) {
                    sklad = await this.prisma.sklad.create({
                        data: {
                            number: skladNumber,
                            name: `Склад ${skladNumber}`,
                        },
                    });
                    this.logger.debug(`Created new sklad: ${skladNumber}`, this.CONTEXT);
                }
                let shtabelId = null;
                if (row.Штабель) {
                    const shtabelLabel = row.Штабель.trim();
                    const shtabel = await this.prisma.shtabel.findUnique({
                        where: {
                            skladId_label: {
                                skladId: sklad.id,
                                label: shtabelLabel,
                            },
                        },
                    });
                    if (shtabel) {
                        shtabelId = shtabel.id;
                        await this.prisma.shtabel.update({
                            where: { id: shtabel.id },
                            data: {
                                status: 'FIRED',
                            },
                        });
                    }
                }
                await this.prisma.fireRecord.create({
                    data: {
                        skladId: sklad.id,
                        shtabelId: shtabelId,
                        reportDate: reportDate,
                        mark: row.Груз || null,
                        weight_t: weight_t && !isNaN(weight_t) ? weight_t : null,
                        startDate: startDate,
                        endDate: endDate,
                        formedAt: formedAt,
                        duration_hours: duration_hours && !isNaN(duration_hours) ? duration_hours : null,
                        damage_t: weight_t && !isNaN(weight_t) ? weight_t : null,
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
                this.logger.warn(`Failed to process fire row ${rowNumber}`, this.CONTEXT, { error: error instanceof Error ? error.message : String(error), row });
            }
        }
        this.logger.log(`Fire processing completed: ${processed} processed, ${failed} failed`, this.CONTEXT, { uploadId, processed, failed });
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
        const date = new Date(dateStr);
        if (!isNaN(date.getTime()))
            return date;
        return null;
    }
};
exports.FiresService = FiresService;
exports.FiresService = FiresService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FiresService);
//# sourceMappingURL=fires.service.js.map