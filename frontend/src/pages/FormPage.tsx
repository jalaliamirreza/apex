import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import FormRenderer from '../components/FormRenderer';
import { getForm, submitForm } from '../services/api';
import { Form } from '../types';

export default function FormPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [form, setForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (slug) getForm(slug).then(setForm).catch((err) => setError(err.message)).finally(() => setLoading(false));
  }, [slug]);

  const handleSubmit = async (submission: { data: Record<string, any> }) => {
    if (!slug) return;
    setSubmitting(true);
    setError(null);
    try {
      await submitForm(slug, submission.data);
      setSuccess(true);
      setTimeout(() => navigate(`/forms/${slug}/submissions`), 2000);
    } catch (err: any) { setError(err.message); }
    finally { setSubmitting(false); }
  };

  if (loading) return <div className="text-center py-8">Loading form...</div>;
  if (error && !form) return <div className="text-center py-8 text-red-600">Error: {error}</div>;
  if (!form) return <div className="text-center py-8">Form not found</div>;
  if (success) return (
    <div className="text-center py-8">
      <div className="text-green-600 text-xl mb-4">✓ Form submitted!</div>
      <p className="text-gray-500">Redirecting...</p>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">{form.name}</h1>
      {form.description && <p className="text-gray-600 mb-6">{form.description}</p>}
      {error && <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg">{error}</div>}
      <FormRenderer schema={form.schema} onSubmit={handleSubmit} />
      {submitting && <div className="mt-4 text-center text-gray-500">Submitting...</div>}
    </div>
  );
}
