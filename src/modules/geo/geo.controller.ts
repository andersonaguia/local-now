import { Controller, Get, Req } from '@nestjs/common';
import { Request } from 'express';
import { toDto } from '../../core/http/to-dto';
import { GeoResponseDto } from './dto/geo-response.dto';
import { ApiGeoTag, ApiGetLocation } from './geo.docs';
import { GeoService } from './geo.service';
import { getClientIp } from './geo.utils';

@ApiGeoTag()
@Controller('geo')
export class GeoController {
  constructor(private readonly geoService: GeoService) {}

  @Get()
  @ApiGetLocation()
  async getLocation(@Req() req: Request): Promise<GeoResponseDto> {
    const location = await this.geoService.getLocation(getClientIp(req));
    return toDto(GeoResponseDto, location);
  }
}
