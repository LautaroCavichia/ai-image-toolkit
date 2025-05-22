// src/App.tsx - Updated for seamless guest experience
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
import UserProfile from './components/UserProfile/UserProfile';


function App() {
  const [currentJob, setCurrentJob] = useState<JobResponseDTO | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isGuest, setIsGuest] = useState<boolean>(true); // Start as guest by default
  const [user, setUser] = useState<{ userId: string; email?: string; displayName: string; isGuest?: boolean } | null>(null);
  const [showJobStatus, setShowJobStatus] = useState<boolean>(false);
  const [showAuth, setShowAuth] = useState<boolean>(false);
  const [showProfile, setShowProfile] = useState<boolean>(false);
  const [tokenBalance, setTokenBalance] = useState<number>(0);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const appRef = useRef<HTMLDivElement>(null);

  // Initialize authentication state and axios interceptors on app load
  useEffect(() => {
    setupAxiosInterceptors();
    
    const authenticated = isAuthenticated();
    
    if (authenticated) {
      // User has an existing session
      const currentUser = getCurrentUser();
      setIsLoggedIn(true);
      setUser(currentUser);
      
      if (currentUser?.isGuest) {
        setIsGuest(true);
      } else {
        setIsGuest(false);
      }
      
      // Get token balance
      if (currentUser?.tokenBalance !== undefined) {
        setTokenBalance(currentUser.tokenBalance);
      } else {
        fetchTokenBalance().then(balance => setTokenBalance(balance));
      }
    } else {
      // No session - create a silent guest user
      handleCreateSilentGuestUser();
    }
  }, []);

  // Effect to handle body scroll when modal is open
  useEffect(() => {
    const isAnyModalOpen = showJobStatus || showAuth || showProfile;
    setModalOpen(isAnyModalOpen);
    
    if (isAnyModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'visible';
    }
    
    return () => {
      document.body.style.overflow = 'visible';
    };
  }, [showJobStatus, showAuth, showProfile]);

  const handleCreateSilentGuestUser = async () => {
    try {
      const guestUser = await createGuestUser();
      // Silent login - user doesn't know they're logged in as guest
      setUser({
        userId: guestUser.userId,
        displayName: guestUser.displayName,
        isGuest: true
      });
      setIsGuest(true);
      setIsLoggedIn(false); // Don't show as "logged in" in UI
      setTokenBalance(guestUser.tokenBalance || 0);
    } catch (error) {
      console.error("Failed to create silent guest user:", error);
      // Show error or fallback UI
      toast.error("Service temporarily unavailable. Please try again later.");
    }
  };

  const handleNewJob = (job: JobResponseDTO) => {
    setCurrentJob(job);
    setShowJobStatus(true);
    toast.success("Job submitted successfully!");
  };
  
  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setIsGuest(false);
    setShowAuth(false);
    const currentUser = getCurrentUser();
    setUser(currentUser);
    
    // Update token balance
    if (currentUser?.tokenBalance !== undefined) {
      setTokenBalance(currentUser.tokenBalance);
    } else {
      fetchTokenBalance().then(balance => setTokenBalance(balance));
    }
    
    toast.success("Welcome back!");
  };
  
  const handleLogout = () => {
    logout();
    setIsLoggedIn(false);
    setIsGuest(true);
    setUser(null);
    setCurrentJob(null);
    setTokenBalance(0);
    setShowProfile(false);
    toast.info("Logged out successfully");
    
    // Auto-create a new silent guest user after logout
    handleCreateSilentGuestUser();
  };

  const handleTokenBalanceChange = (newBalance: number) => {
    setTokenBalance(newBalance);
  };

  const handleGuestConversionSuccess = () => {
    setShowAuth(false);
    setIsGuest(false);
    setIsLoggedIn(true);
    
    // Update user data
    const currentUser = getCurrentUser();
    setUser(currentUser);
    
    toast.success("Account created successfully! Welcome aboard!");
  };

  const closeJobStatus = () => {
    setShowJobStatus(false);
  };

  const toggleAuthModal = () => {
    setShowAuth(prev => !prev);
  };

  const toggleProfileModal = () => {
    setShowProfile(prev => !prev);
  };

  const handleShowGuestConversion = () => {
    if (isGuest && !isLoggedIn) {
      // Show conversion for silent guests
      setShowAuth(true);
    } else {
      // Show login for completely anonymous users
      setShowAuth(true);
    }
  };

  return (
    <div className="app" ref={appRef}>
      <Navbar 
        user={isLoggedIn ? user : null} // Only show user info if actually logged in
        onLogout={handleLogout} 
        isGuest={isGuest && isLoggedIn} // Only show guest badge if explicitly logged in as guest
        tokenBalance={tokenBalance}
        onTokenBalanceChange={handleTokenBalanceChange}
        onShowGuestConversion={handleShowGuestConversion}
        onShowProfile={toggleProfileModal}
        showProfile={isLoggedIn} // Only show profile option for logged in users
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
                      onShowGuestConversion={handleShowGuestConversion}
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
      
      {/* Auth Modal - for login/signup */}
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
              {isGuest && user ? (
                <GuestConversion 
                  userId={user.userId}
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

      {/* Profile Modal - for logged in users */}
      <AnimatePresence>
        {showProfile && isLoggedIn && (
          <motion.div 
            className="auth-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                toggleProfileModal();
              }
            }}
          >
            <motion.div
              className="auth-modal-content profile-modal"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button onClick={toggleProfileModal} className="close-button">×</button>
              <UserProfile 
                user={user}
                tokenBalance={tokenBalance}
                onTokenBalanceChange={handleTokenBalanceChange}
                onClose={toggleProfileModal}
              />
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