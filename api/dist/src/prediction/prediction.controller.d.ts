import { PredictionService } from './prediction.service';
import { CreatePredictionDto } from './dto';
export declare class PredictionController {
    private readonly predictionService;
    constructor(predictionService: PredictionService);
    getPredictions(shtabelId?: number, skladId?: number, riskLevel?: string, limit?: number): Promise<import("../common/interfaces/api-response.interface").ApiResponse<any>>;
    getPredictionById(id: number): Promise<import("../common/interfaces/api-response.interface").ApiResponse<any>>;
    createPrediction(dto: CreatePredictionDto): Promise<import("../common/interfaces/api-response.interface").ApiResponse<any>>;
    batchPredict(): Promise<import("../common/interfaces/api-response.interface").ApiResponse<any>>;
}
