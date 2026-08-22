import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsInt, IsString, Min } from 'class-validator';
import {
  DEFAULT_FIRMWARE_MODEL,
  FIRMWARE_PUBLIC_PATH,
} from '../firmware.constants';

export class FirmwareManifestDto {
  @Expose()
  @ApiProperty({ example: 2 })
  @IsInt()
  @Min(1)
  version!: number;

  @Expose()
  @ApiProperty({
    example:
      'https://github.com/andersonaguia/platformIO-releases/releases/download/car-display-2/firmware.bin',
  })
  @IsString()
  url!: string;

  @Expose()
  @ApiProperty({ example: FIRMWARE_PUBLIC_PATH })
  @IsString()
  path!: string;

  @Expose()
  @ApiProperty({ example: 1048576 })
  @IsInt()
  size!: number;

  @Expose()
  @ApiProperty({
    example: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
  })
  @IsString()
  sha256!: string;

  @Expose()
  @ApiProperty({ example: DEFAULT_FIRMWARE_MODEL })
  @IsString()
  model!: string;
}
