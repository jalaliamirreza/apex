import apiClient from '../utils/apiClient';

export async function listForms() {
  const { data } = await apiClient.get('/forms');
  if (data.forms.length === 0) return { content: [{ type: 'text', text: 'No forms yet. Use create_form to create one.' }] };
  const list = data.forms.map((f: any) => `- ${f.name} (/${f.slug}) - ${f.status}`).join('\n');
  return { content: [{ type: 'text', text: `Found ${data.forms.length} form(s):\n\n${list}` }] };
}
