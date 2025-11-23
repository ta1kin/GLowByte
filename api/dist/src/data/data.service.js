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
exports.DataService = void 0;
const common_1 = require("@nestjs/common");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const uuid_1 = require("uuid");
const prisma_service_1 = require("../../prisma/prisma.service");
const api_response_helper_1 = require("../common/helpers/api.response.helper");
const logger_service_1 = require("../common/logger/logger.service");
const queue_service_1 = require("../queue/queue.service");
let DataService = class DataService {
    prisma;
    queueService;
    logger = new logger_service_1.AppLogger();
    CONTEXT = 'DataService';
    uploadsDir;
    constructor(prisma, queueService) {
        this.prisma = prisma;
        this.queueService = queueService;
        this.uploadsDir = process.env.UPLOADS_DIR || './uploads';
        if (!fs.existsSync(this.uploadsDir)) {
            fs.mkdirSync(this.uploadsDir, { recursive: true });
            this.logger.log(`Created uploads directory: ${this.uploadsDir}`, this.CONTEXT);
        }
    }
    async createUpload(file, fileType, userId) {
        try {
            const fileExtension = path.extname(file.originalname);
            const uniqueFilename = `${(0, uuid_1.v4)()}${fileExtension}`;
            const filePath = path.join(this.uploadsDir, uniqueFilename);
            fs.writeFileSync(filePath, file.buffer);
            this.logger.log(`File saved: ${uniqueFilename} (${file.size} bytes)`, this.CONTEXT, { originalName: file.originalname, fileType, userId });
            const upload = await this.prisma.upload.create({
                data: {
                    filename: uniqueFilename,
                    fileType,
                    uploadedBy: userId,
                    status: 'PENDING',
                    metadata: {
                        originalName: file.originalname,
                        mimeType: file.mimetype,
                        size: file.size,
                    },
                },
            });
            await this.queueService.publish('data.import', {
                uploadId: upload.id,
                filename: uniqueFilename,
                fileType,
            });
            this.logger.log(`Upload created and queued: ${upload.id}`, this.CONTEXT, {
                uploadId: upload.id,
                fileType,
            });
            return (0, api_response_helper_1.successResponse)(upload, 'Upload created and queued for processing');
        }
        catch (error) {
            this.logger.error('Error creating upload', error instanceof Error ? error.stack : String(error), this.CONTEXT, {
                fileName: file.originalname,
                fileType,
                error,
            });
            return (0, api_response_helper_1.errorResponse)('Failed to create upload', error);
        }
    }
    async getUploads(userId, limit = 50) {
        try {
            const uploads = await this.prisma.upload.findMany({
                where: userId ? { uploadedBy: userId } : undefined,
                orderBy: { createdAt: 'desc' },
                take: limit,
                include: {
                    user: {
                        select: {
                            id: true,
                            telegramId: true,
                            fullName: true,
                        },
                    },
                },
            });
            return (0, api_response_helper_1.successResponse)(uploads, 'Uploads retrieved');
        }
        catch (error) {
            this.logger.error('Error getting uploads', error instanceof Error ? error.stack : String(error), this.CONTEXT);
            return (0, api_response_helper_1.errorResponse)('Failed to get uploads', error);
        }
    }
    async getUploadById(id) {
        try {
            const upload = await this.prisma.upload.findUnique({
                where: { id },
                include: {
                    user: {
                        select: {
                            id: true,
                            telegramId: true,
                            fullName: true,
                        },
                    },
                },
            });
            if (!upload) {
                return (0, api_response_helper_1.errorResponse)('Upload not found');
            }
            return (0, api_response_helper_1.successResponse)(upload, 'Upload retrieved');
        }
        catch (error) {
            this.logger.error('Error getting upload', error instanceof Error ? error.stack : String(error), this.CONTEXT);
            return (0, api_response_helper_1.errorResponse)('Failed to get upload', error);
        }
    }
};
exports.DataService = DataService;
exports.DataService = DataService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        queue_service_1.QueueService])
], DataService);
//# sourceMappingURL=data.service.js.map