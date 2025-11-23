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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const api_response_helper_1 = require("../common/helpers/api.response.helper");
const logger_service_1 = require("../common/logger/logger.service");
let AuthService = class AuthService {
    prisma;
    logger = new logger_service_1.AppLogger();
    CONTEXT = 'AuthService';
    constructor(prisma) {
        this.prisma = prisma;
    }
    async validateTelegramUser(telegramId) {
        try {
            const user = await this.prisma.user.findUnique({
                where: { telegramId },
            });
            if (!user || user.status !== 'ACTIVE') {
                return null;
            }
            return user;
        }
        catch (error) {
            this.logger.error('Error validating telegram user', error instanceof Error ? error.stack : String(error), this.CONTEXT);
            return null;
        }
    }
    async login(telegramId, userData) {
        try {
            let user = await this.prisma.user.findUnique({
                where: { telegramId },
            });
            if (!user) {
                user = await this.prisma.user.create({
                    data: {
                        telegramId,
                        username: userData?.username,
                        firstName: userData?.first_name,
                        lastName: userData?.last_name,
                        fullName: userData?.first_name && userData?.last_name
                            ? `${userData.first_name} ${userData.last_name}`
                            : userData?.first_name || userData?.username || null,
                        role: 'OPERATOR',
                        status: 'ACTIVE',
                    },
                });
                await this.prisma.userSettings.create({
                    data: {
                        userId: user.id,
                    },
                });
                this.logger.log(`New user created: ${telegramId}`, this.CONTEXT);
            }
            else {
                if (userData) {
                    user = await this.prisma.user.update({
                        where: { telegramId },
                        data: {
                            username: userData.username || user.username,
                            firstName: userData.first_name || user.firstName,
                            lastName: userData.last_name || user.lastName,
                            fullName: userData.first_name && userData.last_name
                                ? `${userData.first_name} ${userData.last_name}`
                                : userData.first_name || userData.username || user.fullName,
                        },
                    });
                }
            }
            return (0, api_response_helper_1.successResponse)(user, 'Login successful');
        }
        catch (error) {
            this.logger.error('Error during login', error instanceof Error ? error.stack : String(error), this.CONTEXT);
            return (0, api_response_helper_1.errorResponse)('Login failed', error);
        }
    }
    async checkAuth(telegramId) {
        try {
            const user = await this.prisma.user.findUnique({
                where: { telegramId },
                include: {
                    userSettings: true,
                },
            });
            if (!user) {
                return (0, api_response_helper_1.successResponse)(null, 'User not found');
            }
            if (user.status !== 'ACTIVE') {
                return (0, api_response_helper_1.successResponse)({ status: user.status }, 'User is not active');
            }
            return (0, api_response_helper_1.successResponse)(user, 'User authenticated');
        }
        catch (error) {
            this.logger.error('Error checking auth', error instanceof Error ? error.stack : String(error), this.CONTEXT);
            return (0, api_response_helper_1.errorResponse)('Auth check failed', error);
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AuthService);
//# sourceMappingURL=auth.service.js.map