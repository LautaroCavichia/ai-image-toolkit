import React, { useEffect } from 'react';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import BackgroundRemovalPage from './pages/BackgroundRemovalPage';
import UpscalePage from './pages/UpscalePage';
import EnlargePage from './pages/EnlargePage';
import ObjectRemovalPage from './pages/ObjectRemovalPage';
import StyleTransferPage from './pages/StyleTransferPage';
import { isAuthenticated, setupAxiosInterceptors } from './services/authService';

function App() {
  useEffect(() => {
    setupAxiosInterceptors();
  }, []);

  const currentPath = window.location.pathname;

  if (currentPath === '/login' || !isAuthenticated()) {
    return <LoginPage />;
  }

  // Service pages routing
  
  if (currentPath === '/background-removal') {
    return <BackgroundRemovalPage />;
  }
  
  if (currentPath === '/upscale') {
    return <UpscalePage />;
  }
  
  if (currentPath === '/enlarge') {
    return <EnlargePage />;
  }
  
  if (currentPath === '/object-removal') {
    return <ObjectRemovalPage />;
  }
  
  if (currentPath === '/style-transfer') {
    return <StyleTransferPage />;
  }

  return <HomePage />;
}

export default App;