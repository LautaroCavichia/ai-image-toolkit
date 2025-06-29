import React, { useEffect, useState } from 'react';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import BackgroundRemovalPage from './pages/BackgroundRemovalPage';
import UpscalePage from './pages/UpscalePage';
import EnlargePage from './pages/EnlargePage';
import ObjectRemovalPage from './pages/ObjectRemovalPage';
import StyleTransferPage from './pages/StyleTransferPage';
import ResetPasswordPage from './pages/ResetPassword';
import AuthForm from './pages/AuthForm';
import EmailVerificationPage from './pages/EmailVerificationPage';
import { isAuthenticated, setupAxiosInterceptors, createGuestUser } from './services/authService';

function App() {
  console.log('🎯 App component initializing/re-rendering');
  console.log('🎯 Current path:', window.location.pathname);
  console.log('🎯 Token in localStorage at App start:', localStorage.getItem('token') ? 'EXISTS' : 'MISSING');
  
  const [isInitializing, setIsInitializing] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthenticated_, setIsAuthenticated_] = useState(false);

  useEffect(() => {
    setupAxiosInterceptors();
  }, []);

  useEffect(() => {
    console.log('🔄 App.tsx useEffect triggered - initializing auth...');
    
    const initializeUser = async () => {
      // Check if already authenticated
      if (isAuthenticated()) {
        console.log('✅ User already authenticated, skipping guest creation');
        setIsAuthenticated_(true);
        setIsInitializing(false);
        setAuthChecked(true);
        return;
      }

      // Create guest user if not authenticated
      try {
        console.log('❌ No authentication found, creating guest user...');
        const guestUser = await createGuestUser();
        console.log('✅ Guest user created successfully:', guestUser);
        // Update auth state immediately
        setIsAuthenticated_(true);
        setAuthChecked(true);
      } catch (error) {
        console.error('❌ Failed to create guest user:', error);
        setIsAuthenticated_(false);
        setAuthChecked(true);
      } finally {
        setIsInitializing(false);
      }
    };

    initializeUser();
  }, []);

  const currentPath = window.location.pathname;

  // Show login page only if explicitly requested
  if (currentPath === '/login') {
    return <LoginPage />;
  }

  // Show email verification page
  if (currentPath === '/verify-email') {
    return <EmailVerificationPage />;
  }

  // Show loading during guest user creation
  if (isInitializing || !authChecked) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto mb-4"></div>
          <p className="text-slate-600">Initializing...</p>
        </div>
      </div>
    );
  }

  // If still not authenticated after initialization, show login
  console.log('🏠 App.tsx auth check:', {
    isInitializing,
    authChecked,
    isAuthenticated_,
    currentPath,
    isAuthenticatedFunction: isAuthenticated(),
    tokenInStorage: !!localStorage.getItem('token')
  });
  
  if (!isAuthenticated_) {
    console.log('🔴 App.tsx: Showing login page because isAuthenticated_ is false');
    return <LoginPage />;
  }

  // Service pages routing
  console.log('🏠 App.tsx: Rendering page for path:', currentPath);
  
  if (currentPath === '/background-removal') {
    console.log('🏠 App.tsx: Rendering BackgroundRemovalPage');
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

  if (currentPath === '/reset-password') {
  return <ResetPasswordPage />;
}
if (currentPath === '/AuthForm') {
  return <AuthForm/>;
}

  return <HomePage />;
}

export default App;