import React, { useState, useEffect } from 'react';
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
  faPalette
} from '@fortawesome/free-solid-svg-icons';
import TokenPanel from '../TokenPanel/TokenPanel';
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

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  return (
    <motion.nav 
      className={`navbar ${scrolled ? 'scrolled' : ''}`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="navbar-container">
        <Link to="/">
          <motion.div 
            className="navbar-logo"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="logo-icon">
              <div className="logo-square"></div>
              <div className="logo-circle"></div>
            </div>
            <span className="logo-text">PixelPerfect AI</span>
          </motion.div>
        </Link>
        
        <div className="mobile-menu-toggle" onClick={toggleMobileMenu}>
          <FontAwesomeIcon icon={mobileMenuOpen ? faTimes : faBars} />
        </div>
        
        <div className={`navbar-links ${mobileMenuOpen ? 'active' : ''}`}>
          <Link 
            to="/" 
            className={`nav-link ${location.pathname === '/' ? 'active' : ''}`} 
            onClick={() => setMobileMenuOpen(false)}
          >
            <FontAwesomeIcon icon={faHome} />
            <span>Home</span>
          </Link>
          
          <Link 
            to="/background-removal" 
            className={`nav-link ${location.pathname === '/background-removal' ? 'active' : ''}`} 
            onClick={() => setMobileMenuOpen(false)}
          >
            <FontAwesomeIcon icon={faImage} />
            <span>Background Removal</span>
          </Link>
          
          <Link 
            to="/upscale" 
            className={`nav-link ${location.pathname === '/upscale' ? 'active' : ''}`} 
            onClick={() => setMobileMenuOpen(false)}
          >
            <FontAwesomeIcon icon={faArrowsUpDown} />
            <span>Upscale</span>
          </Link>
          
          <Link 
            to="/enlarge" 
            className={`nav-link ${location.pathname === '/enlarge' ? 'active' : ''}`} 
            onClick={() => setMobileMenuOpen(false)}
          >
            <FontAwesomeIcon icon={faExpand} />
            <span>Enlarge</span>
          </Link>
          
          <Link 
            to="/object-removal" 
            className={`nav-link ${location.pathname === '/object-removal' ? 'active' : ''}`} 
            onClick={() => setMobileMenuOpen(false)}
          >
            <FontAwesomeIcon icon={faWandMagicSparkles} />
            <span>Object Removal</span>
          </Link>
          
          <div 
            className="nav-link disabled coming-soon"
            title="Coming Soon"
          >
            <FontAwesomeIcon icon={faPalette} />
            <span>Style Transfer</span>
            <span className="nav-badge">Soon</span>
          </div>
        </div>
        
        <div className="navbar-actions">
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