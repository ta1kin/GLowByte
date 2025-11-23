import { PrismaService } from '../../prisma/prisma.service';
export declare class AuthService {
    private prisma;
    private readonly logger;
    private readonly CONTEXT;
    constructor(prisma: PrismaService);
    validateTelegramUser(telegramId: string): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.UserStatus;
        telegramId: string;
        username: string | null;
        firstName: string | null;
        lastName: string | null;
        fullName: string | null;
        role: import(".prisma/client").$Enums.Role;
        lang: string;
        phone: string | null;
        email: string | null;
    } | null>;
    login(telegramId: string, userData?: any): Promise<import("../common/interfaces/api-response.interface").ApiResponse<any>>;
    checkAuth(telegramId: string): Promise<import("../common/interfaces/api-response.interface").ApiResponse<any>>;
}
