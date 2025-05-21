// src/components/Navbar/Navbar.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSignOutAlt, 
  faSignInAlt
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
}

const Navbar: React.FC<NavbarProps> = ({ 
  user, 
  isGuest = false,
  tokenBalance, 
  onLogout,
  onTokenBalanceChange,
  onShowGuestConversion
}) => {
  return (
    <motion.nav 
      className="navbar"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="navbar-container">
        <div className="navbar-logo">
          <span className="logo-text">PixelPerfect AI</span>
        </div>
        
        <div className="navbar-actions">
          {/* Show token panel for all users */}
          <TokenPanel 
            tokenBalance={tokenBalance}
            onBalanceChange={onTokenBalanceChange}
            onShowGuestConversion={onShowGuestConversion}
          />
          
          {user ? (
            /* User is logged in - show user info and logout button */
            <div className="navbar-user">
              <div className={`user-avatar ${isGuest ? 'guest' : ''}`}>
                {user.displayName.charAt(0).toUpperCase()}
              </div>
              <div className="user-info">
                <span className="user-name">{user.displayName}</span>
                {isGuest && <span className="guest-badge">Guest</span>}
              </div>
              <button onClick={onLogout} className="logout-button" title="Logout">
                <FontAwesomeIcon icon={faSignOutAlt} />
              </button>
            </div>
          ) : (
            /* No user - show login button */
            <button 
              className="auth-button"
              onClick={onShowGuestConversion}
              title="Sign In or Create Account"
            >
              <FontAwesomeIcon icon={faSignInAlt} />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;