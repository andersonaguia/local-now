import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { and, desc, eq } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import { DatabaseService } from '../../core/database/database.service';
import { firmwares } from '../../core/database/schema';
import {
  DEFAULT_FIRMWARE_MODEL,
  FIRMWARE_PUBLIC_PATH,
} from './firmware.constants';
import {
  FirmwareManifest,
  FirmwareRelease,
  FirmwareUploadFile,
} from './firmware.types';
import {
  firmwareTag,
  isEsp32Image,
  isFirmwareSizeAllowed,
  sha256Hex,
} from './firmware.utils';
import { GithubReleasesService } from './github-releases.service';

@Injectable()
export class FirmwareService {
  constructor(
    private readonly database: DatabaseService,
    private readonly githubReleases: GithubReleasesService,
  ) {}

  async publish(input: {
    version: number;
    model?: string;
    file?: FirmwareUploadFile;
    createdBy: string;
  }): Promise<FirmwareManifest> {
    const model = input.model ?? DEFAULT_FIRMWARE_MODEL;
    const file = input.file;

    if (!file?.buffer?.length) {
      throw new BadRequestException('Firmware file is required');
    }
    if (!isFirmwareSizeAllowed(file.size || file.buffer.length)) {
      throw new BadRequestException('Firmware file is too large');
    }
    if (!isEsp32Image(file.buffer)) {
      throw new BadRequestException('File is not a valid ESP32 firmware image');
    }

    const existing = await this.findByModelVersion(model, input.version);
    if (existing) {
      throw new ConflictException('Firmware version already published');
    }

    const sha256 = sha256Hex(file.buffer);
    const sizeBytes = file.buffer.length;
    const { url } = await this.githubReleases.publishAsset({
      tag: firmwareTag(model, input.version),
      name: `${model} ${input.version}`,
      buffer: file.buffer,
    });

    const [release] = await this.database.db
      .insert(firmwares)
      .values({
        id: randomUUID(),
        model,
        version: input.version,
        sha256,
        sizeBytes,
        url,
        createdBy: input.createdBy,
        createdAt: new Date(),
      })
      .returning();

    if (!release) {
      throw new ConflictException('Firmware version already published');
    }

    return toManifest(release);
  }

  async getLatestManifest(model?: string): Promise<FirmwareManifest> {
    const release = await this.findLatest(
      model?.trim() || DEFAULT_FIRMWARE_MODEL,
    );
    if (!release) {
      throw new NotFoundException('Firmware not found');
    }

    return toManifest(release);
  }

  private async findLatest(
    model: string,
  ): Promise<FirmwareRelease | undefined> {
    const [release] = await this.database.db
      .select()
      .from(firmwares)
      .where(eq(firmwares.model, model))
      .orderBy(desc(firmwares.version))
      .limit(1);

    return release;
  }

  private async findByModelVersion(
    model: string,
    version: number,
  ): Promise<FirmwareRelease | undefined> {
    const [release] = await this.database.db
      .select()
      .from(firmwares)
      .where(and(eq(firmwares.model, model), eq(firmwares.version, version)))
      .limit(1);

    return release;
  }
}

function toManifest(release: FirmwareRelease): FirmwareManifest {
  return {
    version: release.version,
    url: release.url,
    path: FIRMWARE_PUBLIC_PATH,
    size: release.sizeBytes,
    sha256: release.sha256,
    model: release.model,
  };
}
