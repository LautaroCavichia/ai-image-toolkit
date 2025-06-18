// src/components/TokenPanel/TokenPanel.tsx
import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCoins,
  faSignInAlt,
  faUserPlus,
  faVideo,
  faArrowDown,
  faMagicWandSparkles as faSparkles,
  faCrown,
  faGift,
  faStar,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import { purchaseTokens, earnTokenFromAd } from '../../services/tokenService';
import { isGuestUser, getCurrentUser } from '../../services/authService';
import Card from '../shared/Card';
import './TokenPanel.css';

interface TokenPanelProps {
  tokenBalance: number;
  onBalanceChange: (newBalance: number) => void;
  onShowLogin?: () => void;
  onShowSignup?: () => void;
}

const TokenPanel: React.FC<TokenPanelProps> = ({ 
  tokenBalance, 
  onBalanceChange,
  onShowLogin,
  onShowSignup
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [isPurchasing, setPurchasing] = useState(false);
  const [isWatchingAd, setWatchingAd] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  
  const isGuest = isGuestUser();
  
  const tokenPackages = [
    {
      amount: 5,
      price: '$2.99',
      icon: faGift,
      label: 'Starter',
      popular: false,
      gradient: 'linear-gradient(135deg, #10b981, #059669)'
    },
    {
      amount: 20,
      price: '$9.99',
      icon: faStar,
      label: 'Popular',
      popular: true,
      gradient: 'linear-gradient(135deg, #3b82f6, #2563eb)'
    },
    {
      amount: 50,
      price: '$19.99',
      icon: faCrown,
      label: 'Pro',
      popular: false,
      gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)'
    }
  ];

  const handlePurchaseTokens = async (amount: number) => {
    if (isGuest) {
      setError('Please sign in to purchase tokens');
      return;
    }

    setError(null);
    setPurchasing(true);
    
    try {
      const success = await purchaseTokens(amount);
      if (success) {
        onBalanceChange(tokenBalance + amount);
        setShowDropdown(false);
      } else {
        setError('Failed to purchase tokens. Please try again.');
      }
    } catch (err) {
      console.error('Token purchase error:', err);
      setError('An error occurred while purchasing tokens.');
    } finally {
      setPurchasing(false);
    }
  };
  
  const handleWatchAd = async () => {
    if (isGuest) {
      setError('Please sign in to earn tokens');
      return;
    }

    setError(null);
    setWatchingAd(true);
    
    try {
      // Simulate ad watching
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const success = await earnTokenFromAd();
      if (success) {
        const userData = getCurrentUser();
        if (userData) {
          const updatedBalance = localStorage.getItem('tokenBalance');
          if (updatedBalance) {
            onBalanceChange(Number(updatedBalance));
          }
        }
        setShowDropdown(false);
      } else {
        setError('Failed to earn token. Please try again.');
      }
    } catch (err) {
      console.error('Watch ad error:', err);
      setError('An error occurred while processing the ad reward.');
    } finally {
      setWatchingAd(false);
    }
  };

  const toggleDropdown = () => {
    setError(null);
    setShowDropdown(!showDropdown);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  // Dropdown animations
  useEffect(() => {
    if (showDropdown && dropdownRef.current) {
      const ctx = gsap.context(() => {
        gsap.fromTo(dropdownRef.current, {
          opacity: 0,
          y: -10,
          scale: 0.95,
        }, {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.2,
          ease: "power2.out",
        });

        // Animate content elements
        gsap.fromTo(".dropdown-content > *", {
          opacity: 0,
          y: 10,
        }, {
          opacity: 1,
          y: 0,
          duration: 0.15,
          stagger: 0.03,
          delay: 0.1,
          ease: "power2.out",
        });
      }, dropdownRef);

      return () => ctx.revert();
    }
  }, [showDropdown]);

  return (
    <div ref={panelRef} className="token-panel">
      {/* Token Balance Button */}
      <button 
        className="token-balance-btn"
        onClick={toggleDropdown}
        title="Manage Tokens"
      >
        <div className="token-icon-wrapper">
          <FontAwesomeIcon icon={faCoins} className="token-icon" />
          <div className="token-sparkle">
            <FontAwesomeIcon icon={faSparkles} />
          </div>
        </div>
        <div className="token-content">
          <span className="token-count">{tokenBalance}</span>
          <span className="token-label">Tokens</span>
        </div>
        <FontAwesomeIcon 
          icon={faArrowDown} 
          className={`dropdown-icon ${showDropdown ? 'open' : ''}`} 
        />
      </button>
      
      {/* Dropdown */}
      {showDropdown && (
        <div ref={dropdownRef} className="token-dropdown">
          <Card variant="glass" className="dropdown-card">
            <div className="dropdown-content">
              {/* Header */}
              <div className="dropdown-header">
                <div className="balance-info">
                  <div className="balance-icon">
                    <FontAwesomeIcon icon={faCoins} />
                  </div>
                  <div className="balance-text">
                    <span className="balance-amount">{tokenBalance}</span>
                    <span className="balance-label">Tokens</span>
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="error-message">
                  <FontAwesomeIcon icon={faExclamationTriangle} />
                  <span>{error}</span>
                </div>
              )}

              {/* Guest User Actions */}
              {isGuest ? (
                <div className="auth-section">
                  <div className="auth-message">
                    <p>Sign in to get tokens</p>
                  </div>
                  <div className="auth-buttons">
                    <button 
                      className="auth-btn signin-btn"
                      onClick={() => {
                        onShowLogin?.();
                        setShowDropdown(false);
                      }}
                    >
                      <FontAwesomeIcon icon={faSignInAlt} />
                      Sign In
                    </button>
                    <button 
                      className="auth-btn signup-btn"
                      onClick={() => {
                        onShowSignup?.();
                        setShowDropdown(false);
                      }}
                    >
                      <FontAwesomeIcon icon={faUserPlus} />
                      Sign Up
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Watch Ad Section */}
                  <div className="watch-ad-section">
                    <button 
                      className="watch-ad-btn"
                      onClick={handleWatchAd}
                      disabled={isWatchingAd || isPurchasing}
                    >
                      <div className="ad-icon">
                        <FontAwesomeIcon icon={faVideo} />
                      </div>
                      <div className="ad-text">
                        <span className="ad-title">Watch Ad</span>
                        <span className="ad-reward">{isWatchingAd ? 'Playing...' : 'Earn 1 token'}</span>
                      </div>
                      {isWatchingAd && <div className="spinner" />}
                    </button>
                  </div>

                  {/* Purchase Section */}
                  <div className="purchase-section">
                    <div className="section-title">Token Packages</div>
                    <div className="packages-list">
                      {tokenPackages.map((pkg) => (
                        <button 
                          key={pkg.amount}
                          className={`package-item ${pkg.popular ? 'popular' : ''}`}
                          onClick={() => handlePurchaseTokens(pkg.amount)}
                          disabled={isPurchasing || isWatchingAd}
                        >
                          <div className="package-icon" style={{ background: pkg.gradient }}>
                            <FontAwesomeIcon icon={pkg.icon} />
                          </div>
                          <div className="package-details">
                            <div className="package-amount">{pkg.amount} tokens</div>
                            <div className="package-price">{pkg.price}</div>
                          </div>
                          {pkg.popular && <div className="popular-badge">Popular</div>}
                          {isPurchasing && <div className="spinner" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Usage Info */}
                  <div className="usage-section">
                    <div className="section-title">Token Usage</div>
                    <div className="usage-list">
                      <div className="usage-item">
                        <span className="service">Background Removal</span>
                        <span className="cost">1 token</span>
                      </div>
                      <div className="usage-item">
                        <span className="service">AI Upscaling</span>
                        <span className="cost">1 token</span>
                      </div>
                      <div className="usage-item">
                        <span className="service">Smart Enlarge</span>
                        <span className="cost">1 token</span>
                      </div>
                      <div className="usage-item">
                        <span className="service">Object Removal</span>
                        <span className="cost">1 token</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default TokenPanel;