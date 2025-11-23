import { CreateStockpileDto, ShtabelStatus } from './create-stockpile.dto';
declare const UpdateStockpileDto_base: import("@nestjs/mapped-types").MappedType<Partial<CreateStockpileDto>>;
export declare class UpdateStockpileDto extends UpdateStockpileDto_base {
    skladId?: number;
    label?: string;
    mark?: string;
    formedAt?: string;
    height_m?: number;
    width_m?: number;
    length_m?: number;
    mass_t?: number;
    status?: ShtabelStatus;
    currentMass?: number;
    lastTemp?: number;
    lastTempDate?: string;
}
export {};
