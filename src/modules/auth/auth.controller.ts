import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { toDto } from '../../core/http/to-dto';
import { UserResponseDto } from '../users/dto/user-response.dto';
import { ApiAuthTag, ApiRegister } from './auth.docs';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';

@ApiAuthTag()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiRegister()
  async register(@Body() dto: RegisterDto): Promise<UserResponseDto> {
    const user = await this.authService.register(dto);
    return toDto(UserResponseDto, user);
  }
}
