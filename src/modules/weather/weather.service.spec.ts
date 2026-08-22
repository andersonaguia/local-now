import { BadGatewayException } from '@nestjs/common';
import { GeoService } from '../geo/geo.service';
import { WeatherService } from './weather.service';

describe('WeatherService', () => {
  const geoService = {
    getLocation: jest.fn(),
  };
  const fetchMock = jest.fn();
  let service: WeatherService;

  const location = {
    ip: '8.8.8.8',
    city: 'Mountain View',
    region: 'California',
    country: 'United States',
    countryCode: 'US',
    latitude: 37.386,
    longitude: -122.0838,
    timezone: 'America/Los_Angeles',
  };

  beforeEach(() => {
    geoService.getLocation.mockReset();
    fetchMock.mockReset();
    global.fetch = fetchMock as unknown as typeof fetch;
    service = new WeatherService(geoService as unknown as GeoService);
  });

  it('should be able to return current weather for the resolved location', async () => {
    geoService.getLocation.mockResolvedValue(location);
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        timezone: 'America/Los_Angeles',
        current: {
          temperature_2m: 18.4,
          relative_humidity_2m: 62,
          apparent_temperature: 16.1,
          precipitation: 0,
          weather_code: 2,
          wind_speed_10m: 12.2,
        },
      }),
    });

    const result = await service.getWeather('8.8.8.8');

    expect(geoService.getLocation).toHaveBeenCalledWith('8.8.8.8');
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('https://api.open-meteo.com/v1/forecast?'),
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
    expect(result).toEqual({
      ...location,
      temperature: 18.4,
      humidity: 62,
      apparentTemperature: 16.1,
      precipitation: 0,
      windSpeed: 12.2,
      weatherCode: 2,
      description: 'Parcialmente nublado',
      timezone: 'America/Los_Angeles',
    });
  });

  it('should not be able to fetch weather when coordinates are missing', async () => {
    geoService.getLocation.mockResolvedValue({
      ...location,
      latitude: null,
      longitude: null,
    });

    await expect(service.getWeather('8.8.8.8')).rejects.toBeInstanceOf(
      BadGatewayException,
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('should not be able to return weather when the lookup fails', async () => {
    geoService.getLocation.mockResolvedValue(location);
    fetchMock.mockRejectedValue(new Error('network down'));

    await expect(service.getWeather('8.8.8.8')).rejects.toBeInstanceOf(
      BadGatewayException,
    );
  });
});
