import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { UserResponseDto } from '../users/dto/user-response.dto';

export const ApiAuthTag = () => ApiTags('auth');

export const ApiRegister = () =>
  applyDecorators(
    ApiOperation({ summary: 'Cria uma nova conta' }),
    ApiCreatedResponse({ type: () => UserResponseDto }),
    ApiBadRequestResponse({ description: 'Dados de entrada inválidos' }),
    ApiConflictResponse({ description: 'Email already registered' }),
  );
