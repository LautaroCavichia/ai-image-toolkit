// src/App.tsx
import React, { useState, useEffect } from 'react';
import './App.css';
import ImageUploader from './components/imageUploader';
import JobStatusDisplay from './components/jobStatusDisplay';
import Login from './components/login';
import { JobResponseDTO } from './types';
import { isAuthenticated, logout, setupAxiosInterceptors, getCurrentUser } from './services/authService';

function App() {
  const [currentJob, setCurrentJob] = useState<JobResponseDTO | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [user, setUser] = useState<{ userId: string; email: string; displayName: string } | null>(null);

  // Initialize authentication state and axios interceptors on app load
  useEffect(() => {
    // Set up axios interceptors for authentication
    setupAxiosInterceptors();
    
    // Check if user is already logged in (token exists in localStorage)
    const authenticated = isAuthenticated();
    setIsLoggedIn(authenticated);
    
    if (authenticated) {
      setUser(getCurrentUser());
    }
  }, []);

  const handleNewJob = (job: JobResponseDTO) => {
    setCurrentJob(job);
  };
  
  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setUser(getCurrentUser());
  };
  
  const handleLogout = () => {
    logout();
    setIsLoggedIn(false);
    setUser(null);
    setCurrentJob(null);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>AI Image Editor</h1>
        {isLoggedIn && user && (
          <div style={{ position: 'absolute', top: '10px', right: '10px', color: 'white' }}>
            <span>Welcome, {user.displayName || user.email} </span>
            <button onClick={handleLogout}>Logout</button>
          </div>
        )}
      </header>
      <main>
        {!isLoggedIn ? (
          <Login onLoginSuccess={handleLoginSuccess} />
        ) : (
          <>
            <ImageUploader onJobCreated={handleNewJob} />
            {currentJob && (
              <div style={{ marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
                <JobStatusDisplay initialJob={currentJob} />
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default App;