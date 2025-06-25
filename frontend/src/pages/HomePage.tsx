import React, { useEffect, useRef, useState } from 'react';
import Layout from '../components/Layout';
import Navbar from '../components/Navbar';
import LoadingScreen from '../components/LoadingScreen';
import { isAuthenticated } from '../services/authService';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Scissors, Maximize, Sparkles, Zap, Target, Shield, ArrowRight, Star } from 'lucide-react';
import logo from '../assets/logo.png';

gsap.registerPlugin(ScrollTrigger);

const HomePage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLImageElement>(null);
  const servicesRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);

  const handleLoadingComplete = () => {
    setIsLoading(false);
    setTimeout(() => setShowContent(true), 100);
  };

  useEffect(() => {
    if (!showContent) return;

    // Main entrance timeline
    const tl = gsap.timeline();
    
    // Set initial states
    gsap.set([logoRef.current, titleRef.current, subtitleRef.current, ctaRef.current], {
      opacity: 0,
      y: 40,
      scale: 0.95
    });
    
    // Enhanced entrance animations with Apple-like easing
    tl.to(logoRef.current, 
      { 
        opacity: 1, 
        scale: 1, 
        y: 0, 
        duration: 1.2, 
        ease: "power3.out",
        filter: "blur(0px)"
      }
    )
    .to(titleRef.current,
      { 
        opacity: 1, 
        y: 0, 
        scale: 1,
        duration: 1.4, 
        ease: "power3.out" 
      },
      "-=0.8"
    )
    .to(subtitleRef.current,
      { 
        opacity: 1, 
        y: 0, 
        scale: 1,
        duration: 1.2, 
        ease: "power3.out" 
      },
      "-=1.0"
    )
    .to(ctaRef.current,
      { 
        opacity: 1, 
        y: 0, 
        scale: 1,
        duration: 1, 
        ease: "power3.out" 
      },
      "-=0.8"
    );

    // Floating animation for logo
    gsap.to(logoRef.current, {
      y: -8,
      duration: 3,
      repeat: -1,
      yoyo: true,
      ease: "power2.inOut",
      delay: 1.5
    });

    // Gradient text animation
    const gradientText = document.querySelector('.gradient-text');
    if (gradientText) {
      gsap.to(gradientText, {
        backgroundPosition: "200% center",
        duration: 4,
        repeat: -1,
        ease: "none",
        delay: 2
      });
    }

    // Services section animation
    if (servicesRef.current) {
      const serviceCards = servicesRef.current.querySelectorAll('.service-card');
      gsap.fromTo(serviceCards, 
        { 
          opacity: 0, 
          y: 60, 
          scale: 0.9 
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1,
          ease: "power3.out",
          stagger: 0.2,
          scrollTrigger: {
            trigger: servicesRef.current,
            start: "top 80%",
            toggleActions: "play none none reverse"
          }
        }
      );
    }

    // Features section animation
    if (featuresRef.current) {
      const featureCards = featuresRef.current.querySelectorAll('.feature-card');
      gsap.fromTo(featureCards, 
        { 
          opacity: 0, 
          y: 40, 
          scale: 0.95 
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          ease: "power3.out",
          stagger: 0.15,
          scrollTrigger: {
            trigger: featuresRef.current,
            start: "top 85%",
            toggleActions: "play none none reverse"
          }
        }
      );
    }

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
      tl.kill();
    };
  }, [showContent]);

  if (!isAuthenticated()) {
    return (
      <Layout>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-6">
          <div className="max-w-md w-full">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/50">
              <div className="text-center mb-8">
                <img 
                  src={logo} 
                  alt="Pixel Perfect AI" 
                  className="w-16 h-16 mx-auto mb-6 drop-shadow-lg"
                />
                <h1 className="text-2xl font-medium text-slate-900 mb-3 tracking-tight">
                  Welcome to Pixel Perfect AI
                </h1>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Professional image processing powered by cutting-edge AI technology.
                </p>
              </div>
              <a 
                href="/login" 
                className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3 px-6 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
              >
                <Star size={16} />
                Get Started
                <ArrowRight size={16} />
              </a>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const services = [
    {
      href: "/background-removal",
      icon: Scissors,
      title: "Background Removal",
      description: "Remove backgrounds with surgical precision. Perfect for product photography and creative projects.",
      tokens: "1 token"
    },
    {
      href: "/upscale",
      icon: Maximize,
      title: "Image Upscaling",
      description: "Enhance resolution up to 4x while preserving every detail with advanced AI algorithms.",
      tokens: "2 tokens"
    },
    {
      href: "/object-removal",
      icon: Sparkles,
      title: "Object Removal",
      description: "Remove unwanted objects with intelligent content-aware fill technology.",
      tokens: "3 tokens"
    }
  ];

  const features = [
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Process images in seconds with our optimized AI infrastructure."
    },
    {
      icon: Target,
      title: "Pixel Perfect",
      description: "Professional-grade results with unmatched precision and quality."
    },
    {
      icon: Shield,
      title: "Privacy First",
      description: "Your images are processed securely and never stored permanently."
    }
  ];

  if (isLoading) {
    return <LoadingScreen onComplete={handleLoadingComplete} />;
  }

  return (
    <Layout>
      <Navbar />
      
      {/* Hero Section */}
      <div 
        ref={heroRef}
        className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-slate-100 flex items-center justify-center px-6 py-20"
      >
        <div className="max-w-4xl mx-auto text-center">
          <img 
            ref={logoRef}
            src={logo} 
            alt="Pixel Perfect AI" 
            className="w-24 h-24 mx-auto mb-12 drop-shadow-2xl opacity-0"
          />
          
          <h1 
            ref={titleRef}
            className="text-5xl md:text-7xl font-light text-slate-900 mb-8 leading-tight tracking-tight opacity-0"
          >
            Rebel Against
            <br />
            <span className="gradient-text font-medium italic bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent bg-[length:200%_100%]">
              Ordinary Images
            </span>
          </h1>
          
          <p 
            ref={subtitleRef}
            className="text-xl md:text-2xl text-slate-600 mb-12 max-w-3xl mx-auto leading-relaxed font-light opacity-0"
          >
            Break the rules. Transform the mundane. Create the extraordinary.
            <br />
            <em className="text-slate-500">Young creators deserve young tools.</em>
          </p>
          
          <div 
            ref={ctaRef}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center opacity-0"
          >
            <a 
              href="/background-removal" 
              className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-2xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 flex items-center gap-3"
            >
              <Scissors size={20} />
              Start Creating
            </a>
            
            <a 
              href="#services" 
              className="bg-white/60 backdrop-blur-sm border border-slate-200 text-slate-700 px-8 py-4 rounded-2xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 flex items-center gap-3"
            >
              Explore Tools
              <ArrowRight size={20} />
            </a>
          </div>
        </div>
      </div>
      
      {/* Services Section */}
      <div 
        ref={servicesRef}
        id="services" 
        className="py-32 bg-white"
      >
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-light text-slate-900 mb-6 tracking-tight">
              <em className="italic text-slate-600">Powerful</em> AI Tools
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto font-light">
              Everything you need to transform your creative vision into reality.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((service) => (
              <a
                key={service.href}
                href={service.href}
                className="service-card group bg-white border border-slate-200 rounded-3xl p-8 transition-all duration-300 hover:shadow-2xl hover:border-slate-300 hover:-translate-y-2 opacity-0"
              >
                <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-slate-900 transition-colors duration-300">
                  <service.icon className="text-slate-600 group-hover:text-white transition-colors duration-300" size={24} />
                </div>
                
                <h3 className="text-xl font-medium text-slate-900 mb-3">
                  {service.title}
                </h3>
                <p className="text-slate-600 text-sm mb-6 leading-relaxed">
                  {service.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 text-sm font-medium">
                    {service.tokens}
                  </span>
                  <ArrowRight 
                    size={16} 
                    className="text-slate-400 group-hover:text-slate-900 group-hover:translate-x-1 transition-all duration-300" 
                  />
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
      
     {/* Features Section */}
     <div ref={featuresRef} className="py-32 bg-slate-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-light text-slate-900 mb-6 tracking-tight">
              Why Choose <em className="italic">Pixel Perfect</em>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {features.map((feature) => (
              <div 
                key={feature.title}
                className="feature-card text-center group opacity-0"
              >
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                  <feature.icon className="text-slate-700" size={28} />
                </div>
                <h3 className="text-xl font-medium text-slate-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default HomePage;