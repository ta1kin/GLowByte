import { PrismaService } from '../../prisma/prisma.service';
export declare class NotificationService {
    private prisma;
    private readonly logger;
    private readonly CONTEXT;
    constructor(prisma: PrismaService);
    getNotifications(userId: number, limit?: number): Promise<import("../common/interfaces/api-response.interface").ApiResponse<any>>;
    markAsRead(notificationId: number, userId: number): Promise<import("../common/interfaces/api-response.interface").ApiResponse<any>>;
    createNotification(data: {
        userId: number;
        type: string;
        title: string;
        message: string;
        data?: any;
        predictionId?: number;
        shtabelId?: number;
        skladId?: number;
    }): Promise<import("../common/interfaces/api-response.interface").ApiResponse<any>>;
}
