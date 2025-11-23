import { PrismaService } from '../../prisma/prisma.service';
export declare class AnalyticsService {
    private prisma;
    private readonly logger;
    private readonly CONTEXT;
    constructor(prisma: PrismaService);
    getModelMetrics(modelName?: string, periodDays?: number): Promise<import("../common/interfaces/api-response.interface").ApiResponse<any>>;
    getPredictionAccuracy(): Promise<import("../common/interfaces/api-response.interface").ApiResponse<any>>;
    getDashboardStats(): Promise<import("../common/interfaces/api-response.interface").ApiResponse<any>>;
    getRiskDistribution(): Promise<import("../common/interfaces/api-response.interface").ApiResponse<any>>;
    getTemperatureTrends(shtabelId?: number, days?: number): Promise<import("../common/interfaces/api-response.interface").ApiResponse<any>>;
}
