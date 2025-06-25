import React, { useState, useEffect, useRef } from 'react';
import { isAuthenticated, getCurrentUser } from '../services/authService';
import { fetchTokenBalance } from '../services/tokenService';
import { ChevronDown, Home, Coins, Scissors, Maximize, Sparkles, Expand, Palette, Menu, X, User } from 'lucide-react';
import { gsap } from 'gsap';
import TokenPanel from './TokenPanel';
import logo from '../assets/logo.png';

const Navbar: React.FC = () => {
  // Estado reactivo para el usuario
  const [user, setUser] = useState(getCurrentUser());
  const [isAuth, setIsAuth] = useState(isAuthenticated());
  const [showTokenPanel, setShowTokenPanel] = useState(false);
  const [tokenBalance, setTokenBalance] = useState(user?.tokenBalance || 0);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showServicesDropdown, setShowServicesDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  
  const tokenPanelRef = useRef<HTMLDivElement>(null);
  const servicesDropdownRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null);

  // Efecto para suscribirse a cambios de autenticación
  useEffect(() => {
  const checkAuthState = async () => {
    const currentUser = getCurrentUser();
    const authStatus = isAuthenticated();
    const tokenBalance = await fetchTokenBalance();

    setUser(currentUser);
    setIsAuth(authStatus);
    setTokenBalance(tokenBalance || 0);
  };

  // Verificar estado inicial
  checkAuthState();

  // Suscribirse a eventos de autenticación
  const handleAuthStateChange = () => {
    checkAuthState();
  };

  window.addEventListener('authStateChanged', handleAuthStateChange);
  window.addEventListener('userLoggedOut', handleAuthStateChange);

  return () => {
    window.removeEventListener('authStateChanged', handleAuthStateChange);
    window.removeEventListener('userLoggedOut', handleAuthStateChange);
  };
}, []);



  // Animaciones GSAP existentes
  useEffect(() => {
    if (navRef.current) {
      gsap.fromTo(navRef.current, 
        { y: -20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }
      );
    }
  }, []);

  useEffect(() => {
    if (showServicesDropdown && servicesDropdownRef.current) {
      gsap.fromTo(servicesDropdownRef.current,
        { opacity: 0, y: -10, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.3, ease: "power3.out" }
      );
    }
  }, [showServicesDropdown]);

  useEffect(() => {
    if (showMobileMenu && mobileMenuRef.current) {
      gsap.fromTo(mobileMenuRef.current,
        { height: 0, opacity: 0 },
        { height: "auto", opacity: 1, duration: 0.4, ease: "power3.out" }
      );
    }
  }, [showMobileMenu]);

  const handleTokenChange = (newBalance: number) => {
    setTokenBalance(newBalance);
  };

  const handleToggleTokenPanel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowTokenPanel(!showTokenPanel);
  };

  const handleToggleUserDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowUserDropdown(!showUserDropdown);
  };

  const handleLogout = async () => {
    try {
      // 1. Llamar al logout del authService (si existe)
      // await authService.logout();
      
      // 2. Limpiar localStorage/sessionStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('refreshToken');
      sessionStorage.clear();
      
      // 3. Limpiar estado local inmediatamente
      setUser(null);
      setIsAuth(false);
      setTokenBalance(0);
      setShowUserDropdown(false);
      setShowTokenPanel(false);
      
      // 4. Emitir evento para que otros componentes se enteren
      window.dispatchEvent(new CustomEvent('userLoggedOut'));
      
      // 5. Opcional: redirigir al login
      window.location.href = '/login';
      
    } catch (error) {
      console.error('Error during logout:', error);
      // Limpiar estado local incluso si hay error
      setUser(null);
      setIsAuth(false);
      setTokenBalance(0);
      setShowUserDropdown(false);
    }
  };

  // Manejo de clicks fuera de los dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tokenPanelRef.current && !tokenPanelRef.current.contains(event.target as Node)) {
        setShowTokenPanel(false);
      }
      if (servicesDropdownRef.current && !servicesDropdownRef.current.contains(event.target as Node)) {
        setShowServicesDropdown(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
    };

    if (showTokenPanel || showServicesDropdown || showUserDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showTokenPanel, showServicesDropdown, showUserDropdown]);

  return (
    <nav 
      ref={navRef}
      className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/50"
    >
      <div className="max-w-4xl mx-auto px-6">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3">
            <div className="relative">
              <img 
                src={logo} 
                alt="Pixel Perfect AI Logo" 
                className="w-8 h-8 object-contain"
              />
            </div>
            <h1 className="text-xl font-medium text-slate-900 tracking-tight">
              Pixel Perfect AI
            </h1>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a
              href="/"
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium transition-colors duration-200"
            >
              <Home size={16} />
              Home
            </a>
            
            {/* Services Dropdown - Solo visible si está autenticado */}
            {isAuth && (
              <div className="relative" ref={servicesDropdownRef}>
                <button
                  onClick={() => setShowServicesDropdown(!showServicesDropdown)}
                  className="flex items-center gap-1 text-slate-600 hover:text-slate-900 font-medium transition-colors duration-200"
                >
                  Services
                  <ChevronDown 
                    size={16} 
                    className={`transition-transform duration-200 ${showServicesDropdown ? 'rotate-180' : ''}`} 
                  />
                </button>

                {showServicesDropdown && (
                  <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200/50 overflow-hidden">
                    <div className="p-2">
                      {[
                        { href: "/background-removal", icon: Scissors, title: "Background Removal", desc: "Remove backgrounds instantly" },
                        { href: "/enlarge", icon: Expand, title: "Image Enlargement", desc: "Expand canvas with AI" },
                        { href: "/upscale", icon: Maximize, title: "Image Upscaling", desc: "Enhance image quality" },
                        { href: "/object-removal", icon: Sparkles, title: "Object Removal", desc: "Remove unwanted objects" },
                      ].map((service) => (
                        <a
                          key={service.href}
                          href={service.href}
                          className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors duration-200 group"
                        >
                          <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center group-hover:bg-slate-900 transition-colors duration-200">
                            <service.icon className="text-slate-600 group-hover:text-white transition-colors duration-200" size={18} />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-slate-900">{service.title}</div>
                            <div className="text-slate-500 text-sm">{service.desc}</div>
                          </div>
                        </a>
                      ))}
                      <div className="flex items-center gap-3 p-3 rounded-xl opacity-50 cursor-not-allowed">
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center">
                          <Palette className="text-white" size={18} />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-slate-900">Style Transfer</div>
                          <div className="text-slate-500 text-sm">Coming soon</div>
                        </div>
                        <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full font-medium">Soon</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right side - Auth & Mobile Menu */}
          <div className="flex items-center space-x-4">
            {isAuth && user ? (
              <>
                <div className="hidden md:flex items-center space-x-4">
                  {/* Token Balance */}
                  <button
                    onClick={handleToggleTokenPanel}
                    className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl font-medium text-slate-700 transition-colors duration-200"
                  >
                    <Coins size={16} />
                    <span>{tokenBalance}</span>
                  </button>
                  
                  {/* User Dropdown */}
                  <div className="relative" ref={userDropdownRef}>
                    <button
                      onClick={handleToggleUserDropdown}
                      className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium transition-colors duration-200"
                    >
                      <User size={16} />
                      <span className="max-w-32 truncate">{user.displayName || user.email || 'Usuario'}</span>
                      <ChevronDown 
                        size={14} 
                        className={`transition-transform duration-200 ${showUserDropdown ? 'rotate-180' : ''}`} 
                      />
                    </button>

                    {showUserDropdown && (
                      <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-200/50 overflow-hidden">
                        <div className="p-2">
                          <div className="p-3 border-b border-slate-100">
                            <div className="font-medium text-slate-900">{user.displayName || 'Usuario'}</div>
                            <div className="text-slate-500 text-sm">{user.email}</div>
                          </div>
                          <a
                            href="/profile"
                            className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors duration-200"
                          >
                            <User size={16} className="text-slate-600" />
                            <span className="text-slate-700">Perfil</span>
                          </a>
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-50 transition-colors duration-200 text-red-600"
                          >
                            <span>Cerrar Sesión</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="hidden md:flex items-center space-x-4">
                <a 
                  href="/login" 
                  className="text-slate-600 hover:text-slate-900 font-medium transition-colors duration-200"
                >
                  Sign In
                </a>
                <a 
                  href="/login" 
                  className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl font-medium transition-colors duration-200"
                >
                  Get Started
                </a>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors duration-200"
            >
              {showMobileMenu ? (
                <X size={20} className="text-slate-700" />
              ) : (
                <Menu size={20} className="text-slate-700" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div
          ref={mobileMenuRef}
          className="md:hidden bg-white/95 backdrop-blur-xl border-t border-slate-200/50"
        >
          <div className="px-6 py-4 space-y-1">
            <a
              href="/"
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors duration-200"
            >
              <Home size={18} className="text-slate-600" />
              <span className="font-medium text-slate-700">Home</span>
            </a>
            
            {isAuth && user ? (
              <>
                <div className="px-3 py-2">
                  <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Services</div>
                  <div className="space-y-1">
                    {[
                      { href: "/background-removal", icon: Scissors, title: "Background Removal" },
                      { href: "/enlarge", icon: Expand, title: "Image Enlargement" },
                      { href: "/upscale", icon: Maximize, title: "Image Upscaling" },
                      { href: "/object-removal", icon: Sparkles, title: "Object Removal" },
                    ].map((service) => (
                      <a
                        key={service.href}
                        href={service.href}
                        className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors duration-200"
                      >
                        <service.icon size={16} className="text-slate-600" />
                        <span className="text-slate-700">{service.title}</span>
                      </a>
                    ))}
                  </div>
                </div>
                
                <div className="border-t border-slate-200/50 pt-4 mt-4">
                  <button
                    onClick={handleToggleTokenPanel}
                    className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors duration-200 mb-2"
                  >
                    <Coins size={18} className="text-slate-600" />
                    <span className="font-medium text-slate-700">{tokenBalance} tokens</span>
                  </button>
                  
                  <div className="p-3 rounded-xl bg-slate-50 mb-2">
                    <div className="font-medium text-slate-900">{user.displayName || 'Usuario'}</div>
                    <div className="text-slate-500 text-sm">{user.email}</div>
                  </div>
                  
                  <a 
                    href="/profile" 
                    className="w-full flex items-center justify-center p-3 rounded-xl hover:bg-slate-50 text-slate-700 font-medium transition-colors duration-200 mb-2"
                  >
                    Perfil
                  </a>
                  
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center p-3 rounded-xl hover:bg-red-50 text-red-600 font-medium transition-colors duration-200"
                  >
                    Cerrar Sesión
                  </button>
                </div>
              </>
            ) : (
              <div className="border-t border-slate-200/50 pt-4 mt-4 space-y-2">
                <a 
                  href="/login" 
                  className="block w-full text-center p-3 rounded-xl hover:bg-slate-50 text-slate-700 font-medium transition-colors duration-200"
                >
                  Sign In
                </a>
                <a 
                  href="/login" 
                  className="block w-full text-center bg-slate-900 hover:bg-slate-800 text-white p-3 rounded-xl font-medium transition-colors duration-200"
                >
                  Get Started
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Token Panel */}
      {showTokenPanel && isAuth && (
        <div
          ref={tokenPanelRef}
          className="absolute top-full right-6 mt-2 w-80 z-50"
        >
          <TokenPanel onTokenChange={handleTokenChange} />
        </div>
      )}
    </nav>
  );
};

export default Navbar;