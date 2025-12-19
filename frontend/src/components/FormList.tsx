import { Link } from 'react-router-dom';
import { Form } from '../types';

export default function FormList({ forms }: { forms: Form[] }) {
  if (forms.length === 0) return <div className="text-center py-8 text-gray-500">No forms available.</div>;
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {forms.map((form) => (
        <div key={form.id} className="bg-white p-6 rounded-lg shadow hover:shadow-md transition">
          <h3 className="text-lg font-semibold text-gray-900">{form.name}</h3>
          {form.description && <p className="mt-2 text-gray-600 text-sm">{form.description}</p>}
          <div className="mt-4 flex space-x-2">
            <Link to={`/forms/${form.slug}`} className="text-blue-600 hover:text-blue-800 text-sm font-medium">Fill Form →</Link>
            <Link to={`/forms/${form.slug}/submissions`} className="text-gray-600 hover:text-gray-800 text-sm font-medium">Submissions</Link>
          </div>
        </div>
      ))}
    </div>
  );
}
