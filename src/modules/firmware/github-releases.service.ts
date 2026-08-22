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
  tag_name?: string;
  upload_url: string;
};

type GithubReleaseRef = {
  id: number;
  tag_name: string;
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
      await this.deleteRelease(release.id, input.tag).catch(() => undefined);
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

  async deleteByTag(tag: string): Promise<void> {
    const release = await this.findReleaseByTag(tag);
    if (release) {
      await this.deleteRelease(release.id, release.tag_name);
      return;
    }

    await this.deleteTag(tag);
  }

  async deleteAllReleases(): Promise<void> {
    for (;;) {
      const releases = await this.listReleases();
      if (releases.length === 0) {
        return;
      }

      for (const release of releases) {
        await this.deleteRelease(release.id, release.tag_name);
      }
    }
  }

  private async findReleaseByTag(
    tag: string,
  ): Promise<GithubReleaseRef | undefined> {
    const body = await this.githubJson<GithubReleaseRef | undefined>(
      `/repos/${this.repoPath()}/releases/tags/${encodeURIComponent(tag)}`,
      { method: 'GET' },
      { allowNotFound: true },
    );

    if (!body) {
      return undefined;
    }
    if (typeof body.id !== 'number' || typeof body.tag_name !== 'string') {
      throw new BadGatewayException('GitHub release response is invalid');
    }

    return { id: body.id, tag_name: body.tag_name };
  }

  private async listReleases(): Promise<GithubReleaseRef[]> {
    const body = await this.githubJson<unknown>(
      `/repos/${this.repoPath()}/releases?per_page=100&page=1`,
      { method: 'GET' },
    );

    if (!Array.isArray(body)) {
      throw new BadGatewayException('GitHub release list is invalid');
    }

    return body.map((item) => {
      if (
        typeof item !== 'object' ||
        item === null ||
        typeof (item as GithubReleaseRef).id !== 'number' ||
        typeof (item as GithubReleaseRef).tag_name !== 'string'
      ) {
        throw new BadGatewayException('GitHub release list is invalid');
      }

      const release = item as GithubReleaseRef;
      return { id: release.id, tag_name: release.tag_name };
    });
  }

  private async deleteRelease(releaseId: number, tag?: string): Promise<void> {
    await this.githubJson(
      `/repos/${this.repoPath()}/releases/${releaseId}`,
      { method: 'DELETE' },
      { allowNotFound: true },
    );

    if (tag) {
      await this.deleteTag(tag);
    }
  }

  private async deleteTag(tag: string): Promise<void> {
    await this.githubJson(
      `/repos/${this.repoPath()}/git/refs/tags/${encodeURIComponent(tag)}`,
      { method: 'DELETE' },
      { allowNotFound: true },
    );
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
    options?: { allowNotFound?: boolean },
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
      if (options?.allowNotFound && response.status === 404) {
        return undefined as T;
      }
      if (response.status === 401 || response.status === 403) {
        throw new InternalServerErrorException(
          'GitHub rejected the firmware token',
        );
      }
      if (response.status === 422) {
        throw new BadGatewayException('GitHub release already exists');
      }
      throw new BadGatewayException('GitHub request failed');
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
