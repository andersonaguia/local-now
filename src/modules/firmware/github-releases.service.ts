import {
  BadGatewayException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FIRMWARE_ASSET_NAME } from './firmware.constants';
import { parseGithubRepo } from './firmware.utils';

type GithubRelease = {
  id: number;
  upload_url: string;
};

type GithubAsset = {
  browser_download_url: string;
};

@Injectable()
export class GithubReleasesService {
  constructor(private readonly config: ConfigService) {}

  async publishAsset(input: {
    tag: string;
    name: string;
    buffer: Buffer;
  }): Promise<{ url: string }> {
    const release = await this.createRelease(input.tag, input.name);
    try {
      const url = await this.uploadAsset(release, input.buffer);
      return { url };
    } catch (error) {
      await this.deleteRelease(release.id);
      throw error;
    }
  }

  private async createRelease(
    tag: string,
    name: string,
  ): Promise<GithubRelease> {
    const body = await this.githubJson<GithubRelease>(
      `/repos/${this.repoPath()}/releases`,
      {
        method: 'POST',
        body: JSON.stringify({
          tag_name: tag,
          name,
          body: `Firmware ${name}`,
        }),
      },
    );

    if (!isGithubRelease(body)) {
      throw new BadGatewayException('GitHub release response is invalid');
    }

    return body;
  }

  private async uploadAsset(
    release: GithubRelease,
    buffer: Buffer,
  ): Promise<string> {
    const uploadUrl = release.upload_url.replace(/\{.*\}$/, '');
    const url = `${uploadUrl}?name=${encodeURIComponent(FIRMWARE_ASSET_NAME)}`;
    const body = await this.githubJson<GithubAsset>(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/octet-stream',
      },
      body: new Uint8Array(buffer),
    });

    if (!body.browser_download_url) {
      throw new BadGatewayException('GitHub asset response is invalid');
    }

    return body.browser_download_url;
  }

  private async deleteRelease(releaseId: number): Promise<void> {
    try {
      await this.githubJson(`/repos/${this.repoPath()}/releases/${releaseId}`, {
        method: 'DELETE',
      });
    } catch {
      // Best-effort rollback if the asset upload failed after the release existed.
    }
  }

  private repoPath(): string {
    const { owner, repo } = parseGithubRepo(
      this.config.getOrThrow<string>('GITHUB_FW_REPO'),
    );
    return `${owner}/${repo}`;
  }

  private async githubJson<T>(
    pathOrUrl: string,
    init: RequestInit,
  ): Promise<T> {
    const token = this.config.getOrThrow<string>('GITHUB_TOKEN');
    const url = pathOrUrl.startsWith('https://')
      ? pathOrUrl
      : `https://api.github.com${pathOrUrl}`;

    let response: Response;
    try {
      response = await fetch(url, {
        ...init,
        headers: {
          Accept: 'application/vnd.github+json',
          Authorization: `Bearer ${token}`,
          'X-GitHub-Api-Version': '2022-11-28',
          'User-Agent': 'time-server',
          ...init.headers,
        },
      });
    } catch {
      throw new BadGatewayException('Unable to reach GitHub');
    }

    if (response.status === 204) {
      return undefined as T;
    }

    const payload: unknown = await response.json().catch(() => undefined);

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new InternalServerErrorException(
          'GitHub rejected the firmware token',
        );
      }
      if (response.status === 422) {
        throw new BadGatewayException('GitHub release already exists');
      }
      throw new BadGatewayException('GitHub release upload failed');
    }

    return payload as T;
  }
}

function isGithubRelease(value: unknown): value is GithubRelease {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const release = value as Record<string, unknown>;
  return (
    typeof release.id === 'number' && typeof release.upload_url === 'string'
  );
}
