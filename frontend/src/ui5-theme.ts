// UI5 Web Components Theme Configuration
// This sets the font family for all UI5 components including Shadow DOM

import { setTheme } from '@ui5/webcomponents-base/dist/config/Theme.js';

// Set custom CSS variables that UI5 respects
const setCSSVariables = () => {
  const root = document.documentElement;
  
  // Font family - UI5 uses these variables internally
  root.style.setProperty('--sapFontFamily', "'Vazirmatn', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif");
  root.style.setProperty('--sapFontHeaderFamily', "'Vazirmatn', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif");
  root.style.setProperty('--sapFontLightFamily', "'Vazirmatn', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif");
  root.style.setProperty('--sapFontBoldFamily', "'Vazirmatn', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif");
};

export const initUI5Theme = () => {
  setCSSVariables();
};
