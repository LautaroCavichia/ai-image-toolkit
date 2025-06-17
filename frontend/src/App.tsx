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
import Hero from './components/sections/Hero';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import axios from 'axios';
import Services from './components/sections/Services/Services';





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
            <Hero onGetStarted={() => {
              // Scroll to the ImageUploader section or trigger upload
              const uploaderElement = document.querySelector('.image-uploader');
              if (uploaderElement) {
                uploaderElement.scrollIntoView({ behavior: 'smooth' });
              }
            }} />

            </motion.div>
          </AnimatePresence>
        </main>

        <Services />

      
      <Footer />
    
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