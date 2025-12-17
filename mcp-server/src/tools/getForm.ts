import apiClient from '../utils/apiClient';

export async function getForm(args: { slug: string }) {
  const { data } = await apiClient.get(`/forms/${args.slug}`);
  const fields = data.schema.components.map((c: any) => `- ${c.label} (${c.key}): ${c.type}${c.validate?.required ? ' [required]' : ''}`).join('\n');
  return { content: [{ type: 'text', text: `Form: ${data.name}\nDescription: ${data.description || 'None'}\nStatus: ${data.status}\n\nFields:\n${fields}` }] };
}
