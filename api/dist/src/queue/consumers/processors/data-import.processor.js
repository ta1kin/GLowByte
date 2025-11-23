"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataImportProcessor = void 0;
const common_1 = require("@nestjs/common");
const sync_1 = require("csv-parse/sync");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const prisma_service_1 = require("../../../../prisma/prisma.service");
const prisma_enums_1 = require("../../../common/enums/prisma-enums");
const logger_service_1 = require("../../../common/logger/logger.service");
const fires_service_1 = require("../../../data/services/fires.service");
const supplies_service_1 = require("../../../data/services/supplies.service");
const temperature_service_1 = require("../../../data/services/temperature.service");
const weather_service_1 = require("../../../data/services/weather.service");
const queue_service_1 = require("../../queue.service");
let DataImportProcessor = class DataImportProcessor {
    prisma;
    suppliesService;
    firesService;
    temperatureService;
    weatherService;
    queueService;
    logger = new logger_service_1.AppLogger();
    CONTEXT = 'DataImportProcessor';
    uploadsDir = process.env.UPLOADS_DIR || './uploads';
    constructor(prisma, suppliesService, firesService, temperatureService, weatherService, queueService) {
        this.prisma = prisma;
        this.suppliesService = suppliesService;
        this.firesService = firesService;
        this.temperatureService = temperatureService;
        this.weatherService = weatherService;
        this.queueService = queueService;
    }
    async processImport(uploadId, filename, fileType) {
        try {
            await this.prisma.upload.update({
                where: { id: uploadId },
                data: { status: 'PROCESSING' },
            });
            const filePath = path.join(this.uploadsDir, filename);
            if (!fs.existsSync(filePath)) {
                throw new Error(`File not found: ${filePath}`);
            }
            const fileContent = fs.readFileSync(filePath, 'utf-8');
            const records = (0, sync_1.parse)(fileContent, {
                columns: true,
                skip_empty_lines: true,
                trim: true,
            });
            this.logger.log(`Processing ${records.length} records from ${filename}`, this.CONTEXT, { uploadId, fileType, recordCount: records.length });
            let processed = 0;
            let failed = 0;
            let errors = [];
            switch (fileType) {
                case 'SUPPLIES':
                    {
                        const result = await this.suppliesService.processCSV(records, uploadId);
                        processed = result.processed;
                        failed = result.failed;
                        errors = result.errors || [];
                    }
                    break;
                case 'FIRES':
                    {
                        const result = await this.firesService.processCSV(records, uploadId);
                        processed = result.processed;
                        failed = result.failed;
                        errors = result.errors || [];
                    }
                    break;
                case 'TEMPERATURE':
                    {
                        const result = await this.temperatureService.processCSV(records, uploadId);
                        processed = result.processed;
                        failed = result.failed;
                        errors = result.errors || [];
                    }
                    break;
                case 'WEATHER':
                    {
                        const result = await this.weatherService.processCSV(records, uploadId);
                        processed = result.processed;
                        failed = result.failed;
                        errors = result.errors || [];
                    }
                    break;
                default:
                    throw new Error(`Unknown file type: ${fileType}`);
            }
            const status = failed === 0
                ? prisma_enums_1.UploadStatus.COMPLETED
                : failed < records.length
                    ? prisma_enums_1.UploadStatus.PARTIAL
                    : prisma_enums_1.UploadStatus.FAILED;
            await this.prisma.upload.update({
                where: { id: uploadId },
                data: {
                    status,
                    rowsTotal: records.length,
                    rowsProcessed: processed,
                    rowsFailed: failed,
                    errors: errors.length > 0 ? errors : undefined,
                },
            });
            this.logger.log(`Import completed: ${processed} processed, ${failed} failed`, this.CONTEXT, { uploadId, processed, failed, status });
        }
        catch (error) {
            await this.prisma.upload.update({
                where: { id: uploadId },
                data: {
                    status: 'FAILED',
                    errors: {
                        error: error instanceof Error ? error.message : String(error),
                        stack: error instanceof Error ? error.stack : String(error),
                    },
                },
            });
            this.logger.error(`Import failed for upload ${uploadId}`, error instanceof Error ? error.stack : String(error), this.CONTEXT, { uploadId, filename, fileType, error });
            throw error;
        }
    }
};
exports.DataImportProcessor = DataImportProcessor;
exports.DataImportProcessor = DataImportProcessor = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        supplies_service_1.SuppliesService,
        fires_service_1.FiresService,
        temperature_service_1.TemperatureService,
        weather_service_1.WeatherService,
        queue_service_1.QueueService])
], DataImportProcessor);
//# sourceMappingURL=data-import.processor.js.map