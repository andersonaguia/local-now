import { createHash } from 'node:crypto';

const DURATION = /^(\d+)(s|m|h|d)$/;
const UNIT_MS = {
  s: 1000,
  m: 60_000,
  h: 3_600_000,
  d: 86_400_000,
} as const;

export function durationToMs(value: string): number {
  const match = DURATION.exec(value.trim());
  if (!match) {
    throw new Error(`Invalid duration: ${value}`);
  }

  const amount = Number(match[1]);
  const unit = match[2] as keyof typeof UNIT_MS;
  return amount * UNIT_MS[unit];
}

export function durationToSeconds(value: string): number {
  return durationToMs(value) / 1000;
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}
