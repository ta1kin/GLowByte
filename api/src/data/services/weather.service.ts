import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { AppLogger } from '../../../common/logger/logger.service';

@Injectable()
export class WeatherService {
  private readonly logger = new AppLogger();
  private readonly CONTEXT = 'WeatherService';

  constructor(private prisma: PrismaService) {}

  async processCSV(data: any[], uploadId: number) {
    // TODO: Implement CSV processing logic
    this.logger.log(`Processing ${data.length} weather records`, this.CONTEXT);
    return { processed: 0, failed: 0 };
  }
}

