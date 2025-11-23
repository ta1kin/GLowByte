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
exports.AppLogger = void 0;
const common_1 = require("@nestjs/common");
const winston_1 = require("winston");
const { combine, timestamp, printf, errors, colorize } = winston_1.format;
let AppLogger = class AppLogger {
    logger = (0, winston_1.createLogger)({
        level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
        format: combine(timestamp(), errors({ stack: true }), printf(({ timestamp, level, message, stack, context, metadata }) => {
            let logMessage = `${timestamp} ${level.toUpperCase()}`;
            if (context) {
                logMessage += ` [${context}]`;
            }
            logMessage += `: ${message}`;
            if (metadata) {
                try {
                    const metadataStr = typeof metadata === 'string'
                        ? metadata
                        : JSON.stringify(metadata, null, 2);
                    logMessage += `\nMetadata: ${metadataStr}`;
                }
                catch (e) {
                    logMessage += `\nMetadata: [Невозможно сериализовать]`;
                }
            }
            if (stack) {
                logMessage += `\nStack: ${stack}`;
            }
            return logMessage;
        })),
        transports: [
            new winston_1.transports.File({
                filename: 'logs/error.log',
                level: 'error',
                maxsize: 10485760,
                maxFiles: 5,
            }),
            new winston_1.transports.File({
                filename: 'logs/combined.log',
                maxsize: 10485760,
                maxFiles: 10,
            }),
        ],
    });
    constructor() {
        if (process.env.NODE_ENV !== 'production') {
            this.logger.add(new winston_1.transports.Console({
                format: combine(colorize({ all: true }), timestamp(), printf(({ timestamp, level, message, context, metadata }) => {
                    let logMessage = `${timestamp} ${level}`;
                    if (context) {
                        logMessage += ` [${context}]`;
                    }
                    logMessage += `: ${message}`;
                    if (metadata) {
                        try {
                            const metadataStr = typeof metadata === 'string'
                                ? metadata
                                : JSON.stringify(metadata, null, 2);
                            logMessage += `\nMetadata: ${metadataStr}`;
                        }
                        catch (e) {
                            logMessage += `\nMetadata: [Невозможно сериализовать]`;
                        }
                    }
                    return logMessage;
                })),
            }));
        }
    }
    log(message, context, metadata) {
        this.logger.info(message, { context, metadata });
    }
    error(message, trace, context, metadata) {
        const errorData = {
            context,
            metadata,
            stack: trace,
        };
        this.logger.error(message, errorData);
    }
    warn(message, context, metadata) {
        this.logger.warn(message, { context, metadata });
    }
    debug(message, context, metadata) {
        this.logger.debug(message, { context, metadata });
    }
    fatal(message, trace, context, metadata) {
        const errorData = {
            context,
            metadata,
            stack: trace,
        };
        this.logger.error(`FATAL: ${message}`, errorData);
    }
    logHttpRequest(method, url, ip, body, statusCode, duration) {
        const requestData = {
            method,
            url,
            ip,
            body: body ? JSON.stringify(body) : 'Нет тела запроса',
            statusCode,
            duration: duration ? `${duration}ms` : undefined,
        };
        let icon = '📥';
        if (statusCode) {
            if (statusCode >= 500) {
                icon = '❌';
                this.error(`${icon} ${method} ${url} - IP: ${ip} - Status: ${statusCode} - ${duration}ms`, undefined, 'HTTP', requestData);
            }
            else if (statusCode >= 400) {
                icon = '⚠️';
                this.warn(`${icon} ${method} ${url} - IP: ${ip} - Status: ${statusCode} - ${duration}ms`, 'HTTP', requestData);
            }
            else {
                icon = '📤';
                this.log(`${icon} ${method} ${url} - IP: ${ip} - Status: ${statusCode} - ${duration}ms`, 'HTTP');
            }
        }
        else {
            this.log(`${icon} ${method} ${url} - IP: ${ip}`, 'HTTP', requestData);
        }
    }
    logApiResponse(method, url, response, duration) {
        const success = response && response.success === true;
        const metadata = {
            method,
            url,
            response,
            duration: `${duration}ms`,
        };
        const statusIcon = success ? '✅' : '❌';
        if (success) {
            this.log(`${statusIcon} API Response: ${method} ${url} - Success: ${success} - ${duration}ms`, 'API', metadata);
        }
        else {
            this.error(`${statusIcon} API Response: ${method} ${url} - Success: ${success} - ${duration}ms`, undefined, 'API', metadata);
        }
    }
};
exports.AppLogger = AppLogger;
exports.AppLogger = AppLogger = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], AppLogger);
//# sourceMappingURL=logger.service.js.map