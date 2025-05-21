// src/App.tsx
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ToastContainer, toast } from 'react-toastify';
import { 
  isAuthenticated, 
  logout, 
  setupAxiosInterceptors, 
  getCurrentUser,
  createGuestUser
} from './services/authService';
import { fetchTokenBalance } from './services/tokenService';
import { JobResponseDTO } from './types';
import './styles/App.css';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from './components/Navbar/Navbar';
import Login from './components/Login/Login';
import ImageUploader from './components/ImageUploader/ImageUploader';
import JobStatusDisplay from './components/JobStatus/JobStatusDisplay';
import AboutSection from './components/AboutSection/AboutSection';
import Footer from './components/Footer/Footer';
import GuestConversion from './components/GuestConversion/GuestConversion';
import ContactForm from './components/ContactForm/ContactForm';
import ApiSection from './components/ApiSection/ApiSection';
import AboutUs from './components/AboutUs/AboutUs';

function App() {
  const [currentJob, setCurrentJob] = useState<JobResponseDTO | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isGuest, setIsGuest] = useState<boolean>(false);
  const [user, setUser] = useState<{ userId: string; email?: string; displayName: string; isGuest?: boolean } | null>(null);
  const [showJobStatus, setShowJobStatus] = useState<boolean>(false);
  const [showAuth, setShowAuth] = useState<boolean>(false);
  const [tokenBalance, setTokenBalance] = useState<number>(0);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const appRef = useRef<HTMLDivElement>(null);

  // Initialize authentication state and axios interceptors on app load
  useEffect(() => {
    // Set up axios interceptors for authentication
    setupAxiosInterceptors();
    
    // Check if user is already logged in (token exists in localStorage)
    const authenticated = isAuthenticated();
    
    if (authenticated) {
      const currentUser = getCurrentUser();
      setIsLoggedIn(true);
      setUser(currentUser);
      
      // Check if user is a guest
      if (currentUser?.isGuest) {
        setIsGuest(true);
      }
      
      // Get token balance
      if (currentUser?.tokenBalance !== undefined) {
        setTokenBalance(currentUser.tokenBalance);
      } else {
        fetchTokenBalance().then(balance => setTokenBalance(balance));
      }
    } else {
      // Auto-create a guest user if not authenticated
      handleCreateGuestUser();
    }
  }, []);

  // Effect to handle body scroll when modal is open
  useEffect(() => {
    const isAnyModalOpen = showJobStatus || showAuth;
    setModalOpen(isAnyModalOpen);
    
    if (isAnyModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'visible';
    }
    
    return () => {
      document.body.style.overflow = 'visible';
    };
  }, [showJobStatus, showAuth]);

  const handleCreateGuestUser = async () => {
    try {
      const guestUser = await createGuestUser();
      setIsLoggedIn(true);
      setIsGuest(true);
      setUser({
        userId: guestUser.userId,
        displayName: guestUser.displayName,
        isGuest: true
      });
      setTokenBalance(guestUser.tokenBalance || 0);
    } catch (error) {
      console.error("Failed to create guest user:", error);
      // If guest user creation fails, remain logged out
    }
  };

  const handleNewJob = (job: JobResponseDTO) => {
    setCurrentJob(job);
    setShowJobStatus(true);
    toast.success("Job submitted successfully!");
  };
  
  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setShowAuth(false);
    const currentUser = getCurrentUser();
    setUser(currentUser);
    setIsGuest(currentUser?.isGuest || false);
    
    // Update token balance
    if (currentUser?.tokenBalance !== undefined) {
      setTokenBalance(currentUser.tokenBalance);
    } else {
      fetchTokenBalance().then(balance => setTokenBalance(balance));
    }
    
    toast.success("Login successful!");
  };
  
  const handleLogout = () => {
    logout();
    setIsLoggedIn(false);
    setIsGuest(false);
    setUser(null);
    setCurrentJob(null);
    setTokenBalance(0);
    toast.info("Logged out successfully");
    
    // Auto-create a guest user after logout
    handleCreateGuestUser();
  };

  const handleTokenBalanceChange = (newBalance: number) => {
    setTokenBalance(newBalance);
  };

  const handleGuestConversionSuccess = () => {
    setShowAuth(false);
    setIsGuest(false);
    
    // Update user data
    const currentUser = getCurrentUser();
    setUser(currentUser);
    
    toast.success("Account created successfully!");
  };

  const closeJobStatus = () => {
    setShowJobStatus(false);
  };

  const toggleAuthModal = () => {
    setShowAuth(prev => !prev);
  };

  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="app" ref={appRef}>
      <Navbar 
        user={isLoggedIn ? user : null} 
        onLogout={handleLogout} 
        isGuest={isGuest}
        tokenBalance={tokenBalance}
        onTokenBalanceChange={handleTokenBalanceChange}
        onShowGuestConversion={toggleAuthModal}
      />
      
      <main className="app-main" id="home">
        <AnimatePresence mode="wait">
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="dashboard-container"
          >
            <motion.div 
              className="hero-content"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <motion.h1 
                className="hero-title"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.8, 
                  delay: 0.3,
                  type: "spring",
                  stiffness: 100
                }}
              >
                Transform Images with AI Magic
              </motion.h1>
              <motion.p 
                className="hero-subtitle"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                Background removal, upscaling, and enhancement powered by cutting-edge AI technology
              </motion.p>
            </motion.div>
            
            <ImageUploader onJobCreated={handleNewJob} />
            
            <AnimatePresence>
              {showJobStatus && currentJob && (
                <motion.div 
                  className="job-status-modal"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={(e) => {
                    if (e.target === e.currentTarget) {
                      closeJobStatus();
                    }
                  }}
                >
                  <motion.div 
                    className="job-status-content"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button onClick={closeJobStatus} className="close-button">×</button>
                    <JobStatusDisplay 
                      initialJob={currentJob}
                      onTokenBalanceChange={handleTokenBalanceChange}
                      onShowGuestConversion={toggleAuthModal}
                    />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>
      </main>
      
      <div className="background">
        <div className="background-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
        </div>
        <div className="pattern"></div>
      </div>
      
      <AboutSection />
      
      <div id="features">
        <AboutUs />
      </div>
      
      <div id="api">
        <ApiSection />
      </div>
      
      <div id="contact">
        <ContactForm />
      </div>
      
      <Footer />
      
      <AnimatePresence>
        {showAuth && (
          <motion.div 
            className="auth-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                toggleAuthModal();
              }
            }}
          >
            <motion.div
              className="auth-modal-content"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button onClick={toggleAuthModal} className="close-button">×</button>
              {isGuest ? (
                <GuestConversion 
                  userId={user?.userId || ''}
                  onConversionSuccess={handleGuestConversionSuccess}
                  onCancel={toggleAuthModal}
                />
              ) : (
                <Login onLoginSuccess={handleLoginSuccess} />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
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
        theme="light"
      />
    </div>
  );
}

export default App;