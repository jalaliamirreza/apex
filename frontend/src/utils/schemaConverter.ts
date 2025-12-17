interface FormioComponent {
  type: string;
  key: string;
  label: string;
  validate?: { required?: boolean };
  data?: { values?: { label: string; value: string }[] };
  placeholder?: string;
}

interface FormioSchema {
  components: FormioComponent[];
}

interface SimpleField {
  name: string;
  type: 'text' | 'textarea' | 'number' | 'email' | 'date' | 'select' | 'checkbox' | 'file';
  label: string;
  required?: boolean;
  options?: string[];
  placeholder?: string;
}

export function convertFormioSchema(formioSchema: FormioSchema): { components: SimpleField[] } {
  const typeMap: Record<string, SimpleField['type']> = {
    textfield: 'text',
    textarea: 'textarea',
    number: 'number',
    email: 'email',
    datetime: 'date',
    day: 'date',
    select: 'select',
    selectboxes: 'select',
    radio: 'select',
    checkbox: 'checkbox',
    file: 'file',
    // Add more mappings as needed
  };

  const components: SimpleField[] = formioSchema.components
    .filter(c => c.type !== 'button') // Skip submit buttons
    .map(c => ({
      name: c.key,
      type: typeMap[c.type] || 'text',
      label: c.label || c.key,
      required: c.validate?.required || false,
      options: c.data?.values?.map(v => v.label),
      placeholder: c.placeholder,
    }));

  return { components };
}
