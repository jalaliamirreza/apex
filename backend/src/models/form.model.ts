export interface FormField {
  name: string;
  type: string;
  label: string;
  required?: boolean;
  options?: string[];
  placeholder?: string;
}

export interface FormSchema { components: FormioComponent[]; }

export interface FormioComponent {
  type: string;
  key: string;
  label: string;
  input?: boolean;
  validate?: { required?: boolean };
  data?: { values?: { label: string; value: string }[] };
  placeholder?: string;
}

export interface Form {
  id: string;
  slug: string;
  name: string;
  description?: string;
  schema: FormSchema;
  status: 'active' | 'archived';
  direction: 'ltr' | 'rtl';
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateFormInput {
  name: string;
  description?: string;
  fields: FormField[];
}

export function fieldToFormioComponent(field: FormField): FormioComponent {
  const typeMap: Record<string, string> = {
    text: 'textfield', textarea: 'textarea', number: 'number', email: 'email',
    date: 'datetime', select: 'select', checkbox: 'checkbox', file: 'file', signature: 'signature'
  };

  const component: FormioComponent = { type: typeMap[field.type] || 'textfield', key: field.name, label: field.label, input: true };
  if (field.required) component.validate = { required: true };
  if (field.placeholder) component.placeholder = field.placeholder;
  if (field.options?.length) {
    component.data = { values: field.options.map(opt => ({ label: opt, value: opt.toLowerCase().replace(/\s+/g, '_') })) };
  }
  return component;
}
