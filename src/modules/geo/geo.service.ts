import { BadGatewayException, Injectable } from '@nestjs/common';
import { GeoResponse } from './geo.types';
import { isPrivateIp, normalizeIp } from './geo.utils';

const GEO_LOOKUP_URL = 'https://ipwho.is';
const LOOKUP_TIMEOUT_MS = 5000;

type GeoLookupResponse = {
  success?: boolean;
  message?: string;
  ip?: string;
  city?: string;
  region?: string;
  country?: string;
  country_code?: string;
  latitude?: number | null;
  longitude?: number | null;
  timezone?: string | { id?: string };
};

@Injectable()
export class GeoService {
  async getLocation(clientIp: string): Promise<GeoResponse> {
    const publicIp = isPrivateIp(clientIp) ? undefined : normalizeIp(clientIp);
    const data = await this.lookup(publicIp);

    return {
      ip: data.ip ?? publicIp ?? clientIp,
      city: data.city ?? '',
      region: data.region ?? '',
      country: data.country ?? '',
      countryCode: data.country_code ?? '',
      latitude: data.latitude ?? null,
      longitude: data.longitude ?? null,
      timezone: this.readTimezone(data.timezone),
    };
  }

  private async lookup(ip?: string): Promise<GeoLookupResponse> {
    const url = ip
      ? `${GEO_LOOKUP_URL}/${encodeURIComponent(ip)}`
      : `${GEO_LOOKUP_URL}/`;

    let response: Response;
    try {
      response = await fetch(url, {
        signal: AbortSignal.timeout(LOOKUP_TIMEOUT_MS),
      });
    } catch {
      throw new BadGatewayException('Unable to resolve location for this IP');
    }

    if (!response.ok) {
      throw new BadGatewayException('Unable to resolve location for this IP');
    }

    const data = (await response.json()) as GeoLookupResponse;
    if (data.success === false) {
      throw new BadGatewayException(
        data.message ?? 'Unable to resolve location for this IP',
      );
    }

    return data;
  }

  private readTimezone(timezone: GeoLookupResponse['timezone']): string {
    if (typeof timezone === 'string') {
      return timezone;
    }

    return timezone?.id ?? '';
  }
}
