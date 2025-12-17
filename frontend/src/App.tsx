import { Routes, Route } from 'react-router-dom';
import { ShellBar, Avatar, ShellBarItem } from '@ui5/webcomponents-react';
import "@ui5/webcomponents-icons/dist/home.js";
import "@ui5/webcomponents-icons/dist/search.js";
import "@ui5/webcomponents-icons/dist/question-mark.js";
import "@ui5/webcomponents-icons/dist/bell.js";
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
        profile={<Avatar initials="BD" colorScheme="Accent6" />}
        onLogoClick={() => window.location.href = '/'}
      >
        <ShellBarItem icon="question-mark" text="Help" />
        <ShellBarItem icon="bell" text="Notifications" />
      </ShellBar>
      <main style={{ flex: 1, backgroundColor: '#f7f7f7', overflow: 'auto' }}>
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
