import { Test, TestingModule } from '@nestjs/testing';
import { Request } from 'express';
import { TimeService } from '../modules/time/time.service';
import { WeatherService } from '../modules/weather/weather.service';
import { AppController } from './app.controller';

describe('AppController', () => {
  let controller: AppController;
  const timeService = {
    getTime: jest.fn(),
  };
  const weatherService = {
    getWeather: jest.fn(),
  };

  beforeEach(async () => {
    timeService.getTime.mockReset();
    weatherService.getWeather.mockReset();
    timeService.getTime.mockReturnValue({
      unix: 1755717600,
      tz: -10800,
      date: '20/08/2026',
      time: '18:34:02',
      weekday: 'QUI',
    });
    weatherService.getWeather.mockResolvedValue({
      city: 'São Paulo',
      region: 'São Paulo',
      temperature: 22.4,
      apparentTemperature: 23.1,
    });

    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        { provide: TimeService, useValue: timeService },
        { provide: WeatherService, useValue: weatherService },
      ],
    }).compile();

    controller = app.get<AppController>(AppController);
  });

  it('should be able to render city, date, time and apparent temperature', async () => {
    const req = { headers: {}, ip: '8.8.8.8' } as unknown as Request;
    const html = await controller.home(req);

    expect(html).toContain('Local Now Server');
    expect(html).toContain('São Paulo');
    expect(html).toContain('QUI 20/08/2026');
    expect(html).toContain('18:34:02');
    expect(html).toContain('22,4 °C');
    expect(html).toContain('23,1 °C');
  });

  it('should be able to keep the page available when weather lookup fails', async () => {
    weatherService.getWeather.mockRejectedValue(new Error('offline'));
    const req = { headers: {}, ip: '8.8.8.8' } as unknown as Request;
    const html = await controller.home(req);

    expect(html).toContain('Local Now Server');
    expect(html).toContain('20/08/2026');
    expect(html).toContain('18:34:02');
    expect(html).toContain('—');
  });
});
