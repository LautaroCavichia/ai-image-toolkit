// src/components/GuestConversion/GuestConversion.tsx - Updated messaging
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserPlus, faEnvelope, faLock, faUser, faSignInAlt,faEyeSlash,faEye } from '@fortawesome/free-solid-svg-icons';
import { convertGuestToRegistered, login, storeUserData } from '../../services/authService';
import './GuestConversion.css';



interface GuestConversionProps {
  userId: string;
  onConversionSuccess: () => void;
  onCancel: () => void;
}

const GuestConversion: React.FC<GuestConversionProps> = ({ userId, onConversionSuccess, onCancel }) => {
  const [mode, setMode] = useState<'signup' | 'login'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);


  const handleSignup = async (e: React.FormEvent) => {
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
        setError('Failed to create account. Email may already be in use.');
      }
    } catch (err: any) {
      console.error('Signup error:', err);
      setError(err.response?.data || 'Failed to create account.');
    } finally {
      setIsLoading(false);
    }
  };

const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!email || !password) {
    setError('Email and password are required');
    return;
  }

  setIsLoading(true);
  setError(null);

  // Timeout de respaldo para evitar bloqueo indefinido
  const timeoutId = setTimeout(() => {
    setIsLoading(false);
    setError('Request timeout. Please try again.');
  }, 15000); // 15 segundos

  try {
    const authData = await login({ email, password });

    clearTimeout(timeoutId); // Cancelar timeout si el login fue exitoso

    try {
      storeUserData(authData);
      onConversionSuccess();
    } catch (storageError) {
      setError('Failed to save user data. Please try again.');
    }

  } catch (err: any) {
    clearTimeout(timeoutId); // Cancelar timeout si hay error
    setError(err.message || 'Login failed. Please try again.');
  } finally {
    setIsLoading(false);
  }
};


  return (
    <div className="guest-conversion-container">
      <div className="conversion-header">
        <h2>{mode === 'signup' ? 'Create Your Account' : 'Welcome Back'}</h2>
        <p>
          {mode === 'signup' 
            ? 'Unlock premium features and save your work' 
            : 'Sign in to access your account'
          }
        </p>
      </div>

      <div className="conversion-mode-toggle">
        <button
          className={`mode-button ${mode === 'signup' ? 'active' : ''}`}
          onClick={() => setMode('signup')}
        >
          Create Account
        </button>
        <button
          className={`mode-button ${mode === 'login' ? 'active' : ''}`}
          onClick={() => setMode('login')}
        >
          Sign In
        </button>
      </div>
<form 
  onSubmit={async (e) => {
    e.preventDefault();
    try {
      if (mode === 'signup') {
        await handleSignup(e);
      } else {
        await handleLogin(e);
      }
    } catch (err) {
      console.error('Unexpected form error:', err);
      setError('Unexpected error occurred');
    }
  }} 
  className="conversion-form"
>
  {mode === 'signup' && (
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
  )}

        
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
    type={showPassword ? "text" : "password"}
    id="password"
    placeholder="Password"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    disabled={isLoading}
  />
  <button
    type="button"
    onClick={() => setShowPassword(!showPassword)}
    className="toggle-password-visibility"
    aria-label={showPassword ? "Hide password" : "Show password"}
  >
    <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
  </button>
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
            Maybe Later
          </button>
          
          <motion.button
            type="submit"
            className="conversion-button"
            disabled={isLoading}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <FontAwesomeIcon 
              icon={mode === 'signup' ? faUserPlus : faSignInAlt} 
              className="button-icon" 
            />
            {isLoading 
              ? (mode === 'signup' ? 'Creating Account...' : 'Signing In...') 
              : (mode === 'signup' ? 'Create Account' : 'Sign In')
            }
          </motion.button>
        </div>
      </form>
      
      {mode === 'signup' && (
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
          <div className="benefit-item">
            <span className="benefit-icon">✓</span>
            <span>Access 30-day processing history</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuestConversion;