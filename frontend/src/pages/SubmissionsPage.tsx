import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import SubmissionList from '../components/SubmissionList';
import { getForm, getSubmissions } from '../services/api';
import { Form, Submission } from '../types';

export default function SubmissionsPage() {
  const { slug } = useParams<{ slug: string }>();
  const [form, setForm] = useState<Form | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      Promise.all([getForm(slug), getSubmissions(slug)])
        .then(([f, s]) => { setForm(f); setSubmissions(s.submissions); })
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }
  }, [slug]);

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (error) return <div className="text-center py-8 text-red-600">Error: {error}</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{form?.name} - Submissions</h1>
          <p className="text-gray-500">{submissions.length} submission(s)</p>
        </div>
        <Link to={`/forms/${slug}`} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">New Submission</Link>
      </div>
      <SubmissionList submissions={submissions} />
    </div>
  );
}
