import { Client } from 'minio';
import { logger } from '../utils/logger';

let minioClient: Client;
const BUCKET_NAME = 'apex-files';

export async function initMinio(): Promise<void> {
  minioClient = new Client({
    endPoint: process.env.MINIO_ENDPOINT || 'localhost',
    port: parseInt(process.env.MINIO_PORT || '9000'),
    useSSL: process.env.MINIO_USE_SSL === 'true',
    accessKey: process.env.MINIO_ACCESS_KEY || 'apex',
    secretKey: process.env.MINIO_SECRET_KEY || 'apex_secret'
  });

  const exists = await minioClient.bucketExists(BUCKET_NAME);
  if (!exists) {
    await minioClient.makeBucket(BUCKET_NAME);
    logger.info(`Created bucket: ${BUCKET_NAME}`);
  }
}

export function getMinioClient(): Client {
  if (!minioClient) throw new Error('MinIO not initialized');
  return minioClient;
}

export { BUCKET_NAME };
