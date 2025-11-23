import { PrismaService } from '../../../prisma/prisma.service';
interface SupplyCSVRow {
    Склад?: string;
    Штабель?: string;
    ВыгрузкаНаСклад?: string;
    'Наим. ЕТСНГ'?: string;
    ПогрузкаНаСудно?: string;
    'На склад, тн'?: string;
    'На судно, тн'?: string;
}
export declare class SuppliesService {
    private prisma;
    private readonly logger;
    private readonly CONTEXT;
    constructor(prisma: PrismaService);
    processCSV(data: SupplyCSVRow[], uploadId: number): Promise<{
        processed: number;
        failed: number;
        errors: {
            row: number;
            error: string;
        }[];
    }>;
    private parseDate;
}
export {};
