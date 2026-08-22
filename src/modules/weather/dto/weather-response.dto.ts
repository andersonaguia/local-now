import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsIP, IsNumber, IsString } from 'class-validator';

export class WeatherResponseDto {
  @Expose()
  @ApiProperty({ example: '200.160.2.3' })
  @IsIP()
  ip!: string;

  @Expose()
  @ApiProperty({ example: 'São Paulo' })
  @IsString()
  city!: string;

  @Expose()
  @ApiProperty({ example: 'São Paulo' })
  @IsString()
  region!: string;

  @Expose()
  @ApiProperty({ example: 'Brazil' })
  @IsString()
  country!: string;

  @Expose()
  @ApiProperty({ example: 'BR' })
  @IsString()
  countryCode!: string;

  @Expose()
  @ApiProperty({ example: -23.55 })
  @IsNumber()
  latitude!: number;

  @Expose()
  @ApiProperty({ example: -46.63 })
  @IsNumber()
  longitude!: number;

  @Expose()
  @ApiProperty({ example: 22.4, description: 'Temperatura em °C' })
  @IsNumber()
  temperature!: number;

  @Expose()
  @ApiProperty({ example: 68, description: 'Umidade relativa em %' })
  @IsNumber()
  humidity!: number;

  @Expose()
  @ApiProperty({ example: 23.1, description: 'Sensação térmica em °C' })
  @IsNumber()
  apparentTemperature!: number;

  @Expose()
  @ApiProperty({ example: 0, description: 'Precipitação em mm' })
  @IsNumber()
  precipitation!: number;

  @Expose()
  @ApiProperty({ example: 9.7, description: 'Vento em km/h' })
  @IsNumber()
  windSpeed!: number;

  @Expose()
  @ApiProperty({ example: 2, description: 'Código WMO do clima' })
  @IsNumber()
  weatherCode!: number;

  @Expose()
  @ApiProperty({ example: 'Parcialmente nublado' })
  @IsString()
  description!: string;

  @Expose()
  @ApiProperty({ example: 'America/Sao_Paulo' })
  @IsString()
  timezone!: string;
}
