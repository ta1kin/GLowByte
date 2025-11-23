import { PrismaService } from '../../../prisma/prisma.service';
interface WeatherCSVRow {
    date?: string;
    t?: string;
    p?: string;
    humidity?: string;
    precipitation?: string;
    wind_dir?: string;
    v_avg?: string;
    v_max?: string;
    cloudcover?: string;
    visibility?: string;
    weather_code?: string;
}
export declare class WeatherService {
    private prisma;
    private readonly logger;
    private readonly CONTEXT;
    constructor(prisma: PrismaService);
    processCSV(data: WeatherCSVRow[], uploadId: number): Promise<{
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
