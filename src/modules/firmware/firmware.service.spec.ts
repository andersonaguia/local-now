import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '../../core/database/database.service';
import { ESP32_IMAGE_MAGIC } from './firmware.constants';
import { FirmwareService } from './firmware.service';
import { GithubReleasesService } from './github-releases.service';

describe('FirmwareService', () => {
  const chain = {
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    limit: jest.fn(),
    values: jest.fn().mockReturnThis(),
    returning: jest.fn(),
  };
  const db = {
    select: jest.fn(() => chain),
    insert: jest.fn(() => chain),
  };
  const githubReleases = { publishAsset: jest.fn() };
  let service: FirmwareService;

  const file = {
    buffer: Buffer.from([ESP32_IMAGE_MAGIC, 0x01, 0x02]),
    size: 3,
    originalname: 'firmware.bin',
  };
  const release = {
    id: 'fw-1',
    model: 'car-display',
    version: 2,
    sha256: 'abc',
    sizeBytes: 3,
    url: 'https://github.com/example/firmware.bin',
    createdBy: 'user-1',
    createdAt: new Date('2026-08-22T20:00:00.000Z'),
  };

  beforeEach(() => {
    chain.from.mockReturnThis();
    chain.where.mockReturnThis();
    chain.orderBy.mockReturnThis();
    chain.values.mockReturnThis();
    chain.limit.mockReset();
    chain.returning.mockReset();
    db.select.mockClear();
    db.insert.mockClear();
    githubReleases.publishAsset.mockReset();
    githubReleases.publishAsset.mockResolvedValue({ url: release.url });
    service = new FirmwareService(
      { db } as unknown as DatabaseService,
      githubReleases as unknown as GithubReleasesService,
    );
  });

  it('should be able to publish a new firmware version', async () => {
    chain.limit.mockResolvedValueOnce([]).mockResolvedValueOnce([release]);
    chain.returning.mockResolvedValue([release]);

    await expect(
      service.publish({
        version: 2,
        file,
        createdBy: 'user-1',
      }),
    ).resolves.toEqual({
      version: 2,
      url: release.url,
      path: '/firmware.bin',
      size: 3,
      sha256: 'abc',
      model: 'car-display',
    });
    expect(githubReleases.publishAsset).toHaveBeenCalledWith({
      tag: 'car-display-2',
      name: 'car-display 2',
      buffer: file.buffer,
    });
  });

  it('should not be able to publish without a file', async () => {
    await expect(
      service.publish({ version: 2, createdBy: 'user-1' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('should not be able to publish a file that is not an ESP32 image', async () => {
    await expect(
      service.publish({
        version: 2,
        createdBy: 'user-1',
        file: { ...file, buffer: Buffer.from([0x00, 0x01]) },
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('should not be able to publish a version that already exists', async () => {
    chain.limit.mockResolvedValue([release]);

    await expect(
      service.publish({ version: 2, file, createdBy: 'user-1' }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(githubReleases.publishAsset).not.toHaveBeenCalled();
  });

  it('should be able to return the latest firmware manifest', async () => {
    chain.limit.mockResolvedValue([release]);

    await expect(service.getLatestManifest()).resolves.toEqual({
      version: 2,
      url: release.url,
      path: '/firmware.bin',
      size: 3,
      sha256: 'abc',
      model: 'car-display',
    });
  });

  it('should not be able to return a manifest when no firmware exists', async () => {
    chain.limit.mockResolvedValue([]);

    await expect(service.getLatestManifest()).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
