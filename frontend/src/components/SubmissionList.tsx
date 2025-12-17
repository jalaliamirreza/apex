import { Submission } from '../types';

export default function SubmissionList({ submissions }: { submissions: Submission[] }) {
  if (submissions.length === 0) return <div className="text-center py-8 text-gray-500">No submissions yet.</div>;
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white rounded-lg shadow">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Submitted</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {submissions.map((s) => (
            <tr key={s.id}>
              <td className="px-6 py-4 text-sm text-gray-500">{s.id.substring(0, 8)}...</td>
              <td className="px-6 py-4 text-sm"><pre className="text-xs">{JSON.stringify(s.data, null, 2)}</pre></td>
              <td className="px-6 py-4 text-sm text-gray-500">{new Date(s.submittedAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
