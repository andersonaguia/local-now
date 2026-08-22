import { Controller, Get } from '@nestjs/common';
import { toDto } from '../../core/http/to-dto';
import { TimeResponseDto } from './dto/time-response.dto';
import { ApiGetTime, ApiTimeTag } from './time.docs';
import { TimeService } from './time.service';

@ApiTimeTag()
@Controller('time')
export class TimeController {
  constructor(private readonly timeService: TimeService) {}

  @Get()
  @ApiGetTime()
  getTime(): TimeResponseDto {
    return toDto(TimeResponseDto, this.timeService.getTime());
  }
}
