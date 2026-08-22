import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsDate, IsEmail, IsUUID } from 'class-validator';

export class UserResponseDto {
  @Expose()
  @ApiProperty({ example: '3d8f1c2e-7a4b-4c9d-9e2f-1a2b3c4d5e6f' })
  @IsUUID()
  id!: string;

  @Expose()
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email!: string;

  @Expose()
  @ApiProperty({ example: '2026-08-22T17:41:00.000Z' })
  @IsDate()
  createdAt!: Date;

  @Expose()
  @ApiProperty({ example: '2026-08-22T17:41:00.000Z' })
  @IsDate()
  updatedAt!: Date;
}
