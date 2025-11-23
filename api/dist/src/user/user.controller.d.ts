import { Request } from 'express';
import { UserService } from './user.service';
import { UpdateUserSettingsDto } from './dto';
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
    getProfile(req: Request & {
        user?: {
            id: number;
        };
    }): Promise<import("../common/interfaces/api-response.interface").ApiResponse<any>>;
    updateSettings(req: Request & {
        user?: {
            id: number;
        };
    }, settings: UpdateUserSettingsDto): Promise<import("../common/interfaces/api-response.interface").ApiResponse<any>>;
}
