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

  // Prevent background scrolling when modals are open
  useEffect(() => {
    if (showPurchaseModal || isWatchingAd) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showPurchaseModal, isWatchingAd]);

  const handleWatchAd = () => {
    setIsWatchingAd(true);
    setAdCountdown(3);

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
        // Replace alert with a more elegant notification in production
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
    const newBalance = tokenBalance + amount;
    setTokenBalance(newBalance);
    localStorage.setItem('tokenBalance', newBalance.toString());
    if (onTokenChange) {
      onTokenChange(newBalance);
    }
    setShowPurchaseModal(false);
    // Replace alert with a more elegant notification in production
    alert(`Mock Purchase: ${amount} tokens added! Total: ${newBalance} tokens`);
  };

  return (
    <div className="bg-white/95 backdrop-blur-xl border border-slate-200/50 rounded-2xl p-6 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mr-4">
            <Coins className="text-slate-700" size={24} />
          </div>
          <div>
            <h3 className="font-medium text-slate-900 text-lg">Token Balance</h3>
            <p className="text-sm text-slate-600">{tokenBalance} tokens available</p>
          </div>
        </div>
        <div className="text-3xl font-light text-slate-900 tracking-tight">
          {tokenBalance}
        </div>
      </div>

      <div className="space-y-3">
        <button
          onClick={handleWatchAd}
          disabled={isWatchingAd}
          className="w-full bg-slate-700 hover:bg-slate-600 text-white py-3 px-4 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium hover:scale-[1.02] active:scale-[0.98]"
        >
          {isWatchingAd ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="animate-spin" size={18} />
              <span>Watching Ad... {adCountdown}s</span>
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <Play size={18} />
              <span>Watch Ad (+1 Token)</span>
            </span>
          )}
        </button>

        <button
          onClick={() => setShowPurchaseModal(true)}
          className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3 px-4 rounded-xl transition-all duration-200 font-medium hover:scale-[1.02] active:scale-[0.98]"
        >
          <span className="flex items-center justify-center gap-2">
            <CreditCard size={18} />
            <span>Buy Tokens</span>
          </span>
        </button>
      </div>

      {/* Purchase Modal */}
      {showPurchaseModal && (
        <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-xl flex items-center justify-center z-50 animate-in fade-in-0 duration-300">
          <div className="bg-white/95 backdrop-blur-3xl rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl border border-white/30 ring-1 ring-slate-900/5 animate-in zoom-in-95 slide-in-from-bottom-8 duration-500">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-light text-slate-900 tracking-tight">Token Packages</h3>
              <button 
                onClick={() => setShowPurchaseModal(false)}
                className="text-slate-400 hover:text-slate-600 p-2 rounded-xl hover:bg-slate-100/50 transition-all duration-200"
              >
                <X size={20} />
              </button>
            </div>
            <p className="text-slate-600 mb-8 text-center font-light">
              Choose the perfect package for your creative needs
            </p>
            
            <div className="space-y-4 mb-8">
              <button
                onClick={() => handleMockPurchase(5)}
                className="w-full p-6 border border-slate-200/50 rounded-2xl hover:border-slate-300 hover:bg-slate-50/50 transition-all duration-200 text-left hover:scale-[1.02] active:scale-[0.98]"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium text-slate-900 text-lg mb-1">Starter Pack</div>
                    <div className="text-sm text-slate-600">5 tokens • Perfect for testing</div>
                  </div>
                  <div className="text-slate-900 font-light text-2xl tracking-tight">$2.99</div>
                </div>
              </button>

              <button
                onClick={() => handleMockPurchase(15)}
                className="w-full p-6 border-2 border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl hover:border-orange-300 hover:from-orange-50/80 hover:to-amber-50/80 transition-all duration-200 text-left relative hover:scale-[1.02] active:scale-[0.98]"
              >
                <div className="absolute top-3 right-3">
                  <div className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-medium">Most Popular</div>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium text-slate-900 text-lg mb-1">Popular Pack</div>
                    <div className="text-sm text-slate-600">15 tokens • Great value</div>
                  </div>
                  <div className="text-slate-900 font-light text-2xl tracking-tight">$7.99</div>
                </div>
              </button>

              <button
                onClick={() => handleMockPurchase(50)}
                className="w-full p-6 border border-slate-200/50 rounded-2xl hover:border-slate-300 hover:bg-slate-50/50 transition-all duration-200 text-left relative hover:scale-[1.02] active:scale-[0.98]"
              >
                <div className="absolute top-3 right-3">
                  <div className="bg-slate-700 text-white px-3 py-1 rounded-full text-xs font-medium">Best Value</div>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium text-slate-900 text-lg mb-1">Pro Pack</div>
                    <div className="text-sm text-slate-600">50 tokens • For professionals</div>
                  </div>
                  <div className="text-slate-900 font-light text-2xl tracking-tight">$19.99</div>
                </div>
              </button>
            </div>

            <button
              onClick={() => setShowPurchaseModal(false)}
              className="w-full bg-slate-100/60 hover:bg-slate-200/60 text-slate-700 py-3 px-4 rounded-xl transition-all duration-200 font-medium hover:scale-[1.02] active:scale-[0.98]"
            >
              Cancel
            </button>

            <div className="mt-6 text-sm text-slate-500 text-center bg-slate-50/60 rounded-xl p-4 border border-slate-200/50">
              💡 Mock purchase for testing • No real charges will be made
            </div>
          </div>
        </div>
      )}

      {/* Ad Modal */}
      {isWatchingAd && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xl flex items-center justify-center z-50 animate-in fade-in-0 duration-300">
          <div className="bg-white/95 backdrop-blur-3xl rounded-3xl p-8 max-w-md w-full mx-4 text-center shadow-2xl border border-white/30 ring-1 ring-slate-900/5 animate-in zoom-in-95 slide-in-from-bottom-8 duration-500">
            <h3 className="text-2xl font-light mb-8 text-slate-900 tracking-tight">Mock Advertisement</h3>
            <div className="bg-slate-50/60 h-48 rounded-2xl flex items-center justify-center mb-8 border border-slate-200/50">
              <div className="text-center">
                <Play className="mx-auto text-slate-600 mb-4" size={60} />
                <div className="text-xl font-medium mb-2 text-slate-900">Fake Ad Playing...</div>
                <div className="text-3xl font-light text-slate-900 tracking-tight">
                  {adCountdown}s remaining
                </div>
              </div>
            </div>
            <p className="text-slate-600 bg-slate-50/60 rounded-xl p-4 text-sm border border-slate-200/50">
              📺 Mock advertisement • Real ads would appear here in production
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TokenPanel;