import { Controller, Get, Req } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { getClientIp } from '../geo/geo.utils';
import { WeatherService } from './weather.service';
import { WeatherResponse } from './weather.types';

@ApiTags('weather')
@Controller('weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @Get()
  @ApiOperation({
    summary: 'Clima atual da região do IP',
    description:
      'Resolve a localização pelo IP e consulta temperatura, umidade e demais dados no Open-Meteo.',
  })
  @ApiOkResponse({ type: WeatherResponse })
  getWeather(@Req() req: Request): Promise<WeatherResponse> {
    return this.weatherService.getWeather(getClientIp(req));
  }
}
