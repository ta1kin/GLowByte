import { Module } from '@nestjs/common';
import { PredictionController } from './prediction.controller';
import { PredictionService } from './prediction.service';
import { MlService } from './ml.service';

@Module({
  controllers: [PredictionController],
  providers: [PredictionService, MlService],
  exports: [PredictionService, MlService],
})
export class PredictionModule {}

