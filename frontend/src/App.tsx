// src/App.tsx - Updated for seamless guest experience
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
import BeforeAfterSlider from './components/ImageSlider/BeforeAfterSlider';
import axios from 'axios';





function App() {
  const [currentJob, setCurrentJob] = useState<JobResponseDTO | null>(null);
  // Para la UI, consideramos "logueado" sólo si es usuario real.
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  // En el estado interno se guardará la info del usuario (puede ser invitado),
  // pero la UI siempre mostrará "Log in" si isLoggedIn es false.
  const [isGuest, setIsGuest] = useState<boolean>(false);
  const [user, setUser] = useState<{ userId: string; email?: string; displayName: string; isGuest?: boolean } | null>(null);
  const [showJobStatus, setShowJobStatus] = useState<boolean>(false);
  const [showAuth, setShowAuth] = useState<boolean>(false);
  const [showProfile, setShowProfile] = useState<boolean>(false);
  const [tokenBalance, setTokenBalance] = useState<number>(0);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const appRef = useRef<HTMLDivElement>(null);
   
    



  
  // Helper: crea un guest "en segundo plano" y lo guarda, pero deja la UI como no logueada.
  const handleCreateSilentGuestUser = async () => {
    
    try {
      const guestUser = await createGuestUser();

      // Guarda el token en localStorage para futuras peticiones
      if (guestUser.token) {
        localStorage.setItem('token', guestUser.token);
      }

      // Actualizamos el estado interno, pero para la UI no se marca como logueado.
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
        // Obtener usuario actual y balance de tokens en paralelo
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


  // Manejo del body scroll cuando se abren modales
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

  const handleNewJob = (job: JobResponseDTO) => {
    setCurrentJob(job);
    setShowJobStatus(true);
    toast.success("Job submitted successfully!");
  };

  const handleLoginSuccess = async (type: 'login' | 'guest' = 'login') => {
    if (type === 'login') {
      try {
        // Always fetch fresh balance after login
        const updatedBalance = await fetchTokenBalance();
        const updatedUser = getCurrentUser();
        
        if (updatedUser) {
          setUser(updatedUser);
          setTokenBalance(updatedBalance); // Use fetched balance
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

    // Crear nuevo guest silencioso (el usuario sigue viendo "Log in")
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
    const balance = await fetchTokenBalance(); // llamada a la API para obtener el balance real
    setTokenBalance(balance);
  } catch (error) {
    console.error("Error fetching token balance:", error);
    // Opcional: manejar error, por ejemplo poner un balance por defecto o mostrar mensaje
    setTokenBalance(0);
  }

  const updatedUser = getCurrentUser();
  setUser(updatedUser);

  toast.success("¡Welcome back!");
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
    // Siempre mostramos el modal de autenticación ("Log in")
    setShowAuth(true);
  };

  return (
    <div className="app" ref={appRef}>
      <Navbar 
        // Para la UI, se muestra el usuario real solo si isLoggedIn es true.
        // Mientras el usuario esté en modo guest, se mostrará null y se verá el botón "Log in".
        user={isLoggedIn ? user : null}
        onLogout={handleLogout}
        // Aunque en estado interno el usuario sea guest, la UI considera isLoggedIn para mostrar perfil.
        isGuest={isGuest && isLoggedIn}
        tokenBalance={tokenBalance}
        onTokenBalanceChange={handleTokenBalanceChange}
        onShowGuestConversion={handleShowGuestConversion}
        onShowProfile={toggleProfileModal}
        showProfile={isLoggedIn}
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
      
      
  {/* Versión simple sin fondo */}
  
      <AboutSection />
      
      <div id="features">
        <AboutUs />
      </div>

          
        <BeforeAfterSlider 
        beforeSrc="/assets/before.png"
        afterSrc="/assets/after.png"
        title="Unmatched Quality Results"
        subtitle="Experience the difference with our professional transformation. Slide to reveal the stunning before and after comparison."
        
      />


      
   

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