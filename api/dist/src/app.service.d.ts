import { PrismaService } from '../prisma/prisma.service';
export declare class AppService {
    private prisma;
    private readonly logger;
    private readonly CONTEXT;
    constructor(prisma: PrismaService);
    getRoot(): {
        service: string;
        version: string;
        status: string;
        docs: string;
    };
    getHealth(): Promise<{
        status: string;
        service: string;
        version: string;
        database: string;
        timestamp: string;
        error?: undefined;
    } | {
        status: string;
        service: string;
        database: string;
        error: string;
        timestamp: string;
        version?: undefined;
    }>;
}
