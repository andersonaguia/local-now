import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { TimeService } from './time.service';
import { TimeResponse } from './time.types';

@ApiTags('time')
@Controller()
export class TimeController {
  constructor(private readonly timeService: TimeService) {}

  @Get()
  @ApiOperation({ summary: 'Horário atual em America/Sao_Paulo' })
  @ApiOkResponse({ type: TimeResponse })
  getTime(): TimeResponse {
    return this.timeService.getTime();
  }
}
