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
exports.UpdateStockpileDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_stockpile_dto_1 = require("./create-stockpile.dto");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class UpdateStockpileDto extends (0, mapped_types_1.PartialType)(create_stockpile_dto_1.CreateStockpileDto) {
    skladId;
    label;
    mark;
    formedAt;
    height_m;
    width_m;
    length_m;
    mass_t;
    status;
    currentMass;
    lastTemp;
    lastTempDate;
}
exports.UpdateStockpileDto = UpdateStockpileDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'ID склада', example: 1 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], UpdateStockpileDto.prototype, "skladId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Номер/код штабеля', example: 'ШТ-001' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateStockpileDto.prototype, "label", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Марка угля', example: 'A1' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateStockpileDto.prototype, "mark", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Дата начала формирования' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpdateStockpileDto.prototype, "formedAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Высота (метры)', example: 5.5 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdateStockpileDto.prototype, "height_m", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Ширина (метры)', example: 10.0 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdateStockpileDto.prototype, "width_m", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Длина (метры)', example: 20.0 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdateStockpileDto.prototype, "length_m", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Масса (тонны)', example: 1000.0 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdateStockpileDto.prototype, "mass_t", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Статус штабеля',
        enum: create_stockpile_dto_1.ShtabelStatus,
        example: create_stockpile_dto_1.ShtabelStatus.ACTIVE,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(create_stockpile_dto_1.ShtabelStatus),
    __metadata("design:type", String)
], UpdateStockpileDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Текущая масса (тонны)', example: 950.0 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdateStockpileDto.prototype, "currentMass", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Последняя температура', example: 45.5 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateStockpileDto.prototype, "lastTemp", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Дата последнего температурного замера' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpdateStockpileDto.prototype, "lastTempDate", void 0);
//# sourceMappingURL=update-stockpile.dto.js.map