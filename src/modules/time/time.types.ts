import { ApiProperty } from '@nestjs/swagger';

export type Weekday = 'DOM' | 'SEG' | 'TER' | 'QUA' | 'QUI' | 'SEX' | 'SAB';

export class TimeResponse {
  @ApiProperty({ example: 1755717600, description: 'Unix timestamp em segundos' })
  unix: number;

  @ApiProperty({ example: -10800, description: 'Offset do fuso em segundos' })
  tz: number;

  @ApiProperty({ example: '20/08/2026', description: 'Data local (DD/MM/YYYY)' })
  date: string;

  @ApiProperty({ example: '17:20:00', description: 'Hora local (HH:mm:ss)' })
  time: string;

  @ApiProperty({
    example: 'QUI',
    enum: ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB'],
  })
  weekday: Weekday;
}
