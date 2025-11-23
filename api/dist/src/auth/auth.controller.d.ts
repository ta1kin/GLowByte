import { AuthService } from './auth.service';
import { LoginDto, CheckAuthDto } from './dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(loginDto: LoginDto): Promise<import("../common/interfaces/api-response.interface").ApiResponse<any>>;
    checkAuth(checkAuthDto: CheckAuthDto): Promise<import("../common/interfaces/api-response.interface").ApiResponse<any>>;
}
