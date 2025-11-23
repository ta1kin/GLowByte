"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../../prisma/prisma.module");
const logger_module_1 = require("../common/logger/logger.module");
const queue_module_1 = require("../queue/queue.module");
const data_controller_1 = require("./data.controller");
const data_service_1 = require("./data.service");
const fires_service_1 = require("./services/fires.service");
const supplies_service_1 = require("./services/supplies.service");
const temperature_service_1 = require("./services/temperature.service");
const weather_service_1 = require("./services/weather.service");
let DataModule = class DataModule {
};
exports.DataModule = DataModule;
exports.DataModule = DataModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, (0, common_1.forwardRef)(() => queue_module_1.QueueModule), logger_module_1.LoggerModule],
        controllers: [data_controller_1.DataController],
        providers: [
            data_service_1.DataService,
            supplies_service_1.SuppliesService,
            fires_service_1.FiresService,
            temperature_service_1.TemperatureService,
            weather_service_1.WeatherService,
        ],
        exports: [
            data_service_1.DataService,
            supplies_service_1.SuppliesService,
            fires_service_1.FiresService,
            temperature_service_1.TemperatureService,
            weather_service_1.WeatherService,
        ],
    })
], DataModule);
//# sourceMappingURL=data.module.js.map