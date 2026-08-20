import { Controller, Get, Header, Req } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { Request } from 'express';
import { getClientIp } from '../modules/geo/geo.utils';
import { TimeService } from '../modules/time/time.service';
import { WeatherService } from '../modules/weather/weather.service';
import { renderHomePage } from './home.page';

function formatCelsius(value: number): string {
  return `${new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value)} °C`;
}

@ApiExcludeController()
@Controller()
export class AppController {
  constructor(
    private readonly timeService: TimeService,
    private readonly weatherService: WeatherService,
  ) {}

  @Get()
  @Header('Content-Type', 'text/html; charset=utf-8')
  async home(@Req() req: Request): Promise<string> {
    const time = this.timeService.getTime();
    let city = '—';
    let temperature = '—';
    let apparentTemperature = '—';

    try {
      const weather = await this.weatherService.getWeather(getClientIp(req));
      city = weather.city || weather.region || '—';
      temperature = formatCelsius(weather.temperature);
      apparentTemperature = formatCelsius(weather.apparentTemperature);
    } catch {
      // Keep placeholders when geo/weather lookup is unavailable.
    }

    return renderHomePage({
      city,
      date: time.date,
      time: time.time,
      weekday: time.weekday,
      temperature,
      apparentTemperature,
    });
  }
}
