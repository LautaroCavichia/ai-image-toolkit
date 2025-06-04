// src/components/Login/Login.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock, faUserCheck } from '@fortawesome/free-solid-svg-icons';
import { login, createTestUser } from '../../services/authService';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import './Login.css';

interface LoginProps {
 onLoginSuccess: (type?: 'login' | 'guest') => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);


const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!email || !password) {
    setError('Email and password are required');
    return;
  }

  setIsLoading(true);
  setError(null);

  try {
    await login({ email, password });
    onLoginSuccess('login');  // <-- PASÁ 'login' para indicar login real
  } catch (err: any) {
    console.error('Login error:', err);
    setError(err.response?.data || 'Failed to log in. Please check your credentials.');
  } finally {
    setIsLoading(false);
  }
};

  const handleTestUserLogin = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await createTestUser();
      onLoginSuccess('login');
    } catch (err: any) {
      console.error('Test user creation error:', err);
      setError(err.response?.data || 'Failed to create test user.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <motion.div 
        className="glass-card login-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <div className="login-header">
          <h1>Welcome</h1>
          <p>Sign in to use the AI Image Toolkit</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <div className="input-icon">
              <FontAwesomeIcon icon={faEnvelope} />
            </div>
            <input
              type="email"
              id="email"
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

          <motion.button
            type="submit"
            className="login-button"
            disabled={isLoading}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </motion.button>
        </form>

        <div className="login-divider">
          <span>OR</span>
        </div>

        <motion.button
          type="button"
          onClick={handleTestUserLogin}
          className="test-user-button"
          disabled={isLoading}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <FontAwesomeIcon icon={faUserCheck} className="button-icon" />
          <span>Use Test Account</span>
        </motion.button>
      </motion.div>
    </div>
  );
};

export default Login;