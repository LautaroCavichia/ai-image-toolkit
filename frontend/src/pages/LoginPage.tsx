import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, Sparkles, User } from 'lucide-react';
import { login, register, createGuestUser, storeUserData } from '../services/authService';
import logo from '../assets/logo.png';

const LoginPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

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
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="bg-white/95 backdrop-blur-xl p-8 rounded-2xl shadow-2xl w-full max-w-md border border-neutral-200/50"
      >
        <div className="text-center mb-8">
          <motion.img 
            src={logo} 
            alt="Pixel Perfect AI" 
            className="w-16 h-16 mx-auto mb-4 filter drop-shadow-lg"
            whileHover={{ scale: 1.05, rotate: 3 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          />
          <motion.h2 
            className="text-2xl font-system font-semibold text-ice-900 mb-2 tracking-tight"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </motion.h2>
          <motion.p 
            className="text-ice-600 font-system text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            {isLogin ? 'Sign in to your account' : 'Join the AI image revolution'}
          </motion.p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50/80 backdrop-blur-sm border border-red-200/50 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm font-system"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <label className="block text-sm font-medium text-ice-700 mb-2 font-system">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-ice-500" size={18} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white/90 border border-neutral-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-glacier-500 focus:border-glacier-500 transition-all duration-200 font-system text-ice-900 placeholder-ice-400"
                placeholder="Enter your email"
                required
              />
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <label className="block text-sm font-medium text-ice-700 mb-2 font-system">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-ice-500" size={18} />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-12 py-3 bg-white/90 border border-neutral-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-glacier-500 focus:border-glacier-500 transition-all duration-200 font-system text-ice-900 placeholder-ice-400"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-ice-500 hover:text-ice-700 transition-colors duration-200"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </motion.div>

          <motion.button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-button text-white py-3 px-6 rounded-xl font-system font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <div className="flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <motion.div 
                    className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  Processing...
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  {isLogin ? 'Sign In' : 'Create Account'}
                </>
              )}
            </div>
          </motion.button>
        </form>

        <motion.div 
          className="mt-6 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-glacier-600 hover:text-glacier-700 font-system text-sm font-medium transition-colors duration-200"
          >
            {isLogin ? 'Need an account? Sign up' : 'Already have an account? Sign in'}
          </button>
        </motion.div>

        <motion.div 
          className="mt-6 pt-6 border-t border-neutral-200/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <motion.button
            onClick={handleGuestLogin}
            disabled={loading}
            className="w-full bg-ice-100 text-ice-700 py-3 px-6 rounded-xl font-system font-medium transition-all duration-200 hover:bg-ice-200 disabled:opacity-50 disabled:cursor-not-allowed border border-ice-200/50"
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
          >
            <div className="flex items-center justify-center gap-2">
              <User size={18} />
              Continue as Guest
            </div>
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LoginPage;