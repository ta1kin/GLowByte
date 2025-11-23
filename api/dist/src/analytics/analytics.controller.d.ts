import { AnalyticsService } from './analytics.service';
export declare class AnalyticsController {
    private readonly analyticsService;
    constructor(analyticsService: AnalyticsService);
    getModelMetrics(modelName?: string, periodDays?: number): Promise<import("../common/interfaces/api-response.interface").ApiResponse<any>>;
    getPredictionAccuracy(): Promise<import("../common/interfaces/api-response.interface").ApiResponse<any>>;
    getDashboardStats(): Promise<import("../common/interfaces/api-response.interface").ApiResponse<any>>;
    getRiskDistribution(): Promise<import("../common/interfaces/api-response.interface").ApiResponse<any>>;
    getTemperatureTrends(shtabelId?: number, days?: number): Promise<import("../common/interfaces/api-response.interface").ApiResponse<any>>;
}
