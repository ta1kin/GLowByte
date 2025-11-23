import { ShtabelStatus } from '../../common/enums/prisma-enums';
export { ShtabelStatus };
export declare class CreateStockpileDto {
    skladId: number;
    label: string;
    mark?: string;
    formedAt?: string;
    height_m?: number;
    width_m?: number;
    length_m?: number;
    mass_t?: number;
    status?: ShtabelStatus;
}
