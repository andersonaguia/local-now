import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FirmwareController } from './firmware.controller';
import { FirmwareService } from './firmware.service';

describe('FirmwareController', () => {
  const firmwareService = {
    publish: jest.fn(),
    getLatestManifest: jest.fn(),
    remove: jest.fn(),
    removeAll: jest.fn(),
  };
  let controller: FirmwareController;

  const manifest = {
    version: 2,
    url: 'https://github.com/example/firmware.bin',
    path: '/firmware.bin',
    size: 1024,
    sha256: 'abc',
    model: 'car-display',
  };

  beforeEach(async () => {
    firmwareService.publish.mockReset();
    firmwareService.getLatestManifest.mockReset();
    firmwareService.remove.mockReset();
    firmwareService.removeAll.mockReset();
    firmwareService.publish.mockResolvedValue(manifest);
    firmwareService.getLatestManifest.mockResolvedValue(manifest);
    firmwareService.remove.mockResolvedValue(undefined);
    firmwareService.removeAll.mockResolvedValue(undefined);

    const module = await Test.createTestingModule({
      controllers: [FirmwareController],
      providers: [{ provide: FirmwareService, useValue: firmwareService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get(FirmwareController);
  });

  it('should be able to publish firmware for an authenticated user', async () => {
    const file = {
      buffer: Buffer.from([0xe9]),
      size: 1,
      originalname: 'firmware.bin',
    };

    await expect(
      controller.publish(
        file,
        { version: 2 },
        { user: { id: 'user-1', email: 'a@b.c' } },
      ),
    ).resolves.toEqual(
      expect.objectContaining({ version: 2, path: '/firmware.bin' }),
    );
    expect(firmwareService.publish).toHaveBeenCalledWith({
      version: 2,
      model: undefined,
      file,
      createdBy: 'user-1',
    });
  });

  it('should be able to return the latest firmware manifest', async () => {
    await expect(controller.getManifest()).resolves.toEqual(
      expect.objectContaining({ version: 2, url: manifest.url }),
    );
  });

  it('should be able to redirect download to the GitHub asset', async () => {
    await expect(controller.download()).resolves.toEqual({
      url: manifest.url,
      statusCode: 302,
    });
  });

  it('should not be able to download when no firmware exists', async () => {
    firmwareService.getLatestManifest.mockRejectedValue(
      new NotFoundException(),
    );

    await expect(controller.download()).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('should be able to delete all firmware releases', async () => {
    await expect(controller.remove()).resolves.toBeUndefined();
    expect(firmwareService.removeAll).toHaveBeenCalled();
  });

  it('should be able to delete a single firmware version', async () => {
    await expect(
      controller.remove('2', 'car-display'),
    ).resolves.toBeUndefined();
    expect(firmwareService.remove).toHaveBeenCalledWith(2, 'car-display');
  });

  it('should not be able to delete a firmware with an invalid version', async () => {
    await expect(controller.remove('abc')).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('should not be able to publish without a token', async () => {
    firmwareService.publish.mockRejectedValue(new UnauthorizedException());

    await expect(
      controller.publish(
        { buffer: Buffer.from([0xe9]), size: 1, originalname: 'firmware.bin' },
        { version: 2 },
        { user: { id: 'user-1', email: 'a@b.c' } },
      ),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
