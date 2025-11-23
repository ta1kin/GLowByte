import { PrismaService } from '../../../../prisma/prisma.service';
import { NotificationService } from '../../../notification/notification.service';
import { MlService } from '../../../prediction/ml.service';
export declare class PredictionProcessor {
    private prisma;
    private mlService;
    private notificationService;
    private readonly logger;
    private readonly CONTEXT;
    constructor(prisma: PrismaService, mlService: MlService, notificationService: NotificationService);
    processPrediction(shtabelId: number, horizonDays?: number): Promise<void>;
    processBatchPredictions(shtabelIds: number[]): Promise<void>;
    private sendRiskNotifications;
}
