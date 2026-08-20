import { Injectable } from '@nestjs/common';
import { TimeResponse, Weekday } from './time.types';

const TIME_ZONE = 'America/Sao_Paulo';
const WEEKDAYS: Weekday[] = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB'];

function offsetSeconds(date: Date, timeZone: string): number {
  const name = new Intl.DateTimeFormat('en-US', {
    timeZone,
    timeZoneName: 'longOffset',
  })
    .formatToParts(date)
    .find((part) => part.type === 'timeZoneName')?.value;

  const match = name?.match(/GMT([+-])(\d{1,2})(?::?(\d{2}))?/);
  if (!match) {
    return -3 * 3600;
  }

  const sign = match[1] === '-' ? -1 : 1;
  const hours = Number(match[2]);
  const minutes = Number(match[3] ?? 0);
  return sign * (hours * 3600 + minutes * 60);
}

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

@Injectable()
export class TimeService {
  getTime(): TimeResponse {
    const now = new Date();
    const unix = Math.floor(now.getTime() / 1000);
    const tz = offsetSeconds(now, TIME_ZONE);
    const local = new Date(now.getTime() + tz * 1000);

    return {
      unix,
      tz,
      date: `${pad(local.getUTCDate())}/${pad(local.getUTCMonth() + 1)}/${local.getUTCFullYear()}`,
      time: `${pad(local.getUTCHours())}:${pad(local.getUTCMinutes())}:${pad(local.getUTCSeconds())}`,
      weekday: WEEKDAYS[local.getUTCDay()],
    };
  }
}
