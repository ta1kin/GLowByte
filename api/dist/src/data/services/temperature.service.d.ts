import { PrismaService } from '../../../prisma/prisma.service';
interface TemperatureCSVRow {
    Склад?: string;
    Штабель?: string;
    Марка?: string;
    'Макс. температура'?: string;
    Пикет?: string;
    'Дата акта'?: string;
    Смена?: string;
}
export declare class TemperatureService {
    private prisma;
    private readonly logger;
    private readonly CONTEXT;
    constructor(prisma: PrismaService);
    processCSV(data: TemperatureCSVRow[], uploadId: number): Promise<{
        processed: number;
        failed: number;
        errors: {
            row: number;
            error: string;
        }[];
    }>;
    private calculateRiskLevel;
    private parseDate;
}
export {};
