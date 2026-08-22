import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsIn, IsNumber, IsString, Matches } from 'class-validator';
import { Weekday } from '../time.types';

const WEEKDAYS: Weekday[] = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB'];

export class TimeResponseDto {
  @Expose()
  @ApiProperty({
    example: 1755717600,
    description: 'Unix timestamp em segundos',
  })
  @IsNumber()
  unix!: number;

  @Expose()
  @ApiProperty({
    example: -10800,
    description: 'Offset do fuso em segundos',
  })
  @IsNumber()
  tz!: number;

  @Expose()
  @ApiProperty({
    example: '20/08/2026',
    description: 'Data local (DD/MM/YYYY)',
  })
  @IsString()
  @Matches(/^\d{2}\/\d{2}\/\d{4}$/)
  date!: string;

  @Expose()
  @ApiProperty({
    example: '17:20:00',
    description: 'Hora local (HH:mm:ss)',
  })
  @IsString()
  @Matches(/^\d{2}:\d{2}:\d{2}$/)
  time!: string;

  @Expose()
  @ApiProperty({
    example: 'QUI',
    enum: WEEKDAYS,
  })
  @IsIn(WEEKDAYS)
  weekday!: Weekday;
}
