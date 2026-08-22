import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { toDto } from '../../core/http/to-dto';
import { UserResponseDto } from '../users/dto/user-response.dto';
import { ApiAuthTag, ApiLogin, ApiRefresh, ApiRegister } from './auth.docs';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { RefreshDto } from './dto/refresh.dto';
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

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiLogin()
  async login(@Body() dto: LoginDto): Promise<LoginResponseDto> {
    const tokens = await this.authService.login(dto);
    return toDto(LoginResponseDto, tokens);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiRefresh()
  async refresh(@Body() dto: RefreshDto): Promise<LoginResponseDto> {
    const tokens = await this.authService.refresh(dto);
    return toDto(LoginResponseDto, tokens);
  }
}
