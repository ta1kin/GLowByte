"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MlModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../../prisma/prisma.module");
const logger_module_1 = require("../common/logger/logger.module");
const queue_module_1 = require("../queue/queue.module");
const ml_controller_1 = require("./ml.controller");
const ml_service_1 = require("./ml.service");
let MlModule = class MlModule {
};
exports.MlModule = MlModule;
exports.MlModule = MlModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, (0, common_1.forwardRef)(() => queue_module_1.QueueModule), logger_module_1.LoggerModule],
        controllers: [ml_controller_1.MlController],
        providers: [ml_service_1.MlService],
        exports: [ml_service_1.MlService],
    })
], MlModule);
//# sourceMappingURL=ml.module.js.map