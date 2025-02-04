import { Storage } from "@google-cloud/storage";
import type { StorageOptions } from "@google-cloud/storage";

import type { BlobStorageConfig } from "../BlobStorage";
import { BlobStorage } from "../BlobStorage";
import type { Environment } from "../env";

export interface GoogleStorageConfig extends BlobStorageConfig {
  serviceKey?: string;
  projectId?: string;
  bucketName: string;
  apiEndpoint?: string;
}

export type GoogleCredentials = {
  client_email: string;
  private_key: string;
};

export class GoogleStorage extends BlobStorage {
  _storageClient: Storage;
  _bucketName: string;

  constructor({
    bucketName,
    projectId,
    serviceKey,
    apiEndpoint,
  }: GoogleStorageConfig) {
    super();

    const storageOptions: StorageOptions = {};

    if (serviceKey) {
      storageOptions.credentials = JSON.parse(
        Buffer.from(serviceKey, "base64").toString()
      ) as GoogleCredentials;
    }

    if (apiEndpoint) {
      storageOptions.apiEndpoint = apiEndpoint;
    }

    this._bucketName = bucketName;

    storageOptions.projectId = projectId;

    this._storageClient = new Storage(storageOptions);
  }

  async healthCheck(): Promise<void> {
    const [buckets] = await this._storageClient.getBuckets();

    if (!buckets.find((b) => b.name === this._bucketName)) {
      throw new Error(`Bucket ${this._bucketName} does not exist`);
    }
  }

  async getBlob(uri: string): Promise<string> {
    return (
      await this._storageClient.bucket(this._bucketName).file(uri).download()
    ).toString();
  }

  async storeBlob(
    chainId: number,
    versionedHash: string,
    data: string
  ): Promise<string> {
    const fileName = this.buildBlobFileName(chainId, versionedHash);

    await this._storageClient
      .bucket(this._bucketName)
      .file(fileName)
      .save(data);

    return fileName;
  }

  async setUpBucket() {
    if (this._storageClient.bucket(this._bucketName)) {
      return;
    }

    return this._storageClient.createBucket(this._bucketName);
  }

  static tryGetConfigFromEnv(
    env: Partial<Environment>
  ): GoogleStorageConfig | undefined {
    if (!env.GOOGLE_STORAGE_ENABLED) {
      return;
    }

    if (
      !env.GOOGLE_STORAGE_BUCKET_NAME ||
      (!env.GOOGLE_SERVICE_KEY && !env.GOOGLE_STORAGE_API_ENDPOINT)
    ) {
      console.warn(
        "Google storage enabled but no bucket name, api endpoint or service key provided."
      );
      return;
    }

    return {
      bucketName: env.GOOGLE_STORAGE_BUCKET_NAME,
      projectId: env.GOOGLE_STORAGE_PROJECT_ID,
      serviceKey: env.GOOGLE_SERVICE_KEY,
      apiEndpoint: env.GOOGLE_STORAGE_API_ENDPOINT,
    };
  }
}
