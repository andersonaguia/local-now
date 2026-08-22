import { BadGatewayException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GithubReleasesService } from './github-releases.service';

describe('GithubReleasesService', () => {
  const config = {
    getOrThrow: jest.fn((key: string) => {
      if (key === 'GITHUB_TOKEN') {
        return 'test-token';
      }
      return 'andersonaguia/platformIO-releases';
    }),
  };
  let service: GithubReleasesService;
  let fetchMock: jest.Mock;

  beforeEach(() => {
    fetchMock = jest.fn();
    global.fetch = fetchMock;
    config.getOrThrow.mockClear();
    service = new GithubReleasesService(config as unknown as ConfigService);
  });

  it('should be able to create a release and upload the asset', async () => {
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: () =>
          Promise.resolve({
            id: 10,
            upload_url:
              'https://uploads.github.com/repos/a/b/releases/10/assets{?name,label}',
          }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: () =>
          Promise.resolve({
            browser_download_url:
              'https://github.com/a/b/releases/download/t/firmware.bin',
          }),
      });

    await expect(
      service.publishAsset({
        tag: 'car-display-2',
        name: 'car-display 2',
        buffer: Buffer.from([0xe9]),
      }),
    ).resolves.toEqual({
      url: 'https://github.com/a/b/releases/download/t/firmware.bin',
    });
  });

  it('should not be able to keep a release when the asset upload fails', async () => {
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: () =>
          Promise.resolve({
            id: 10,
            upload_url:
              'https://uploads.github.com/repos/a/b/releases/10/assets{?name,label}',
          }),
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.resolve({}),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 204,
        json: () => Promise.resolve(undefined),
      });

    await expect(
      service.publishAsset({
        tag: 'car-display-2',
        name: 'car-display 2',
        buffer: Buffer.from([0xe9]),
      }),
    ).rejects.toBeInstanceOf(BadGatewayException);
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });
});
