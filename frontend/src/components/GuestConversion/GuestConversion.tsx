// src/components/GuestConversion/GuestConversion.tsx

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserPlus, faEnvelope, faLock, faUser } from '@fortawesome/free-solid-svg-icons';
import { convertGuestToRegistered } from '../../services/authService';
import './GuestConversion.css';

interface GuestConversionProps {
  userId: string;
  onConversionSuccess: () => void;
  onCancel: () => void;
}

const GuestConversion: React.FC<GuestConversionProps> = ({ userId, onConversionSuccess, onCancel }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !displayName) {
      setError('All fields are required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const success = await convertGuestToRegistered(userId, email, password, displayName);
      if (success) {
        onConversionSuccess();
      } else {
        setError('Failed to convert account. Email may already be in use.');
      }
    } catch (err: any) {
      console.error('Conversion error:', err);
      setError(err.response?.data || 'Failed to convert account.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="guest-conversion-overlay">
      <motion.div 
        className="glass-card guest-conversion-card"
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <button className="close-button" onClick={onCancel}>×</button>
        
        <div className="conversion-header">
          <h2>Create Your Account</h2>
          <p>Save your work and unlock premium features</p>
        </div>

        <form onSubmit={handleSubmit} className="conversion-form">
          <div className="form-group">
            <div className="input-icon">
              <FontAwesomeIcon icon={faUser} />
            </div>
            <input
              type="text"
              placeholder="Display Name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              disabled={isLoading}
            />
          </div>
          
          <div className="form-group">
            <div className="input-icon">
              <FontAwesomeIcon icon={faEnvelope} />
            </div>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <div className="input-icon">
              <FontAwesomeIcon icon={faLock} />
            </div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {error && (
            <motion.div 
              className="error-message"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {error}
            </motion.div>
          )}

          <div className="conversion-actions">
            <button
              type="button"
              className="cancel-button"
              onClick={onCancel}
              disabled={isLoading}
            >
              Not Now
            </button>
            
            <motion.button
              type="submit"
              className="conversion-button"
              disabled={isLoading}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <FontAwesomeIcon icon={faUserPlus} className="button-icon" />
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </motion.button>
          </div>
        </form>
        
        <div className="conversion-benefits">
          <div className="benefit-item">
            <span className="benefit-icon">✓</span>
            <span>Save your image processing history</span>
          </div>
          <div className="benefit-item">
            <span className="benefit-icon">✓</span>
            <span>Download high-resolution results</span>
          </div>
          <div className="benefit-item">
            <span className="benefit-icon">✓</span>
            <span>Earn and manage tokens more easily</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default GuestConversion;