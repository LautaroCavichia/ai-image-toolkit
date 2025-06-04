// src/index.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import reportWebVitals from './reportWebVitals';
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
