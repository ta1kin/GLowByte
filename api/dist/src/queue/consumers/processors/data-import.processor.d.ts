import { PrismaService } from '../../../../prisma/prisma.service';
import { FileType } from '../../../common/enums/prisma-enums';
import { FiresService } from '../../../data/services/fires.service';
import { SuppliesService } from '../../../data/services/supplies.service';
import { TemperatureService } from '../../../data/services/temperature.service';
import { WeatherService } from '../../../data/services/weather.service';
import { QueueService } from '../../queue.service';
export declare class DataImportProcessor {
    private prisma;
    private suppliesService;
    private firesService;
    private temperatureService;
    private weatherService;
    private queueService;
    private readonly logger;
    private readonly CONTEXT;
    private readonly uploadsDir;
    constructor(prisma: PrismaService, suppliesService: SuppliesService, firesService: FiresService, temperatureService: TemperatureService, weatherService: WeatherService, queueService: QueueService);
    processImport(uploadId: number, filename: string, fileType: FileType): Promise<void>;
}
