export declare class AppLogger {
    private logger;
    constructor();
    log(message: string, context?: string, metadata?: any): void;
    error(message: string, trace?: string | undefined, context?: string, metadata?: any): void;
    warn(message: string, context?: string, metadata?: any): void;
    debug(message: string, context?: string, metadata?: any): void;
    fatal(message: string, trace?: string | undefined, context?: string, metadata?: any): void;
    logHttpRequest(method: string, url: string, ip: string, body: any, statusCode?: number | undefined, duration?: number | undefined): void;
    logApiResponse(method: string, url: string, response: any, duration: number): void;
}
