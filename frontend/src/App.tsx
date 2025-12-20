import { Routes, Route, Navigate } from 'react-router-dom';
import LaunchpadPage from './pages/LaunchpadPage';
import FormPage from './pages/FormPage';
import SubmissionsPage from './pages/SubmissionsPage';
import SearchPage from './pages/SearchPage';
import LoginPage from './pages/LoginPage';

function App() {
  return (
    <Routes>
      {/* Login */}
      <Route path="/login" element={<LoginPage />} />

      {/* User Portal - Launchpad */}
      <Route path="/" element={<Navigate to="/launchpad" replace />} />
      <Route path="/launchpad" element={<LaunchpadPage />} />
      <Route path="/launchpad/:spaceId" element={<LaunchpadPage />} />
      <Route path="/launchpad/:spaceId/:pageId" element={<LaunchpadPage />} />

      {/* Form Pages */}
      <Route path="/forms/:slug" element={<FormPage />} />
      <Route path="/forms/:slug/submissions" element={<SubmissionsPage />} />

      {/* Search */}
      <Route path="/search" element={<SearchPage />} />

      {/* Legacy routes (redirect to launchpad) */}
      <Route path="/forms" element={<Navigate to="/launchpad" replace />} />

      {/* Admin Portal (future) */}
      {/* <Route path="/admin/*" element={<AdminLayout />} /> */}
    </Routes>
  );
}

export default App;
