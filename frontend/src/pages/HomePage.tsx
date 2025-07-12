import React, { useEffect, useRef, useState } from 'react';
import Layout from '../components/Layout';
import Navbar from '../components/Navbar';
import AnimatedGradientMesh from '../components/AnimatedGradientMesh';
import AnimatedNetMesh from '../components/AnimatedNetMesh';
import { isAuthenticated } from '../services/authService';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import BeforeAfterSlider from '../components/BeforeAfterSlider';
import { Scissors, Maximize, Sparkles, Expand, Zap, Target, Shield, ArrowRight, Star, Wand2, FileImage, ArrowUpRight } from 'lucide-react';
import logo from '../assets/logo.png';

gsap.registerPlugin(ScrollTrigger);

const HomePage: React.FC = () => {
   const [showContent] = useState(true);
 


  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLImageElement>(null);
  const servicesRef = useRef<HTMLDivElement>(null);
  const techTextRef = useRef<HTMLDivElement>(null);
  const speedQualityRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isTransitioning] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const launchAppRef = useRef<HTMLDivElement>(null); 
  const forYouRef = useRef<HTMLDivElement>(null);
  const forTeamsRef = useRef(null) 
  
   const features = [
    {
      title: "For Creators",
      description: "Create production-quality visual assets for your projects with unprecedented quality, speed, and style-consistency.",
    },
    {
      title: "For Teams", 
      description: "Bring your team's best ideas to life at scale, with our intuitive AI-first creative suite designed for collaboration and built for business.",
    },
    {
      title: "For Developers",
      description: "Experience content creation excellence with PixelPerfect'S API. With unmatched scalability, effortlessly tailor outputs to your brand guideline.",
    }
  ];

  const mediaLogos = [
    "FORTUNE",
    "ZONDA",
    "Forbes", 
    "TechCrunch",
    "BUSINESS INSIDER",
    "Smart Company",
    "FINANCIAL REVIEW"
  ];

   const contentData = [
    {
      url: "https://i.imgur.com/4qFtyXo.png",
      alt: "Modern Technology",
      title: "Built for those who need",
      highlight1: { text: "speed", color: "from-blue-700 to-blue-600" },
      highlight2: { text: "quality", color: "from-purple-700 to-purple-600" },
      description: "Advanced AI processing technology that delivers exceptional results in seconds, maintaining the precision and quality your work demands."
    },
    {
      url: "https://i.imgur.com/unna4UB.png",
      alt: "Data Analysis",
      title: "Designed for teams that value",
      highlight1: { text: "precision", color: "from-emerald-700 to-emerald-600" },
      highlight2: { text: "efficiency", color: "from-orange-700 to-orange-600" },
      description: "Streamlined workflows and intelligent automation tools that empower your team to achieve more with less effort and maximum accuracy."
    },
    {
      url: "https://i.imgur.com/YYPiic6.jpeg",
      alt: "Empresarial innovation",
      title: "Perfect for organizations seeking",
      highlight1: { text: "innovation", color: "from-violet-700 to-violet-600" },
      highlight2: { text: "growth", color: "from-rose-700 to-rose-600" },
      description: "Cutting-edge solutions that scale with your business, fostering innovation while driving sustainable growth and competitive advantage."
    },
    {
      url: "https://i.imgur.com/Hmgx1e3.png",
      alt: "Team collaboration",
      title: "Crafted for professionals who demand",
      highlight1: { text: "reliability", color: "from-teal-700 to-teal-600" },
      highlight2: { text: "excellence", color: "from-indigo-700 to-indigo-600" },
      description: "Enterprise-grade reliability meets intuitive design, delivering consistent excellence that professionals trust for their most critical projects."
    }
  ];

  const currentContent = contentData[currentImageIndex];

;

useEffect(() => {
  const handleScroll = () => {
    if (!sectionRef.current) return;
    
    const rect = sectionRef.current.getBoundingClientRect();
    const sectionHeight = rect.height;
    const windowHeight = window.innerHeight;
    
    
    let scrollProgress;
    
    if (rect.top > 0) {
      
      scrollProgress = 0;
    } else if (rect.bottom < windowHeight) {
     
      scrollProgress = 1;
    } else {
      
      const scrolled = -rect.top;
      const totalScrollable = sectionHeight - windowHeight;
      scrollProgress = scrolled / totalScrollable;
    }
    
    scrollProgress = Math.max(0, Math.min(1, scrollProgress));
    
    const imageIndex = Math.floor(scrollProgress * (contentData.length - 1));
    
  
    if (imageIndex !== currentImageIndex) {
      setCurrentImageIndex(imageIndex);
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll(); // Check inicial
  
  return () => window.removeEventListener('scroll', handleScroll);
}, [contentData.length, currentImageIndex]);


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

    // Enhanced entrance animations
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
      href: "/image-generation",
      icon: Wand2,
      title: "Image Generation",
      description: "Create stunning images from text prompts using advanced AI technology and creative algorithms.",
      tokens: "1 token",
      gradient: "bg-gradient-to-r from-pink-600 via-rose-600 to-red-600"
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
            <br />
            <em className="text-slate-500">
              No compromises. Fast and{' '}
              <span className="relative inline-block px-1 py-1 font-semibold text-white bg-gradient-to-r from-green-400 to-blue-500 rounded-md">
                FREE
                <span className="absolute inset-0 rounded-md opacity-30 bg-white mix-blend-screen pointer-events-none"></span>
              </span>
            </em>
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

      <div ref={forTeamsRef} className="min-h-screen bg-white py-24 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-32">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="group relative bg-gray-50/80 backdrop-blur-xl border border-gray-200/50 rounded-2xl p-10 hover:bg-white hover:shadow-2xl hover:shadow-gray-200/30 transition-all duration-700 hover:-translate-y-1"
            >
              {/* Title */}
              <h3 className="text-2xl font-semibold mb-6 text-gray-900 tracking-tight">
                {feature.title}
              </h3>
              
              {/* Description */}
              <p className="text-gray-600 leading-relaxed text-[15px] font-normal">
                {feature.description}
              </p>
              
              {/* Arrow Icon */}
              <div className="absolute top-8 right-8 w-10 h-10 bg-gray-100/80 rounded-full flex items-center justify-center group-hover:bg-gray-200/80 transition-all duration-300">
                <ArrowUpRight className="w-5 h-5 text-gray-700 group-hover:rotate-12 transition-transform duration-300" />
              </div>
            </div>
          ))}
        </div>

        {/* As Featured In Section */}
        <div className="text-center">
          <p className="text-sm font-medium text-gray-500 mb-12 uppercase tracking-wider">
            As Featured In
          </p>
          
          <div className="flex flex-wrap justify-center items-center gap-16 opacity-40">
            {mediaLogos.map((logo, index) => (
              <div 
                key={index}
                className="text-gray-700 hover:opacity-100 transition-opacity duration-300 cursor-pointer"
              >
                <div className="text-base font-medium tracking-wide">
                  {logo}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Subtle Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/20 to-purple-50/20 pointer-events-none"></div>
    </div>

<div
  ref={sectionRef}
  className="relative"
  style={{ height: `${contentData.length * 50}vh` }}
>
  <div className="sticky top-0 h-screen flex flex-col">
    <div className="py-4 sm:py-6 lg:py-8 w-full
     bg-gradient-to-br from-slate-50/95 via-white/90 to-slate-50/95 backdrop-blur-2xl relative overflow-hidden shadow-lg sm:shadow-xl shadow-slate-900/5 border border-slate-200/50 h-full">
      
      {/* Subtle background elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.06),transparent_50%)] sm:bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.08),transparent_50%)] opacity-60"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(147,51,234,0.04),transparent_50%)] sm:bg-[radial-gradient(circle_at_70%_80%,rgba(147,51,234,0.06),transparent_50%)] opacity-50"></div>

      {/* Floating refined elements - hidden on mobile */}
      <div className="hidden sm:block absolute top-1/4 right-1/4 w-px h-24 bg-gradient-to-b from-transparent via-slate-300/40 to-transparent rotate-12 opacity-60"></div>
      <div className="hidden sm:block absolute bottom-1/3 left-1/4 w-16 h-px bg-gradient-to-r from-transparent via-slate-300/30 to-transparent opacity-40"></div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 h-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8 lg:gap-20 items-center h-full">
          
          {/* Creative Image Container */}
          <div className="relative w-full h-64 sm:h-80 lg:h-[500px] xl:h-[40rem] flex items-center justify-center order-1 mb-0 sm:mb-0">
            <div className="relative group">
              
              {/* Floating Image Gallery */}
              <div className="relative w-80 h-80 sm:w-96 sm:h-96 lg:w-[30rem] lg:h-[30rem]">
                
                {/* Main featured image */}
                <div className="absolute top-0 left-0 w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96 group-hover:scale-105 transition-all duration-700">
                  <div className="w-full h-full rounded-3xl overflow-hidden shadow-2xl shadow-slate-900/25 ring-1 ring-white/20 relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10"></div>
                    {contentData.map((content, index) => (
                      <img
                        key={index}
                        src={content.url}
                        alt={content.alt}
                        className={`absolute top-0 left-0 w-full h-full object-cover transition-all duration-1000 ${
                          index === currentImageIndex
                            ? 'opacity-100 z-10'
                            : 'opacity-0 z-0'
                        }`}
                      />
                    ))}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent opacity-60"></div>
                  </div>
                </div>

                {/* Floating accent images */}
                <div className="absolute -top-4 -right-4 w-28 h-36 sm:w-36 sm:h-44 lg:w-44 lg:h-52 rotate-12 group-hover:rotate-6 transition-all duration-700">
                  <div className="w-full h-full rounded-[3rem] overflow-hidden shadow-xl shadow-slate-900/20 ring-1 ring-white/30 opacity-80 group-hover:opacity-100 transform -skew-y-2">
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 to-pink-500/20"></div>
                    {contentData.map((content, index) => (
                      <img
                        key={index}
                        src={content.url}
                        alt={content.alt}
                        className={`absolute top-0 left-0 w-full h-full object-cover transition-all duration-1000 ${
                          index === (currentImageIndex + 1) % contentData.length
                            ? 'opacity-100 z-10'
                            : 'opacity-0 z-0'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="absolute -bottom-6 -left-6 w-24 h-32 sm:w-32 sm:h-40 lg:w-40 lg:h-48 -rotate-12 group-hover:-rotate-6 transition-all duration-700">
                  <div className="w-full h-full rounded-[2rem] overflow-hidden shadow-xl shadow-slate-900/20 ring-1 ring-white/30 opacity-70 group-hover:opacity-90 transform skew-x-3">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20"></div>
                    {contentData.map((content, index) => (
                      <img
                        key={index}
                        src={content.url}
                        alt={content.alt}
                        className={`absolute top-0 left-0 w-full h-full object-cover transition-all duration-1000 ${
                          index === (currentImageIndex + 2) % contentData.length
                            ? 'opacity-100 z-10'
                            : 'opacity-0 z-0'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Floating particles */}
                <div className="absolute top-1/4 right-1/4 w-2 h-2 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full opacity-60 group-hover:opacity-80 transition-all duration-700 animate-pulse"></div>
                <div className="absolute bottom-1/3 left-1/3 w-1 h-1 bg-gradient-to-br from-pink-400 to-orange-400 rounded-full opacity-50 group-hover:opacity-70 transition-all duration-700 animate-pulse" style={{animationDelay: '0.5s'}}></div>
                <div className="absolute top-2/3 left-1/6 w-1.5 h-1.5 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-full opacity-40 group-hover:opacity-60 transition-all duration-700 animate-pulse" style={{animationDelay: '1s'}}></div>
              </div>
            </div>
            
            {/* Attribution text */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex flex-col items-center space-y-1 z-30">
              <p className="text-[12px] sm:text-base text-black/80 px-5 py-2 rounded-lg bg-white/70 backdrop-blur-md font-light tracking-wide shadow-md">
                These images were generated by PixelPerfect Gen AI
              </p>
              <a
                href="image-generation"
                className="mt-1.5 text-[11px] sm:text-sm text-black/70 hover:text-black transition-colors font-medium"
              >
                Try it now →
              </a>
            </div>
        </div>
    
      
          {/* Premium typography with dynamic content */}
          <div
            className={`space-y-4 sm:space-y-6 lg:space-y-10 order-2 text-center lg:text-left -mt-4 sm:mt-0 transition-all duration-500 ${
              isTransitioning
                ? 'opacity-0 transform translate-y-4'
                : 'opacity-100 transform translate-y-0'
            }`}
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-extralight tracking-tight text-slate-900 leading-[1.1] relative">
              <span className="block mb-1 sm:mb-2">{currentContent.title}</span>

              <div className="flex flex-wrap justify-center lg:justify-start items-center gap-2 sm:gap-4">
                <span className="relative inline-block">
                  <span
                    className={`italic bg-gradient-to-r ${currentContent.highlight1.color} bg-clip-text text-transparent font-light`}
                  >
                    {currentContent.highlight1.text}
                  </span>
                  <div
                    className={`absolute -bottom-1 left-0 w-full h-[1px] bg-gradient-to-r ${currentContent.highlight1.color
                      .replace('to-', 'to-transparent from-')
                      .replace('from-', 'from-')}/60`}
                  ></div>
                </span>

                <span className="text-slate-900 font-extralight">and</span>

                <span className="relative inline-block">
                  <span
                    className={`italic bg-gradient-to-r ${currentContent.highlight2.color} bg-clip-text text-transparent font-light`}
                  >
                    {currentContent.highlight2.text}
                  </span>
                  <div
                    className={`absolute -bottom-1 left-0 w-full h-[1px] bg-gradient-to-r ${currentContent.highlight2.color
                      .replace('to-', 'to-transparent from-')
                      .replace('from-', 'from-')}/60`}
                  ></div>
                </span>
              </div>
            </h2>

            {/* Description */}
            <div className="relative">
              <p className="text-base sm:text-lg lg:text-xl text-slate-600 leading-relaxed max-w-xl mx-auto lg:mx-0 font-light tracking-wide">
                {currentContent.description}
              </p>

              {/* Side indicator - hidden on mobile */}
              <div className="hidden lg:block absolute left-0 top-0 w-[2px] h-full bg-gradient-to-b from-transparent via-slate-300/50 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-700"></div>
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>
</div>
                      

{/* Launch App Section */}
<div ref={launchAppRef} className="py-32 bg-white relative z-10">
  <div className="max-w-6xl mx-auto px-6">
    <div className="grid md:grid-cols-2 items-center gap-12">
      <div className="rounded-xl overflow-hidden shadow-lg">
        <img
          src="https://i.imgur.com/vFbGwUI.jpeg"
          alt="Launch App"
          className="w-full h-[500px] object-cover"
        />
      </div>
      <div>
        <h2 className="text-4xl md:text-5xl font-light text-slate-900 mb-6 tracking-tight">
          <span className="block mb-2">Get started now.</span>
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            <span className="relative inline-block">
              <span className="italic bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent font-light">
                Launch
              </span>
              <div className="absolute -bottom-1 left-0 w-full h-[1px] bg-gradient-to-r from-blue-500 to-transparent/60"></div>
            </span>
            <span className="text-slate-900 font-extralight">the</span>
            <span className="relative inline-block">
              <span className="italic bg-gradient-to-r from-cyan-500 to-purple-500 bg-clip-text text-transparent font-light">
                App
              </span>
              <div className="absolute -bottom-1 left-0 w-full h-[1px] bg-gradient-to-r from-cyan-500 to-transparent/60"></div>
            </span>
          </div>
        </h2>
        <p className="text-xl text-slate-600 font-light leading-relaxed mb-6">
          Discover the tools that bring your creative vision to life.
        </p>
        <div className="text-left">
          <button
            onClick={() => setShowPopup(true)}
            className="inline-flex items-center px-6 py-3 bg-slate-900 text-white text-sm sm:text-base rounded-full shadow hover:bg-slate-700 transition-colors"
          >
            Launch App
          </button>
        </div>
      </div>
    </div>

    {showPopup && (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-2xl shadow-xl max-w-4xl w-full space-y-6 relative">
          <button
            onClick={() => setShowPopup(false)}
            className="absolute top-3 right-3 text-slate-500 hover:text-slate-800"
          >
            ✕
          </button>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
  {
    name: 'Background Removal',
    key: 'bg-removal',
    img: 'https://i.imgur.com/tcqYJZV.png',
    href: 'background-removal', 
  },
  {
    name: 'Upscaling',
    key: 'upscaling',
    img: 'https://i.imgur.com/XioAAH7.jpeg',
    href: 'upscale', 
  },
  {
    name: 'Generative Fill',
    key: 'generative-fill',
    img: 'https://i.imgur.com/LjEnkZx.jpeg',
    href: 'enlarge', 
  },
  {
    name: 'Object Removal',
    key: 'object-removal',
    img: 'https://i.imgur.com/MikJwxb.png',
    href: 'object-removal', 
  },
  {
    name: 'Text to Image',
    key: 'text-to-image',
    img: 'https://i.imgur.com/birXPAV.png',
    href: 'image-generation', 
  },
].map((tool) => (
  <div
    key={tool.key}
    className="border border-slate-200 rounded-xl p-4 flex flex-col items-center text-center hover:shadow-md transition-shadow"
  >
    <div className="w-full h-32 bg-slate-100 rounded-lg mb-4 overflow-hidden">
      <img
        src={tool.img}
        alt={tool.name}
        className="w-full h-full object-cover rounded-lg"
      />
    </div>
    <h3 className="text-lg font-semibold text-slate-800 mb-2">
      {tool.name}
    </h3>
    <a
      href={tool.href}
      className="px-4 py-2 bg-slate-900 text-white text-sm rounded-full hover:bg-slate-700 transition-colors"
    >
      Try {tool.name}
    </a>
  </div>
))}
          </div>
        </div>
      </div>
    )}
  </div>
</div>

{/* Unlimited Banner Section */}
<div ref={forYouRef} className="py-32 bg-slate-50/60 backdrop-blur-sm">
  <div className="w-full px-6">
    <div className="relative flex h-[410px] items-center overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-black text-center shadow-2xl shadow-slate-900/20 md:text-left">
      
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(59,130,246,0.15),transparent_50%)] opacity-80"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_80%,rgba(147,51,234,0.12),transparent_50%)] opacity-70"></div>
      
      {/* Animated background pattern */}
      <div className="absolute top-0 right-0 w-full h-full opacity-10">
        <div className="absolute top-1/4 right-1/4 w-32 h-32 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/3 w-20 h-20 bg-blue-400/20 rounded-full blur-2xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 right-1/5 w-16 h-16 bg-purple-400/15 rounded-full blur-xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      {/* Main background image */}
      <div className="absolute bottom-0 right-0 hidden md:block">
        <div className="relative w-[726px] h-[410px] lg:w-[886px] xl:translate-x-32 2xl:translate-x-48">
          <img
            src="https://res.cloudinary.com/drzokg7bb/image/upload/v1752321215/pixelperfect/processed/8d27f1aa-5c1a-4da7-ab05-f1d6b5f66b39_pixel_perfect.png"
            alt="unlimited banner"
            className="w-full h-full object-cover opacity-60 mix-blend-overlay"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-l from-transparent via-black/20 to-black/80"></div>
          
          {/* Copyright text */}
          <div className="absolute bottom-2 left-4 text-xs text-white/50 font-light whitespace-nowrap">
            PixelPerfect AI ™ all rights reserved
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full md:pl-20">
        <div className="flex w-full max-w-[80%] flex-col items-center justify-center mx-auto px-6 md:max-w-[45%] md:items-start md:justify-start md:mx-0 md:px-0 md:pr-8">
          
          {/* Title */}
          <h2 className="text-center text-[28px] md:text-3xl lg:text-4xl font-semibold leading-tight text-white md:text-left mb-4">
            <span className="block md:inline whitespace-nowrap bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">
              Unlimited images.
            </span>{' '}
            <span className="block md:inline whitespace-nowrap bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent font-light italic">
              Endless creativity
            </span>
          </h2>

          {/* Description */}
          <p className="text-center text-[16px] md:text-[18px] leading-relaxed text-slate-200 md:text-left mb-8 font-light">
            Generate and edit unlimited images with all our AI models.{' '}
            <strong className="text-white font-semibold">
              No credits, no limits: your ideas will flow freely.
            </strong>
            <br />
            <span className="text-slate-300 text-sm">
              Available with Pro and Premium+ plans.
            </span>
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap justify-center gap-4 md:justify-start">
            <a
              href="/pricing?origin=freepik_web"
              className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 px-8 py-3 text-sm font-semibold text-white transition-all duration-300 hover:from-blue-600 hover:to-blue-700 hover:shadow-lg hover:shadow-blue-500/25 hover:-translate-y-0.5"
            >
              <span className="relative z-10">View plans</span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </a>
            
            <a
              href="/demo"
              className="group relative overflow-hidden rounded-xl border-2 border-white/20 bg-white/5 backdrop-blur-sm px-8 py-3 text-sm font-semibold text-white transition-all duration-300 hover:bg-white/10 hover:border-white/30 hover:shadow-lg hover:shadow-white/10 hover:-translate-y-0.5"
            >
              <span className="relative z-10">Try for free</span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </a>
          </div>
        </div>
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