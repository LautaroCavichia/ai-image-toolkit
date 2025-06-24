import React, { useState, useEffect, useRef } from 'react';
import { isAuthenticated, logout, getCurrentUser, isGuestUser } from '../services/authService';
import { ChevronDown, Home, LogOut, Coins, Scissors, Search, Maximize, Sparkles, Palette } from 'lucide-react';
import TokenPanel from './TokenPanel';
import logo from '../assets/logo.png';

const Navbar: React.FC = () => {
  const user = getCurrentUser();
  const isGuest = isGuestUser();
  const [showTokenPanel, setShowTokenPanel] = useState(false);
  const [tokenBalance, setTokenBalance] = useState(user?.tokenBalance || 0);
  const tokenPanelRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logout();
    window.location.reload();
  };

  const handleTokenChange = (newBalance: number) => {
    setTokenBalance(newBalance);
  };

  const handleToggleTokenPanel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowTokenPanel(!showTokenPanel);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tokenPanelRef.current && !tokenPanelRef.current.contains(event.target as Node)) {
        setShowTokenPanel(false);
      }
    };

    if (showTokenPanel) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showTokenPanel]);

  return (
    <nav className="bg-black text-white p-4 sticky top-0 z-40 shadow-md border-b border-neutral-800">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-4">
            <div className="relative group">
              <img 
                src={logo} 
                alt="Pixel Perfect AI Logo" 
                className="w-10 h-10 object-contain filter invert transition-all duration-500 group-hover:scale-110 group-hover:rotate-12 group-hover:drop-shadow-lg"
              />
            </div>
            <h1 className="text-2xl font-bold text-white hover:text-gray-300 transition-all duration-300 cursor-pointer">
              Pixel Perfect AI
            </h1>
          </div>
          <nav className="hidden md:flex space-x-4">
            <a 
              href="/" 
              className="hover:text-gray-300 transition-all duration-300 flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-neutral-800"
            >
              <Home size={18} />
              Home
            </a>
            <div className="relative group">
              <button className="hover:text-gray-300 transition-all duration-300 flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-neutral-800">
                Services
                <ChevronDown size={18} className="group-hover:rotate-180 transition-transform duration-300" />
              </button>
              <div className="absolute top-full left-0 mt-3 w-64 bg-neutral-900 text-white rounded-2xl shadow-lg border border-neutral-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-500 overflow-hidden">
                <a href="/background-removal" className="block px-6 py-4 hover:bg-neutral-800 transition-all duration-300 border-b border-neutral-800">
                  <span className="flex items-center gap-3">
                    <Scissors size={16} />
                    Background Removal
                  </span>
                </a>
                <a href="/upscale" className="block px-6 py-4 hover:bg-neutral-800 transition-all duration-300 border-b border-neutral-800">
                  <span className="flex items-center gap-3">
                    <Search size={16} />
                    Image Upscaling
                  </span>
                </a>
                <a href="/enlarge" className="block px-6 py-4 hover:bg-neutral-800 transition-all duration-300 border-b border-neutral-800">
                  <span className="flex items-center gap-3">
                    <Maximize size={16} />
                    Image Enlargement
                  </span>
                </a>
                <a href="/object-removal" className="block px-6 py-4 hover:bg-neutral-800 transition-all duration-300 border-b border-neutral-800">
                  <span className="flex items-center gap-3">
                    <Sparkles size={16} />
                    Object Removal
                  </span>
                </a>
                <a href="/style-transfer" className="block px-6 py-4 hover:bg-neutral-800 transition-all duration-300">
                  <span className="flex items-center gap-3">
                    <Palette size={16} />
                    Style Transfer 
                    <span className="text-xs bg-yellow-300 text-black px-2 py-1 rounded-full font-mono font-medium ml-auto">Soon</span>
                  </span>
                </a>
              </div>
            </div>
          </nav>
        </div>
        
        <div className="flex items-center space-x-4">
          {isAuthenticated() ? (
            <>
              <span>{user?.displayName}</span>
              {isGuest && (
                <span className="bg-yellow-400 text-black px-3 py-1 rounded-full text-xs font-medium animate-pulse">Guest</span>
              )}
              <button 
                onClick={handleToggleTokenPanel}
                className="bg-neutral-800 hover:bg-neutral-700 px-5 py-2 rounded-xl text-sm transition-all duration-300 flex items-center gap-3 border border-neutral-700"
              >
                <Coins size={18} />
                <span>{tokenBalance} tokens</span>
              </button>
              <button 
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-500 px-5 py-2 rounded-xl flex items-center gap-3 transition-all duration-300 text-white"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <div className="space-x-2">
              <span>Not logged in</span>
            </div>
          )}
        </div>
      </div>

      {showTokenPanel && isAuthenticated() && (
        <div ref={tokenPanelRef} className="absolute top-full right-4 mt-2 w-80 z-50">
          <TokenPanel onTokenChange={handleTokenChange} />
        </div>
      )}
    </nav>
  );
};

export default Navbar;
