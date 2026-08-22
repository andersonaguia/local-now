import { Module } from '@nestjs/common';
import { CoreModule } from '../core/core.module';
import { AuthModule } from '../modules/auth/auth.module';
import { FirmwareModule } from '../modules/firmware/firmware.module';
import { GeoModule } from '../modules/geo/geo.module';
import { TimeModule } from '../modules/time/time.module';
import { WeatherModule } from '../modules/weather/weather.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    CoreModule,
    AuthModule,
    FirmwareModule,
    TimeModule,
    GeoModule,
    WeatherModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
