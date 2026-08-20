import { ApiProperty } from '@nestjs/swagger';

export class GeoResponse {
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

  @ApiProperty({ example: -23.55, nullable: true })
  latitude: number | null;

  @ApiProperty({ example: -46.63, nullable: true })
  longitude: number | null;

  @ApiProperty({ example: 'America/Sao_Paulo' })
  timezone: string;
}
