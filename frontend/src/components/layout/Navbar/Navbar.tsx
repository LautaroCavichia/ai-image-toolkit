// src/components/layout/Navbar/Navbar.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSignOutAlt, 
  faSignInAlt,
  faUser,
  faBars,
  faTimes,
  faCoins
} from '@fortawesome/free-solid-svg-icons';
import Button from '../../shared/Button';
import TokenPanel from '../../TokenPanel/TokenPanel';
import { useScrollPosition, useScrollDirection } from '../../../hooks/useScrollPosition';
import './Navbar.css';
import Logo from '../../shared/Logo/Logo';

interface NavbarProps {
  user: { userId: string; email?: string; displayName: string } | null;
  isGuest?: boolean;
  tokenBalance: number;
  onLogout: () => void;
  onTokenBalanceChange: (newBalance: number) => void;
  onShowLogin?: () => void;
  onShowSignup?: () => void;
  onShowProfile?: () => void;
  showProfile?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ 
  user, 
  isGuest = false,
  tokenBalance, 
  onLogout,
  onTokenBalanceChange,
  onShowLogin,
  onShowSignup,
  onShowProfile,
  showProfile = false
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const scrollPosition = useScrollPosition();
  const scrollDirection = useScrollDirection();
  
  // Determine navbar state based on scroll
  const isScrolled = scrollPosition.y > 50;
  // Make navbar always visible (sticky)
  const shouldHide = false;

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  const navItems = [
    { label: 'Features', href: '#features' },
    { label: 'How it Works', href: '#how-it-works' },
    { label: 'API', href: '#api' },
    { label: 'Contact', href: '#contact' },
  ];

  const handleNavClick = (href: string) => {
    setMobileMenuOpen(false);
    
    // Smooth scroll to section
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <motion.nav 
      className={`navbar ${isScrolled ? 'navbar-scrolled' : ''} ${shouldHide ? 'navbar-hidden' : ''}`}
      initial={{ y: -100 }}
      animate={{ y: shouldHide ? -100 : 0 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      {/* Background blur effect */}
      <div className="navbar-bg" />
      
      <div className="navbar-container">
        {/* Logo */}
        <motion.div 
          className="navbar-logo"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <div className="logo-icon">
            <Logo />
          </div>
          <span className="logo-text">PIXELPERFECT</span>
        </motion.div>
        
        {/* Desktop Navigation */}
        <div className="navbar-nav">
          {navItems.map((item, index) => (
            <motion.a
              key={item.href}
              href={item.href}
              className="nav-link"
              onClick={(e) => {
                e.preventDefault();
                handleNavClick(item.href);
              }}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -2 }}
            >
              {item.label}
            </motion.a>
          ))}
        </div>
        
        {/* Actions */}
        <div className="navbar-actions">
          {/* Token Panel */}
          <TokenPanel 
            tokenBalance={tokenBalance}
            onBalanceChange={onTokenBalanceChange}
            onShowLogin={onShowLogin}
            onShowSignup={onShowSignup}
          />
          
          {/* User Section */}
          {user ? (
            <div className="navbar-user">
              <motion.div 
                className={`user-avatar ${isGuest ? 'guest' : ''}`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onShowProfile}
              >
                <span>{user.displayName.charAt(0).toUpperCase()}</span>
                {isGuest && <div className="guest-indicator" />}
              </motion.div>
              
              <div className="user-menu">
                <div className="user-info">
                  <span className="user-name">{user.displayName}</span>
                  {isGuest && <span className="guest-badge">Guest</span>}
                </div>
                
                <div className="user-actions">
                  {showProfile && onShowProfile && (
                    <Button
                      variant="ghost"
                      size="sm"
                      leftIcon={<FontAwesomeIcon icon={faUser} />}
                      onClick={onShowProfile}
                      className="user-action-btn"
                    >
                      Profile
                    </Button>
                  )}
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={<FontAwesomeIcon icon={faSignOutAlt} />}
                    onClick={onLogout}
                    className="user-action-btn logout-btn"
                  >
                    Logout
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <Button
              variant="primary"
              size="md"
              leftIcon={<FontAwesomeIcon icon={faSignInAlt} />}
              onClick={onShowLogin}
              glow
            >
              Sign In
            </Button>
          )}
          
          {/* Mobile Menu Toggle */}
          <button 
            className="mobile-menu-toggle"
            onClick={toggleMobileMenu}
            aria-label="Toggle mobile menu"
          >
            <FontAwesomeIcon icon={mobileMenuOpen ? faTimes : faBars} />
          </button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="mobile-menu-content">
              {navItems.map((item, index) => (
                <motion.a
                  key={item.href}
                  href={item.href}
                  className="mobile-nav-link"
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(item.href);
                  }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  {item.label}
                </motion.a>
              ))}
              
              {!user && (
                <div className="mobile-auth">
                  <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    leftIcon={<FontAwesomeIcon icon={faSignInAlt} />}
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onShowLogin?.();
                    }}
                  >
                    Sign In
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Mobile menu backdrop */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="mobile-menu-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;