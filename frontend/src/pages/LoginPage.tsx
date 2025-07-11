import React, { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { Eye, EyeOff, Mail, Lock, Sparkles, User, ArrowRight, Shield } from 'lucide-react';
import { login, register, createGuestUser, storeUserData, resendVerificationEmail } from '../services/authService';
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

 const backgroundImages = [
  "https://i.imgur.com/86ij9Sd.jpeg",
  "https://i.imgur.com/HEhUJ5q.jpeg",
  "https://i.imgur.com/aXmHT1p.jpeg",
  "https://i.imgur.com/mCtgUAu.jpeg",
  "https://i.imgur.com/0YsUKZi.jpeg",
  "https://i.imgur.com/7572PnN.jpeg",
  "https://i.imgur.com/P14Jczs.jpeg"
];

const [selectedIndex, setSelectedIndex] = useState(0);

useEffect(() => {
  const interval = setInterval(() => {
    setSelectedIndex(prevIndex => (prevIndex + 1) % backgroundImages.length);
  }, 3000); // Cambia cada 3 segundos, ajusta el tiempo como quieras

  return () => clearInterval(interval); // limpieza del intervalo al desmontar
}, []);

const selectedImage = backgroundImages[selectedIndex];

  // Refs for animation
  const heroRef = useRef<HTMLDivElement>(null);
  const uploaderRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const formContentRef = useRef<HTMLDivElement>(null);
  const onForgotPassword = () => {
  
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
  <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 relative">
  
  {/* Hero Image Section */}
  <div className="absolute left-0 top-0 bottom-0 right-[500px] hidden lg:block">
    {selectedImage && (
      <img 
        src={selectedImage}
        alt="Hero Background"
        className="w-full h-full object-cover"
      />
    )}
    
    <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-black/30"></div>

    <p className="absolute bottom-4 left-4 text-white text-sm z-10">
      This image was generated by PixelPerfect Gen-AI.
    </p>
  </div>

  
  <div className="h-screen flex items-stretch justify-end relative z-10">
    <div className="w-[500px] h-full flex items-stretch justify-center bg-white">

          {/* Login Form */}
          <div ref={uploaderRef} className="w-full max-w-lg">
      <div className="bg-white p-6 shadow-lg border border-gray-200 h-full flex flex-col justify-center">
        
        {/* Content wrapper */}
        <div className="relative z-10">
          
          {/* Logo and Header */}
          <div ref={formContentRef} className="text-center mb-4">
            <img 
              src={logo} 
              alt="Logo" 
              className="w-12 h-12 mx-auto mb-3"
            />
            <h2 className="text-xl font-medium text-gray-800 mb-1">
              {isLogin ? 'Sign In' : 'Create Account'}
            </h2>
          </div>

          {/* Error Message */}
          {error && !registrationSuccess && !emailVerificationPending && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg mb-4 text-center text-sm">
              {error}
            </div>
          )}

          {/* Registration Success Message */}
          {registrationSuccess && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded-lg mb-4 text-center text-sm">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Mail size={14} />
                <span className="font-medium">Registration Successful!</span>
              </div>
              <p>Check your email ({registrationEmail}) and click the verification link.</p>
              <button
                onClick={handleResendVerification}
                disabled={loading}
                className="mt-1 text-green-600 hover:text-green-800 font-medium text-sm underline"
              >
                Didn't receive the email? Resend
              </button>
            </div>
          )}

          {/* Email Verification Pending Message */}
          {emailVerificationPending && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-3 py-2 rounded-lg mb-4 text-center text-sm">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Mail size={14} />
                <span className="font-medium">Verification Required</span>
              </div>
              <p>Verify your email ({registrationEmail}) to continue.</p>
              <button
                onClick={handleResendVerification}
                disabled={loading}
                className="mt-1 text-yellow-600 hover:text-yellow-800 font-medium text-sm underline"
              >
                Resend verification email
              </button>
            </div>
          )}

          {/* Social Login Buttons */}
          <div className="space-y-2 mb-4">
            <button className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200">
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="text-gray-700 font-medium text-sm">Continue with Google</span>
            </button>

            <button className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.024-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.749.099.12.112.225.085.402-.09.407-.293 1.188-.332 1.355-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.749-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017.001z"/>
              </svg>
              <span className="text-gray-700 font-medium text-sm">Continue with Apple</span>
            </button>

            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              <Mail className="w-4 h-4 text-gray-600" />
              <span className="text-gray-700 font-medium text-sm">Continue with Email</span>
            </button>
          </div>

          {/* Email Form */}
          <form onSubmit={handleSubmit} className="space-y-3 mb-4">
            {!isLogin && (
              <div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm"
                  placeholder="Username"
                  required
                />
              </div>
            )}

            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm"
                placeholder="Email"
                required
              />
            </div>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2.5 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm"
                placeholder="Password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-4 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing...
                </div>
              ) : (
                isLogin ? 'Sign In' : 'Create Account'
              )}
            </button>
          </form>

          {/* Notifications checkbox */}
          <div className="flex items-start gap-2 mb-4">
            <input
              type="checkbox"
              id="notifications"
              className="mt-0.5 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="notifications" className="text-xs text-gray-600 leading-relaxed">
              I don't want to receive promotional email notifications.
            </label>
          </div>

          {/* Guest Login */}
          <button
            onClick={handleGuestLogin}
            disabled={loading}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 px-4 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed mb-4 text-sm"
          >
            <div className="flex items-center justify-center gap-2">
              <User size={16} />
              Continue as Guest
            </div>
          </button>

          {/* Terms and Privacy */}
          <p className="text-center text-xs text-gray-500 mb-3">
            By registering you agree to our{' '}
            <a href="#" className="text-blue-600 hover:underline">Terms of Use</a>
            {' '}and{' '}
            <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>.
          </p>

          {/* Switch Login/Register */}
          <div className="text-center mb-3">
            <span className="text-gray-600 text-sm">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
            </span>
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-blue-600 hover:underline font-medium text-sm ml-1"
            >
              {isLogin ? 'Create Account' : 'Sign In'}
            </button>
          </div>

          {isLogin && (
            <div className="text-center mb-3">
              <button 
                onClick={onForgotPassword}
                className="text-blue-600 hover:underline text-sm"
              >
                Forgot your password?
              </button>
            </div>
          )}

          {/* Cookie Settings */}
          <div className="text-center">
            <button className="text-blue-600 hover:underline text-sm">
              Cookie Settings
            </button>
          </div>
        </div>
      </div>
    </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;