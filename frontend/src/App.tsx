import { Routes, Route } from 'react-router-dom';
import { ShellBar, Avatar } from '@ui5/webcomponents-react';
import "@ui5/webcomponents-icons/dist/home.js";
import "@ui5/webcomponents-icons/dist/list.js";
import "@ui5/webcomponents-icons/dist/search.js";
import HomePage from './pages/HomePage';
import FormsListPage from './pages/FormsListPage';
import FormPage from './pages/FormPage';
import SubmissionsPage from './pages/SubmissionsPage';
import SearchPage from './pages/SearchPage';

function App() {
  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <ShellBar
        primaryTitle="APEX"
        secondaryTitle="Form Management"
        showSearchField
        profile={<Avatar initials="U" />}
        onLogoClick={() => window.location.href = '/'}
      />
      <main style={{ flex: 1, padding: '1rem', backgroundColor: '#f7f7f7', overflow: 'auto' }}>
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
