/**
 * Convert schemas to SurveyJS format
 */

interface InternalField {
  name: string;
  type: 'text' | 'textarea' | 'number' | 'email' | 'date' | 'select' | 'checkbox' | 'file';
  label: string;
  required?: boolean;
  options?: string[];
  placeholder?: string;
  validation?: {
    pattern?: string;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
  };
}

interface InternalSchema {
  components: InternalField[];
}

interface SurveyJSQuestion {
  type: string;
  name: string;
  title: string;
  isRequired?: boolean;
  placeholder?: string;
  inputType?: string;
  choices?: string[];
  validators?: any[];
  rows?: number;
}

interface SurveyJSSchema {
  title?: string;
  description?: string;
  logoPosition?: string;
  pages: {
    name: string;
    elements: SurveyJSQuestion[];
  }[];
  showQuestionNumbers?: boolean;
  questionErrorLocation?: string;
  completeText?: string;
}

const typeMapping: Record<string, { type: string; inputType?: string }> = {
  text: { type: 'text' },
  textarea: { type: 'comment' },
  number: { type: 'text', inputType: 'number' },
  email: { type: 'text', inputType: 'email' },
  date: { type: 'text', inputType: 'date' },
  select: { type: 'dropdown' },
  checkbox: { type: 'boolean' },
  file: { type: 'file' },
};

export function convertToSurveyJS(
  schema: InternalSchema,
  formTitle?: string,
  formDescription?: string
): SurveyJSSchema {
  const elements: SurveyJSQuestion[] = schema.components.map((field) => {
    const mapping = typeMapping[field.type] || { type: 'text' };

    const question: SurveyJSQuestion = {
      type: mapping.type,
      name: field.name,
      title: field.label,
      isRequired: field.required,
      placeholder: field.placeholder,
    };

    if (mapping.inputType) {
      question.inputType = mapping.inputType;
    }

    if (field.type === 'select' && field.options) {
      question.choices = field.options;
    }

    if (field.type === 'textarea') {
      question.rows = 4;
    }

    // Add validators if validation rules exist
    if (field.validation) {
      question.validators = [];

      if (field.validation.pattern) {
        question.validators.push({
          type: 'regex',
          regex: field.validation.pattern,
          text: 'فرمت وارد شده صحیح نیست',
        });
      }

      if (field.validation.minLength) {
        question.validators.push({
          type: 'text',
          minLength: field.validation.minLength,
          text: `حداقل ${field.validation.minLength} کاراکتر`,
        });
      }
    }

    return question;
  });

  return {
    title: formTitle,
    description: formDescription,
    logoPosition: 'right',
    pages: [
      {
        name: 'page1',
        elements,
      },
    ],
    showQuestionNumbers: false,
    questionErrorLocation: 'bottom',
    completeText: 'ثبت',
  };
}

/**
 * Convert Formio schema (existing forms) to SurveyJS
 */
export function convertFormioToSurveyJS(formioSchema: any): SurveyJSSchema {
  const formioTypeMap: Record<string, string> = {
    textfield: 'text',
    textarea: 'textarea',
    number: 'number',
    email: 'email',
    datetime: 'date',
    day: 'date',
    select: 'select',
    checkbox: 'checkbox',
    file: 'file',
  };

  const components: InternalField[] = (formioSchema.components || [])
    .filter((c: any) => c.type !== 'button')
    .map((c: any) => ({
      name: c.key,
      type: formioTypeMap[c.type] || 'text',
      label: c.label || c.key,
      required: c.validate?.required || false,
      options: c.data?.values?.map((v: any) => v.label),
      placeholder: c.placeholder,
    }));

  return convertToSurveyJS({ components });
}
