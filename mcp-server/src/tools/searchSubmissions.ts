import apiClient from '../utils/apiClient';

export async function searchSubmissions(args: { query: string; formSlug?: string; limit?: number }) {
  const { data } = await apiClient.post('/search', { query: args.query, formSlug: args.formSlug, limit: args.limit || 20 });
  if (data.results.length === 0) return { content: [{ type: 'text', text: `No results for "${args.query}".` }] };
  const list = data.results.map((r: any) => `Form: ${r.formName}\nSubmitted: ${new Date(r.submittedAt).toLocaleString()}\nData:\n${JSON.stringify(r.data, null, 2)}`).join('\n\n---\n\n');
  return { content: [{ type: 'text', text: `Found ${data.total} result(s):\n\n${list}` }] };
}
