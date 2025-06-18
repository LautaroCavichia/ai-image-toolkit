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
import './styles/App.css';
import 'react-toastify/dist/ReactToastify.css';
import Hero from './components/sections/Hero';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import AuthModal from './components/shared/AuthModal';
import Services from './components/sections/Services/Services';
import HowItWorks from './components/sections/HowItWorks/HowItWorks';
import ApiSection from './components/sections/ApiSection/ApiSection';
import ContactSection from './components/sections/ContactSection/ContactSection';
import BackgroundRemovalPage from './pages/BackgroundRemovalPage';
import UpscalePage from './pages/UpscalePage';
import EnlargePage from './pages/EnlargePage';
import ObjectRemovalPage from './pages/ObjectRemovalPage';
import './styles/ServicePage.css';





type AuthMode = 'signin' | 'signup';
type CurrentPage = 'home' | 'background-removal' | 'upscale' | 'enlarge' | 'object-removal';

function App() {
  // Para la UI, consideramos "logueado" sólo si es usuario real.
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  // En el estado interno se guardará la info del usuario (puede ser invitado),
  // pero la UI siempre mostrará "Log in" si isLoggedIn es false.
  const [isGuest, setIsGuest] = useState<boolean>(false);
  const [user, setUser] = useState<{ userId: string; email?: string; displayName: string; isGuest?: boolean } | null>(null);
  const [showAuth, setShowAuth] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<AuthMode>('signin');
  const [showProfile, setShowProfile] = useState<boolean>(false);
  const [tokenBalance, setTokenBalance] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<CurrentPage>('home');
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
    const isAnyModalOpen = showAuth || showProfile;

    if (isAnyModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'visible';
    }

    return () => {
      document.body.style.overflow = 'visible';
    };
  }, [showAuth, showProfile]);

  const handleAuthSuccess = async (userData: any) => {
    try {
      setUser({
        userId: userData.id,
        email: userData.email,
        displayName: `${userData.firstName} ${userData.lastName}`.trim(),
        isGuest: false
      });
      setTokenBalance(userData.tokenBalance || 0);
      setIsLoggedIn(true);
      setIsGuest(false);
      setShowAuth(false);
      
      const welcomeMessage = authMode === 'signup' ? 'Welcome to PixelPerfect AI!' : 'Welcome back!';
      toast.success(welcomeMessage);
    } catch (error) {
      console.error('Auth success error:', error);
      toast.error("Error loading user data");
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


  const handleShowLogin = () => {
    setAuthMode('signin');
    setShowAuth(true);
  };

  const handleShowSignup = () => {
    setAuthMode('signup');
    setShowAuth(true);
  };

  const handleCloseAuth = () => {
    setShowAuth(false);
  };

  const handleSwitchAuthMode = (mode: AuthMode) => {
    setAuthMode(mode);
  };

  const toggleProfileModal = () => {
    setShowProfile(prev => !prev);
  };


  const navigateToService = (servicePage: CurrentPage) => {
    setCurrentPage(servicePage);
  };

  const navigateToHome = () => {
    setCurrentPage('home');
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
        onShowLogin={handleShowLogin}
        onShowSignup={handleShowSignup}
        onShowProfile={toggleProfileModal}
        showProfile={isLoggedIn}
      />
      
      <main className="app-main" id="home">
        <AnimatePresence mode="wait">
          {currentPage === 'home' ? (
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
          ) : currentPage === 'background-removal' ? (
            <motion.div
              key="background-removal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <BackgroundRemovalPage onBack={navigateToHome} />
            </motion.div>
          ) : currentPage === 'upscale' ? (
            <motion.div
              key="upscale"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <UpscalePage onBack={navigateToHome} />
            </motion.div>
          ) : currentPage === 'enlarge' ? (
            <motion.div
              key="enlarge"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <EnlargePage onBack={navigateToHome} />
            </motion.div>
          ) : currentPage === 'object-removal' ? (
            <motion.div
              key="object-removal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <ObjectRemovalPage onBack={navigateToHome} />
            </motion.div>
          ) : null}
        </AnimatePresence>
      </main>

      {currentPage === 'home' && (
        <>
          <Services onServiceClick={navigateToService} />
          <HowItWorks />
          <ApiSection />
          <ContactSection />
        </>
      )}

      
      <Footer />

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuth}
        mode={authMode}
        onClose={handleCloseAuth}
        onSwitchMode={handleSwitchAuthMode}
        onAuthSuccess={handleAuthSuccess}
      />
    
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