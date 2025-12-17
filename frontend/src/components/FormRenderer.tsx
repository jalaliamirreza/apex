import { Form } from '@formio/react';

interface FormRendererProps {
  schema: { components: any[] };
  onSubmit: (submission: { data: Record<string, any> }) => void;
}

export default function FormRenderer({ schema, onSubmit }: FormRendererProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <Form form={schema} onSubmit={onSubmit} />
    </div>
  );
}
