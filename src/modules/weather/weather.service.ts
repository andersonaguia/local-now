import { BadGatewayException, Injectable } from '@nestjs/common';
import { GeoService } from '../geo/geo.service';
import { describeWeather } from './weather.codes';
import { WeatherResponse } from './weather.types';

const WEATHER_LOOKUP_URL = 'https://api.open-meteo.com/v1/forecast';
const LOOKUP_TIMEOUT_MS = 5000;
const CURRENT_FIELDS = [
  'temperature_2m',
  'relative_humidity_2m',
  'apparent_temperature',
  'precipitation',
  'weather_code',
  'wind_speed_10m',
].join(',');

type OpenMeteoResponse = {
  timezone?: string;
  current?: {
    temperature_2m?: number;
    relative_humidity_2m?: number;
    apparent_temperature?: number;
    precipitation?: number;
    weather_code?: number;
    wind_speed_10m?: number;
  };
};

@Injectable()
export class WeatherService {
  constructor(private readonly geoService: GeoService) {}

  async getWeather(clientIp: string): Promise<WeatherResponse> {
    const geo = await this.geoService.getLocation(clientIp);
    if (geo.latitude == null || geo.longitude == null) {
      throw new BadGatewayException(
        'Unable to resolve coordinates for weather',
      );
    }

    const data = await this.lookup(geo.latitude, geo.longitude, geo.timezone);
    const current = data.current;
    const weatherCode = current?.weather_code ?? -1;

    return {
      ip: geo.ip,
      city: geo.city,
      region: geo.region,
      country: geo.country,
      countryCode: geo.countryCode,
      latitude: geo.latitude,
      longitude: geo.longitude,
      temperature: current?.temperature_2m ?? 0,
      humidity: current?.relative_humidity_2m ?? 0,
      apparentTemperature: current?.apparent_temperature ?? 0,
      precipitation: current?.precipitation ?? 0,
      windSpeed: current?.wind_speed_10m ?? 0,
      weatherCode,
      description: describeWeather(weatherCode),
      timezone: data.timezone || geo.timezone,
    };
  }

  private async lookup(
    latitude: number,
    longitude: number,
    timezone: string,
  ): Promise<OpenMeteoResponse> {
    const params = new URLSearchParams({
      latitude: String(latitude),
      longitude: String(longitude),
      current: CURRENT_FIELDS,
      timezone: timezone || 'auto',
    });

    let response: Response;
    try {
      response = await fetch(`${WEATHER_LOOKUP_URL}?${params.toString()}`, {
        signal: AbortSignal.timeout(LOOKUP_TIMEOUT_MS),
      });
    } catch {
      throw new BadGatewayException(
        'Unable to resolve weather for this location',
      );
    }

    if (!response.ok) {
      throw new BadGatewayException(
        'Unable to resolve weather for this location',
      );
    }

    return (await response.json()) as OpenMeteoResponse;
  }
}
