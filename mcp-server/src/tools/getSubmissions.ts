import apiClient from '../utils/apiClient';

export async function getSubmissions(args: { formSlug: string; limit?: number; offset?: number }) {
  const { data } = await apiClient.get(`/forms/${args.formSlug}/submissions`, { params: { limit: args.limit || 50, offset: args.offset || 0 } });
  if (data.submissions.length === 0) return { content: [{ type: 'text', text: `No submissions for "${args.formSlug}".` }] };
  const list = data.submissions.map((s: any) => `ID: ${s.id.substring(0, 8)}...\nSubmitted: ${new Date(s.submittedAt).toLocaleString()}\nData:\n${JSON.stringify(s.data, null, 2)}`).join('\n\n---\n\n');
  return { content: [{ type: 'text', text: `Found ${data.total} submission(s):\n\n${list}` }] };
}
