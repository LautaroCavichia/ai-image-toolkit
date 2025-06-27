import React, { useEffect, useRef, useState } from 'react';
import Layout from '../components/Layout';
import Navbar from '../components/Navbar';
import LoadingScreen from '../components/LoadingScreen';
import AnimatedGradientMesh from '../components/AnimatedGradientMesh';
import AnimatedNetMesh from '../components/AnimatedNetMesh';
import { isAuthenticated } from '../services/authService';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Scissors, Maximize, Sparkles, Expand, Zap, Target, Shield, ArrowRight, Star, Palette, FileImage } from 'lucide-react';
import logo from '../assets/logo.png';

gsap.registerPlugin(ScrollTrigger);

const HomePage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(() => {
    // Only show loading screen on first visit
    const hasVisited = localStorage.getItem('hasVisitedHomepage');
    return !hasVisited;
  });
  const [showContent, setShowContent] = useState(() => {
    // Show content immediately if user has visited before
    const hasVisited = localStorage.getItem('hasVisitedHomepage');
    return !!hasVisited;
  });
  const [activeTextIndex, setActiveTextIndex] = useState(0);

  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLImageElement>(null);
  const servicesRef = useRef<HTMLDivElement>(null);
  const techTextRef = useRef<HTMLDivElement>(null);
  const speedQualityRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);

  const handleLoadingComplete = () => {
    // Mark that user has visited the homepage
    localStorage.setItem('hasVisitedHomepage', 'true');
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

    // Services section animation with enhanced title animation
    if (servicesRef.current) {
      const serviceTitle = servicesRef.current.querySelector('.services-title');
      const serviceSubtitle = servicesRef.current.querySelector('.services-subtitle');
      const serviceCards = servicesRef.current.querySelectorAll('.service-card');

      // Create a timeline for the services section
      const servicesTl = gsap.timeline({
        scrollTrigger: {
          trigger: servicesRef.current,
          start: "-2px bottom",
          toggleActions: "play none none reverse"
        }
      });

      // Animate title with snappier timing
      servicesTl.fromTo(serviceTitle,
        {
          opacity: 0,
          y: 30,
          scale: 0.95,
          filter: "blur(10px)"
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          filter: "blur(0px)",
          duration: 0.8,
          ease: "power4.out"
        }
      )
        // Animate subtitle
        .fromTo(serviceSubtitle,
          {
            opacity: 0,
            y: 20
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "power3.out"
          },
          "-=0.5"
        )
        // Animate service cards with improved stagger
        .fromTo(serviceCards,
          {
            opacity: 0,
            y: 40,
            scale: 0.9,
            rotationX: 15
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            rotationX: 0,
            duration: 0.1,
            ease: "power3.out",
            stagger: 0.02
          },
          "-=0.05"
        );
    }

    // Tech Text section animation
    if (techTextRef.current) {
      const techTextLines = techTextRef.current.querySelectorAll('.superhuman-text-line');
      const techIndicators = techTextRef.current.querySelectorAll('.tech-indicator');
      const techImages = techTextRef.current.querySelectorAll('.tech-image');

      const techTl = gsap.timeline({
        scrollTrigger: {
          trigger: techTextRef.current,
          start: "top 85%",
          toggleActions: "play none none reverse"
        }
      });

      // Animate text lines
      techTl.fromTo(techTextLines,
        {
          opacity: 0,
          x: -50,
          scale: 0.95
        },
        {
          opacity: 1,
          x: 0,
          scale: 1,
          duration: 0.8,
          ease: "power3.out",
          stagger: 0.1
        }
      )
        // Animate indicators
        .fromTo(techIndicators,
          {
            opacity: 0,
            scale: 0
          },
          {
            opacity: 1,
            scale: 1,
            duration: 0.5,
            ease: "back.out(1.7)",
            stagger: 0.1
          },
          "-=0.4"
        )
        // Animate images
        .fromTo(techImages,
          {
            opacity: 0,
            scale: 0.8,
            rotationY: 15
          },
          {
            opacity: 1,
            scale: 1,
            rotationY: 0,
            duration: 1,
            ease: "power3.out",
            stagger: 0.2
          },
          "-=0.6"
        );
    }

    // Speed Quality section animation
    if (speedQualityRef.current) {
      const speedQualityTitle = speedQualityRef.current.querySelector('.speed-quality-title');
      const speedQualityText = speedQualityRef.current.querySelector('.speed-quality-text');
      const speedQualityImage = speedQualityRef.current.querySelector('.speed-quality-image');
      const speedQualityStats = speedQualityRef.current.querySelectorAll('.speed-quality-stat');

      const speedTl = gsap.timeline({
        scrollTrigger: {
          trigger: speedQualityRef.current,
          start: "top 85%",
          toggleActions: "play none none reverse"
        }
      });

      // Animate image first
      speedTl.fromTo(speedQualityImage,
        {
          opacity: 0,
          scale: 0.8,
          rotation: -5
        },
        {
          opacity: 1,
          scale: 1,
          rotation: 0,
          duration: 1,
          ease: "power3.out"
        }
      )
        // Animate title
        .fromTo(speedQualityTitle,
          {
            opacity: 0,
            y: 30,
            scale: 0.95
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.8,
            ease: "power3.out"
          },
          "-=0.6"
        )
        // Animate text
        .fromTo(speedQualityText,
          {
            opacity: 0,
            y: 20
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "power3.out"
          },
          "-=0.4"
        )
        // Animate stats
        .fromTo(speedQualityStats,
          {
            opacity: 0,
            scale: 0.8
          },
          {
            opacity: 1,
            scale: 1,
            duration: 0.5,
            ease: "back.out(1.7)",
            stagger: 0.1
          },
          "-=0.3"
        );
    }

    // Features section animation
    if (featuresRef.current) {
      const featureCards = featuresRef.current.querySelectorAll('.feature-card');
      const featuresTitle = featuresRef.current.querySelector('.features-title');

      const featuresTl = gsap.timeline({
        scrollTrigger: {
          trigger: featuresRef.current,
          start: "top 85%",
          toggleActions: "play none none reverse"
        }
      });

      // Animate title first
      featuresTl.fromTo(featuresTitle,
        {
          opacity: 0,
          y: 30,
          scale: 0.95
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          ease: "power3.out"
        }
      )
        // Animate feature cards
        .fromTo(featureCards,
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
            stagger: 0.15
          },
          "-=0.4"
        );
    }

    // Tech text scroll effect handler
    const updateActiveText = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const centerY = scrollY + windowHeight / 2;

      const textElements = document.querySelectorAll('.superhuman-text-line');

      let closestIndex = 0;
      let closestDistance = Infinity;

      textElements.forEach((element, index) => {
        const rect = element.getBoundingClientRect();
        const elementY = rect.top + scrollY + rect.height / 2;
        const distance = Math.abs(centerY - elementY);

        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });

      setActiveTextIndex(closestIndex);
    };

    const handleSupermanScroll = () => {
      requestAnimationFrame(updateActiveText);
    };

    window.addEventListener('scroll', handleSupermanScroll);

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
      window.removeEventListener('scroll', handleSupermanScroll);
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
      tokens: "Free",
      gradient: "bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600"
    },
    {
      href: "/enlarge",
      icon: Expand,
      title: "Image Enlargement",
      description: "Intelligently expand images with AI-generated content to any aspect ratio.",
      tokens: "1 token",
      gradient: "bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600"
    },
    {
      href: "/upscale",
      icon: Maximize,
      title: "Image Upscaling",
      description: "Enhance resolution up to 4x while preserving every detail with advanced AI algorithms.",
      tokens: "Free",
      gradient: "bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600"
    },
    {
      href: "/object-removal",
      icon: Sparkles,
      title: "Object Removal",
      description: "Remove unwanted objects with intelligent content-aware fill technology.",
      tokens: "Free",
      gradient: "bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600"
    },
    {
      href: "#",
      icon: Palette,
      title: "Style Transfer",
      description: "Transform your images with artistic styles and creative filters using advanced neural networks.",
      tokens: "Coming Soon",
      gradient: "bg-gradient-to-r from-pink-600 via-rose-600 to-red-600",
      comingSoon: true
    },
    {
      href: "#",
      icon: FileImage,
      title: "File Conversion",
      description: "Convert between formats like PNG to JPG, WEBP, and more with optimized compression settings.",
      tokens: "Coming Soon",
      gradient: "bg-gradient-to-r from-slate-600 via-gray-600 to-zinc-600",
      comingSoon: true
    }
  ];

  const privacyFeatures = [
    {
      icon: Shield,
      title: "Secure Processing",
      description: "Your images are processed securely with enterprise-grade encryption and never stored permanently on our servers."
    },
    {
      icon: Target,
      title: "Zero Data Training",
      description: "We never use your images to train our AI models. Your creative work remains exclusively yours."
    },
    {
      icon: Zap,
      title: "Instant Deletion",
      description: "Images are automatically deleted from our servers immediately after processing is complete."
    }
  ];

  const techTexts = [
    "NEXT-GEN",
    "AI PROCESSING",
    "PIXEL PERFECT",
    "FUTURE READY"
  ];

  if (isLoading) {
    return <LoadingScreen onComplete={handleLoadingComplete} />;
  }

  return (
    <Layout>
      <AnimatedGradientMesh variant="default" intensity="subtle" />
      <AnimatedNetMesh intensity="subtle" />
      <Navbar />

      {/* Hero Section */}
      <div
        ref={heroRef}
        className="min-h-screen flex items-center justify-center px-6 py-20"
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
        className="py-32 bg-white/40 backdrop-blur-sm"
      >
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="services-title text-4xl md:text-5xl font-light text-slate-900 mb-6 tracking-tight">
              <em className="italic text-slate-600">Powerful</em> AI Tools
            </h2>
            <p className="services-subtitle text-xl text-slate-600 max-w-2xl mx-auto font-light">
              Everything you need to transform your creative vision into reality.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => (
              <a
                key={service.href}
                href={service.href}
                className={`service-card group bg-white border border-slate-200 rounded-3xl p-8 transition-all duration-300 hover:shadow-2xl hover:border-slate-300 hover:-translate-y-2 ${service.comingSoon ? 'cursor-default opacity-90' : ''}`}
              >
                {/* Coming Soon badge */}
                {service.comingSoon && (
                  <div className="absolute top-6 right-6 bg-slate-100 text-slate-500 text-xs font-medium px-3 py-1 rounded-full">
                    Coming Soon
                  </div>
                )}

                <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-slate-900 transition-colors duration-300">
                  <service.icon className="text-slate-600 group-hover:text-white transition-colors duration-300" size={24} />
                </div>

                <h3 className={`text-xl font-medium mb-3 ${service.gradient} bg-clip-text text-transparent`}>
                  {service.title}
                </h3>
                
                <p className="text-slate-600 text-sm mb-6 leading-relaxed">
                  {service.description}
                </p>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 text-sm font-medium">
                    {service.tokens}
                  </span>
                  {!service.comingSoon && (
                    <ArrowRight
                      size={16}
                      className="text-slate-400 group-hover:text-slate-900 group-hover:translate-x-1 transition-all duration-300"
                    />
                  )}
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Tech Text Effect Section */}
      <div
        ref={techTextRef}
        className="py-24 mx-6 bg-white/60 backdrop-blur-sm relative overflow-hidden rounded-3xl"
      >
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* Text on the left */}
            <div className="space-y-6">
              {techTexts.map((line, index) => (
                <div
                  key={index}
                  className={`
              superhuman-text-line
              text-4xl md:text-6xl font-light tracking-tight text-left
              transition-all duration-700 ease-out
              ${activeTextIndex === index
                      ? 'text-slate-900 opacity-100 scale-100'
                      : 'text-slate-300 opacity-60 scale-98'
                    }
            `}
                  style={{
                    background: activeTextIndex === index
                      ? 'linear-gradient(135deg,rgb(0, 76, 255) 0%,rgb(84, 71, 105) 50%, #0f172a 100%)'
                      : 'transparent',
                    WebkitBackgroundClip: activeTextIndex === index ? 'text' : 'unset',
                    WebkitTextFillColor: activeTextIndex === index ? 'transparent' : 'inherit',
                    backgroundClip: activeTextIndex === index ? 'text' : 'unset',
                    textShadow: activeTextIndex === index
                      ? '0 0 60px rgba(15, 23, 42, 0.08), 0 0 30px rgba(71, 85, 105, 0.12), 0 4px 20px rgba(15, 23, 42, 0.15)'
                      : 'none',
                    filter: activeTextIndex === index
                      ? 'drop-shadow(0 8px 32px rgba(15, 23, 42, 0.06)) drop-shadow(0 0 24px rgba(71, 85, 105, 0.04))'
                      : 'none'
                  }}
                >
                  {line}
                </div>
              ))}

              {/* Subtle indicators */}
              <div className="flex space-x-3 pt-8">
                {[0, 1, 2, 3].map((index) => (
                  <div
                    key={index}
                    className={`
                tech-indicator
                w-2 h-2 rounded-full transition-all duration-500
                ${activeTextIndex === index ? 'bg-slate-900 scale-125' : 'bg-slate-300'}
              `}
                  />
                ))}
              </div>
            </div>

            {/* Image collage on the right */}
            <div className="relative h-96 lg:h-[500px]">

              {/* Original Image - Top left position in collage */}
              <div
                className={`
            tech-image
            absolute top-0 left-0 rotate-2
            transition-all duration-1000 ease-out
            ${activeTextIndex === 0 || activeTextIndex === 1
                    ? 'opacity-100 scale-100 z-20'
                    : 'opacity-30 scale-95 z-10'
                  }
          `}
              >
                <div className="group relative">
                  {/* Premium glow effect - multiple layers */}
                  <div className={`
              absolute -inset-4 rounded-3xl
              transition-all duration-1000 ease-out
              ${activeTextIndex === 0 || activeTextIndex === 1
                      ? 'opacity-100'
                      : 'opacity-0'
                    }
            `}>
                    {/* Outer layer - very subtle glow */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 via-purple-400/25 to-blue-400/20 rounded-3xl blur-xl"></div>
                    {/* Middle layer - definition */}
                    <div className="absolute inset-1 bg-gradient-to-r from-blue-500/30 via-purple-500/35 to-blue-500/30 rounded-3xl blur-lg"></div>
                    {/* Inner layer - fine shine */}
                    <div className="absolute inset-2 bg-gradient-to-r from-blue-600/25 via-purple-600/30 to-blue-600/25 rounded-3xl blur-md"></div>
                  </div>

                  <img
                    src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=500&h=600&fit=crop&crop=center"
                    alt="Original image"
                    className="relative w-64 h-72 object-cover rounded-3xl shadow-2xl ring-1 ring-white/20 backdrop-blur-sm"
                  />
                  {/* Premium overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-white/5 rounded-3xl"></div>

                  {/* Integrated label */}
                  <div className={`
              absolute bottom-4 left-4 
              bg-white/95 backdrop-blur-md text-slate-800 text-sm font-medium px-4 py-2 rounded-xl 
              shadow-lg shadow-black/5 ring-1 ring-white/20
              transition-all duration-500
              ${activeTextIndex === 0 || activeTextIndex === 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
            `}>
                    Original
                  </div>
                </div>
              </div>

              {/* Enhanced Image - Bottom right position in collage */}
              <div
                className={`
            tech-image
            absolute bottom-0 right-0 -rotate-1
            transition-all duration-1000 ease-out
            ${activeTextIndex === 2 || activeTextIndex === 3
                    ? 'opacity-100 scale-100 z-20'
                    : 'opacity-30 scale-95 z-10'
                  }
          `}
              >
                <div className="group relative">
                  {/* Premium glow effect - multiple layers - SAME BLUE/PURPLE */}
                  <div className={`
              absolute -inset-4 rounded-3xl
              transition-all duration-1000 ease-out
              ${activeTextIndex === 2 || activeTextIndex === 3
                      ? 'opacity-100'
                      : 'opacity-0'
                    }
            `}>
                    {/* Outer layer - very subtle glow */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 via-purple-400/25 to-blue-400/20 rounded-3xl blur-xl"></div>
                    {/* Middle layer - definition */}
                    <div className="absolute inset-1 bg-gradient-to-r from-blue-500/30 via-purple-500/35 to-blue-500/30 rounded-3xl blur-lg"></div>
                    {/* Inner layer - fine shine */}
                    <div className="absolute inset-2 bg-gradient-to-r from-blue-600/25 via-purple-600/30 to-blue-600/25 rounded-3xl blur-md"></div>
                  </div>

                  <img
                    src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=600&fit=crop&crop=center"
                    alt="AI enhanced image"
                    className="relative w-72 h-80 object-cover rounded-3xl shadow-2xl ring-1 ring-white/20 backdrop-blur-sm"
                  />
                  {/* Premium overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-white/5 rounded-3xl"></div>

                  {/* Integrated label */}
                  <div className={`
              absolute bottom-4 left-4 
              bg-white/95 backdrop-blur-md text-slate-800 text-sm font-medium px-4 py-2 rounded-xl 
              shadow-lg shadow-black/5 ring-1 ring-white/20
              transition-all duration-500
              ${activeTextIndex === 2 || activeTextIndex === 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
            `}>
                    AI Enhanced
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        ref={speedQualityRef}
        className="py-32 mx-6 bg-gradient-to-br from-slate-50/95 via-white/90 to-slate-50/95 backdrop-blur-2xl relative overflow-hidden rounded-[2rem] shadow-xl shadow-slate-900/5 border border-slate-200/50">

        {/* Subtle background elements */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.08),transparent_50%)] opacity-60"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(147,51,234,0.06),transparent_50%)] opacity-50"></div>

        {/* Refined floating elements */}
        <div className="absolute top-1/4 right-1/4 w-px h-24 bg-gradient-to-b from-transparent via-slate-300/40 to-transparent rotate-12 opacity-60"></div>
        <div className="absolute bottom-1/3 left-1/4 w-16 h-px bg-gradient-to-r from-transparent via-slate-300/30 to-transparent opacity-40"></div>

        <div className="max-w-6xl mx-auto px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">

            {/* Premium image container */}
            <div className="relative h-96 lg:h-[500px] flex items-center justify-center">
              <div className="relative group">
                {/* Refined glow effect */}
                <div className="absolute -inset-8 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 rounded-[3rem] blur-3xl opacity-0 group-hover:opacity-100 transition-all duration-1000"></div>

                <div className="w-full max-w-md h-85 rounded-2xl overflow-hidden shadow-2xl shadow-slate-900/10 ring-1 ring-slate-200/60 group-hover:shadow-slate-900/15 group-hover:ring-slate-300/80 transform transition-all duration-700 hover:scale-[1.02] bg-white/60 backdrop-blur-sm">
                  <img
                    src="https://images.unsplash.com/photo-1552053831-71594a27632d?w=500&h=600&fit=crop&crop=center"
                    alt="Premium AI Technology"
                    className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
                  />

                  {/* Subtle overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 via-transparent to-white/10 group-hover:from-slate-900/10 transition-all duration-500"></div>

                  {/* Minimal corner accents */}
                  <div className="absolute top-4 left-4 w-4 h-4 border-l border-t border-white/80 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="absolute bottom-4 right-4 w-4 h-4 border-r border-b border-white/80 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>
              </div>
            </div>

            {/* Premium typography */}
            <div className="space-y-10">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-extralight tracking-tight text-slate-900 leading-[1.1] relative">
                <span className="block mb-2">Built for those who need</span>

                <span className="relative inline-block mr-4">
                  <span className="bg-gradient-to-r from-blue-700 to-blue-600 bg-clip-text text-transparent font-light">
                    speed
                  </span>
                  <div className="absolute -bottom-1 left-0 w-full h-[1px] bg-gradient-to-r from-blue-600/60 to-transparent"></div>
                </span>

                <span className="text-slate-900 font-extralight mr-4">and</span>

                <span className="relative inline-block">
                  <span className="bg-gradient-to-r from-purple-700 to-purple-600 bg-clip-text text-transparent font-light">
                    quality
                  </span>
                  <div className="absolute -bottom-1 left-0 w-full h-[1px] bg-gradient-to-r from-purple-600/60 to-transparent"></div>
                </span>
              </h2>

              {/* Refined description */}
              <div className="relative">
                <p className="text-xl text-slate-600 leading-relaxed max-w-xl font-light tracking-wide">
                  Advanced AI processing technology that delivers exceptional results
                  in seconds, maintaining the precision and quality your work demands.
                </p>

                {/* Subtle side indicator */}
                <div className="absolute left-0 top-0 w-[2px] h-full bg-gradient-to-b from-transparent via-slate-300/50 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-700"></div>
              </div>

              {/* Minimal stats */}


            </div>
          </div>
        </div>
      </div>



      {/* Privacy Section */}
      <div ref={featuresRef} className="py-32 bg-slate-50/60 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-light text-slate-900 mb-6 tracking-tight">
              Your <em className="italic">Privacy</em> Matters
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto font-light leading-relaxed">
              We believe your creative work should remain private. That's why we've built our platform with privacy at its core.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {privacyFeatures.map((feature) => (
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