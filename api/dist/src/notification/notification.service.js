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
exports.NotificationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const api_response_helper_1 = require("../common/helpers/api.response.helper");
const logger_service_1 = require("../common/logger/logger.service");
let NotificationService = class NotificationService {
    prisma;
    logger = new logger_service_1.AppLogger();
    CONTEXT = 'NotificationService';
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getNotifications(userId, limit = 50) {
        try {
            const notifications = await this.prisma.notification.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
                take: limit,
            });
            return (0, api_response_helper_1.successResponse)(notifications, 'Notifications retrieved');
        }
        catch (error) {
            this.logger.error('Error getting notifications', error instanceof Error ? error.stack : String(error), this.CONTEXT);
            return (0, api_response_helper_1.errorResponse)('Failed to get notifications', error);
        }
    }
    async markAsRead(notificationId, userId) {
        try {
            const notification = await this.prisma.notification.update({
                where: {
                    id: notificationId,
                    userId,
                },
                data: {
                    status: 'READ',
                    readAt: new Date(),
                },
            });
            return (0, api_response_helper_1.successResponse)(notification, 'Notification marked as read');
        }
        catch (error) {
            this.logger.error('Error marking notification as read', error instanceof Error ? error.stack : String(error), this.CONTEXT);
            return (0, api_response_helper_1.errorResponse)('Failed to mark notification as read', error);
        }
    }
    async createNotification(data) {
        try {
            const notification = await this.prisma.notification.create({
                data: {
                    userId: data.userId,
                    type: data.type,
                    title: data.title,
                    message: data.message,
                    data: data.data,
                    predictionId: data.predictionId,
                    shtabelId: data.shtabelId,
                    skladId: data.skladId,
                    status: 'PENDING',
                },
            });
            return (0, api_response_helper_1.successResponse)(notification, 'Notification created');
        }
        catch (error) {
            this.logger.error('Error creating notification', error instanceof Error ? error.stack : String(error), this.CONTEXT);
            return (0, api_response_helper_1.errorResponse)('Failed to create notification', error);
        }
    }
};
exports.NotificationService = NotificationService;
exports.NotificationService = NotificationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], NotificationService);
//# sourceMappingURL=notification.service.js.map