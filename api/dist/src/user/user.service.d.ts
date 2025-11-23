import { PrismaService } from '../../prisma/prisma.service';
export declare class UserService {
    private prisma;
    private readonly logger;
    private readonly CONTEXT;
    constructor(prisma: PrismaService);
    getUserProfile(userId: number): Promise<import("../common/interfaces/api-response.interface").ApiResponse<any>>;
    updateUserSettings(userId: number, settings: any): Promise<import("../common/interfaces/api-response.interface").ApiResponse<any>>;
}
