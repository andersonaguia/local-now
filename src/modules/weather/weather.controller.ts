import { Controller, Get, Req } from '@nestjs/common';
import { Request } from 'express';
import { toDto } from '../../core/http/to-dto';
import { getClientIp } from '../geo/geo.utils';
import { WeatherResponseDto } from './dto/weather-response.dto';
import { ApiGetWeather, ApiWeatherTag } from './weather.docs';
import { WeatherService } from './weather.service';

@ApiWeatherTag()
@Controller('weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @Get()
  @ApiGetWeather()
  async getWeather(@Req() req: Request): Promise<WeatherResponseDto> {
    const weather = await this.weatherService.getWeather(getClientIp(req));
    return toDto(WeatherResponseDto, weather);
  }
}
