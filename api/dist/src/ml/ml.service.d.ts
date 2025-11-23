import { PrismaService } from '../../prisma/prisma.service';
import { QueueService } from '../queue/queue.service';
export declare class MlService {
    private prisma;
    private queueService;
    private readonly logger;
    private readonly CONTEXT;
    constructor(prisma: PrismaService, queueService: QueueService);
    trainModel(modelName: string, modelVersion: string, config?: any): Promise<import("../common/interfaces/api-response.interface").ApiResponse<any>>;
    getModels(): Promise<import("../common/interfaces/api-response.interface").ApiResponse<any>>;
    getModelMetrics(modelName: string, limit?: number): Promise<import("../common/interfaces/api-response.interface").ApiResponse<any>>;
}
