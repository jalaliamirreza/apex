import { getOpenSearchClient, SUBMISSIONS_INDEX } from '../config/opensearch';
import { logger } from '../utils/logger';

export interface SearchResult {
  submissionId: string;
  formSlug: string;
  formName: string;
  data: Record<string, any>;
  submittedAt: string;
  highlights: string[];
  score: number;
}

export interface SearchOptions {
  query: string;
  formSlug?: string;
  limit?: number;
  offset?: number;
}

export async function searchSubmissions(options: SearchOptions): Promise<{ results: SearchResult[]; total: number }> {
  const client = getOpenSearchClient();
  const must: any[] = [{ multi_match: { query: options.query, fields: ['dataText^2', 'formName', 'data.*'], fuzziness: 'AUTO' } }];
  if (options.formSlug) must.push({ term: { formSlug: options.formSlug } });

  try {
    const response = await client.search({
      index: SUBMISSIONS_INDEX,
      body: {
        query: { bool: { must } },
        highlight: { fields: { dataText: {}, 'data.*': {} } },
        from: options.offset || 0,
        size: options.limit || 20,
        sort: [{ _score: 'desc' }, { submittedAt: 'desc' }]
      }
    });

    const hits = response.body.hits.hits;
    const total = response.body.hits.total.value;
    const results: SearchResult[] = hits.map((hit: any) => ({
      submissionId: hit._id,
      formSlug: hit._source.formSlug,
      formName: hit._source.formName,
      data: hit._source.data,
      submittedAt: hit._source.submittedAt,
      highlights: hit.highlight ? Object.values(hit.highlight).flat() : [],
      score: hit._score
    }));
    return { results, total };
  } catch (error) {
    logger.error('Search error:', error);
    return { results: [], total: 0 };
  }
}
