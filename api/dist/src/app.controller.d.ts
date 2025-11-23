import { AppService } from './app.service';
export declare class AppController {
    private readonly appService;
    constructor(appService: AppService);
    getRoot(): {
        service: string;
        version: string;
        status: string;
        docs: string;
    };
    getHealth(): Promise<{
        status: string;
        service: string;
        version: string;
        database: string;
        timestamp: string;
        error?: undefined;
    } | {
        status: string;
        service: string;
        database: string;
        error: string;
        timestamp: string;
        version?: undefined;
    }>;
}
