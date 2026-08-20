import { Module } from '@nestjs/common';
import { CoreModule } from '../core/core.module';
import { GeoModule } from '../modules/geo/geo.module';
import { TimeModule } from '../modules/time/time.module';
import { WeatherModule } from '../modules/weather/weather.module';

@Module({
  imports: [CoreModule, TimeModule, GeoModule, WeatherModule],
})
export class AppModule {}
