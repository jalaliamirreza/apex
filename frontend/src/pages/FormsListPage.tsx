import { useState, useEffect } from 'react';
import FormList from '../components/FormList';
import { getForms } from '../services/api';
import { Form } from '../types';

export default function FormsListPage() {
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getForms().then(setForms).catch((err) => setError(err.message)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-8">Loading forms...</div>;
  if (error) return <div className="text-center py-8 text-red-600">Error: {error}</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Available Forms</h1>
      <FormList forms={forms} />
    </div>
  );
}
