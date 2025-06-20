import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import {
  isAuthenticated,
  logout,
  getCurrentUser,
  createGuestUser,
  registerUnauthorizedHandler,
} from './services/authService';
import { fetchTokenBalance } from './services/tokenService';
import { JobResponseDTO } from './types';
import Layout from './components/Layout/Layout';
import HomePage from './pages/HomePage';
import BackgroundRemovalPage from './pages/BackgroundRemovalPage';
import UpscalePage from './pages/UpscalePage';
import EnlargePage from './pages/EnlargePage';
import ObjectRemovalPage from './pages/ObjectRemovalPage';
import ComingSoonPage from './pages/ComingSoonPage';
import { faPalette } from '@fortawesome/free-solid-svg-icons';
import './styles/App.css';
import 'react-toastify/dist/ReactToastify.css';

// Service availability configuration
const serviceConfig = {
  backgroundRemoval: { enabled: true, comingSoon: false },
  upscale: { enabled: true, comingSoon: false },
  enlarge: { enabled: true, comingSoon: false },
  objectRemoval: { enabled: true, comingSoon: false },
  styleTransfer: { enabled: false, comingSoon: true }
};

const AppRouter: React.FC = () => {
  const [currentJob, setCurrentJob] = useState<JobResponseDTO | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isGuest, setIsGuest] = useState<boolean>(false);
  const [user, setUser] = useState<{ userId: string; email?: string; displayName: string; isGuest?: boolean } | null>(null);
  const [showJobStatus, setShowJobStatus] = useState<boolean>(false);
  const [showAuth, setShowAuth] = useState<boolean>(false);
  const [showProfile, setShowProfile] = useState<boolean>(false);
  const [tokenBalance, setTokenBalance] = useState<number>(0);

  const handleCreateSilentGuestUser = async () => {
    try {
      const guestUser = await createGuestUser();

      if (guestUser.token) {
        localStorage.setItem('token', guestUser.token);
      }

      setUser({
        userId: guestUser.userId,
        displayName: guestUser.displayName,
        isGuest: true
      });
      setIsGuest(true);
      setIsLoggedIn(false);
      setTokenBalance(guestUser.tokenBalance || 0);
    } catch (error) {
      console.error("Failed to create silent guest user:", error);
      toast.error("Service temporarily unavailable. Please try again later.");
    }
  };

  useEffect(() => {
    const initializeUser = async () => {
      try {
        const authenticated = isAuthenticated();
        if (authenticated) {
          const [currentUser, tokenBalance] = await Promise.all([
            getCurrentUser(),
            fetchTokenBalance()
          ]);

          if (currentUser) {
            setUser(currentUser);
            setTokenBalance(tokenBalance);
            
            if (currentUser.isGuest) {
              setIsGuest(true);
              setIsLoggedIn(false);
            } else {
              setIsGuest(false);
              setIsLoggedIn(true);
            }
          }
        } else {
          await handleCreateSilentGuestUser();
        }
      } catch (error) {
        console.error('Error initializing user:', error);
        toast.error("Error loading user data");
        await handleCreateSilentGuestUser();
      }
    };

    initializeUser();

    return () => {
      registerUnauthorizedHandler(undefined);
    };
  }, []);

  const handleNewJob = (job: JobResponseDTO) => {
    setCurrentJob(job);
    setShowJobStatus(true);
    toast.success("Job submitted successfully!");
  };

  const handleLoginSuccess = async (type: 'login' | 'guest' = 'login') => {
    if (type === 'login') {
      try {
        const updatedBalance = await fetchTokenBalance();
        const updatedUser = getCurrentUser();
        
        if (updatedUser) {
          setUser(updatedUser);
          setTokenBalance(updatedBalance);
          setIsLoggedIn(true);
          setIsGuest(false);
          setShowAuth(false);
          toast.success("Welcome back!");
        }
      } catch (error) {
        console.error('Login error:', error);
        toast.error("Error loading user data");
      }
    }
  };

  const handleLogout = async () => {
    logout();
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setIsGuest(true);
    setUser(null);
    setCurrentJob(null);
    setTokenBalance(0);
    setShowProfile(false);
    toast.info("Logged out successfully");

    await handleCreateSilentGuestUser();
  };

  const handleTokenBalanceChange = (newBalance: number) => {
    setTokenBalance(newBalance);
  };

  const handleGuestConversionSuccess = async () => {
    setShowAuth(false);
    setIsGuest(false);
    setIsLoggedIn(true);

    try {
      const balance = await fetchTokenBalance();
      setTokenBalance(balance);
    } catch (error) {
      console.error("Error fetching token balance:", error);
      setTokenBalance(0);
    }

    const updatedUser = getCurrentUser();
    setUser(updatedUser);

    toast.success("Welcome back!");
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
    setShowAuth(true);
  };

  const handleShowProfile = () => {
    setShowProfile(true);
  };

  return (
    <Router>
      <Layout
        user={user}
        isLoggedIn={isLoggedIn}
        isGuest={isGuest}
        tokenBalance={tokenBalance}
        showAuth={showAuth}
        showProfile={showProfile}
        showJobStatus={showJobStatus}
        currentJob={currentJob}
        onLogout={handleLogout}
        onTokenBalanceChange={handleTokenBalanceChange}
        onShowGuestConversion={handleShowGuestConversion}
        onShowProfile={handleShowProfile}
        onToggleAuth={toggleAuthModal}
        onToggleProfile={toggleProfileModal}
        onCloseJobStatus={closeJobStatus}
        onLoginSuccess={handleLoginSuccess}
        onGuestConversionSuccess={handleGuestConversionSuccess}
      >
        <Routes>
          <Route path="/" element={<HomePage />} />
          
          {serviceConfig.backgroundRemoval.enabled && (
            <Route 
              path="/background-removal" 
              element={<BackgroundRemovalPage onJobCreated={handleNewJob} />} 
            />
          )}
          
          {serviceConfig.upscale.enabled && (
            <Route 
              path="/upscale" 
              element={<UpscalePage onJobCreated={handleNewJob} />} 
            />
          )}
          
          {serviceConfig.enlarge.enabled && (
            <Route 
              path="/enlarge" 
              element={<EnlargePage onJobCreated={handleNewJob} />} 
            />
          )}
          
          {serviceConfig.objectRemoval.enabled && (
            <Route 
              path="/object-removal" 
              element={<ObjectRemovalPage onJobCreated={handleNewJob} />} 
            />
          )}
          
          {/* Style Transfer - Coming Soon */}
          <Route 
            path="/style-transfer" 
            element={
              <ComingSoonPage 
                serviceName="Style Transfer" 
                serviceIcon={faPalette}
                serviceColor="#6f42c1"
                description="Transform your images with 20+ artistic styles using cutting-edge AI. Custom prompts and adjustable strength controls coming soon!"
              />
            } 
          />
        </Routes>
      </Layout>
      
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
    </Router>
  );
};

export default AppRouter;