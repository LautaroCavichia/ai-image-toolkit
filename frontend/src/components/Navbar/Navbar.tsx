// src/components/Navbar/Navbar.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import './Navbar.css';

interface NavbarProps {
  user: { userId: string; email: string; displayName: string } | null;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onLogout }) => {
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
        
        <div className="navbar-user">
          {user && (
            <>
              <div className="user-avatar">
                {user.displayName.charAt(0).toUpperCase()}
              </div>
              <span className="user-name">{user.displayName}</span>
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
