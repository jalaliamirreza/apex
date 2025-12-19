import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@ui5/webcomponents-react';
import '@ui5/webcomponents-react/dist/Assets.js';
import App from './App';
import './index.css';

// LTR by default - individual forms control their own direction
document.documentElement.dir = 'ltr';
document.documentElement.lang = 'en';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>
);
