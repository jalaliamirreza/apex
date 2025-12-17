import { useState } from 'react';
import SearchBar from '../components/SearchBar';
import { search } from '../services/api';
import { SearchResult } from '../types';
import { Link } from 'react-router-dom';

export default function SearchPage() {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (query: string) => {
    setLoading(true);
    try {
      const data = await search(query);
      setResults(data.results);
      setTotal(data.total);
      setSearched(true);
    } catch (err) { console.error('Search error:', err); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Search Submissions</h1>
      <SearchBar onSearch={handleSearch} isLoading={loading} />
      {searched && (
        <div className="mt-8">
          <p className="text-gray-500 mb-4">Found {total} result(s)</p>
          {results.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No results found</div>
          ) : (
            <div className="space-y-4">
              {results.map((r) => (
                <div key={r.submissionId} className="bg-white p-6 rounded-lg shadow">
                  <Link to={`/forms/${r.formSlug}/submissions`} className="text-lg font-semibold text-blue-600 hover:text-blue-800">{r.formName}</Link>
                  <p className="text-sm text-gray-500 mt-1">{new Date(r.submittedAt).toLocaleString()}</p>
                  <pre className="mt-4 text-sm bg-gray-50 p-3 rounded overflow-x-auto">{JSON.stringify(r.data, null, 2)}</pre>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
