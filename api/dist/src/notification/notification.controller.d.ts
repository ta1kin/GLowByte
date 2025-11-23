import { Request } from 'express';
import { NotificationService } from './notification.service';
export declare class NotificationController {
    private readonly notificationService;
    constructor(notificationService: NotificationService);
    getNotifications(req: Request & {
        user?: {
            id: number;
        };
    }): Promise<import("../common/interfaces/api-response.interface").ApiResponse<any>>;
    markAsRead(id: number, req: Request & {
        user?: {
            id: number;
        };
    }): Promise<import("../common/interfaces/api-response.interface").ApiResponse<any>>;
}
