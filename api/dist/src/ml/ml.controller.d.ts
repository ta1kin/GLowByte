import { MlService } from './ml.service';
export declare class MlController {
    private readonly mlService;
    constructor(mlService: MlService);
    trainModel(body: {
        modelName: string;
        modelVersion: string;
        config?: any;
    }): Promise<import("../common/interfaces/api-response.interface").ApiResponse<any>>;
    getModels(): Promise<import("../common/interfaces/api-response.interface").ApiResponse<any>>;
    getModelMetrics(modelName: string, limit?: number): Promise<import("../common/interfaces/api-response.interface").ApiResponse<any>>;
}
