import React from 'react';
import { isAuthenticated, logout, getCurrentUser, isGuestUser } from '../services/authService';

const Navbar: React.FC = () => {
  const user = getCurrentUser();
  const isGuest = isGuestUser();

  const handleLogout = () => {
    logout();
    window.location.reload();
  };

  return (
    <nav className="bg-blue-600 text-white p-4">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-6">
          <h1 className="text-xl font-bold">AI Image Toolkit</h1>
          <nav className="hidden md:flex space-x-4">
            <a 
              href="/" 
              className="hover:text-blue-200 transition-colors"
            >
              Home
            </a>
            <div className="relative group">
              <button className="hover:text-blue-200 transition-colors flex items-center">
                Services
                <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <a href="/background-removal" className="block px-4 py-2 text-gray-800 hover:bg-blue-50">Background Removal</a>
                <a href="/upscale" className="block px-4 py-2 text-gray-800 hover:bg-blue-50">Image Upscaling</a>
                <a href="/enlarge" className="block px-4 py-2 text-gray-800 hover:bg-blue-50">Image Enlargement</a>
                <a href="/object-removal" className="block px-4 py-2 text-gray-800 hover:bg-blue-50">Object Removal</a>
                <a href="/style-transfer" className="block px-4 py-2 text-gray-400">Style Transfer (Soon)</a>
              </div>
            </div>
          </nav>
        </div>
        
        <div className="flex items-center space-x-4">
          {isAuthenticated() ? (
            <>
              <span>Hello, {user?.displayName}</span>
              {isGuest && (
                <span className="bg-orange-500 px-2 py-1 rounded text-xs">Guest</span>
              )}
              <span className="bg-green-500 px-2 py-1 rounded text-sm">
                Tokens: {user?.tokenBalance || 0}
              </span>
              <button 
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded"
              >
                Logout
              </button>
            </>
          ) : (
            <div className="space-x-2">
              <span>Not logged in</span>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;