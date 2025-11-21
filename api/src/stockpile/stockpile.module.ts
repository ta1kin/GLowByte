import { Module } from '@nestjs/common';
import { StockpileController } from './stockpile.controller';
import { StockpileService } from './stockpile.service';

@Module({
  controllers: [StockpileController],
  providers: [StockpileService],
  exports: [StockpileService],
})
export class StockpileModule {}

