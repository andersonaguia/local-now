import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UserResponseDto } from '../users/dto/user-response.dto';
import { LoginResponseDto } from './dto/login-response.dto';

export const ApiAuthTag = () => ApiTags('auth');

export const ApiRegister = () =>
  applyDecorators(
    ApiOperation({ summary: 'Cria uma nova conta' }),
    ApiCreatedResponse({ type: () => UserResponseDto }),
    ApiBadRequestResponse({ description: 'Dados de entrada inválidos' }),
    ApiConflictResponse({ description: 'Email already registered' }),
  );

export const ApiLogin = () =>
  applyDecorators(
    ApiOperation({ summary: 'Autentica o usuário e emite tokens' }),
    ApiOkResponse({ type: () => LoginResponseDto }),
    ApiBadRequestResponse({ description: 'Dados de entrada inválidos' }),
    ApiUnauthorizedResponse({ description: 'Invalid credentials' }),
  );
