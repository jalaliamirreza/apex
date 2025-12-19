import { useState } from 'react';

export default function SearchBar({ onSearch, isLoading }: { onSearch: (q: string) => void; isLoading?: boolean }) {
  const [query, setQuery] = useState('');
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); if (query.trim()) onSearch(query.trim()); };
  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search submissions..."
        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
      <button type="submit" disabled={isLoading} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
        {isLoading ? 'Searching...' : 'Search'}
      </button>
    </form>
  );
}
