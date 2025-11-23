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
exports.UploadFileDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const prisma_enums_1 = require("../../common/enums/prisma-enums");
class UploadFileDto {
    fileType;
}
exports.UploadFileDto = UploadFileDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Тип загружаемого файла',
        enum: prisma_enums_1.FileType,
        example: prisma_enums_1.FileType.SUPPLIES,
    }),
    (0, class_validator_1.IsEnum)(prisma_enums_1.FileType, {
        message: 'fileType must be one of: SUPPLIES, FIRES, TEMPERATURE, WEATHER',
    }),
    (0, class_validator_1.IsNotEmpty)({ message: 'fileType is required' }),
    __metadata("design:type", String)
], UploadFileDto.prototype, "fileType", void 0);
//# sourceMappingURL=upload-file.dto.js.map