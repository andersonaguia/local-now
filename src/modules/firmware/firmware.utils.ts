import { createHash } from 'node:crypto';
import { ESP32_IMAGE_MAGIC, MAX_FIRMWARE_BYTES } from './firmware.constants';
import { GithubRepo } from './firmware.types';

export function sha256Hex(buffer: Buffer): string {
  return createHash('sha256').update(buffer).digest('hex');
}

export function isEsp32Image(buffer: Buffer): boolean {
  return buffer.length > 0 && buffer[0] === ESP32_IMAGE_MAGIC;
}

export function isFirmwareSizeAllowed(size: number): boolean {
  return size > 0 && size <= MAX_FIRMWARE_BYTES;
}

export function firmwareTag(model: string, version: number): string {
  return `${model}-${version}`;
}

export function parseGithubRepo(value: string): GithubRepo {
  const [owner, repo] = value.split('/');
  if (!owner || !repo || value.split('/').length !== 2) {
    throw new Error('GITHUB_FW_REPO must be in the form owner/repo');
  }

  return { owner, repo };
}
