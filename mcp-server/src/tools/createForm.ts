import apiClient from '../utils/apiClient';

interface CreateFormArgs {
  name: string;
  description?: string;
  fields: Array<{ name: string; type: string; label: string; required?: boolean; options?: string[]; placeholder?: string }>;
}

export async function createForm(args: CreateFormArgs) {
  const { data } = await apiClient.post('/forms', args);
  return {
    content: [{
      type: 'text',
      text: `✓ Form "${data.name}" created!\n\n- ID: ${data.id}\n- Slug: ${data.slug}\n- URL: http://localhost:3000/forms/${data.slug}\n- Fields: ${data.schema.components.length}\n\nForm is live and ready.`
    }]
  };
}
