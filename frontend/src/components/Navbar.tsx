import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="bg-white shadow">
      <div className="container mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-blue-600">APEX</Link>
            <div className="ml-10 flex space-x-4">
              <Link to="/forms" className="text-gray-700 hover:text-blue-600 px-3 py-2">Forms</Link>
              <Link to="/search" className="text-gray-700 hover:text-blue-600 px-3 py-2">Search</Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
