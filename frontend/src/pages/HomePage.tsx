import React from 'react';
import Layout from '../components/Layout';
import Navbar from '../components/Navbar';
import { isAuthenticated } from '../services/authService';
import { Scissors, Search, Maximize, Sparkles, Palette, Zap, Target, Settings, ArrowRight, Sparkle, TrendingUp, Shield } from 'lucide-react';
import logo from '../assets/logo.png';

const HomePage: React.FC = () => {
  if (!isAuthenticated()) {
    return (
      <Layout>
        <Navbar />
        <div className="min-h-screen bg-gradient-hero flex items-center justify-center px-4">
          <div className="max-w-2xl text-center">
            <div className="glass rounded-3xl p-12 shadow-glass-lg">
              <div className="mb-8">
                <img 
                  src={logo} 
                  alt="Pixel Perfect AI" 
                  className="w-24 h-24 mx-auto mb-6 animate-float filter drop-shadow-2xl"
                />
                <h1 className="text-4xl font-bold font-title text-gradient-primary mb-4">
                  Welcome to Pixel Perfect AI
                </h1>
                <p className="text-lg text-neutral-700 font-title leading-relaxed">
                  Professional image processing powered by cutting-edge AI technology.
                </p>
              </div>
              <a 
                href="/login" 
                className="inline-flex items-center gap-3 bg-gradient-primary text-white px-8 py-4 rounded-2xl font-title font-semibold hover:scale-105 hover:shadow-glass-lg transition-all duration-300 group"
              >
                <Sparkle size={20} className="group-hover:rotate-12 transition-transform duration-300" />
                Get Started
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform duration-300" />
              </a>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative min-h-screen bg-gradient-hero overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-br from-primary-400/20 to-secondary-400/20 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-br from-accent-400/20 to-primary-400/20 rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-secondary-400/20 to-accent-400/20 rounded-full blur-3xl animate-float" style={{animationDelay: '4s'}}></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 pt-20 pb-32">
          <div className="text-center mb-16">
            {/* Hero Logo */}
            <div className="mb-12 relative group">
              <div className="absolute inset-0 bg-gradient-primary rounded-full blur-2xl opacity-30 group-hover:opacity-50 transition-opacity duration-700 w-32 h-32 mx-auto"></div>
              <img 
                src={logo} 
                alt="Pixel Perfect AI" 
                className="w-32 h-32 mx-auto relative z-10 animate-float group-hover:scale-110 group-hover:rotate-12 transition-all duration-700 filter drop-shadow-2xl cursor-pointer"
              />
            </div>
            
            <div className="max-w-5xl mx-auto">
              <h1 className="text-6xl md:text-8xl font-title font-bold mb-8 leading-tight animate-fade-in">
                Transform Images with{' '}
                <span className="font-accent italic text-gradient-primary relative">
                  AI Magic
                  <div className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-primary rounded-full opacity-50"></div>
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-neutral-700 mb-12 max-w-4xl mx-auto leading-relaxed font-title font-light animate-slide-up">
                Professional image processing powered by cutting-edge AI technology. 
                <span className="font-accent italic text-gradient-reverse"> 
                  Remove, enhance, transform, and perfect
                </span> your images with precision.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center animate-scale-in">
                <a 
                  href="/background-removal" 
                  className="group relative overflow-hidden bg-gradient-primary text-white px-10 py-5 rounded-2xl font-title font-semibold text-lg transition-all duration-500 hover:scale-105 hover:shadow-glass-lg"
                >
                  <div className="absolute inset-0 bg-gradient-primary-reverse opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <span className="relative flex items-center gap-3">
                    <Scissors size={24} className="group-hover:rotate-12 transition-transform duration-300" />
                    Start Creating
                    <Sparkle size={20} className="group-hover:scale-125 transition-transform duration-300" />
                  </span>
                </a>
                
                <a 
                  href="#services" 
                  className="group glass border border-white/40 text-neutral-800 px-10 py-5 rounded-2xl font-title font-semibold text-lg transition-all duration-500 hover:scale-105 hover:shadow-glass-lg"
                >
                  <span className="flex items-center gap-3">
                    <TrendingUp size={24} className="text-primary-600 group-hover:scale-110 transition-transform duration-300" />
                    Explore Services
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform duration-300" />
                  </span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Services Section */}
      <div id="services" className="relative py-32 bg-gradient-to-b from-neutral-50 to-white overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-gradient-to-br from-primary-300/10 to-secondary-300/10 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-gradient-to-br from-accent-300/10 to-primary-300/10 rounded-full blur-3xl animate-pulse-slow" style={{animationDelay: '2s'}}></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-3 bg-gradient-primary text-white px-6 py-3 rounded-full font-title font-medium text-sm mb-6 shadow-glass">
              <Shield size={16} />
              Professional AI Services
            </div>
            <h2 className="text-5xl md:text-6xl font-title font-bold text-neutral-900 mb-6 leading-tight">
              <span className="text-gradient-primary">AI-Powered</span>{' '}
              <span className="font-accent italic">Image Services</span>
            </h2>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto font-title font-light">
              Choose the perfect tool for your image processing needs. Each service is crafted with precision and powered by state-of-the-art AI technology.
            </p>
          </div>

          {/* Main Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {/* Background Removal */}
            <a 
              href="/background-removal" 
              className="group relative glass p-8 rounded-3xl shadow-glass hover:shadow-glass-lg transition-all duration-500 border border-white/30 hover:border-primary-300/50 backdrop-blur-2xl transform hover:scale-105 hover:-translate-y-4 animate-fade-in"
            >
              <div className="absolute inset-0 bg-gradient-glass-orange opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
              
              <div className="relative z-10">
                <div className="mb-6 relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-glass">
                    <Scissors className="text-white" size={28} />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-primary rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <Sparkle className="text-white" size={12} />
                  </div>
                </div>
                
                <h3 className="text-xl font-title font-bold text-neutral-900 mb-3 group-hover:text-primary-700 transition-colors duration-300">
                  Background Removal
                </h3>
                <p className="text-neutral-600 text-sm mb-6 leading-relaxed font-title">
                  Remove backgrounds with AI precision. Perfect for product photos, portraits, and e-commerce.
                </p>
                
                <div className="flex items-center justify-between">
                  <span className="text-primary-600 font-title font-semibold text-sm">
                    1 token per image
                  </span>
                  <ArrowRight size={16} className="text-primary-600 group-hover:translate-x-1 group-hover:scale-110 transition-all duration-300" />
                </div>
              </div>
            </a>

            {/* Image Upscaling */}
            <a 
              href="/upscale" 
              className="group relative glass p-8 rounded-3xl shadow-glass hover:shadow-glass-lg transition-all duration-500 border border-white/30 hover:border-secondary-300/50 backdrop-blur-2xl transform hover:scale-105 hover:-translate-y-4 animate-fade-in"
              style={{animationDelay: '100ms'}}
            >
              <div className="absolute inset-0 bg-gradient-glass-blue opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
              
              <div className="relative z-10">
                <div className="mb-6 relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-secondary-400 to-secondary-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-glass">
                    <Search className="text-white" size={28} />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-primary rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <Sparkle className="text-white" size={12} />
                  </div>
                </div>
                
                <h3 className="text-xl font-title font-bold text-neutral-900 mb-3 group-hover:text-secondary-700 transition-colors duration-300">
                  Image Upscaling
                </h3>
                <p className="text-neutral-600 text-sm mb-6 leading-relaxed font-title">
                  Enhance resolution up to 4x while preserving quality and fine details with advanced AI.
                </p>
                
                <div className="flex items-center justify-between">
                  <span className="text-secondary-600 font-title font-semibold text-sm">
                    2 tokens per image
                  </span>
                  <ArrowRight size={16} className="text-secondary-600 group-hover:translate-x-1 group-hover:scale-110 transition-all duration-300" />
                </div>
              </div>
            </a>

            {/* Image Enlargement */}
            <a 
              href="/enlarge" 
              className="group relative glass p-8 rounded-3xl shadow-glass hover:shadow-glass-lg transition-all duration-500 border border-white/30 hover:border-accent-300/50 backdrop-blur-2xl transform hover:scale-105 hover:-translate-y-4 animate-fade-in"
              style={{animationDelay: '200ms'}}
            >
              <div className="absolute inset-0 bg-gradient-glass-purple opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
              
              <div className="relative z-10">
                <div className="mb-6 relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-accent-400 to-accent-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-glass">
                    <Maximize className="text-white" size={28} />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-primary rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <Sparkle className="text-white" size={12} />
                  </div>
                </div>
                
                <h3 className="text-xl font-title font-bold text-neutral-900 mb-3 group-hover:text-accent-700 transition-colors duration-300">
                  Image Enlargement
                </h3>
                <p className="text-neutral-600 text-sm mb-6 leading-relaxed font-title">
                  Intelligently enlarge images with AI-generated content to fill new dimensions perfectly.
                </p>
                
                <div className="flex items-center justify-between">
                  <span className="text-accent-600 font-title font-semibold text-sm">
                    2 tokens per image
                  </span>
                  <ArrowRight size={16} className="text-accent-600 group-hover:translate-x-1 group-hover:scale-110 transition-all duration-300" />
                </div>
              </div>
            </a>

            {/* Object Removal */}
            <a 
              href="/object-removal" 
              className="group relative glass p-8 rounded-3xl shadow-glass hover:shadow-glass-lg transition-all duration-500 border border-white/30 hover:border-primary-300/50 backdrop-blur-2xl transform hover:scale-105 hover:-translate-y-4 animate-fade-in"
              style={{animationDelay: '300ms'}}
            >
              <div className="absolute inset-0 bg-gradient-glass-orange opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
              
              <div className="relative z-10">
                <div className="mb-6 relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-glass">
                    <Sparkles className="text-white" size={28} />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-primary rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <Sparkle className="text-white" size={12} />
                  </div>
                </div>
                
                <h3 className="text-xl font-title font-bold text-neutral-900 mb-3 group-hover:text-primary-700 transition-colors duration-300">
                  Object Removal
                </h3>
                <p className="text-neutral-600 text-sm mb-6 leading-relaxed font-title">
                  Remove unwanted objects with AI-powered inpainting technology and seamless blending.
                </p>
                
                <div className="flex items-center justify-between">
                  <span className="text-primary-600 font-title font-semibold text-sm">
                    3 tokens per image
                  </span>
                  <ArrowRight size={16} className="text-primary-600 group-hover:translate-x-1 group-hover:scale-110 transition-all duration-300" />
                </div>
              </div>
            </a>
          </div>

          {/* Coming Soon Service */}
          <div className="max-w-4xl mx-auto mb-20">
            <a 
              href="/style-transfer" 
              className="group relative glass p-8 rounded-3xl border border-warning-300/40 hover:border-warning-400/60 transition-all duration-500 block backdrop-blur-2xl transform hover:scale-102 hover:shadow-glass-lg animate-fade-in"
              style={{animationDelay: '400ms'}}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-warning-50/50 to-primary-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
              
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-8">
                  <div className="relative">
                    <div className="w-20 h-20 bg-gradient-to-br from-warning-400 to-warning-600 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-glass">
                      <Palette className="text-white" size={32} />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <Sparkle className="text-white" size={16} />
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-3xl font-title font-bold text-neutral-900 mb-2 group-hover:text-warning-700 transition-colors duration-300">
                      Style Transfer
                    </h3>
                    <p className="text-lg text-neutral-600 font-title mb-2">
                      Transform images with artistic styles and creative effects.
                    </p>
                    <p className="text-sm text-neutral-500 font-title font-light italic">
                      Advanced AI model training in progress...
                    </p>
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="glass-orange px-6 py-3 rounded-full border border-warning-400/40 mb-4">
                    <span className="text-warning-700 font-title font-bold text-sm">Coming Soon</span>
                  </div>
                  <div className="text-warning-600 font-title font-semibold text-sm">
                    Notify me when ready
                  </div>
                </div>
              </div>
            </a>
          </div>
        </div>
      </div>
      
      {/* Features Section */}
      <div className="relative py-32 bg-gradient-to-b from-white to-neutral-50 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-gradient-to-br from-secondary-300/10 to-accent-300/10 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-gradient-to-br from-primary-300/10 to-secondary-300/10 rounded-full blur-3xl animate-pulse-slow" style={{animationDelay: '3s'}}></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-3 bg-gradient-primary text-white px-6 py-3 rounded-full font-title font-medium text-sm mb-6 shadow-glass">
              <Target size={16} />
              Why Choose Us
            </div>
            <h2 className="text-5xl md:text-6xl font-title font-bold text-neutral-900 mb-6 leading-tight">
              <span className="font-accent italic text-gradient-reverse">Powerful</span>{' '}
              AI Technology
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center group animate-fade-in">
              <div className="relative mb-8">
                <div className="w-24 h-24 glass rounded-3xl flex items-center justify-center mx-auto shadow-glass border border-primary-300/30 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-400/20 to-secondary-400/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                  <Zap className="text-primary-600 relative z-10" size={36} />
                </div>
              </div>
              <h3 className="text-2xl font-title font-bold text-neutral-900 mb-4 group-hover:text-primary-700 transition-colors duration-300">
                Lightning Fast
              </h3>
              <p className="text-neutral-600 leading-relaxed font-title">
                Advanced AI models optimized for speed without compromising quality. Process images in seconds, not minutes.
              </p>
            </div>

            <div className="text-center group animate-fade-in" style={{animationDelay: '100ms'}}>
              <div className="relative mb-8">
                <div className="w-24 h-24 glass rounded-3xl flex items-center justify-center mx-auto shadow-glass border border-secondary-300/30 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                  <div className="absolute inset-0 bg-gradient-to-br from-secondary-400/20 to-accent-400/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                  <Target className="text-secondary-600 relative z-10" size={36} />
                </div>
              </div>
              <h3 className="text-2xl font-title font-bold text-neutral-900 mb-4 group-hover:text-secondary-700 transition-colors duration-300">
                Precise Results
              </h3>
              <p className="text-neutral-600 leading-relaxed font-title">
                Professional-grade results with pixel-perfect accuracy. Our AI understands context and detail like never before.
              </p>
            </div>

            <div className="text-center group animate-fade-in" style={{animationDelay: '200ms'}}>
              <div className="relative mb-8">
                <div className="w-24 h-24 glass rounded-3xl flex items-center justify-center mx-auto shadow-glass border border-accent-300/30 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                  <div className="absolute inset-0 bg-gradient-to-br from-accent-400/20 to-primary-400/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                  <Settings className="text-accent-600 relative z-10" size={36} />
                </div>
              </div>
              <h3 className="text-2xl font-title font-bold text-neutral-900 mb-4 group-hover:text-accent-700 transition-colors duration-300">
                Easy to Use
              </h3>
              <p className="text-neutral-600 leading-relaxed font-title">
                Simple interface designed for both beginners and professionals. Drag, drop, and watch the magic happen.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default HomePage;