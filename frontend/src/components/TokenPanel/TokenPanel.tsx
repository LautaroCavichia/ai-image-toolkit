// src/components/TokenPanel/TokenPanel.tsx

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCoins, 
  faShoppingCart, 
  faVideo,
  faArrowDown
} from '@fortawesome/free-solid-svg-icons';
import { purchaseTokens, earnTokenFromAd } from '../../services/tokenService';
import { isGuestUser } from '../../services/authService';
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
      // Simulate ad playback
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const success = await earnTokenFromAd();
      if (success) {
        onBalanceChange(tokenBalance + 1);
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
  
  return (
    <div className="token-panel">
      <button 
        className="token-balance-button"
        onClick={toggleOptions}
      >
        <FontAwesomeIcon icon={faCoins} className="token-icon" />
        <span>{tokenBalance} Tokens</span>
        <FontAwesomeIcon 
          icon={faArrowDown} 
          className={`dropdown-icon ${showOptions ? 'open' : ''}`} 
        />
      </button>
      
      <AnimatePresence>
        {showOptions && (
          <motion.div 
            className="token-options"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <h3 className="options-title">Get More Tokens</h3>
            
            {error && (
              <motion.div 
                className="token-error-message"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {error}
              </motion.div>
            )}
            
            <div className="token-actions">
              <button 
                className="token-action-button purchase"
                onClick={() => handlePurchaseTokens(5)}
                disabled={isPurchasing || isWatchingAd}
              >
                <FontAwesomeIcon icon={faShoppingCart} />
                <span>
                  {isPurchasing ? 'Processing...' : 'Buy 5 Tokens'}
                </span>
              </button>
              
              <button 
                className="token-action-button watch-ad"
                onClick={handleWatchAd}
                disabled={isPurchasing || isWatchingAd}
              >
                <FontAwesomeIcon icon={faVideo} />
                <span>
                  {isWatchingAd ? 'Watching Ad...' : 'Watch Ad for 1 Token'}
                </span>
              </button>
            </div>
            
            <div className="token-info">
              <p>Tokens are used for premium quality downloads</p>
              <ul className="token-costs">
                <li>Background Removal: 1 token</li>
                <li>Upscaling: 1 tokens</li>
                <li>Enlargement: 1 tokens</li>
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TokenPanel;