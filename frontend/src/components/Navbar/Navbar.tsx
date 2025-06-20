import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSignOutAlt, 
  faSignInAlt,
  faHome,
  faInfo,
  faEnvelope,
  faFileAlt,
  faBars,
  faTimes,
  faUser,
  faHistory,
  faImage,
  faArrowsUpDown,
  faExpand,
  faWandMagicSparkles,
  faPalette,
  faMoon,
  faSun
} from '@fortawesome/free-solid-svg-icons';
import { gsap } from 'gsap';
import { useTheme } from '../../contexts/ThemeContext';
import TokenPanel from '../TokenPanel/TokenPanel';
import PixelPerfectLogo from '../Logo/PixelPerfectLogo';
import './Navbar.css';

interface NavbarProps {
  user: { userId: string; email?: string; displayName: string } | null;
  isGuest?: boolean;
  tokenBalance: number;
  onLogout: () => void;
  onTokenBalanceChange: (newBalance: number) => void;
  onShowGuestConversion?: () => void;
  onShowProfile?: () => void;
  showProfile?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ 
  user, 
  isGuest = false,
  tokenBalance, 
  onLogout,
  onTokenBalanceChange,
  onShowGuestConversion,
  onShowProfile,
  showProfile = false
}) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const navRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);

  useEffect(() => {
    if (navRef.current && !mobileMenuOpen) {
      gsap.fromTo(navRef.current.querySelectorAll('.nav-link'), 
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'back.out(1.7)' }
      );
    }
  }, [mobileMenuOpen]);

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  return (
    <motion.nav 
      className={`navbar ${scrolled ? 'scrolled' : ''}`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <motion.div 
            className="navbar-logo"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <PixelPerfectLogo size={32} animated={false} glowOnHover={true} />
            <span className="logo-text gradient-text">PixelPerfect</span>
            <span className="logo-suffix">AI</span>
          </motion.div>
        </Link>
        
        <div className="mobile-menu-toggle" onClick={toggleMobileMenu}>
          <FontAwesomeIcon icon={mobileMenuOpen ? faTimes : faBars} />
        </div>
        
        <div className={`navbar-links ${mobileMenuOpen ? 'active' : ''}`} ref={navRef}>
          <Link 
            to="/" 
            className={`nav-link ${location.pathname === '/' ? 'active' : ''}`} 
            onClick={() => setMobileMenuOpen(false)}
          >
            <FontAwesomeIcon icon={faHome} />
            <span>Home</span>
            <div className="nav-indicator"></div>
          </Link>
          
          <div className="nav-dropdown">
            <div className="nav-link dropdown-trigger">
              <FontAwesomeIcon icon={faImage} />
              <span>Services</span>
              <div className="nav-indicator"></div>
            </div>
            <div className="dropdown-menu glass">
              <Link 
                to="/background-removal" 
                className={`dropdown-item ${location.pathname === '/background-removal' ? 'active' : ''}`} 
                onClick={() => setMobileMenuOpen(false)}
              >
                <FontAwesomeIcon icon={faImage} style={{ color: 'var(--color-service-background)' }} />
                <div>
                  <span className="item-title">Background Removal</span>
                  <span className="item-desc">Remove backgrounds instantly</span>
                </div>
              </Link>
              
              <Link 
                to="/upscale" 
                className={`dropdown-item ${location.pathname === '/upscale' ? 'active' : ''}`} 
                onClick={() => setMobileMenuOpen(false)}
              >
                <FontAwesomeIcon icon={faArrowsUpDown} style={{ color: 'var(--color-service-upscale)' }} />
                <div>
                  <span className="item-title">AI Upscaling</span>
                  <span className="item-desc">Enhance image resolution</span>
                </div>
              </Link>
              
              <Link 
                to="/enlarge" 
                className={`dropdown-item ${location.pathname === '/enlarge' ? 'active' : ''}`} 
                onClick={() => setMobileMenuOpen(false)}
              >
                <FontAwesomeIcon icon={faExpand} style={{ color: 'var(--color-service-enlarge)' }} />
                <div>
                  <span className="item-title">Smart Enlargement</span>
                  <span className="item-desc">Expand with AI generation</span>
                </div>
              </Link>
              
              <Link 
                to="/object-removal" 
                className={`dropdown-item ${location.pathname === '/object-removal' ? 'active' : ''}`} 
                onClick={() => setMobileMenuOpen(false)}
              >
                <FontAwesomeIcon icon={faWandMagicSparkles} style={{ color: 'var(--color-service-object)' }} />
                <div>
                  <span className="item-title">Object Removal</span>
                  <span className="item-desc">Remove unwanted objects</span>
                </div>
              </Link>
              
              <div className="dropdown-item disabled">
                <FontAwesomeIcon icon={faPalette} style={{ color: 'var(--color-service-style)' }} />
                <div>
                  <span className="item-title">Style Transfer</span>
                  <span className="item-desc">Coming soon</span>
                </div>
                <span className="coming-soon-badge">Soon</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="navbar-actions">
          {/* Theme Toggle */}
          <motion.button 
            className="theme-toggle"
            onClick={toggleTheme}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            <FontAwesomeIcon icon={theme === 'light' ? faMoon : faSun} />
          </motion.button>
          
          {/* Always show token panel */}
          <TokenPanel 
            tokenBalance={tokenBalance}
            onBalanceChange={onTokenBalanceChange}
            onShowGuestConversion={onShowGuestConversion}
          />
          
          {user ? (
            /* User is logged in - show user info and actions */
            <div className="navbar-user">
              <motion.div 
                className={`user-avatar ${isGuest ? 'guest' : ''}`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onShowProfile}
                style={{ cursor: 'pointer' }}
              >
                {user.displayName.charAt(0).toUpperCase()}
              </motion.div>
              <div className="user-info">
                <span className="user-name">{user.displayName}</span>
                {isGuest && <span className="guest-badge">Guest</span>}
              </div>
              
              {/* Show profile and logout options for logged in users */}
              <div className="user-actions">
                {showProfile && onShowProfile && (
                  <motion.button 
                    onClick={onShowProfile} 
                    className="profile-button" 
                    title="Profile & History"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <FontAwesomeIcon icon={faUser} />
                  </motion.button>
                )}
                
                <motion.button 
                  onClick={onLogout} 
                  className="logout-button" 
                  title="Logout"
                  whileHover={{ scale: 1.1, rotate: 10 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <FontAwesomeIcon icon={faSignOutAlt} />
                </motion.button>
              </div>
            </div>
          ) : (
            /* No user or anonymous - show sign in button */
            <motion.button 
              className="auth-button"
              onClick={onShowGuestConversion}
              title="Sign In or Create Account"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FontAwesomeIcon icon={faSignInAlt} />
              <span>Sign In</span>
            </motion.button>
          )}
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;