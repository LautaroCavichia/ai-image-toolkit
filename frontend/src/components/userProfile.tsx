import React, { useState, useEffect } from 'react';
import { isAuthenticated, getCurrentUser, logout } from '../services/authService';
import { getUserHistory } from '../services/historyService';
import { JobResponseDTO, JobStatusEnum } from '../types';
import { 
  User, 
  Coins, 
  History, 
  Calendar,
  Image,
  Download,
  ShoppingCart,
  Video,
  RefreshCw,
  Mail,
  Crown,
  X,
  LogOut
} from 'lucide-react';

// Mock services for token operations (replace with real services later)
const purchaseTokens = async (amount: number): Promise<boolean> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  return Math.random() > 0.1; // 90% success rate for demo
};

const earnTokenFromAd = async (): Promise<boolean> => {
  await new Promise(resolve => setTimeout(resolve, 2000));
  return Math.random() > 0.2; // 80% success rate for demo
};

interface UserProfileProps {
  user?: { userId: string; email?: string; displayName: string; isGuest?: boolean } | null;
  tokenBalance?: number;
  onTokenBalanceChange?: (newBalance: number) => void;
  onClose?: () => void;
  onLogout?: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ 
  user: propUser, 
  tokenBalance: propTokenBalance = 5, 
  onTokenBalanceChange, 
  onClose,
  onLogout 
}) => {
  // Use demo data if no props are provided
  const user = propUser || {
    userId: 'demo-user-123',
    email: 'user@example.com',
    displayName: 'Demo User',
    isGuest: false
  };

  const [tokenBalance, setTokenBalance] = useState(propTokenBalance);
  const [activeTab, setActiveTab] = useState<'profile' | 'history' | 'tokens'>('profile');
  const [jobHistory, setJobHistory] = useState<JobResponseDTO[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [isPurchasing, setPurchasing] = useState(false);
  const [isWatchingAd, setWatchingAd] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Handle token balance changes
  const handleTokenBalanceChange = (newBalance: number) => {
    setTokenBalance(newBalance);
    if (onTokenBalanceChange) {
      onTokenBalanceChange(newBalance);
    }
  };

  useEffect(() => {
    if (activeTab === 'history' && user && !user.isGuest) {
      loadUserHistory();
    }
  }, [activeTab, user]);

  const loadUserHistory = async () => {
    if (!user || user.isGuest) return;
    
    setIsLoadingHistory(true);
    setHistoryError(null);
    
    try {
      const history = await getUserHistory();
      setJobHistory(history);
    } catch (error: any) {
      console.error('Failed to load user history:', error);
      
      // More specific error handling
      if (error.response?.status === 401) {
        setHistoryError('Unauthorized. Please sign in again.');
      } else if (error.response?.status === 403) {
        setHistoryError('You don\'t have permission to view history.');
      } else if (error.response?.status >= 500) {
        setHistoryError('Server error. Please try again later.');
      } else if (error.code === 'NETWORK_ERROR' || !error.response) {
        setHistoryError('Connection error. Check your internet connection.');
      } else {
        setHistoryError('Failed to load history. Please try again.');
      }
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
        handleTokenBalanceChange(tokenBalance + amount);
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
        handleTokenBalanceChange(tokenBalance + 1);
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

  const handleLogout = async () => {
    setIsLoggingOut(true);
    
    try {
      await logout();
      
      // Call onLogout callback if available
      if (onLogout) {
        onLogout();
      }
      
      // Close profile modal after successful logout
      if (onClose) {
        onClose();
      }
      
      // Force page reload to update authentication state
      window.location.reload();
      
    } catch (error) {
      console.error('Error during logout:', error);
      // You could show an error message here if desired
      alert('Error signing out. Please try again.');
    } finally {
      setIsLoggingOut(false);
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
        return 'text-green-600';
      case JobStatusEnum.FAILED:
        return 'text-red-600';
      case JobStatusEnum.PROCESSING:
        return 'text-blue-600';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusBgColor = (status: JobStatusEnum) => {
    switch (status) {
      case JobStatusEnum.COMPLETED:
        return 'bg-green-50 border-green-200';
      case JobStatusEnum.FAILED:
        return 'bg-red-50 border-red-200';
      case JobStatusEnum.PROCESSING:
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getJobTypeDisplayName = (jobType: string) => {
    const typeMap: { [key: string]: string } = {
      'BACKGROUND_REMOVAL': 'Background Removal',
      'IMAGE_UPSCALING': 'Image Upscaling',
      'IMAGE_ENLARGEMENT': 'Image Enlargement',
      'IMAGE_ENHANCEMENT': 'Image Enhancement'
    };
    
    return typeMap[jobType] || jobType.replace('_', ' ');
  };

  const getStatusDisplayName = (status: JobStatusEnum) => {
    switch (status) {
      case JobStatusEnum.COMPLETED:
        return 'COMPLETED';
      case JobStatusEnum.FAILED:
        return 'FAILED';
      case JobStatusEnum.PROCESSING:
        return 'PROCESSING';
      default:
        return status;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-hidden bg-white/95 backdrop-blur-3xl rounded-3xl shadow-2xl border border-white/20 ring-1 ring-black/5">
        {/* Header with close button */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-200/50">
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Account</h1>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100/70 rounded-full transition-all duration-200 ease-out"
            >
              <X size={18} className="text-gray-600" />
            </button>
          )}
        </div>

        {/* Profile Header */}
        <div className="flex items-center gap-6 px-8 py-8 border-b border-gray-200/50">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 flex items-center justify-center text-white shadow-lg ring-4 ring-blue-100/50">
            <User size={36} />
          </div>
          <div className="flex-1">
            <h2 className="text-3xl font-semibold text-gray-900 mb-2 tracking-tight">{user.displayName}</h2>
            {user.email && <p className="text-gray-600 text-base mb-4 font-medium">{user.email}</p>}
            <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${
              user.isGuest 
                ? 'bg-amber-50 text-amber-800 ring-1 ring-amber-200' 
                : 'bg-green-50 text-green-800 ring-1 ring-green-200'
            }`}>
              {user.isGuest ? 'Guest Account' : 'Registered User'}
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-gray-50/70 border-b border-gray-200/50">
          <button
            className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 font-semibold text-base transition-all duration-300 ease-out relative ${
              activeTab === 'profile'
                ? 'text-blue-600 bg-white shadow-sm border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-blue-600 hover:bg-white/80'
            }`}
            onClick={() => setActiveTab('profile')}
          >
            <User size={20} />
            <span className="hidden sm:inline">Profile</span>
          </button>
          <button
            className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 font-semibold text-base transition-all duration-300 ease-out relative ${
              activeTab === 'tokens'
                ? 'text-blue-600 bg-white shadow-sm border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-blue-600 hover:bg-white/80'
            }`}
            onClick={() => setActiveTab('tokens')}
          >
            <Coins size={20} />
            <span className="hidden sm:inline">Tokens</span>
          </button>
          {!user.isGuest && (
            <button
              className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 font-semibold text-base transition-all duration-300 ease-out relative ${
                activeTab === 'history'
                  ? 'text-blue-600 bg-white shadow-sm border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-blue-600 hover:bg-white/80'
              }`}
              onClick={() => setActiveTab('history')}
            >
              <History size={20} />
              <span className="hidden sm:inline">History</span>
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-8 max-h-[calc(90vh-320px)] overflow-y-auto">
          {activeTab === 'profile' && (
            <div className="space-y-8">
              <h3 className="text-xl font-semibold text-gray-900 tracking-tight">Account Information</h3>
              
              <div className="space-y-4">
                <div className="flex items-center gap-5 p-6 bg-gray-50/80 rounded-2xl border border-gray-200/50 hover:bg-gray-50 transition-all duration-200">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <User className="text-blue-600 w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 font-medium mb-1">Username</div>
                    <div className="font-semibold text-gray-900 text-lg">{user.displayName}</div>
                  </div>
                </div>
                
                {user.email && (
                  <div className="flex items-center gap-5 p-6 bg-gray-50/80 rounded-2xl border border-gray-200/50 hover:bg-gray-50 transition-all duration-200">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Mail className="text-blue-600 w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 font-medium mb-1">Email</div>
                      <div className="font-semibold text-gray-900 text-lg">{user.email}</div>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center gap-5 p-6 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200/50 hover:from-amber-50/80 hover:to-orange-50/80 transition-all duration-200">
                  <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                    <Coins className="text-amber-600 w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-sm text-amber-700 font-medium mb-1">Token Balance</div>
                    <div className="font-bold text-amber-800 text-xl">{tokenBalance} tokens</div>
                  </div>
                </div>
              </div>
              
              {user.isGuest && (
                <div className="p-6 bg-blue-50/80 rounded-2xl border border-blue-200/50">
                  <h4 className="text-blue-900 font-semibold mb-3 text-lg">Guest Account Limitations</h4>
                  <p className="text-blue-800 leading-relaxed">
                    As a guest, your processing history isn't saved. 
                    Create an account to access your 30-day history and enjoy additional benefits!
                  </p>
                </div>
              )}

              {/* Logout Button */}
              <div className="pt-6 border-t border-gray-200/50">
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="w-full flex items-center justify-center gap-3 p-4 bg-red-500 text-white font-semibold rounded-2xl shadow-lg transition-all duration-300 ease-out hover:bg-red-600 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  <LogOut size={20} className={isLoggingOut ? 'animate-spin' : ''} />
                  <span className="text-base">{isLoggingOut ? 'Signing Out...' : 'Sign Out'}</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'tokens' && (
            <div className="space-y-8">
              <h3 className="text-xl font-semibold text-gray-900 tracking-tight">Token Management</h3>
              
              <div className="flex flex-col items-center gap-4 p-10 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 rounded-3xl border border-amber-200/50 shadow-inner">
                <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                  <Coins className="text-white w-10 h-10" />
                </div>
                <span className="text-5xl font-light text-amber-800 tracking-tight">{tokenBalance}</span>
                <span className="text-amber-700 font-medium">Available Tokens</span>
              </div>

              {tokenError && (
                <div className="p-5 bg-red-50/80 border border-red-200/50 rounded-2xl text-red-800 font-medium">
                  {tokenError}
                </div>
              )}

              <div>
                <h4 className="font-semibold text-gray-900 mb-6 text-lg">Get More Tokens</h4>
                <div className="space-y-4">
                  <button 
                    className="w-full flex items-center justify-center gap-3 p-5 bg-blue-500 text-white font-semibold rounded-2xl shadow-lg transition-all duration-300 ease-out hover:bg-blue-600 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
                    onClick={() => handlePurchaseTokens(5)}
                    disabled={isPurchasing || isWatchingAd}
                  >
                    <ShoppingCart size={20} />
                    <span className="text-base">{isPurchasing ? 'Processing...' : 'Buy 5 Tokens ($2.99)'}</span>
                  </button>
                  
                  <button 
                    className="w-full flex items-center justify-center gap-3 p-5 bg-green-500 text-white font-semibold rounded-2xl shadow-lg transition-all duration-300 ease-out hover:bg-green-600 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
                    onClick={() => handlePurchaseTokens(15)}
                    disabled={isPurchasing || isWatchingAd}
                  >
                    <ShoppingCart size={20} />
                    <span className="text-base">{isPurchasing ? 'Processing...' : 'Buy 15 Tokens ($7.99)'}</span>
                  </button>
                  
                  <button 
                    className="w-full flex items-center justify-center gap-3 p-5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-2xl shadow-lg transition-all duration-300 ease-out hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
                    onClick={handleWatchAd}
                    disabled={isPurchasing || isWatchingAd}
                  >
                    <Video size={20} />
                    <span className="text-base">{isWatchingAd ? 'Watching Ad...' : 'Watch Ad for 1 Token'}</span>
                  </button>
                </div>
              </div>

              <div className="p-6 bg-gray-50/80 rounded-2xl border border-gray-200/50">
                <h4 className="font-semibold text-gray-900 mb-5 text-lg">Token Usage</h4>
                <ul className="space-y-3">
                  <li className="flex items-center gap-4 text-gray-800">
                    <div className="w-3 h-3 bg-amber-500 rounded-full shadow-sm"></div>
                    <span className="font-medium">Background Removal: 1 token for HD quality</span>
                  </li>
                  <li className="flex items-center gap-4 text-gray-800">
                    <div className="w-3 h-3 bg-amber-500 rounded-full shadow-sm"></div>
                    <span className="font-medium">Image Enlargement: 1 token for HD quality</span>
                  </li>
                  <li className="flex items-center gap-4 text-gray-800">
                    <div className="w-3 h-3 bg-amber-500 rounded-full shadow-sm"></div>
                    <span className="font-medium">Image Enhancement: 1 token for HD quality</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'history' && !user.isGuest && (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900 tracking-tight">Processing History</h3>
                <button 
                  className="p-3 text-gray-500 rounded-xl hover:bg-gray-100/70 transition-all duration-200 ease-out"
                  onClick={loadUserHistory}
                  disabled={isLoadingHistory}
                >
                  <RefreshCw size={18} className={isLoadingHistory ? 'animate-spin' : ''} />
                </button>
              </div>

              {isLoadingHistory && (
                <div className="flex items-center justify-center gap-4 p-12 text-gray-600">
                  <RefreshCw size={24} className="animate-spin" />
                  <span className="font-medium text-lg">Loading history...</span>
                </div>
              )}

              {historyError && (
                <div className="p-5 bg-red-50/80 border border-red-200/50 rounded-2xl text-red-800 text-center font-medium">
                  {historyError}
                </div>
              )}

              {!isLoadingHistory && !historyError && (
                <div className="space-y-4">
                  {jobHistory.length === 0 ? (
                    <div className="flex flex-col items-center gap-6 p-16 text-center text-gray-500">
                      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
                        <History size={40} className="opacity-60" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-xl mb-2">No processing history found</p>
                        <span className="text-gray-600">Start processing images to see your history here</span>
                      </div>
                    </div>
                  ) : (
                    jobHistory.map((job) => (
                      <div 
                        key={job.jobId} 
                        className="p-6 bg-gray-50/80 rounded-2xl border border-gray-200/50 transition-all duration-200 hover:bg-gray-50 hover:shadow-sm"
                      >
                        <div className="flex items-center justify-between mb-5">
                          <div className="flex items-center gap-4 font-semibold text-gray-900 text-lg">
                            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                              <Image size={20} className="text-blue-600" />
                            </div>
                            <span>{getJobTypeDisplayName(job.jobType)}</span>
                          </div>
                          <div className={`text-sm font-semibold px-4 py-2 rounded-full ${getStatusBgColor(job.status)} ${getStatusColor(job.status)}`}>
                            {getStatusDisplayName(job.status)}
                          </div>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          <div className="flex items-center gap-3 text-gray-600 font-medium">
                            <Calendar size={18} />
                            <span>{formatDate(job.createdAt)}</span>
                          </div>
                          
                          {job.status === JobStatusEnum.COMPLETED && (
                            <div className="flex gap-3">
                              {job.isPremiumQuality && job.processedImageUrl && (
                                <a
                                  href={job.processedImageUrl}
                                  download
                                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl shadow-lg transition-all duration-300 ease-out hover:shadow-xl hover:scale-105 active:scale-95"
                                >
                                  <Crown size={16} />
                                  <span>Download HD</span>
                                </a>
                              )}
                              {job.thumbnailUrl && (
                                <a
                                  href={job.thumbnailUrl}
                                  download
                                  className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-xl border border-gray-200 shadow-sm transition-all duration-300 ease-out hover:bg-gray-200 hover:shadow-md hover:scale-105 active:scale-95"
                                >
                                  <Download size={16} />
                                  <span>Download Free</span>
                                </a>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;