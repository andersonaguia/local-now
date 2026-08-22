import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GeoResponseDto } from './dto/geo-response.dto';

export const ApiGeoTag = () => ApiTags('geo');

export const ApiGetLocation = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Localização a partir do IP do cliente',
      description:
        'Usa o IP da requisição. Em localhost ou rede privada, consulta o IP público de saída.',
    }),
    ApiOkResponse({ type: () => GeoResponseDto }),
  );
