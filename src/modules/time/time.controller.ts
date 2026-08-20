import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { TimeResponseDto } from './time-response.dto';
import { TimeService } from './time.service';
import { TimeResponse } from './time.types';

@ApiTags('time')
@Controller('time')
export class TimeController {
  constructor(private readonly timeService: TimeService) {}

  @Get()
  @ApiOperation({ summary: 'Horário atual em America/Sao_Paulo' })
  @ApiOkResponse({ type: TimeResponseDto })
  getTime(): TimeResponse {
    return this.timeService.getTime();
  }
}
