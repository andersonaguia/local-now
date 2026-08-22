import { Request } from 'express';

export function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0].trim();
  }
  if (Array.isArray(forwarded) && forwarded[0]) {
    return forwarded[0].split(',')[0].trim();
  }

  return req.ip ?? req.socket?.remoteAddress ?? '';
}

export function normalizeIp(ip: string): string {
  if (ip.startsWith('::ffff:')) {
    return ip.slice(7);
  }

  return ip;
}

export function isPrivateIp(ip: string): boolean {
  const value = normalizeIp(ip);
  if (
    !value ||
    value === '::1' ||
    value === '127.0.0.1' ||
    value === 'localhost'
  ) {
    return true;
  }
  if (
    value.startsWith('10.') ||
    value.startsWith('192.168.') ||
    value.startsWith('169.254.')
  ) {
    return true;
  }

  const match = /^172\.(\d+)\./.exec(value);
  if (match) {
    const second = Number(match[1]);
    if (second >= 16 && second <= 31) {
      return true;
    }
  }

  const lower = value.toLowerCase();
  return (
    lower.startsWith('fc') ||
    lower.startsWith('fd') ||
    lower.startsWith('fe80:')
  );
}
