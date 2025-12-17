import { Client } from '@opensearch-project/opensearch';
import { logger } from '../utils/logger';

let client: Client;
const SUBMISSIONS_INDEX = 'apex-submissions';

export async function initOpenSearch(): Promise<void> {
  client = new Client({ node: process.env.OPENSEARCH_URL || 'http://localhost:9200' });
  await client.cluster.health({});

  const indexExists = await client.indices.exists({ index: SUBMISSIONS_INDEX });
  if (!indexExists.body) {
    await client.indices.create({
      index: SUBMISSIONS_INDEX,
      body: {
        mappings: {
          properties: {
            formId: { type: 'keyword' },
            formSlug: { type: 'keyword' },
            formName: { type: 'text' },
            dataText: { type: 'text' },
            submittedAt: { type: 'date' }
          }
        }
      }
    });
    logger.info(`Created index: ${SUBMISSIONS_INDEX}`);
  }
}

export function getOpenSearchClient(): Client {
  if (!client) throw new Error('OpenSearch not initialized');
  return client;
}

export { SUBMISSIONS_INDEX };
