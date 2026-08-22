import { BadGatewayException } from '@nestjs/common';
import { GeoService } from './geo.service';

describe('GeoService', () => {
  let service: GeoService;
  const fetchMock = jest.fn();

  beforeEach(() => {
    service = new GeoService();
    fetchMock.mockReset();
    global.fetch = fetchMock as unknown as typeof fetch;
  });

  it('should be able to look up a public client IP', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        ip: '8.8.8.8',
        city: 'Mountain View',
        region: 'California',
        country: 'United States',
        country_code: 'US',
        latitude: 37.386,
        longitude: -122.0838,
        timezone: { id: 'America/Los_Angeles' },
      }),
    });

    const result = await service.getLocation('8.8.8.8');

    expect(fetchMock).toHaveBeenCalledWith(
      'https://ipwho.is/8.8.8.8',
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
    expect(result).toEqual({
      ip: '8.8.8.8',
      city: 'Mountain View',
      region: 'California',
      country: 'United States',
      countryCode: 'US',
      latitude: 37.386,
      longitude: -122.0838,
      timezone: 'America/Los_Angeles',
    });
  });

  it('should be able to fall back to the caller public IP when the client IP is private', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        ip: '200.160.2.3',
        city: 'São Paulo',
        region: 'São Paulo',
        country: 'Brazil',
        country_code: 'BR',
        latitude: -23.55,
        longitude: -46.63,
        timezone: { id: 'America/Sao_Paulo' },
      }),
    });

    const result = await service.getLocation('127.0.0.1');

    expect(fetchMock).toHaveBeenCalledWith(
      'https://ipwho.is/',
      expect.any(Object),
    );
    expect(result.ip).toBe('200.160.2.3');
    expect(result.countryCode).toBe('BR');
  });

  it('should not be able to return a location when the lookup fails', async () => {
    fetchMock.mockRejectedValue(new Error('network down'));

    await expect(service.getLocation('8.8.8.8')).rejects.toBeInstanceOf(
      BadGatewayException,
    );
  });
});
