import { Test, TestingModule } from '@nestjs/testing';
import { Request } from 'express';
import { WeatherController } from './weather.controller';
import { WeatherService } from './weather.service';
import { WeatherResponse } from './weather.types';

describe('WeatherController', () => {
  let controller: WeatherController;
  const weatherService = {
    getWeather: jest.fn(),
  };

  const weather: WeatherResponse = {
    ip: '8.8.8.8',
    city: 'Mountain View',
    region: 'California',
    country: 'United States',
    countryCode: 'US',
    latitude: 37.386,
    longitude: -122.0838,
    temperature: 18.4,
    humidity: 62,
    apparentTemperature: 16.1,
    precipitation: 0,
    windSpeed: 12.2,
    weatherCode: 2,
    description: 'Parcialmente nublado',
    timezone: 'America/Los_Angeles',
  };

  beforeEach(async () => {
    weatherService.getWeather.mockReset();
    weatherService.getWeather.mockResolvedValue(weather);

    const app: TestingModule = await Test.createTestingModule({
      controllers: [WeatherController],
      providers: [{ provide: WeatherService, useValue: weatherService }],
    }).compile();

    controller = app.get<WeatherController>(WeatherController);
  });

  it('returns the weather for the request IP', async () => {
    const req = {
      headers: { 'x-forwarded-for': '8.8.8.8' },
      ip: '10.0.0.1',
    } as unknown as Request;

    await expect(controller.getWeather(req)).resolves.toEqual(weather);
    expect(weatherService.getWeather).toHaveBeenCalledWith('8.8.8.8');
  });
});
