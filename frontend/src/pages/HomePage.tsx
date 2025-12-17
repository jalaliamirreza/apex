import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <div className="max-w-4xl mx-auto text-center py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to APEX</h1>
      <p className="text-xl text-gray-600 mb-8">AI-Powered Process Execution Platform</p>
      <p className="text-gray-500 mb-8">Describe your forms in natural language. Claude will create them.</p>
      <div className="flex justify-center gap-4">
        <Link to="/forms" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">View Forms</Link>
        <Link to="/search" className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">Search</Link>
      </div>
    </div>
  );
}
