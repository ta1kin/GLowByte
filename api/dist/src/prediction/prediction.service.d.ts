import { PrismaService } from '../../prisma/prisma.service';
import { QueueService } from '../queue/queue.service';
import { MlService } from './ml.service';
export declare class PredictionService {
    private prisma;
    private queueService;
    private mlService;
    private readonly logger;
    private readonly CONTEXT;
    constructor(prisma: PrismaService, queueService: QueueService, mlService: MlService);
    getPredictions(shtabelId?: number, skladId?: number, riskLevel?: string, limit?: number): Promise<import("../common/interfaces/api-response.interface").ApiResponse<any>>;
    getPredictionById(id: number): Promise<import("../common/interfaces/api-response.interface").ApiResponse<any>>;
    createPrediction(shtabelId: number, horizonDays?: number): Promise<import("../common/interfaces/api-response.interface").ApiResponse<any>>;
    batchPredict(): Promise<import("../common/interfaces/api-response.interface").ApiResponse<any>>;
}
