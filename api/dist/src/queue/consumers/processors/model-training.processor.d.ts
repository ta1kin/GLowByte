import { PrismaService } from '../../../../prisma/prisma.service';
import { MlService } from '../../../prediction/ml.service';
export declare class ModelTrainingProcessor {
    private prisma;
    private mlService;
    private readonly logger;
    private readonly CONTEXT;
    private readonly mlServiceUrl;
    constructor(prisma: PrismaService, mlService: MlService);
    processTraining(modelName: string, modelVersion: string, config?: any): Promise<void>;
}
