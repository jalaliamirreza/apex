import { Routes, Route, Navigate } from 'react-router-dom';
import LaunchpadPage from './pages/LaunchpadPage';
import FormPage from './pages/FormPage';
import SubmissionsPage from './pages/SubmissionsPage';
import SearchPage from './pages/SearchPage';
import AdminAppPage from './pages/AdminAppPage';
import LoginPage from './pages/LoginPage';
import ManageSpacesPage from './pages/admin/ManageSpacesPage';
import ManagePagesPage from './pages/admin/ManagePagesPage';
import ManageSectionsPage from './pages/admin/ManageSectionsPage';
import ManageTilesPage from './pages/admin/ManageTilesPage';
import ManageFormsPage from './pages/admin/ManageFormsPage';

function App() {
  return (
    <Routes>
      {/* Login */}
      <Route path="/login" element={<LoginPage />} />

      {/* User Portal - Launchpad */}
      <Route path="/" element={<Navigate to="/launchpad" replace />} />
      <Route path="/launchpad" element={<LaunchpadPage />} />
      <Route path="/launchpad/:spaceSlug" element={<LaunchpadPage />} />
      <Route path="/launchpad/:spaceSlug/:pageSlug" element={<LaunchpadPage />} />

      {/* Form Pages */}
      <Route path="/forms/:slug" element={<FormPage />} />
      <Route path="/forms/:slug/submissions" element={<SubmissionsPage />} />

      {/* Search */}
      <Route path="/search" element={<SearchPage />} />

      {/* Admin Management Pages */}
      <Route path="/app/manage-spaces" element={<ManageSpacesPage />} />
      <Route path="/app/manage-pages" element={<ManagePagesPage />} />
      <Route path="/app/manage-sections" element={<ManageSectionsPage />} />
      <Route path="/app/manage-tiles" element={<ManageTilesPage />} />
      <Route path="/app/manage-forms" element={<ManageFormsPage />} />

      {/* Admin Apps (fallback for other apps) */}
      <Route path="/app/:slug" element={<AdminAppPage />} />

      {/* Legacy routes (redirect to launchpad) */}
      <Route path="/forms" element={<Navigate to="/launchpad" replace />} />
    </Routes>
  );
}

export default App;
