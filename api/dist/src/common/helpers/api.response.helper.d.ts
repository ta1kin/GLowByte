import { ApiResponse } from '../interfaces/api-response.interface';
import { AppLogger } from '../logger/logger.service';
export declare const setResponseLogger: (logger: AppLogger) => void;
export declare const successResponse: <T>(data: T, message?: string, meta?: any) => ApiResponse<T>;
export declare const errorResponse: (message: string, errors?: any, context?: string) => ApiResponse;
export declare const warningResponse: <T>(data: T, message: string, meta?: any, context?: string) => ApiResponse<T>;
