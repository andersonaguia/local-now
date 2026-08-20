export type Weekday = 'DOM' | 'SEG' | 'TER' | 'QUA' | 'QUI' | 'SEX' | 'SAB';

export type TimeResponse = {
  unix: number;
  tz: number;
  date: string;
  time: string;
  weekday: Weekday;
};
