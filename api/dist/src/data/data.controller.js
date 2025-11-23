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
exports.DataController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const data_service_1 = require("./data.service");
const dto_1 = require("./dto");
let DataController = class DataController {
    dataService;
    constructor(dataService) {
        this.dataService = dataService;
    }
    async uploadFile(file, uploadDto, req) {
        if (!file) {
            throw new common_1.BadRequestException('File is required');
        }
        if (!file.originalname.toLowerCase().endsWith('.csv')) {
            throw new common_1.BadRequestException('Only CSV files are allowed');
        }
        const maxSize = 50 * 1024 * 1024;
        if (file.size > maxSize) {
            throw new common_1.BadRequestException('File size exceeds maximum limit of 50MB');
        }
        if (file.size === 0) {
            throw new common_1.BadRequestException('File cannot be empty');
        }
        const userId = req.user?.id;
        return this.dataService.createUpload(file, uploadDto.fileType, userId);
    }
    async getUploads(req) {
        const userId = req.user?.id;
        return this.dataService.getUploads(userId);
    }
    async getUploadById(id) {
        return this.dataService.getUploadById(id);
    }
};
exports.DataController = DataController;
__decorate([
    (0, common_1.Post)('upload'),
    (0, swagger_1.ApiOperation)({ summary: 'Upload CSV file' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                },
                fileType: {
                    type: 'string',
                    enum: ['SUPPLIES', 'FIRES', 'TEMPERATURE', 'WEATHER'],
                },
            },
        },
    }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, dto_1.UploadFileDto, Object]),
    __metadata("design:returntype", Promise)
], DataController.prototype, "uploadFile", null);
__decorate([
    (0, common_1.Get)('uploads'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all uploads' }),
    (0, swagger_1.ApiBearerAuth)(),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DataController.prototype, "getUploads", null);
__decorate([
    (0, common_1.Get)('uploads/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get upload by ID' }),
    (0, swagger_1.ApiBearerAuth)(),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], DataController.prototype, "getUploadById", null);
exports.DataController = DataController = __decorate([
    (0, swagger_1.ApiTags)('Data'),
    (0, common_1.Controller)('data'),
    __metadata("design:paramtypes", [data_service_1.DataService])
], DataController);
//# sourceMappingURL=data.controller.js.map