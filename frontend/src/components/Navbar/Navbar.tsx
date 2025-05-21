// src/components/Navbar/Navbar.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt, faUserPlus } from '@fortawesome/free-solid-svg-icons';
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
          {isGuest && (
            <button 
              className="create-account-button"
              onClick={onShowGuestConversion}
            >
              <FontAwesomeIcon icon={faUserPlus} />
              <span>Create Account</span>
            </button>
          )}
          
          <TokenPanel 
            tokenBalance={tokenBalance}
            onBalanceChange={onTokenBalanceChange}
            onShowGuestConversion={onShowGuestConversion}
          />
        </div>
        
        <div className="navbar-user">
          {user && (
            <>
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
            </>
          )}
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;