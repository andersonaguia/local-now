import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Redirect,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { toDto } from '../../core/http/to-dto';
import { AuthUser } from '../auth/auth.types';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FirmwareManifestDto } from './dto/firmware-manifest.dto';
import { UploadFirmwareDto } from './dto/upload-firmware.dto';
import {
  ApiDeleteFirmware,
  ApiDownloadFirmware,
  ApiFirmwareTag,
  ApiGetFirmwareManifest,
  ApiPublishFirmware,
} from './firmware.docs';
import { FirmwareService } from './firmware.service';
import { FirmwareUploadFile } from './firmware.types';

type AuthedRequest = {
  user: AuthUser;
};

@ApiFirmwareTag()
@Controller()
export class FirmwareController {
  constructor(private readonly firmwareService: FirmwareService) {}

  @Post('firmware')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(HttpStatus.CREATED)
  @ApiPublishFirmware()
  async publish(
    @UploadedFile() file: FirmwareUploadFile | undefined,
    @Body() dto: UploadFirmwareDto,
    @Req() request: AuthedRequest,
  ): Promise<FirmwareManifestDto> {
    const manifest = await this.firmwareService.publish({
      version: dto.version,
      model: dto.model,
      file,
      createdBy: request.user.id,
    });
    return toDto(FirmwareManifestDto, manifest);
  }

  @Delete('firmware')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiDeleteFirmware()
  async remove(
    @Query('version') version?: string,
    @Query('model') model?: string,
  ): Promise<void> {
    if (version === undefined || version === '') {
      await this.firmwareService.removeAll();
      return;
    }

    const parsed = Number(version);
    if (!Number.isInteger(parsed) || parsed < 1) {
      throw new BadRequestException('version must be a positive integer');
    }

    await this.firmwareService.remove(parsed, model);
  }

  @Get('firmware')
  @ApiGetFirmwareManifest()
  async getManifest(
    @Query('model') model?: string,
  ): Promise<FirmwareManifestDto> {
    const manifest = await this.firmwareService.getLatestManifest(model);
    return toDto(FirmwareManifestDto, manifest);
  }

  @Get('firmware.bin')
  @Redirect()
  @ApiDownloadFirmware()
  async download(@Query('model') model?: string): Promise<{
    url: string;
    statusCode: number;
  }> {
    const manifest = await this.firmwareService.getLatestManifest(model);
    return { url: manifest.url, statusCode: HttpStatus.FOUND };
  }
}
