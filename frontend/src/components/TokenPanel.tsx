import React, { useState, useEffect, useCallback } from 'react';
import { fetchTokenBalance, earnTokenFromAd } from '../services/tokenService';
import { Coins, Play, CreditCard, X, Loader2 } from 'lucide-react';

interface TokenPanelProps {
  onTokenChange?: (newBalance: number) => void;
}

const TokenPanel: React.FC<TokenPanelProps> = ({ onTokenChange }) => {
  const [tokenBalance, setTokenBalance] = useState<number>(0);
  const [isWatchingAd, setIsWatchingAd] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [adCountdown, setAdCountdown] = useState(0);

  const loadTokenBalance = useCallback(async () => {
    try {
      const balance = await fetchTokenBalance();
      setTokenBalance(balance);
      if (onTokenChange) {
        onTokenChange(balance);
      }
    } catch (error) {
      console.error('Failed to load token balance:', error);
    }
  }, [onTokenChange]);

  useEffect(() => {
    loadTokenBalance();
  }, [loadTokenBalance]);

  const handleWatchAd = () => {
    setIsWatchingAd(true);
    setAdCountdown(3); // 15 second mock ad

    const countdown = setInterval(() => {
      setAdCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdown);
          completeAdWatch();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const completeAdWatch = async () => {
    try {
      const success = await earnTokenFromAd();
      if (success) {
        await loadTokenBalance();
        setIsWatchingAd(false);
        alert('Great! You earned 1 token for watching the ad!');
      } else {
        setIsWatchingAd(false);
        alert('Sorry, there was an error processing your ad reward. Please try again.');
      }
    } catch (error) {
      setIsWatchingAd(false);
      alert('Sorry, there was an error processing your ad reward. Please try again.');
    }
  };

  const handleMockPurchase = (amount: number) => {
    // Mock purchase - in real app this would integrate with payment processor
    const newBalance = tokenBalance + amount;
    setTokenBalance(newBalance);
    localStorage.setItem('tokenBalance', newBalance.toString());
    if (onTokenChange) {
      onTokenChange(newBalance);
    }
    setShowPurchaseModal(false);
    alert(`Mock Purchase: ${amount} tokens added! Total: ${newBalance} tokens`);
  };

  return (
    <div className="glass border border-white/40 rounded-2xl p-6 shadow-glass-lg backdrop-blur-2xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-gradient-to-br from-secondary-400 to-secondary-600 rounded-2xl flex items-center justify-center mr-4 shadow-glass group-hover:scale-110 transition-transform duration-300">
            <Coins className="text-white" size={24} />
          </div>
          <div>
            <h3 className="font-title font-bold text-neutral-900 text-xl">Token Balance</h3>
            <p className="text-sm text-neutral-700 font-title">{tokenBalance} tokens available</p>
          </div>
        </div>
        <div className="text-4xl font-title font-bold text-gradient-primary">
          {tokenBalance}
        </div>
      </div>

      <div className="space-y-3">
        {/* Free Token - Watch Ad */}
        <button
          onClick={handleWatchAd}
          disabled={isWatchingAd}
          className="w-full bg-gradient-to-r from-success-500 to-success-600 hover:from-success-600 hover:to-success-700 text-white py-4 px-6 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-glass hover:shadow-glass-lg group font-title font-semibold transform hover:scale-105"
        >
          {isWatchingAd ? (
            <span className="flex items-center justify-center gap-3">
              <Loader2 className="animate-spin" size={20} />
              <span>Watching Ad... {adCountdown}s</span>
            </span>
          ) : (
            <span className="flex items-center justify-center gap-3">
              <Play className="group-hover:scale-110 transition-transform duration-300" size={20} />
              <span>Watch Ad (+1 Token)</span>
            </span>
          )}
        </button>

        {/* Purchase Tokens */}
        <button
          onClick={() => setShowPurchaseModal(true)}
          className="w-full bg-gradient-primary text-white py-4 px-6 rounded-2xl transition-all duration-300 shadow-glass hover:shadow-glass-lg group font-title font-semibold transform hover:scale-105"
        >
          <span className="flex items-center justify-center gap-3">
            <CreditCard className="group-hover:scale-110 transition-transform duration-300" size={20} />
            <span>Buy Tokens</span>
          </span>
        </button>
      </div>

      {/* Mock Purchase Modal */}
      {showPurchaseModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-lg flex items-center justify-center z-50 animate-fade-in">
          <div className="glass rounded-3xl p-10 max-w-lg w-full mx-4 shadow-glass-lg backdrop-blur-2xl border border-white/40 animate-scale-in">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-title font-bold text-gradient-primary">Token Packages</h3>
              <button 
                onClick={() => setShowPurchaseModal(false)}
                className="text-neutral-400 hover:text-neutral-600 p-2 rounded-xl hover:glass-dark transition-all duration-300 group"
              >
                <X size={24} className="group-hover:rotate-90 transition-transform duration-300" />
              </button>
            </div>
            <p className="text-neutral-700 mb-8 font-title font-light text-lg text-center">
              Choose the perfect package for your needs
            </p>
            
            <div className="space-y-3 mb-6">
              <button
                onClick={() => handleMockPurchase(5)}
                className="w-full p-6 glass border border-primary-300/40 rounded-2xl hover:border-primary-400/60 hover:bg-gradient-glass-orange transition-all duration-500 text-left group shadow-glass hover:shadow-glass-lg transform hover:scale-105"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-title font-bold text-neutral-900 group-hover:text-primary-800 text-lg">Starter Pack</div>
                    <div className="text-sm text-neutral-600 group-hover:text-primary-700 font-title">5 tokens • Perfect for testing</div>
                  </div>
                  <div className="text-primary-700 font-title font-bold text-2xl group-hover:text-primary-800">$2.99</div>
                </div>
              </button>

              <button
                onClick={() => handleMockPurchase(15)}
                className="w-full p-6 glass border border-secondary-300/40 rounded-2xl hover:border-secondary-400/60 hover:bg-gradient-glass-blue transition-all duration-500 text-left group shadow-glass hover:shadow-glass-lg transform hover:scale-105 relative overflow-hidden"
              >
                <div className="absolute top-2 right-2">
                  <div className="bg-gradient-to-r from-secondary-500 to-accent-500 text-white px-3 py-1 rounded-full text-xs font-title font-bold">Most Popular</div>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-title font-bold text-neutral-900 group-hover:text-secondary-800 text-lg">
                      Popular Pack
                    </div>
                    <div className="text-sm text-neutral-600 group-hover:text-secondary-700 font-title">15 tokens • Great value</div>
                  </div>
                  <div className="text-secondary-700 font-title font-bold text-2xl group-hover:text-secondary-800">$7.99</div>
                </div>
              </button>

              <button
                onClick={() => handleMockPurchase(50)}
                className="w-full p-6 glass border border-accent-300/40 rounded-2xl hover:border-accent-400/60 hover:bg-gradient-glass-purple transition-all duration-500 text-left group shadow-glass hover:shadow-glass-lg transform hover:scale-105 relative overflow-hidden"
              >
                <div className="absolute top-2 right-2">
                  <div className="bg-gradient-to-r from-accent-500 to-primary-500 text-white px-3 py-1 rounded-full text-xs font-title font-bold">Best Value</div>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-title font-bold text-neutral-900 group-hover:text-accent-800 text-lg">
                      Pro Pack
                    </div>
                    <div className="text-sm text-neutral-600 group-hover:text-accent-700 font-title">50 tokens • For professionals</div>
                  </div>
                  <div className="text-accent-700 font-title font-bold text-2xl group-hover:text-accent-800">$19.99</div>
                </div>
              </button>
            </div>

            <div className="flex gap-4 mt-8">
              <button
                onClick={() => setShowPurchaseModal(false)}
                className="flex-1 glass-dark text-neutral-700 py-4 px-6 rounded-2xl hover:bg-neutral-400/20 transition-all duration-300 border border-neutral-400/30 hover:border-neutral-400/50 font-title font-semibold transform hover:scale-105"
              >
                Cancel
              </button>
            </div>

            <div className="mt-8 text-sm text-neutral-600 text-center glass rounded-2xl p-4 border border-neutral-300/40 font-title font-light">
              💡 Mock purchase for testing • No real charges will be made
            </div>
          </div>
        </div>
      )}

      {/* Mock Ad Video Modal */}
      {isWatchingAd && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-50 animate-fade-in">
          <div className="glass rounded-3xl p-10 max-w-lg w-full mx-4 text-center shadow-glass-lg backdrop-blur-2xl border border-white/40 animate-scale-in">
            <h3 className="text-2xl font-title font-bold mb-8 text-gradient-primary">Mock Advertisement</h3>
            <div className="bg-gradient-to-br from-primary-500/20 to-secondary-500/20 h-64 rounded-2xl flex items-center justify-center mb-8 border border-primary-400/40 shadow-glass backdrop-blur-sm">
              <div className="text-center">
                <div className="relative mb-8">
                  <Play className="mx-auto text-primary-600 animate-pulse-slow" size={80} />
                  <div className="absolute inset-0 bg-gradient-primary rounded-full blur-2xl opacity-30 animate-pulse"></div>
                </div>
                <div className="text-3xl font-title font-bold mb-4 text-neutral-900">Fake Ad Playing...</div>
                <div className="text-2xl font-title font-bold text-gradient-primary">
                  {adCountdown}s remaining
                </div>
              </div>
            </div>
            <p className="text-neutral-700 font-title font-light glass rounded-2xl p-4 border border-neutral-300/40">
              📺 Mock advertisement • Real ads would appear here in production
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TokenPanel;