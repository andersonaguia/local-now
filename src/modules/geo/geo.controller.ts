import { Controller, Get, Req } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { GeoService } from './geo.service';
import { GeoResponse } from './geo.types';
import { getClientIp } from './geo.utils';

@ApiTags('geo')
@Controller('geo')
export class GeoController {
  constructor(private readonly geoService: GeoService) {}

  @Get()
  @ApiOperation({
    summary: 'Localização a partir do IP do cliente',
    description:
      'Usa o IP da requisição. Em localhost ou rede privada, consulta o IP público de saída.',
  })
  @ApiOkResponse({ type: GeoResponse })
  getLocation(@Req() req: Request): Promise<GeoResponse> {
    return this.geoService.getLocation(getClientIp(req));
  }
}
