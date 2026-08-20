import { Request } from 'express';
import { getClientIp, isPrivateIp, normalizeIp } from './geo.utils';

describe('geo.utils', () => {
  describe('normalizeIp', () => {
    it('strips IPv4-mapped IPv6 prefix', () => {
      expect(normalizeIp('::ffff:192.168.0.10')).toBe('192.168.0.10');
    });
  });

  describe('isPrivateIp', () => {
    it.each([
      '',
      '::1',
      '127.0.0.1',
      'localhost',
      '::ffff:127.0.0.1',
      '10.0.0.1',
      '192.168.1.10',
      '172.16.0.1',
      '172.31.255.255',
      '169.254.1.1',
      'fd12:3456:789a::1',
      'fe80::1',
    ])('treats %s as private', (ip) => {
      expect(isPrivateIp(ip)).toBe(true);
    });

    it.each(['8.8.8.8', '1.1.1.1', '177.0.0.1', '172.15.0.1', '172.32.0.1'])(
      'treats %s as public',
      (ip) => {
        expect(isPrivateIp(ip)).toBe(false);
      },
    );
  });

  describe('getClientIp', () => {
    it('prefers the first X-Forwarded-For address', () => {
      const req = {
        headers: { 'x-forwarded-for': '203.0.113.10, 10.0.0.1' },
        ip: '10.0.0.1',
      } as unknown as Request;

      expect(getClientIp(req)).toBe('203.0.113.10');
    });

    it('falls back to req.ip', () => {
      const req = {
        headers: {},
        ip: '8.8.8.8',
      } as unknown as Request;

      expect(getClientIp(req)).toBe('8.8.8.8');
    });
  });
});
