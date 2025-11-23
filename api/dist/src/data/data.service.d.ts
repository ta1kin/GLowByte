import { PrismaService } from '../../prisma/prisma.service';
import { FileType } from '../common/enums/prisma-enums';
import { QueueService } from '../queue/queue.service';
export declare class DataService {
    private prisma;
    private queueService;
    private readonly logger;
    private readonly CONTEXT;
    private readonly uploadsDir;
    constructor(prisma: PrismaService, queueService: QueueService);
    createUpload(file: Express.Multer.File, fileType: FileType, userId?: number): Promise<import("../common/interfaces/api-response.interface").ApiResponse<any>>;
    getUploads(userId?: number, limit?: number): Promise<import("../common/interfaces/api-response.interface").ApiResponse<any>>;
    getUploadById(id: number): Promise<import("../common/interfaces/api-response.interface").ApiResponse<any>>;
}
