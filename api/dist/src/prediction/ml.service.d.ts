export declare class MlService {
    private readonly logger;
    private readonly CONTEXT;
    private readonly client;
    private readonly mlServiceUrl;
    constructor();
    predict(shtabelId: number, horizonDays?: number): Promise<any>;
    batchPredict(shtabelIds: number[]): Promise<any>;
    getMetrics(): Promise<any>;
    healthCheck(): Promise<any>;
}
