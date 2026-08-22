export type FirmwareRelease = {
  id: string;
  model: string;
  version: number;
  sha256: string;
  sizeBytes: number;
  url: string;
  createdBy: string;
  createdAt: Date;
};

export type FirmwareManifest = {
  version: number;
  url: string;
  path: string;
  size: number;
  sha256: string;
  model: string;
};

export type FirmwareUploadFile = {
  buffer: Buffer;
  size: number;
  originalname: string;
};

export type GithubRepo = {
  owner: string;
  repo: string;
};
