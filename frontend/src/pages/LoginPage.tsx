import React, { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { Eye, EyeOff, Mail, Lock, Sparkles, User, ArrowRight, Shield } from 'lucide-react';
import { login, register, createGuestUser, storeUserData } from '../services/authService';
import { useFirstVisit } from '../hooks/useFirstVisit';
import ServicePreloader from '../components/ServicePreloader';
import AnimatedGradientMesh from '../components/AnimatedGradientMesh';
import logo from '../assets/logo.png';

const LoginPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);

  // Refs for animation
  const heroRef = useRef<HTMLDivElement>(null);
  const uploaderRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const preloaderRef = useRef<HTMLDivElement>(null);
  const formContentRef = useRef<HTMLDivElement>(null);

  // Enhanced animation system for login page
  const { isFirstVisit, isLoading: isCheckingVisit } = useFirstVisit({ serviceType: 'login' });

  // Animation effect that only runs once
  useEffect(() => {
    if (!hasAnimated && !isCheckingVisit) {
      // Set initial states immediately to prevent flash
      if (heroRef.current && uploaderRef.current && featuresRef.current) {
        gsap.set([heroRef.current, uploaderRef.current, featuresRef.current], {
          opacity: 0,
          y: 40,
          scale: 0.95,
          filter: 'blur(8px)'
        });

        // Create entrance animation
        const tl = gsap.timeline({ delay: isFirstVisit ? 2.2 : 0.1 });
        
        tl.to(heroRef.current, {
          opacity: 1,
          y: 0,
          scale: 1,
          filter: 'blur(0px)',
          duration: 1.4,
          ease: "power4.out"
        })
        .to(uploaderRef.current, {
          opacity: 1,
          y: 0,
          scale: 1,
          filter: 'blur(0px)',
          duration: 1.2,
          ease: "power3.out"
        }, "-=0.9")
        .to(featuresRef.current, {
          opacity: 1,
          y: 0,
          scale: 1,
          filter: 'blur(0px)',
          duration: 0.8,
          ease: "power2.out"
        }, "-=0.3");

        setHasAnimated(true);
      }
    }
  }, [hasAnimated, isCheckingVisit, isFirstVisit]);

  // Subtle animation for form content when switching between login/signup
  useEffect(() => {
    if (hasAnimated && formContentRef.current) {
      gsap.fromTo(formContentRef.current, 
        { opacity: 0.7, y: 10 },
        { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }
      );
    }
  }, [isLogin, hasAnimated]);

  // Show loading state while checking first visit
  if (isCheckingVisit) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let response;
      if (isLogin) {
        response = await login({ email, password });
      } else {
        response = await register({ email, password });
      }
      
      storeUserData(response);
      window.location.href = '/';
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setLoading(true);
    try {
      const response = await createGuestUser();
      storeUserData(response);
      window.location.href = '/';
    } catch (err: any) {
      setError(err.message || 'Failed to create guest user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 relative overflow-hidden">
      {isFirstVisit && (
        <div ref={preloaderRef}>
          <ServicePreloader serviceType="background-removal" />
        </div>
      )}
      
      <AnimatedGradientMesh variant="background-removal" intensity="subtle" />
      
      <div className="min-h-screen flex items-center justify-center p-6 relative z-10">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Hero Section */}
          <div ref={heroRef} className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-full font-medium text-sm mb-8">
              <Shield size={16} />
              Secure Authentication
            </div>
            <h1 className="text-5xl md:text-6xl font-light text-slate-900 mb-6 leading-tight tracking-tight">
              Welcome to
              <br />
              <span className="font-medium italic bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 bg-clip-text text-transparent">
                PixelPerfect
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-600 max-w-2xl leading-relaxed font-light mb-8">
              Transform your images with cutting-edge AI technology.
              <br />
              <em className="text-slate-500">Professional results in seconds.</em>
            </p>
          </div>

          {/* Login Form */}
          <div ref={uploaderRef} className="w-full max-w-md mx-auto lg:mx-0">
            <div className="bg-white/60 backdrop-blur-xl p-8 md:p-12 rounded-3xl shadow-xl border border-slate-200/50">
              
              {/* Logo and Header */}
              <div ref={formContentRef} className="text-center mb-8">
                <img 
                  src={logo} 
                  alt="Pixel Perfect AI" 
                  className="w-16 h-16 mx-auto mb-6 drop-shadow-2xl"
                />
                <h2 className="text-3xl font-light text-slate-900 mb-3 tracking-tight">
                  {isLogin ? 'Welcome Back' : 'Create Account'}
                </h2>
                <p className="text-slate-600 text-lg">
                  {isLogin ? 'Sign in to continue your journey' : 'Join the AI revolution today'}
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl mb-8 text-center">
                  {error}
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500" size={20} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-white/90 backdrop-blur-sm border border-slate-200/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 text-slate-900 placeholder-slate-400"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500" size={20} />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-12 pr-14 py-4 bg-white/90 backdrop-blur-sm border border-slate-200/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 text-slate-900 placeholder-slate-400"
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-700 transition-colors duration-200"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white py-4 px-8 rounded-2xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] text-lg"
                >
                  <div className="flex items-center justify-center gap-3">
                    {loading ? (
                      <>
                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Sparkles size={20} />
                        {isLogin ? 'Sign In' : 'Create Account'}
                        <ArrowRight size={20} />
                      </>
                    )}
                  </div>
                </button>
              </form>

              {/* Switch Login/Register */}
              <div className="mt-8 text-center">
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-slate-600 hover:text-slate-900 font-medium transition-colors duration-200"
                >
                  {isLogin ? 'Need an account? Sign up' : 'Already have an account? Sign in'}
                </button>
              </div>

              {/* Guest Login */}
              <div className="mt-8 pt-8 border-t border-slate-200/50">
                <button
                  onClick={handleGuestLogin}
                  disabled={loading}
                  className="w-full bg-white/80 hover:bg-white text-slate-700 py-4 px-8 rounded-2xl font-medium transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed border border-slate-200/50 hover:scale-[1.02]"
                >
                  <div className="flex items-center justify-center gap-3">
                    <User size={20} />
                    Continue as Guest
                    <ArrowRight size={20} />
                  </div>
                </button>
              </div>

              {/* Security Note */}
              <div className="mt-6 p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl border border-slate-200/50 text-center">
                <p className="text-slate-600 text-sm">
                  <Shield className="inline w-4 h-4 mr-1" />
                  Your data is encrypted and secure
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;