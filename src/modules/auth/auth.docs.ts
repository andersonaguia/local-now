import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
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

export const ApiRefresh = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Troca um refresh token válido por um novo par de tokens',
    }),
    ApiOkResponse({ type: () => LoginResponseDto }),
    ApiBadRequestResponse({ description: 'Dados de entrada inválidos' }),
    ApiUnauthorizedResponse({ description: 'Invalid refresh token' }),
  );

export const ApiLogout = () =>
  applyDecorators(
    ApiOperation({ summary: 'Encerra a sessão e revoga o refresh token' }),
    ApiNoContentResponse(),
    ApiBadRequestResponse({ description: 'Dados de entrada inválidos' }),
    ApiUnauthorizedResponse({ description: 'Invalid refresh token' }),
  );
