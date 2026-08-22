import { ESP32_IMAGE_MAGIC } from './firmware.constants';
import {
  firmwareTag,
  isEsp32Image,
  isFirmwareSizeAllowed,
  parseGithubRepo,
  sha256Hex,
} from './firmware.utils';

describe('firmware.utils', () => {
  it('should be able to hash a buffer', () => {
    expect(sha256Hex(Buffer.from('abc'))).toBe(
      'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
    );
  });

  it('should be able to accept an ESP32 image magic byte', () => {
    expect(isEsp32Image(Buffer.from([ESP32_IMAGE_MAGIC, 0x00]))).toBe(true);
  });

  it('should not be able to accept a file without the ESP32 magic', () => {
    expect(isEsp32Image(Buffer.from([0x00, 0x01]))).toBe(false);
    expect(isEsp32Image(Buffer.alloc(0))).toBe(false);
  });

  it('should be able to accept a firmware that fits the OTA slot', () => {
    expect(isFirmwareSizeAllowed(1024)).toBe(true);
  });

  it('should not be able to accept an empty or oversized firmware', () => {
    expect(isFirmwareSizeAllowed(0)).toBe(false);
    expect(isFirmwareSizeAllowed(1984 * 1024 + 1)).toBe(false);
  });

  it('should be able to build a release tag', () => {
    expect(firmwareTag('car-display', 2)).toBe('car-display-2');
  });

  it('should be able to parse owner/repo', () => {
    expect(parseGithubRepo('andersonaguia/platformIO-releases')).toEqual({
      owner: 'andersonaguia',
      repo: 'platformIO-releases',
    });
  });

  it('should not be able to parse an invalid repo slug', () => {
    expect(() => parseGithubRepo('platformIO-releases')).toThrow(
      'GITHUB_FW_REPO must be in the form owner/repo',
    );
  });
});
