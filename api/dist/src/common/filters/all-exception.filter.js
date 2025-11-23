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
exports.AllExceptionsFilter = void 0;
const common_1 = require("@nestjs/common");
const logger_service_1 = require("../logger/logger.service");
const library_1 = require("@prisma/client/runtime/library");
let AllExceptionsFilter = class AllExceptionsFilter {
    logger;
    constructor(logger) {
        this.logger = logger;
    }
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        const status = exception instanceof common_1.HttpException
            ? exception.getStatus()
            : common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        const errorResponse = this.createErrorResponse(exception, request);
        const { message, error } = errorResponse;
        this.logger.error(`Exception: ${message}`, error?.stack || exception?.stack, 'ExceptionFilter', {
            path: request.url,
            method: request.method,
            body: request.body,
            statusCode: status,
            error,
        });
        response.status(status).json(errorResponse);
    }
    createErrorResponse(exception, request) {
        const errorResponse = {
            success: false,
            message: 'Внутренняя ошибка сервера',
            timestamp: new Date().toISOString(),
            path: request.url,
            error: null,
        };
        if (exception instanceof common_1.HttpException) {
            const response = exception.getResponse();
            if (typeof response === 'object') {
                const responseObj = response;
                errorResponse.message = responseObj.message || exception.message;
                errorResponse.error = {
                    name: exception.name,
                    ...responseObj,
                };
            }
            else {
                errorResponse.message = exception.message;
                errorResponse.error = { name: exception.name };
            }
        }
        else if (exception instanceof library_1.PrismaClientKnownRequestError) {
            errorResponse.message = 'Ошибка при работе с базой данных';
            errorResponse.error = {
                name: exception.name,
                code: exception.code,
                meta: exception.meta,
                message: exception.message,
            };
        }
        else if (exception instanceof library_1.PrismaClientValidationError) {
            errorResponse.message = 'Ошибка валидации данных';
            errorResponse.error = {
                name: exception.name,
                message: exception.message,
            };
        }
        else if (exception instanceof Error) {
            errorResponse.message = exception.message;
            errorResponse.error = {
                name: exception.name,
                stack: exception.stack,
            };
        }
        else {
            errorResponse.error = {
                unknown: String(exception),
            };
        }
        return errorResponse;
    }
};
exports.AllExceptionsFilter = AllExceptionsFilter;
exports.AllExceptionsFilter = AllExceptionsFilter = __decorate([
    (0, common_1.Catch)(),
    __metadata("design:paramtypes", [logger_service_1.AppLogger])
], AllExceptionsFilter);
//# sourceMappingURL=all-exception.filter.js.map