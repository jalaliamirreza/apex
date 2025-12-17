import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import FormsListPage from './pages/FormsListPage';
import FormPage from './pages/FormPage';
import SubmissionsPage from './pages/SubmissionsPage';
import SearchPage from './pages/SearchPage';

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/forms" element={<FormsListPage />} />
          <Route path="/forms/:slug" element={<FormPage />} />
          <Route path="/forms/:slug/submissions" element={<SubmissionsPage />} />
          <Route path="/search" element={<SearchPage />} />
        </Routes>
      </main>
    </div>
  );
}
export default App;
