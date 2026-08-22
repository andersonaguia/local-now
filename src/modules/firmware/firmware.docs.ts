import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiConsumes,
  ApiCreatedResponse,
  ApiFoundResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { DEFAULT_FIRMWARE_MODEL } from './firmware.constants';
import { FirmwareManifestDto } from './dto/firmware-manifest.dto';

export const ApiFirmwareTag = () => ApiTags('firmware');

export const ApiPublishFirmware = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Publica um firmware na GitHub Release e registra a versão',
    }),
    ApiBearerAuth(),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      schema: {
        type: 'object',
        required: ['file', 'version'],
        properties: {
          file: { type: 'string', format: 'binary' },
          version: { type: 'integer', example: 2 },
          model: { type: 'string', example: DEFAULT_FIRMWARE_MODEL },
        },
      },
    }),
    ApiCreatedResponse({ type: () => FirmwareManifestDto }),
    ApiBadRequestResponse({ description: 'Arquivo ou dados inválidos' }),
    ApiUnauthorizedResponse({
      description: 'Missing or invalid access token',
    }),
    ApiConflictResponse({ description: 'Firmware version already published' }),
  );

export const ApiGetFirmwareManifest = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Manifesto OTA da versão mais recente do modelo',
    }),
    ApiQuery({
      name: 'model',
      required: false,
      example: DEFAULT_FIRMWARE_MODEL,
    }),
    ApiOkResponse({ type: () => FirmwareManifestDto }),
    ApiNotFoundResponse({ description: 'Firmware not found' }),
  );

export const ApiDownloadFirmware = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Redireciona para o .bin mais recente no CDN da GitHub',
    }),
    ApiQuery({
      name: 'model',
      required: false,
      example: DEFAULT_FIRMWARE_MODEL,
    }),
    ApiFoundResponse({ description: 'Redirect to GitHub release asset' }),
    ApiNotFoundResponse({ description: 'Firmware not found' }),
  );
