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
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const api_response_helper_1 = require("../common/helpers/api.response.helper");
const logger_service_1 = require("../common/logger/logger.service");
let UserService = class UserService {
    prisma;
    logger = new logger_service_1.AppLogger();
    CONTEXT = 'UserService';
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getUserProfile(userId) {
        try {
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
                include: {
                    userSettings: true,
                },
            });
            if (!user) {
                return (0, api_response_helper_1.errorResponse)('User not found');
            }
            return (0, api_response_helper_1.successResponse)(user, 'User profile retrieved');
        }
        catch (error) {
            this.logger.error('Error getting user profile', error instanceof Error ? error.stack : String(error), this.CONTEXT);
            return (0, api_response_helper_1.errorResponse)('Failed to get user profile', error);
        }
    }
    async updateUserSettings(userId, settings) {
        try {
            const updated = await this.prisma.userSettings.upsert({
                where: { userId },
                update: settings,
                create: {
                    userId,
                    ...settings,
                },
            });
            return (0, api_response_helper_1.successResponse)(updated, 'Settings updated');
        }
        catch (error) {
            this.logger.error('Error updating user settings', error instanceof Error ? error.stack : String(error), this.CONTEXT);
            return (0, api_response_helper_1.errorResponse)('Failed to update settings', error);
        }
    }
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UserService);
//# sourceMappingURL=user.service.js.map