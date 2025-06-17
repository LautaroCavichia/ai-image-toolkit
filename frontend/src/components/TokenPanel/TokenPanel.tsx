// src/components/TokenPanel/TokenPanel.tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCoins, 
  faShoppingCart, 
  faVideo,
  faArrowDown,
  faMagicWandSparkles as faSparkles,
  faCrown,
  faGift,
  faStar
} from '@fortawesome/free-solid-svg-icons';
import { purchaseTokens, earnTokenFromAd } from '../../services/tokenService';
import { isGuestUser, getCurrentUser } from '../../services/authService';
import Card from '../shared/Card';
import './TokenPanel.css';


interface TokenPanelProps {
  tokenBalance: number;
  onBalanceChange: (newBalance: number) => void;
  onShowGuestConversion?: () => void;
}

const TokenPanel: React.FC<TokenPanelProps> = ({ 
  tokenBalance, 
  onBalanceChange,
  onShowGuestConversion
}) => {
  const [showOptions, setShowOptions] = useState(false);
  const [isPurchasing, setPurchasing] = useState(false);
  const [isWatchingAd, setWatchingAd] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const toggleOptions = () => setShowOptions(prev => !prev);
  
  const handlePurchaseTokens = async (amount: number) => {
    setError(null);
    setPurchasing(true);
    
    try {
      const isGuest = isGuestUser();
      
      // If guest user, prompt to create an account first
      if (isGuest && onShowGuestConversion) {
        onShowGuestConversion();
        setPurchasing(false);
        setShowOptions(false);
        return;
      }
      
      const success = await purchaseTokens(amount);
      if (success) {
        onBalanceChange(tokenBalance + amount);
        setShowOptions(false);
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
  setError(null);
  setWatchingAd(true);
  
  try {
    // Simular anuncio
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const success = await earnTokenFromAd();
    if (success) {
      const userData = getCurrentUser();
      if (userData) {
        // Traer balance actualizado desde localStorage o response de earnTokenFromAd
        const updatedBalance = localStorage.getItem('tokenBalance');
        if (updatedBalance) {
          onBalanceChange(Number(updatedBalance)); // actualizar estado padre/UI
        }
      }
      setShowOptions(false);
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

  
  const tokenPackages = [
    {
      amount: 5,
      price: '$2.99',
      icon: faGift,
      label: 'Starter Pack',
      popular: false
    },
    {
      amount: 20,
      price: '$9.99',
      icon: faStar,
      label: 'Popular Pack',
      popular: true
    },
    {
      amount: 50,
      price: '$19.99',
      icon: faCrown,
      label: 'Pro Pack',
      popular: false
    }
  ];

  return (
    <div className="token-panel">
      {/* Token Balance Button */}
      <motion.button 
        className="token-balance-button"
        onClick={toggleOptions}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="token-icon-wrapper">
          <FontAwesomeIcon icon={faCoins} className="token-icon" />
          <motion.div 
            className="token-sparkle"
            animate={{ 
              opacity: [0.4, 1, 0.4],
              scale: [0.8, 1.2, 0.8]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <FontAwesomeIcon icon={faSparkles} />
          </motion.div>
        </div>
        <div className="token-balance-content">
          <span className="token-count">{tokenBalance}</span>
          <span className="token-label">Tokens</span>
        </div>
        <FontAwesomeIcon 
          icon={faArrowDown} 
          className={`dropdown-icon ${showOptions ? 'open' : ''}`} 
        />
      </motion.button>
      
      {/* Token Options Dropdown */}
      <AnimatePresence>
        {showOptions && (
          <>
            {/* Backdrop */}
            <motion.div 
              className="token-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowOptions(false)}
            />
            
            {/* Options Panel */}
            <motion.div 
              className="token-options"
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ 
                type: "spring", 
                stiffness: 300, 
                damping: 25 
              }}
            >
              <Card variant="glass" padding="lg" className="token-options-card">
                {/* Header */}
                <div className="token-options-header">
                  <h3 className="options-title">
                    <FontAwesomeIcon icon={faCoins} />
                    Get More Tokens
                  </h3>
                  <p className="options-subtitle">
                    Unlock premium features and high-quality downloads
                  </p>
                </div>
                
                {/* Error Message */}
                {error && (
                  <motion.div 
                    className="token-error-message"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <Card variant="glass" padding="sm" className="error-card">
                      {error}
                    </Card>
                  </motion.div>
                )}
                
                {/* Watch Ad Option */}
                <motion.div 
                  className="watch-ad-section"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Card variant="glass" padding="md" className="watch-ad-card">
                    <button 
                      className="watch-ad-button"
                      onClick={handleWatchAd}
                      disabled={isPurchasing || isWatchingAd}
                    >
                      <div className="watch-ad-icon">
                        <FontAwesomeIcon icon={faVideo} />
                      </div>
                      <div className="watch-ad-content">
                        <h4>Earn 1 Free Token</h4>
                        <p>{isWatchingAd ? 'Watching Ad...' : 'Watch a short video'}</p>
                      </div>
                      {isWatchingAd && (
                        <motion.div 
                          className="loading-spinner"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                      )}
                    </button>
                  </Card>
                </motion.div>
                
                {/* Purchase Options */}
                <div className="purchase-section">
                  <h4 className="purchase-title">Token Packages</h4>
                  <div className="token-packages">
                    {tokenPackages.map((pkg, index) => (
                      <motion.div
                        key={pkg.amount}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + (index * 0.1) }}
                      >
                        <Card 
                          variant="glass" 
                          padding="md" 
                          hover
                          className={`token-package ${pkg.popular ? 'popular' : ''}`}
                        >
                          {pkg.popular && (
                            <div className="popular-badge">
                              <FontAwesomeIcon icon={faStar} />
                              Most Popular
                            </div>
                          )}
                          
                          <button 
                            className="package-button"
                            onClick={() => handlePurchaseTokens(pkg.amount)}
                            disabled={isPurchasing || isWatchingAd}
                          >
                            <div className="package-icon">
                              <FontAwesomeIcon icon={pkg.icon} />
                            </div>
                            <div className="package-content">
                              <div className="package-amount">{pkg.amount} Tokens</div>
                              <div className="package-label">{pkg.label}</div>
                              <div className="package-price">{pkg.price}</div>
                            </div>
                            {isPurchasing && (
                              <motion.div 
                                className="loading-spinner"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              />
                            )}
                          </button>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </div>
                
                {/* Token Usage Info */}
                <motion.div 
                  className="token-info"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <Card variant="glass" padding="sm" className="usage-info-card">
                    <h5 className="usage-title">Token Usage</h5>
                    <div className="usage-list">
                      <div className="usage-item">
                        <FontAwesomeIcon icon={faCoins} />
                        <span>Background Removal: 1 token</span>
                      </div>
                      <div className="usage-item">
                        <FontAwesomeIcon icon={faCoins} />
                        <span>AI Upscaling: 1 token</span>
                      </div>
                      <div className="usage-item">
                        <FontAwesomeIcon icon={faCoins} />
                        <span>Smart Enlarge: 1 token</span>
                      </div>
                      <div className="usage-item">
                        <FontAwesomeIcon icon={faCoins} />
                        <span>Object Removal: 1 token</span>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TokenPanel;