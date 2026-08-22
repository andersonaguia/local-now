import { durationToMs, durationToSeconds, hashToken } from './auth.utils';

describe('auth.utils', () => {
  it('should be able to convert durations to milliseconds', () => {
    expect(durationToMs('15m')).toBe(15 * 60 * 1000);
    expect(durationToMs('7d')).toBe(7 * 24 * 60 * 60 * 1000);
  });

  it('should be able to convert durations to seconds', () => {
    expect(durationToSeconds('15m')).toBe(900);
  });

  it('should not be able to parse an invalid duration', () => {
    expect(() => durationToMs('15 minutes')).toThrow('Invalid duration');
  });

  it('should be able to hash a refresh token', () => {
    expect(hashToken('refresh-token')).toMatch(/^[a-f0-9]{64}$/);
    expect(hashToken('refresh-token')).toBe(hashToken('refresh-token'));
    expect(hashToken('refresh-token')).not.toBe(hashToken('other-token'));
  });
});
