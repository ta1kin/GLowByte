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
exports.SuppliesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma/prisma.service");
const logger_service_1 = require("../../common/logger/logger.service");
let SuppliesService = class SuppliesService {
    prisma;
    logger = new logger_service_1.AppLogger();
    CONTEXT = 'SuppliesService';
    constructor(prisma) {
        this.prisma = prisma;
    }
    async processCSV(data, uploadId) {
        let processed = 0;
        let failed = 0;
        const errors = [];
        this.logger.log(`Processing ${data.length} supply records`, this.CONTEXT, {
            uploadId,
            totalRows: data.length,
        });
        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            const rowNumber = i + 2;
            try {
                if (!row.Склад || !row.Штабель || !row.ВыгрузкаНаСклад) {
                    failed++;
                    errors.push({
                        row: rowNumber,
                        error: 'Missing required fields: Склад, Штабель, or ВыгрузкаНаСклад',
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
                const dateIn = this.parseDate(row.ВыгрузкаНаСклад);
                if (!dateIn) {
                    failed++;
                    errors.push({
                        row: rowNumber,
                        error: `Invalid date format: ${row.ВыгрузкаНаСклад}`,
                    });
                    continue;
                }
                const dateShip = row.ПогрузкаНаСудно
                    ? this.parseDate(row.ПогрузкаНаСудно)
                    : null;
                const toStorage_t = row['На склад, тн']
                    ? parseFloat(row['На склад, тн'].replace(/,/g, '.'))
                    : null;
                const toShip_t = row['На судно, тн']
                    ? parseFloat(row['На судно, тн'].replace(/,/g, '.'))
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
                const shtabelLabel = row.Штабель.trim();
                let shtabel = await this.prisma.shtabel.findUnique({
                    where: {
                        skladId_label: {
                            skladId: sklad.id,
                            label: shtabelLabel,
                        },
                    },
                });
                if (!shtabel) {
                    shtabel = await this.prisma.shtabel.create({
                        data: {
                            skladId: sklad.id,
                            label: shtabelLabel,
                            mark: row['Наим. ЕТСНГ'] || null,
                            formedAt: dateIn,
                            mass_t: toStorage_t,
                            currentMass: toStorage_t,
                        },
                    });
                    this.logger.debug(`Created new shtabel: ${shtabelLabel} in sklad ${skladNumber}`, this.CONTEXT);
                }
                else {
                    await this.prisma.shtabel.update({
                        where: { id: shtabel.id },
                        data: {
                            mark: row['Наим. ЕТСНГ'] || shtabel.mark,
                            currentMass: toStorage_t || shtabel.currentMass,
                        },
                    });
                }
                await this.prisma.supply.create({
                    data: {
                        skladId: sklad.id,
                        shtabelId: shtabel.id,
                        dateIn: dateIn,
                        mark: row['Наим. ЕТСНГ'] || null,
                        dateShip: dateShip,
                        toStorage_t: toStorage_t && !isNaN(toStorage_t) ? toStorage_t : null,
                        toShip_t: toShip_t && !isNaN(toShip_t) ? toShip_t : null,
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
                this.logger.warn(`Failed to process supply row ${rowNumber}`, this.CONTEXT, { error: error instanceof Error ? error.message : String(error), row });
            }
        }
        this.logger.log(`Supply processing completed: ${processed} processed, ${failed} failed`, this.CONTEXT, { uploadId, processed, failed });
        return { processed, failed, errors: errors.slice(0, 100) };
    }
    parseDate(dateString) {
        if (!dateString)
            return null;
        const formats = [
            /^\d{4}-\d{2}-\d{2}$/,
            /^\d{2}\.\d{2}\.\d{4}$/,
            /^\d{2}\/\d{2}\/\d{4}$/,
            /^\d{4}\.\d{2}\.\d{2}$/,
        ];
        const dateStr = dateString.trim();
        if (formats[0].test(dateStr)) {
            const date = new Date(dateStr);
            if (!isNaN(date.getTime()))
                return date;
        }
        if (formats[1].test(dateStr)) {
            const [day, month, year] = dateStr.split('.');
            const date = new Date(`${year}-${month}-${day}`);
            if (!isNaN(date.getTime()))
                return date;
        }
        if (formats[2].test(dateStr)) {
            const [day, month, year] = dateStr.split('/');
            const date = new Date(`${year}-${month}-${day}`);
            if (!isNaN(date.getTime()))
                return date;
        }
        if (formats[3].test(dateStr)) {
            const [year, month, day] = dateStr.split('.');
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
exports.SuppliesService = SuppliesService;
exports.SuppliesService = SuppliesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SuppliesService);
//# sourceMappingURL=supplies.service.js.map