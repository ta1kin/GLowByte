import { Request } from 'express';
import { DataService } from './data.service';
import { UploadFileDto } from './dto';
export declare class DataController {
    private readonly dataService;
    constructor(dataService: DataService);
    uploadFile(file: Express.Multer.File | undefined, uploadDto: UploadFileDto, req: Request & {
        user?: {
            id: number;
        };
    }): Promise<import("../common/interfaces/api-response.interface").ApiResponse<any>>;
    getUploads(req: Request & {
        user?: {
            id: number;
        };
    }): Promise<import("../common/interfaces/api-response.interface").ApiResponse<any>>;
    getUploadById(id: number): Promise<import("../common/interfaces/api-response.interface").ApiResponse<any>>;
}
