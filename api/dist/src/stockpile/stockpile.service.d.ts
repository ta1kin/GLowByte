import { PrismaService } from '../../prisma/prisma.service';
import { CreateSkladDto, CreateStockpileDto, UpdateStockpileDto } from './dto';
export declare class StockpileService {
    private prisma;
    private readonly logger;
    private readonly CONTEXT;
    constructor(prisma: PrismaService);
    getSklads(): Promise<import("../common/interfaces/api-response.interface").ApiResponse<any>>;
    getSkladById(id: number): Promise<import("../common/interfaces/api-response.interface").ApiResponse<any>>;
    createSklad(dto: CreateSkladDto): Promise<import("../common/interfaces/api-response.interface").ApiResponse<any>>;
    updateSklad(id: number, dto: Partial<CreateSkladDto>): Promise<import("../common/interfaces/api-response.interface").ApiResponse<any>>;
    getStockpiles(skladId?: number, status?: string, limit?: number): Promise<import("../common/interfaces/api-response.interface").ApiResponse<any>>;
    getStockpileById(id: number): Promise<import("../common/interfaces/api-response.interface").ApiResponse<any>>;
    createStockpile(dto: CreateStockpileDto): Promise<import("../common/interfaces/api-response.interface").ApiResponse<any>>;
    updateStockpile(id: number, dto: UpdateStockpileDto): Promise<import("../common/interfaces/api-response.interface").ApiResponse<any>>;
    deleteStockpile(id: number): Promise<import("../common/interfaces/api-response.interface").ApiResponse<any>>;
    getStockpileTemperatureHistory(shtabelId: number, days?: number): Promise<import("../common/interfaces/api-response.interface").ApiResponse<any>>;
}
