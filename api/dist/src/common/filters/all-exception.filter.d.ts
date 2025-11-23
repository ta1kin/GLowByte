import { ExceptionFilter, ArgumentsHost } from '@nestjs/common';
import { AppLogger } from '../logger/logger.service';
export declare class AllExceptionsFilter implements ExceptionFilter {
    private readonly logger;
    constructor(logger: AppLogger);
    catch(exception: unknown, host: ArgumentsHost): void;
    private createErrorResponse;
}
