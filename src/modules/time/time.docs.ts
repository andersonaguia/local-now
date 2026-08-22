import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { TimeResponseDto } from './dto/time-response.dto';

export const ApiTimeTag = () => ApiTags('time');

export const ApiGetTime = () =>
  applyDecorators(
    ApiOperation({ summary: 'Horário atual em America/Sao_Paulo' }),
    ApiOkResponse({ type: () => TimeResponseDto }),
  );
