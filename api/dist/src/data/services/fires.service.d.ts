import { PrismaService } from '../../../prisma/prisma.service';
interface FireCSVRow {
    Склад?: string;
    Штабель?: string;
    'Дата составления'?: string;
    Груз?: string;
    'Вес по акту, тн'?: string;
    'Дата начала'?: string;
    'Дата окончания'?: string;
    'Нач.форм.штабеля'?: string;
}
export declare class FiresService {
    private prisma;
    private readonly logger;
    private readonly CONTEXT;
    constructor(prisma: PrismaService);
    processCSV(data: FireCSVRow[], uploadId: number): Promise<{
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
