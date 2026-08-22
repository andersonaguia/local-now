import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { WeatherResponseDto } from './dto/weather-response.dto';

export const ApiWeatherTag = () => ApiTags('weather');

export const ApiGetWeather = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Clima atual da região do IP',
      description:
        'Resolve a localização pelo IP e consulta temperatura, umidade e demais dados no Open-Meteo.',
    }),
    ApiOkResponse({ type: () => WeatherResponseDto }),
  );
