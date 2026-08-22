import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsIn, IsNumber, IsString } from 'class-validator';

export class LoginResponseDto {
  @Expose()
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  @IsString()
  accessToken!: string;

  @Expose()
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  @IsString()
  refreshToken!: string;

  @Expose()
  @ApiProperty({ example: 'Bearer', enum: ['Bearer'] })
  @IsIn(['Bearer'])
  tokenType!: 'Bearer';

  @Expose()
  @ApiProperty({
    example: 900,
    description: 'Validade do access token em segundos',
  })
  @IsNumber()
  expiresIn!: number;
}
