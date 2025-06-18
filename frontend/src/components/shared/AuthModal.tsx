// src/components/shared/AuthModal.tsx
import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTimes,
  faSignInAlt,
  faUserPlus,
  faEye,
  faEyeSlash,
  faEnvelope,
  faLock,
  faUser,
  faExclamationTriangle,
  faSpinner
} from '@fortawesome/free-solid-svg-icons';
import { faGoogle, faGithub } from '@fortawesome/free-brands-svg-icons';
import Card from './Card';
import './AuthModal.css';

type AuthMode = 'signin' | 'signup';

interface AuthModalProps {
  isOpen: boolean;
  mode: AuthMode;
  onClose: () => void;
  onSwitchMode: (mode: AuthMode) => void;
  onAuthSuccess?: (user: any) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  mode,
  onClose,
  onSwitchMode,
  onAuthSuccess
}) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const modalRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  // Reset form when mode changes
  useEffect(() => {
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: ''
    });
    setError(null);
    setShowPassword(false);
    setShowConfirmPassword(false);
  }, [mode]);

  // Modal animations
  useEffect(() => {
    if (isOpen && modalRef.current && backdropRef.current) {
      const ctx = gsap.context(() => {
        // Set initial states
        gsap.set([backdropRef.current, modalRef.current], {
          opacity: 0,
        });
        gsap.set(modalRef.current, {
          scale: 0.9,
          y: 20,
        });

        // Entrance animation
        const tl = gsap.timeline();
        tl.to(backdropRef.current, {
          opacity: 1,
          duration: 0.2,
          ease: "power2.out",
        })
        .to(modalRef.current, {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.3,
          ease: "back.out(1.7)",
        }, "-=0.1");

        // Animate form elements
        gsap.fromTo(".auth-form > *", {
          opacity: 0,
          y: 15,
        }, {
          opacity: 1,
          y: 0,
          duration: 0.2,
          stagger: 0.05,
          delay: 0.3,
          ease: "power2.out",
        });
      }, modalRef);

      return () => ctx.revert();
    }
  }, [isOpen, mode]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setError('Please fill in all required fields');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }

    if (mode === 'signup') {
      if (!formData.firstName || !formData.lastName) {
        setError('Please fill in all required fields');
        return false;
      }
      
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock successful auth
      const mockUser = {
        id: '1',
        email: formData.email,
        firstName: formData.firstName || 'User',
        lastName: formData.lastName || '',
        tokenBalance: mode === 'signup' ? 5 : 10 // Welcome bonus for new users
      };

      // Store user data (in real app, this would be handled by auth service)
      localStorage.setItem('user', JSON.stringify(mockUser));
      localStorage.setItem('tokenBalance', mockUser.tokenBalance.toString());
      
      onAuthSuccess?.(mockUser);
      onClose();
    } catch (err) {
      setError('Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialAuth = async (provider: 'google' | 'github') => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate social auth
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockUser = {
        id: '1',
        email: `user@${provider}.com`,
        firstName: 'User',
        lastName: '',
        tokenBalance: 10
      };

      localStorage.setItem('user', JSON.stringify(mockUser));
      localStorage.setItem('tokenBalance', mockUser.tokenBalance.toString());
      
      onAuthSuccess?.(mockUser);
      onClose();
    } catch (err) {
      setError(`${provider} authentication failed. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  const closeModal = () => {
    if (modalRef.current && backdropRef.current) {
      const tl = gsap.timeline({
        onComplete: onClose
      });
      
      tl.to(modalRef.current, {
        opacity: 0,
        scale: 0.9,
        y: 20,
        duration: 0.2,
        ease: "power2.in",
      })
      .to(backdropRef.current, {
        opacity: 0,
        duration: 0.15,
        ease: "power2.out",
      }, "-=0.1");
    } else {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        ref={backdropRef}
        className="auth-backdrop"
        onClick={closeModal}
      />
      
      {/* Modal */}
      <div 
        ref={modalRef}
        className="auth-modal"
      >
        <Card variant="glass" className="auth-card">
          <div className="auth-content">
            {/* Header */}
            <div className="auth-header">
              <div className="auth-title-section">
                <FontAwesomeIcon 
                  icon={mode === 'signin' ? faSignInAlt : faUserPlus} 
                  className="auth-icon" 
                />
                <h2 className="auth-title">
                  {mode === 'signin' ? 'Welcome Back' : 'Create Account'}
                </h2>
              </div>
              <button 
                className="auth-close-btn"
                onClick={closeModal}
                title="Close"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            <p className="auth-subtitle">
              {mode === 'signin' 
                ? 'Sign in to your account to access premium features' 
                : 'Join thousands of users creating amazing images with AI'
              }
            </p>

            {/* Error Message */}
            {error && (
              <div className="auth-error">
                <FontAwesomeIcon icon={faExclamationTriangle} />
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form className="auth-form" onSubmit={handleSubmit}>
              {/* Name fields for signup */}
              {mode === 'signup' && (
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="firstName" className="form-label">First Name</label>
                    <div className="input-wrapper">
                      <FontAwesomeIcon icon={faUser} className="input-icon" />
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        className="form-input"
                        placeholder="Enter your first name"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        disabled={isLoading}
                        required
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="lastName" className="form-label">Last Name</label>
                    <div className="input-wrapper">
                      <FontAwesomeIcon icon={faUser} className="input-icon" />
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        className="form-input"
                        placeholder="Enter your last name"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        disabled={isLoading}
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Email */}
              <div className="form-group">
                <label htmlFor="email" className="form-label">Email Address</label>
                <div className="input-wrapper">
                  <FontAwesomeIcon icon={faEnvelope} className="input-icon" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="form-input"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="form-group">
                <label htmlFor="password" className="form-label">Password</label>
                <div className="input-wrapper">
                  <FontAwesomeIcon icon={faLock} className="input-icon" />
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    className="form-input"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                  </button>
                </div>
              </div>

              {/* Confirm Password for signup */}
              {mode === 'signup' && (
                <div className="form-group">
                  <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                  <div className="input-wrapper">
                    <FontAwesomeIcon icon={faLock} className="input-icon" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      id="confirmPassword"
                      name="confirmPassword"
                      className="form-input"
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      disabled={isLoading}
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      title={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                      <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
                    </button>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button 
                type="submit" 
                className="auth-submit-btn"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} className="spinner" />
                    <span>{mode === 'signin' ? 'Signing In...' : 'Creating Account...'}</span>
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={mode === 'signin' ? faSignInAlt : faUserPlus} />
                    <span>{mode === 'signin' ? 'Sign In' : 'Create Account'}</span>
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="auth-divider">
              <span>or continue with</span>
            </div>

            {/* Social Auth */}
            <div className="social-auth">
              <button 
                className="social-btn google-btn"
                onClick={() => handleSocialAuth('google')}
                disabled={isLoading}
              >
                <FontAwesomeIcon icon={faGoogle} />
                <span>Google</span>
              </button>
              <button 
                className="social-btn github-btn"
                onClick={() => handleSocialAuth('github')}
                disabled={isLoading}
              >
                <FontAwesomeIcon icon={faGithub} />
                <span>GitHub</span>
              </button>
            </div>

            {/* Switch Mode */}
            <div className="auth-switch">
              <span>
                {mode === 'signin' ? "Don't have an account?" : "Already have an account?"}
              </span>
              <button 
                type="button"
                className="switch-btn"
                onClick={() => onSwitchMode(mode === 'signin' ? 'signup' : 'signin')}
                disabled={isLoading}
              >
                {mode === 'signin' ? 'Sign Up' : 'Sign In'}
              </button>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
};

export default AuthModal;