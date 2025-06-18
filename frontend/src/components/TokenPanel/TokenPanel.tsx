import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCoins,
  faPlus,
  faVideo,
  faStar,
  faCrown,
  faGift,
  faSpinner,
  faChevronDown,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import { purchaseTokens, earnTokenFromAd } from '../../services/tokenService';
import { isGuestUser } from '../../services/authService';
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
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  
  const isGuest = isGuestUser();

  const tokenPackages = [
    {
      id: 'starter',
      tokens: 10,
      price: '$4.99',
      bonus: 0,
      icon: faGift,
      color: 'var(--success)',
      label: 'Starter'
    },
    {
      id: 'popular',
      tokens: 25,
      price: '$9.99',
      bonus: 5,
      icon: faStar,
      color: 'var(--accent-primary)',
      label: 'Popular',
      popular: true
    },
    {
      id: 'pro',
      tokens: 60,
      price: '$19.99',
      bonus: 15,
      icon: faCrown,
      color: 'var(--warning)',
      label: 'Pro'
    }
  ];

  const handleToggle = () => {
    if (isGuest) {
      onShowLogin?.();
      return;
    }
    setIsOpen(!isOpen);
    setError(null);
  };

  const handlePurchase = async (packageId: string) => {
    const pkg = tokenPackages.find(p => p.id === packageId);
    if (!pkg) return;

    setIsLoading(true);
    setError(null);
    
    try {
      const totalTokens = pkg.tokens + pkg.bonus;
      const success = await purchaseTokens(totalTokens);
      
      if (success) {
        onBalanceChange(tokenBalance + totalTokens);
        setIsOpen(false);
      } else {
        setError('Purchase failed. Please try again.');
      }
    } catch (err) {
      setError('An error occurred during purchase.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleWatchAd = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate ad watching
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const success = await earnTokenFromAd();
      if (success) {
        onBalanceChange(tokenBalance + 1);
        setIsOpen(false);
      } else {
        setError('Ad reward failed. Please try again.');
      }
    } catch (err) {
      setError('An error occurred while processing ad reward.');
    } finally {
      setIsLoading(false);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div ref={panelRef} className="token-panel-wrapper">
      <motion.button
        className={`token-panel-trigger ${isGuest ? 'guest' : ''}`}
        onClick={handleToggle}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="token-icon-container">
          <FontAwesomeIcon icon={faCoins} className="token-icon" />
          <motion.div 
            className="token-glow"
            animate={{ 
              opacity: [0.5, 1, 0.5],
              scale: [1, 1.1, 1] 
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut" 
            }}
          />
        </div>
        
        <div className="token-info">
          <span className="token-count">{tokenBalance}</span>
          <span className="token-label">Tokens</span>
        </div>

        {!isGuest && (
          <FontAwesomeIcon 
            icon={faChevronDown} 
            className={`chevron ${isOpen ? 'open' : ''}`}
          />
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && !isGuest && (
          <motion.div
            className="token-panel-dropdown"
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <div className="dropdown-header">
              <h3>Get More Tokens</h3>
              <p>Choose how you'd like to earn tokens</p>
            </div>

            {error && (
              <motion.div 
                className="error-notice"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <FontAwesomeIcon icon={faExclamationTriangle} />
                <span>{error}</span>
              </motion.div>
            )}

            {/* Watch Ad Section */}
            <div className="earn-section">
              <motion.button
                className="watch-ad-button"
                onClick={handleWatchAd}
                disabled={isLoading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="ad-icon">
                  <FontAwesomeIcon icon={isLoading ? faSpinner : faVideo} 
                    className={isLoading ? 'spinning' : ''} />
                </div>
                <div className="ad-content">
                  <span className="ad-title">
                    {isLoading ? 'Processing...' : 'Watch Ad'}
                  </span>
                  <span className="ad-reward">Earn 1 free token</span>
                </div>
              </motion.button>
            </div>

            {/* Purchase Packages */}
            <div className="purchase-section">
              <h4>Token Packages</h4>
              <div className="packages-grid">
                {tokenPackages.map((pkg, index) => (
                  <motion.button
                    key={pkg.id}
                    className={`package-card ${pkg.popular ? 'popular' : ''}`}
                    onClick={() => handlePurchase(pkg.id)}
                    disabled={isLoading}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {pkg.popular && (
                      <div className="popular-badge">Most Popular</div>
                    )}
                    
                    <div className="package-icon" style={{ color: pkg.color }}>
                      <FontAwesomeIcon icon={pkg.icon} />
                    </div>
                    
                    <div className="package-info">
                      <div className="package-tokens">
                        {pkg.tokens} tokens
                        {pkg.bonus > 0 && (
                          <span className="bonus">+{pkg.bonus} bonus</span>
                        )}
                      </div>
                      <div className="package-price">{pkg.price}</div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Usage Info */}
            <div className="usage-info">
              <h4>Token Usage</h4>
              <div className="usage-list">
                <div className="usage-item">
                  <span>Background Removal</span>
                  <span>1 token</span>
                </div>
                <div className="usage-item">
                  <span>AI Upscaling (Premium)</span>
                  <span>1 token</span>
                </div>
                <div className="usage-item">
                  <span>Image Enlargement (Premium)</span>
                  <span>1 token</span>
                </div>
                <div className="usage-item">
                  <span>Object Removal (Premium)</span>
                  <span>1 token</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TokenPanel;