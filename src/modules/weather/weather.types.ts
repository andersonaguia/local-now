import { ApiProperty } from '@nestjs/swagger';

export class WeatherResponse {
  @ApiProperty({ example: '200.160.2.3' })
  ip: string;

  @ApiProperty({ example: 'São Paulo' })
  city: string;

  @ApiProperty({ example: 'São Paulo' })
  region: string;

  @ApiProperty({ example: 'Brazil' })
  country: string;

  @ApiProperty({ example: 'BR' })
  countryCode: string;

  @ApiProperty({ example: -23.55 })
  latitude: number;

  @ApiProperty({ example: -46.63 })
  longitude: number;

  @ApiProperty({ example: 22.4, description: 'Temperatura em °C' })
  temperature: number;

  @ApiProperty({ example: 68, description: 'Umidade relativa em %' })
  humidity: number;

  @ApiProperty({ example: 23.1, description: 'Sensação térmica em °C' })
  apparentTemperature: number;

  @ApiProperty({ example: 0, description: 'Precipitação em mm' })
  precipitation: number;

  @ApiProperty({ example: 9.7, description: 'Vento em km/h' })
  windSpeed: number;

  @ApiProperty({ example: 2, description: 'Código WMO do clima' })
  weatherCode: number;

  @ApiProperty({ example: 'Parcialmente nublado' })
  description: string;

  @ApiProperty({ example: 'America/Sao_Paulo' })
  timezone: string;
}
