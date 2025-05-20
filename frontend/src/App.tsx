// src/App.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ToastContainer, toast } from 'react-toastify';
import { isAuthenticated, logout, setupAxiosInterceptors, getCurrentUser } from './services/authService';
import { JobResponseDTO } from './types';
import './styles/App.css';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from './components/Navbar/Navbar';
import Login from './components/Login/Login';
import ImageUploader from './components/ImageUploader/ImageUploader';
import JobStatusDisplay from './components/JobStatus/JobStatusDisplay';

function App() {
  const [currentJob, setCurrentJob] = useState<JobResponseDTO | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [user, setUser] = useState<{ userId: string; email: string; displayName: string } | null>(null);
  const [showJobStatus, setShowJobStatus] = useState<boolean>(false);

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
    setShowJobStatus(true);
    toast.success("Job submitted successfully!");
  };
  
  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setUser(getCurrentUser());
    toast.success("Login successful!");
  };
  
  const handleLogout = () => {
    logout();
    setIsLoggedIn(false);
    setUser(null);
    setCurrentJob(null);
    toast.info("Logged out successfully");
  };

  const closeJobStatus = () => {
    setShowJobStatus(false);
  };

  return (
    <div className="app">
      {isLoggedIn && <Navbar user={user} onLogout={handleLogout} />}
      
      <main className="app-main">
        <AnimatePresence mode="wait">
          {!isLoggedIn ? (
            <motion.div
              key="login"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="login-container"
            >
              <Login onLoginSuccess={handleLoginSuccess} />
            </motion.div>
          ) : (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="dashboard-container"
            >
              <ImageUploader onJobCreated={handleNewJob} />
              
              <AnimatePresence>
                {showJobStatus && currentJob && (
                  <motion.div 
                    className="job-status-modal"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  >
                    <div className="job-status-content">
                      <button onClick={closeJobStatus} className="close-button">×</button>
                      <JobStatusDisplay initialJob={currentJob} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      
      <div className="background">
        <div className="gradient-blob gradient-blob-1"></div>
        <div className="gradient-blob gradient-blob-2"></div>
        <div className="gradient-blob gradient-blob-3"></div>
      </div>
      
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </div>
  );
}

export default App;