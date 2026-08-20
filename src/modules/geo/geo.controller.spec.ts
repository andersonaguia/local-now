import { Test, TestingModule } from '@nestjs/testing';
import { Request } from 'express';
import { GeoController } from './geo.controller';
import { GeoService } from './geo.service';
import { GeoResponse } from './geo.types';

describe('GeoController', () => {
  let controller: GeoController;
  const geoService = {
    getLocation: jest.fn(),
  };

  const location: GeoResponse = {
    ip: '8.8.8.8',
    city: 'Mountain View',
    region: 'California',
    country: 'United States',
    countryCode: 'US',
    latitude: 37.386,
    longitude: -122.0838,
    timezone: 'America/Los_Angeles',
  };

  beforeEach(async () => {
    geoService.getLocation.mockReset();
    geoService.getLocation.mockResolvedValue(location);

    const app: TestingModule = await Test.createTestingModule({
      controllers: [GeoController],
      providers: [{ provide: GeoService, useValue: geoService }],
    }).compile();

    controller = app.get<GeoController>(GeoController);
  });

  it('returns the location for the request IP', async () => {
    const req = {
      headers: { 'x-forwarded-for': '8.8.8.8' },
      ip: '10.0.0.1',
    } as unknown as Request;

    await expect(controller.getLocation(req)).resolves.toEqual(location);
    expect(geoService.getLocation).toHaveBeenCalledWith('8.8.8.8');
  });
});
