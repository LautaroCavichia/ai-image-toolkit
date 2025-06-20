// src/index.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Import fonts
import '@fontsource/space-grotesk/400.css';
import '@fontsource/space-grotesk/500.css';
import '@fontsource/space-grotesk/600.css';
import '@fontsource/space-grotesk/700.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/jetbrains-mono/400.css';

// Import styles
import './styles/theme.css';
import './styles/index.css';
import { setupAxiosInterceptors } from './services/authService';


// Import FontAwesome configuration
import { library } from '@fortawesome/fontawesome-svg-core';
import { 
  faUpload,
  faImage,
  faSpinner,
  faCheckCircle,
  faExclamationTriangle,
  faDownload,
  faSync,
  faEnvelope,
  faLock,
  faUserCheck,
  faSignOutAlt,
  faExpand,
  faArrowsUpDown
} from '@fortawesome/free-solid-svg-icons';

// Add icons to the library to be accessible globally
library.add(
  faUpload,
  faImage,
  faSpinner,
  faCheckCircle,
  faExclamationTriangle,
  faDownload,
  faSync,
  faEnvelope,
  faLock,
  faUserCheck,
  faSignOutAlt,
  faExpand,
  faArrowsUpDown
);


setupAxiosInterceptors();

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
reportWebVitals();
