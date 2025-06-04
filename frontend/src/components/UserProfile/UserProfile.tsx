// src/components/UserProfile/UserProfile.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, 
  faCoins, 
  faHistory, 
  faCalendarAlt,
  faImage,
  faDownload,
  faShoppingCart,
  faVideo,
  faRefresh,
  faEnvelope,
  faCrown
} from '@fortawesome/free-solid-svg-icons';

import { purchaseTokens, earnTokenFromAd } from '../../services/tokenService';
import { JobResponseDTO, JobStatusEnum } from '../../types';
import './UserProfile.css';
import { getUserHistory } from '../../services/historyService';

interface UserProfileProps {
  user: { userId: string; email?: string; displayName: string; isGuest?: boolean } | null;
  tokenBalance: number;
  onTokenBalanceChange: (newBalance: number) => void;
  onClose: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ 
  user, 
  tokenBalance, 
  onTokenBalanceChange, 
  onClose 
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'history' | 'tokens'>('profile');
  const [jobHistory, setJobHistory] = useState<JobResponseDTO[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [isPurchasing, setPurchasing] = useState(false);
  const [isWatchingAd, setWatchingAd] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);

  useEffect(() => {
    if (activeTab === 'history' && user && !user.isGuest) {
      loadUserHistory();
    }
  }, [activeTab, user]);

  const loadUserHistory = async () => {
    if (!user) return;
    
    setIsLoadingHistory(true);
    setHistoryError(null);
    
    try {
      const history = await getUserHistory();
      setJobHistory(history);
    } catch (error: any) {
      console.error('Failed to load user history:', error);
      setHistoryError('Failed to load history. Please try again.');
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handlePurchaseTokens = async (amount: number) => {
    setTokenError(null);
    setPurchasing(true);
    
    try {
      const success = await purchaseTokens(amount);
      if (success) {
        onTokenBalanceChange(tokenBalance + amount);
      } else {
        setTokenError('Failed to purchase tokens. Please try again.');
      }
    } catch (err) {
      console.error('Token purchase error:', err);
      setTokenError('An error occurred while purchasing tokens.');
    } finally {
      setPurchasing(false);
    }
  };

  const handleWatchAd = async () => {
    setTokenError(null);
    setWatchingAd(true);
    
    try {
      // Simulate ad playback
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const success = await earnTokenFromAd();
      if (success) {
        onTokenBalanceChange(tokenBalance + 1);
      } else {
        setTokenError('Failed to earn token. Please try again.');
      }
    } catch (err) {
      console.error('Watch ad error:', err);
      setTokenError('An error occurred while processing the ad reward.');
    } finally {
      setWatchingAd(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: JobStatusEnum) => {
    switch (status) {
      case JobStatusEnum.COMPLETED:
        return 'var(--success)';
      case JobStatusEnum.FAILED:
        return 'var(--error)';
      case JobStatusEnum.PROCESSING:
        return 'var(--warning)';
      default:
        return 'var(--text-muted)';
    }
  };

  if (!user) {
    return (
      <div className="user-profile">
        <div className="profile-error">
          <p>User data not available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="user-profile">
      <div className="profile-header">
        <div className="profile-avatar">
          <FontAwesomeIcon icon={faUser} />
        </div>
        <div className="profile-info">
          <h2 className="profile-name">{user.displayName}</h2>
          {user.email && <p className="profile-email">{user.email}</p>}
          {user.isGuest 
          ? <span className="guest-badge">Guest Account</span> 
          : <span className="guest-badge">Registered</span>}
        </div>
      </div>

      <div className="profile-tabs">
        <button
          className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          <FontAwesomeIcon icon={faUser} />
          <span>Profile</span>
        </button>
        <button
          className={`tab-button ${activeTab === 'tokens' ? 'active' : ''}`}
          onClick={() => setActiveTab('tokens')}
        >
          <FontAwesomeIcon icon={faCoins} />
          <span>Tokens</span>
        </button>
        {!user.isGuest && (
          <button
            className={`tab-button ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            <FontAwesomeIcon icon={faHistory} />
            <span>History</span>
          </button>
        )}
      </div>

      <div className="profile-content">
        {activeTab === 'profile' && (
          <motion.div 
            className="profile-tab-content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h3>Account Information</h3>
            <div className="profile-details">
              <div className="detail-item">
                <FontAwesomeIcon icon={faUser} className="detail-icon" />
                <div className="detail-content">
                  <label>Display Name</label>
                  <span>{user.displayName}</span>
                </div>
              </div>
              {user.email && (
                <div className="detail-item">
                  <FontAwesomeIcon icon={faEnvelope} className="detail-icon" />
                  <div className="detail-content">
                    <label>Email</label>
                    <span>{user.email}</span>
                  </div>
                </div>
              )}
              <div className="detail-item">
                <FontAwesomeIcon icon={faCoins} className="detail-icon" />
                <div className="detail-content">
                  <label>Token Balance</label>
                  <span className="token-balance">{tokenBalance} tokens</span>
                </div>
              </div>
            </div>
            
            {user.isGuest && (
              <div className="guest-notice">
                <h4>Guest Account Limitations</h4>
                <p>
                  As a guest, your processing history is not saved. 
                  Create an account to access your 30-day history and enjoy additional benefits!
                </p>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'tokens' && (
          <motion.div 
            className="profile-tab-content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h3>Token Management</h3>
            <div className="token-balance-display">
              <FontAwesomeIcon icon={faCoins} className="token-icon" />
              <span className="balance-number">{tokenBalance}</span>
              <span className="balance-label">Tokens Available</span>
            </div>

            {tokenError && (
              <div className="token-error">
                {tokenError}
              </div>
            )}

            <div className="token-actions">
              <h4>Get More Tokens</h4>
              <div className="token-purchase-options">
                <button 
                  className="token-purchase-btn primary"
                  onClick={() => handlePurchaseTokens(5)}
                  disabled={isPurchasing || isWatchingAd}
                >
                  <FontAwesomeIcon icon={faShoppingCart} />
                  <span>{isPurchasing ? 'Processing...' : 'Buy 5 Tokens ($2.99)'}</span>
                </button>
                
                <button 
                  className="token-purchase-btn secondary"
                  onClick={() => handlePurchaseTokens(15)}
                  disabled={isPurchasing || isWatchingAd}
                >
                  <FontAwesomeIcon icon={faShoppingCart} />
                  <span>{isPurchasing ? 'Processing...' : 'Buy 15 Tokens ($7.99)'}</span>
                </button>
                
                <button 
                  className="token-purchase-btn ad"
                  onClick={handleWatchAd}
                  disabled={isPurchasing || isWatchingAd}
                >
                  <FontAwesomeIcon icon={faVideo} />
                  <span>{isWatchingAd ? 'Watching Ad...' : 'Watch Ad for 1 Token'}</span>
                </button>
              </div>
            </div>

            <div className="token-usage-info">
              <h4>Token Usage</h4>
              <ul>
                <li>Background Removal: 1 token for HD quality</li>
                <li>Image Upscaling: 1 token for HD quality</li>
                <li>Image Enlargement: 1 token for HD quality</li>
              </ul>
            </div>
          </motion.div>
        )}

        {activeTab === 'history' && !user.isGuest && (
          <motion.div 
            className="profile-tab-content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="history-header">
              <h3>Processing History</h3>
              <button 
                className="refresh-btn"
                onClick={loadUserHistory}
                disabled={isLoadingHistory}
              >
                <FontAwesomeIcon icon={faRefresh} className={isLoadingHistory ? 'spinning' : ''} />
              </button>
            </div>

            {isLoadingHistory && (
              <div className="loading-state">
                <FontAwesomeIcon icon={faRefresh} className="spinning" />
                <span>Loading history...</span>
              </div>
            )}

            {historyError && (
              <div className="history-error">
                {historyError}
              </div>
            )}

            {!isLoadingHistory && !historyError && (
              <div className="history-list">
                {jobHistory.length === 0 ? (
                  <div className="empty-history">
                    <FontAwesomeIcon icon={faHistory} />
                    <p>No processing history found</p>
                    <span>Start processing images to see your history here</span>
                  </div>
                ) : (
                  jobHistory.map((job) => (
                    <motion.div 
                      key={job.jobId} 
                      className="history-item"
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="history-item-header">
                        <div className="job-type">
                          <FontAwesomeIcon icon={faImage} />
                          <span>{job.jobType.replace('_', ' ')}</span>
                        </div>
                        <div 
                          className="job-status"
                          style={{ color: getStatusColor(job.status) }}
                        >
                          {job.status}
                        </div>
                      </div>
                      
                      <div className="history-item-details">
                        <div className="job-date">
                          <FontAwesomeIcon icon={faCalendarAlt} />
                          <span>{formatDate(job.createdAt)}</span>
                        </div>
                        
                        {job.status === JobStatusEnum.COMPLETED && (
                          <div className="job-actions">
                            {job.isPremiumQuality && job.processedImageUrl && (
                              <a 
                                href={job.processedImageUrl} 
                                download 
                                className="download-link premium"
                                target="_blank" 
                                rel="noopener noreferrer"
                              >
                                <FontAwesomeIcon icon={faCrown} />
                                <span>Download HD</span>
                              </a>
                            )}
                            {job.thumbnailUrl && (
                              <a 
                                href={job.thumbnailUrl} 
                                download 
                                className="download-link free"
                                target="_blank" 
                                rel="noopener noreferrer"
                              >
                                <FontAwesomeIcon icon={faDownload} />
                                <span>Download Free</span>
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;