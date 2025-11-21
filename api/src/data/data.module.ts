import { Module } from '@nestjs/common';
import { DataController } from './data.controller';
import { DataService } from './data.service';
import { SuppliesService } from './services/supplies.service';
import { FiresService } from './services/fires.service';
import { TemperatureService } from './services/temperature.service';
import { WeatherService } from './services/weather.service';

@Module({
  controllers: [DataController],
  providers: [
    DataService,
    SuppliesService,
    FiresService,
    TemperatureService,
    WeatherService,
  ],
  exports: [
    DataService,
    SuppliesService,
    FiresService,
    TemperatureService,
    WeatherService,
  ],
})
export class DataModule {}

