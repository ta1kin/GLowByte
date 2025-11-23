import { StockpileService } from './stockpile.service';
import { CreateStockpileDto, UpdateStockpileDto, CreateSkladDto } from './dto';
export declare class StockpileController {
    private readonly stockpileService;
    constructor(stockpileService: StockpileService);
    getSklads(): Promise<import("../common/interfaces/api-response.interface").ApiResponse<any>>;
    getSkladById(id: number): Promise<import("../common/interfaces/api-response.interface").ApiResponse<any>>;
    createSklad(dto: CreateSkladDto): Promise<import("../common/interfaces/api-response.interface").ApiResponse<any>>;
    updateSklad(id: number, dto: Partial<CreateSkladDto>): Promise<import("../common/interfaces/api-response.interface").ApiResponse<any>>;
    getStockpiles(skladId?: number, status?: string, limit?: number): Promise<import("../common/interfaces/api-response.interface").ApiResponse<any>>;
    getStockpileById(id: number): Promise<import("../common/interfaces/api-response.interface").ApiResponse<any>>;
    createStockpile(dto: CreateStockpileDto): Promise<import("../common/interfaces/api-response.interface").ApiResponse<any>>;
    updateStockpile(id: number, dto: UpdateStockpileDto): Promise<import("../common/interfaces/api-response.interface").ApiResponse<any>>;
    deleteStockpile(id: number): Promise<import("../common/interfaces/api-response.interface").ApiResponse<any>>;
    getTemperatureHistory(id: number, days?: number): Promise<import("../common/interfaces/api-response.interface").ApiResponse<any>>;
}
