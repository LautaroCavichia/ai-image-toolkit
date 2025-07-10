import React, { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { Eye, EyeOff, Mail, Lock, Sparkles, User, ArrowRight, Shield } from 'lucide-react';
import { login, register, createGuestUser, storeUserData, resendVerificationEmail } from '../services/authService';
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
  const [username, setUsername] = useState('');
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [registrationEmail, setRegistrationEmail] = useState('');
  const [emailVerificationPending, setEmailVerificationPending] = useState(false);

  // Refs for animation
  const heroRef = useRef<HTMLDivElement>(null);
  const uploaderRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const formContentRef = useRef<HTMLDivElement>(null);
  const onForgotPassword = () => {
    // Aquí puedes redirigir a la página de recuperación de contraseña
    window.location.href = '/AuthForm';
  };

  // Animation effect that only runs once
  useEffect(() => {
    if (!hasAnimated) {
      // Set initial states immediately to prevent flash
      if (heroRef.current && uploaderRef.current && featuresRef.current) {
        gsap.set([heroRef.current, uploaderRef.current, featuresRef.current], {
          opacity: 0,
          y: 40,
          scale: 0.95,
          filter: 'blur(8px)'
        });

        // Create entrance animation
        const tl = gsap.timeline({ delay: 0.1 });
        
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
  }, [hasAnimated]);

  // Subtle animation for form content when switching between login/signup
  useEffect(() => {
    if (hasAnimated && formContentRef.current) {
      gsap.fromTo(formContentRef.current, 
        { opacity: 0.7, y: 10 },
        { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }
      );
    }
  }, [isLogin, hasAnimated]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setRegistrationSuccess(false);
    setEmailVerificationPending(false);

    try {
      if (isLogin) {
        const response = await login({email, password });
        storeUserData(response);
        window.location.href = '/';
      } else {
        const response = await register({displayName: username, email, password });
        setRegistrationSuccess(true);
        setRegistrationEmail(email);
      }
    } catch (err: any) {
      // Handle email verification error specifically
      if (err.type === 'EMAIL_NOT_VERIFIED') {
        setEmailVerificationPending(true);
        setRegistrationEmail(err.email);
        setError(err.message);
      } else {
        setError(err.message || 'An error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setLoading(true);
    setError('');
    
    try {
      await resendVerificationEmail(registrationEmail);
      setError('Verification email sent! Please check your inbox.');
    } catch (err: any) {
      setError(err.message || 'Failed to resend verification email');
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
            <div className="bg-white/60 backdrop-blur-xl p-6 md:p-8 rounded-3xl shadow-xl border border-slate-200/50">
              
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
              {error && !registrationSuccess && !emailVerificationPending && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl mb-8 text-center">
                  {error}
                </div>
              )}

              {/* Registration Success Message */}
              {registrationSuccess && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-2xl mb-8 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Mail size={20} />
                    <span className="font-medium">Registration Successful!</span>
                  </div>
                  <p>Please check your email ({registrationEmail}) and click the verification link to activate your account.</p>
                  <button
                    onClick={handleResendVerification}
                    disabled={loading}
                    className="mt-3 text-green-600 hover:text-green-800 font-medium text-sm underline"
                  >
                    Didn't receive email? Resend verification
                  </button>
                </div>
              )}

              {/* Email Verification Pending Message */}
              {emailVerificationPending && (
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-6 py-4 rounded-2xl mb-8 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Mail size={20} />
                    <span className="font-medium">Email Verification Required</span>
                  </div>
                  <p>Please verify your email address ({registrationEmail}) before signing in.</p>
                  <button
                    onClick={handleResendVerification}
                    disabled={loading}
                    className="mt-3 text-yellow-600 hover:text-yellow-800 font-medium text-sm underline"
                  >
                    Resend verification email
                  </button>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-6">

               {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">Username</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500" size={20} />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-white/90 backdrop-blur-sm border border-slate-200/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 text-slate-900 placeholder-slate-400"
                      placeholder="Choose a username"
                      required
                    />
                  </div>
                </div>
              )}

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

              {isLogin && (
            <div className="mt-8 text-center">
              <button onClick={onForgotPassword}>
                Forgot your Password?
              </button>
            </div>
          )}

              {/* Guest Login */}
        <div className="pt-8 border-t border-slate-200/50">
          <button
            onClick={handleGuestLogin}
            disabled={loading}
           className="
            w-full 
            bg-gradient-to-r from-[#0d47a1] via-[#42a5f5] to-[#0d47a1] 
            hover:from-[#1565c0] hover:via-[#64b5f6] hover:to-[#1565c0] 
            text-white 
            py-5 px-8 
            rounded-2xl 
            font-semibold 
            transition-all duration-500 
            hover:shadow-lg hover:shadow-blue-400/40 
            disabled:opacity-50 disabled:cursor-not-allowed 
            border border-blue-600/30 
            hover:border-blue-400/60 
            hover:scale-[1.03] transform 
            relative overflow-hidden 
            group 
            backdrop-blur-sm
          "
          >
           
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 group-hover:animate-pulse"></div>
            
          
            
            <div className="flex items-center justify-center gap-4 relative z-10">
              <div className="p-1 rounded-full bg-white/10 group-hover:bg-white/15 transition-all duration-300">
                <User size={18} className="group-hover:scale-110 transition-transform duration-300" />
              </div>
              <span className="text-base font-medium tracking-wide letter-spacing-wider">Continue as Guest</span>
              <div className="p-1 rounded-full bg-white/10 group-hover:bg-white/15 transition-all duration-300">
                <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform duration-300" />
              </div>
            </div>
            
        
            <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/5 to-transparent rounded-t-2xl"></div>
            
        
            <div className="absolute top-3 right-6 w-1 h-1 bg-white/30 rounded-full animate-pulse opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
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