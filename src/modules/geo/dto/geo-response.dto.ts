import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsIP, IsNumber, IsOptional, IsString } from 'class-validator';

export class GeoResponseDto {
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
  @ApiProperty({ example: -23.55, nullable: true })
  @IsOptional()
  @IsNumber()
  latitude!: number | null;

  @Expose()
  @ApiProperty({ example: -46.63, nullable: true })
  @IsOptional()
  @IsNumber()
  longitude!: number | null;

  @Expose()
  @ApiProperty({ example: 'America/Sao_Paulo' })
  @IsString()
  timezone!: string;
}
