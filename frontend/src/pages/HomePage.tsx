import React, { useEffect, useRef, useState } from 'react';
import Layout from '../components/Layout';
import Navbar from '../components/Navbar';
//import LoadingScreen from '../components/LoadingScreen';
import AnimatedGradientMesh from '../components/AnimatedGradientMesh';
import AnimatedNetMesh from '../components/AnimatedNetMesh';
import { isAuthenticated } from '../services/authService';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Scissors, Maximize, Sparkles, Expand, Zap, Target, Shield, ArrowRight, Star, Wand2, FileImage } from 'lucide-react';
import logo from '../assets/logo.png';

gsap.registerPlugin(ScrollTrigger);

const HomePage: React.FC = () => {
   const [showContent, setShowContent] = useState(true);
 
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
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);
  const [currentOffset, setCurrentOffset] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isTransitioning] = useState(false);

   const contentData = [
    {
      url: "https://cdn.leonardo.ai/users/7accf579-f61e-438c-80d3-9d45630f0f1b/generations/708616f7-b8be-4ecd-be1e-1349081e1ece/Leonardo_Phoenix_10_A_joyful_dog_its_fur_a_warm_golden_brown_w_0.jpg",
      alt: "Tecnología moderna",
      title: "Built for those who need",
      highlight1: { text: "speed", color: "from-blue-700 to-blue-600" },
      highlight2: { text: "quality", color: "from-purple-700 to-purple-600" },
      description: "Advanced AI processing technology that delivers exceptional results in seconds, maintaining the precision and quality your work demands."
    },
    {
      url: "https://cdn.leonardo.ai/users/7accf579-f61e-438c-80d3-9d45630f0f1b/generations/4b498504-637d-4a15-96da-ea0e4864d205/Leonardo_Phoenix_10_A_majestic_cat_with_shimmering_iridescent_1.jpg",
      alt: "Análisis de datos",
      title: "Designed for teams that value",
      highlight1: { text: "precision", color: "from-emerald-700 to-emerald-600" },
      highlight2: { text: "efficiency", color: "from-orange-700 to-orange-600" },
      description: "Streamlined workflows and intelligent automation tools that empower your team to achieve more with less effort and maximum accuracy."
    },
    {
      url: "https://cdn.leonardo.ai/users/7accf579-f61e-438c-80d3-9d45630f0f1b/generations/87c1e6f1-e1b2-449a-9214-2381409ec850/Leonardo_Phoenix_10_A_lone_majestic_cactus_donning_trendy_refl_2.jpg",
      alt: "Innovación empresarial",
      title: "Perfect for organizations seeking",
      highlight1: { text: "innovation", color: "from-violet-700 to-violet-600" },
      highlight2: { text: "growth", color: "from-rose-700 to-rose-600" },
      description: "Cutting-edge solutions that scale with your business, fostering innovation while driving sustainable growth and competitive advantage."
    },
    {
      url: "https://cdn.leonardo.ai/users/7accf579-f61e-438c-80d3-9d45630f0f1b/generations/4b498504-637d-4a15-96da-ea0e4864d205/Leonardo_Phoenix_10_A_majestic_cat_with_shimmering_iridescent_1.jpg",
      alt: "Colaboración en equipo",
      title: "Crafted for professionals who demand",
      highlight1: { text: "reliability", color: "from-teal-700 to-teal-600" },
      highlight2: { text: "excellence", color: "from-indigo-700 to-indigo-600" },
      description: "Enterprise-grade reliability meets intuitive design, delivering consistent excellence that professionals trust for their most critical projects."
    }
  ];

  const currentContent = contentData[currentImageIndex];
  const technologies = [
    {
      name: 'Java',
      icon: (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8.851 18.56s-.917.534.653.714c1.902.218 2.874.187 4.969-.211 0 0 .552.346 1.321.646-4.699 2.013-10.633-.118-6.943-1.149M8.276 15.933s-1.028.761.542.924c2.032.209 3.636.227 6.413-.308 0 0 .384.389.987.602-5.679 1.661-12.007.13-7.942-1.218M13.116 11.475c1.158 1.333-.304 2.533-.304 2.533s2.939-1.518 1.589-3.418c-1.261-1.772-2.228-2.652 3.007-5.688 0-.001-8.216 2.051-4.292 6.573M19.33 20.504s.679.559-.747.991c-2.712.822-11.288 1.069-13.669.033-.856-.373.75-.89 1.254-.998.527-.114.828-.093.828-.093-.953-.671-6.156 1.317-2.643 1.887 9.58 1.553 17.462-.7 14.977-1.82M9.292 13.21s-4.362 1.036-1.544 1.412c1.189.159 3.561.123 5.77-.062 1.806-.152 3.618-.477 3.618-.477s-.637.272-1.098.587c-4.429 1.165-12.986.623-10.522-.568 2.082-1.006 3.776-.892 3.776-.892M17.116 17.584c4.503-2.34 2.421-4.589.968-4.285-.355.074-.515.138-.515.138s.132-.207.385-.297c2.875-1.011 5.086 2.981-.928 4.562 0-.001.07-.062.09-.118M14.401 0s2.494 2.494-2.365 6.33c-3.896 3.077-.888 4.832-.001 6.836-2.274-2.053-3.943-3.858-2.824-5.539 1.644-2.469 6.197-3.665 5.19-7.627M9.734 23.924c4.322.277 10.959-.153 11.116-2.198 0 0-.302.775-1.788 1.393-2.83 1.177-6.334 1.042-10.106.283 0 0 .51.425.778.522"/>
        </svg>
      )
    },
    {
      name: 'Python',
      icon: (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
          <path d="M14.25.18l.9.2.73.26.59.3.45.32.34.34.25.34.16.33.1.3.04.26.02.2-.01.13V8.5l-.05.63-.13.55-.21.46-.26.38-.3.31-.33.25-.35.19-.35.14-.33.1-.3.07-.26.04-.21.02H8.77l-.69.05-.59.14-.5.22-.41.27-.33.32-.27.35-.2.36-.15.37-.1.35-.07.32-.04.27-.02.21v3.06H3.17l-.21-.03-.28-.07-.32-.12-.35-.18-.36-.26-.36-.36-.35-.46-.32-.59-.28-.73-.21-.88-.14-1.05-.05-1.23.06-1.22.16-1.04.24-.87.32-.71.36-.57.4-.44.42-.33.42-.24.4-.16.36-.1.32-.05.24-.01h.16l.06.01h8.16v-.83H6.18l-.01-2.75-.02-.37.05-.34.11-.31.17-.28.25-.26.31-.23.38-.2.44-.18.51-.15.58-.12.64-.1.71-.06.77-.04.84-.02 1.27.05zm-6.3 1.98l-.23.33-.08.41.08.41.23.34.33.22.41.09.41-.09.33-.22.23-.34.08-.41-.08-.41-.23-.33-.33-.22-.41-.09-.41.09zm13.09 3.95l.28.06.32.12.35.18.36.27.36.35.35.47.32.59.28.73.21.88.14 1.04.05 1.23-.06 1.23-.16 1.04-.24.86-.32.71-.36.57-.4.45-.42.33-.42.24-.4.16-.36.09-.32.05-.24.02-.16-.01h-8.22v.82h5.84l.01 2.76.02.36-.05.34-.11.31-.17.29-.25.25-.31.24-.38.2-.44.17-.51.15-.58.13-.64.09-.71.07-.77.04-.84.01-1.27-.04-1.07-.14-.9-.2-.73-.25-.59-.3-.45-.33-.34-.34-.25-.34-.16-.33-.1-.3-.04-.25-.02-.2.01-.13v-5.34l.05-.64.13-.54.21-.46.26-.38.3-.32.33-.24.35-.2.35-.14.33-.1.3-.06.26-.04.21-.02.13-.01h5.84l.69-.05.59-.14.5-.21.41-.28.33-.32.27-.35.2-.36.15-.36.1-.35.07-.32.04-.28.02-.21V6.07h2.09l.14.01zm-6.47 14.25l-.23.33-.08.41.08.41.23.33.33.23.41.08.41-.08.33-.23.23-.33.08-.41-.08-.41-.23-.33-.33-.23-.41-.08-.41.08z"/>
        </svg>
      )
    },
    {
      name: 'React',
      icon: (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
          <path d="M14.23 12.004a2.236 2.236 0 0 1-2.235 2.236 2.236 2.236 0 0 1-2.236-2.236 2.236 2.236 0 0 1 2.235-2.236 2.236 2.236 0 0 1 2.236 2.236zm2.648-10.69c-1.346 0-3.107.96-4.888 2.622-1.78-1.653-3.542-2.602-4.887-2.602-.41 0-.783.093-1.106.278-1.375.793-1.683 3.264-.973 6.365C1.98 8.917 0 10.42 0 12.004c0 1.59 1.99 3.097 5.043 4.03-.704 3.113-.39 5.588.988 6.38.32.187.69.275 1.102.275 1.345 0 3.107-.96 4.888-2.624 1.78 1.654 3.542 2.603 4.887 2.603.41 0 .783-.09 1.106-.275 1.374-.792 1.683-3.263.973-6.365C22.02 15.096 24 13.59 24 12.004c0-1.59-1.99-3.097-5.043-4.032.704-3.11.39-5.587-.988-6.38-.318-.184-.688-.277-1.092-.278zm-.005 1.09v.006c.225 0 .406.044.558.127.666.382.955 1.835.73 3.704-.054.46-.142.945-.25 1.44-.96-.236-2.006-.417-3.107-.534-.66-.905-1.345-1.727-2.035-2.447 1.592-1.48 3.087-2.292 4.105-2.295zm-9.77.02c1.012 0 2.514.808 4.11 2.28-.686.72-1.37 1.537-2.02 2.442-1.107.117-2.154.298-3.113.538-.112-.49-.195-.964-.254-1.42-.23-1.868.054-3.32.714-3.707.19-.09.4-.127.563-.132zm4.882 3.05c.455.468.91.992 1.36 1.564-.44-.02-.89-.034-1.36-.034-.47 0-.92.014-1.36.034.44-.572.895-1.096 1.36-1.564zM12 8.1c.74 0 1.477.034 2.202.093.406.582.802 1.203 1.183 1.86.372.64.71 1.29 1.018 1.946-.308.655-.646 1.31-1.013 1.95-.38.66-.773 1.288-1.18 1.87-.728.063-1.466.098-2.21.098-.74 0-1.477-.035-2.202-.093-.406-.582-.802-1.204-1.183-1.86-.372-.64-.71-1.29-1.018-1.946.303-.657.646-1.313 1.013-1.954.38-.66.773-1.286 1.18-1.866.728-.064 1.466-.098 2.21-.098zm-3.635.254c-.24.377-.48.763-.704 1.16-.225.39-.435.788-.63 1.18-.265-.506-.504-1.012-.714-1.515-.207-.49-.365-.98-.49-1.463.613-.068 1.315-.116 2.038-.172.115.202.23.418.348.646.11.21.23.418.347.646-.232.38-.476.763-.705 1.161.225.39.435.788.63 1.18zm.318-1.673c.204.425.436.855.67 1.284.47-.637.91-1.278 1.36-1.905-.51-.025-1.02-.044-1.53-.044-.51 0-1.02.019-1.53.044.45.627.89 1.268 1.36 1.905-.234-.429-.466-.859-.67-1.284-.112-.218-.22-.441-.33-.664-.11-.218-.22-.441-.33-.664z"/>
        </svg>
      )
    },
    {
      name: 'Node.js',
      icon: (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
          <path d="M11.998,24c-0.321,0-0.641-0.084-0.922-0.247l-2.936-1.737c-0.438-0.245-0.224-0.332-0.08-0.383 c0.585-0.203,0.703-0.25,1.328-0.604c0.065-0.037,0.151-0.023,0.218,0.017l2.256,1.339c0.082,0.045,0.197,0.045,0.272,0l8.795-5.076 c0.082-0.047,0.134-0.141,0.134-0.238V6.921c0-0.099-0.053-0.192-0.137-0.242l-8.791-5.072c-0.081-0.047-0.189-0.047-0.271,0 L3.075,6.68C2.99,6.729,2.936,6.825,2.936,6.921v10.15c0,0.097,0.054,0.189,0.139,0.235l2.409,1.392 c1.307,0.654,2.108-0.116,2.108-0.89V7.787c0-0.142,0.114-0.253,0.256-0.253h1.115c0.139,0,0.255,0.112,0.255,0.253v10.021 c0,1.745-0.95,2.745-2.604,2.745c-0.508,0-0.909,0-2.026-0.551L2.28,18.675c-0.57-0.329-0.922-0.945-0.922-1.604V6.921 c0-0.659,0.353-1.275,0.922-1.603l8.795-5.082c0.557-0.315,1.296-0.315,1.848,0l8.794,5.082c0.570,0.329,0.924,0.944,0.924,1.603 v10.15c0,0.659-0.354,1.273-0.924,1.604l-8.794,5.078C12.643,23.916,12.324,24,11.998,24z M19.099,13.993 c0-1.9-1.284-2.406-3.987-2.763c-2.731-0.361-3.009-0.548-3.009-1.187c0-0.528,0.235-1.233,2.258-1.233 c1.807,0,2.473,0.389,2.747,1.607c0.024,0.115,0.129,0.199,0.247,0.199h1.141c0.071,0,0.138-0.031,0.186-0.081 c0.048-0.054,0.074-0.123,0.067-0.196c-0.177-2.098-1.571-3.076-4.388-3.076c-2.508,0-4.004,1.058-4.004,2.833 c0,1.925,1.488,2.457,3.895,2.695c2.88,0.282,3.103,0.703,3.103,1.269c0,0.983-0.789,1.402-2.642,1.402 c-2.327,0-2.839-0.584-3.011-1.742c-0.02-0.124-0.126-0.215-0.253-0.215h-1.137c-0.141,0-0.254,0.112-0.254,0.253 c0,1.482,0.806,3.248,4.655,3.248C17.501,17.007,19.099,15.91,19.099,13.993z"/>
        </svg>
      )
    },
    {
      name: 'RabbitMQ',
      icon: (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
          <path d="M23.035 9.601h-7.677a.956.956 0 01-.962-.962V.962a.956.956 0 00-.962-.962H10.57a.956.956 0 00-.962.962v7.677a.956.956 0 01-.962.962H.965a.956.956 0 00-.962.962v2.874c0 .531.431.962.962.962h7.681c.531 0 .962.431.962.962v7.677c0 .531.431.962.962.962h2.866c.531 0 .962-.431.962-.962v-7.677a.956.956 0 01.962-.962h7.677c.531 0 .962-.431.962-.962v-2.874a.962.962 0 00-.962-.962zM8.61 6.124a1.922 1.922 0 110-3.844 1.922 1.922 0 010 3.844z"/>
        </svg>
      )
    }
  ];

  // Duplicated technologies for infinite loop
  const duplicatedTechnologies = [...technologies, ...technologies, ...technologies];
 useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      
      setTimeout(() => {
        setCurrentOffset(prev => {
          const nextOffset = prev - 120; 
          // resets
          if (nextOffset <= -120 * technologies.length) {
            return 0;
          }
          return nextOffset;
        });
      }, 100);
      
      setTimeout(() => {
        setIsAnimating(false);
      }, 800); 
      
    }, 2000); 

    return () => clearInterval(interval);
  }, [technologies.length]);




useEffect(() => {
  const handleScroll = () => {
    if (!sectionRef.current) return;
    const rect = sectionRef.current.getBoundingClientRect();
    const sectionHeight = rect.height;
    const windowHeight = window.innerHeight;
    
    // Calculate scroll progress within the section
    let scrollProgress = 0;
    
    if (rect.top <= 0 && rect.bottom >= windowHeight) {
      // Section is fully visible and scrolling through it
      scrollProgress = Math.abs(rect.top) / (sectionHeight - windowHeight);
    } else if (rect.top > 0) {
      // Section is below viewport
      scrollProgress = 0;
    } else if (rect.bottom < windowHeight) {
      // Section is above viewport
      scrollProgress = 1;
    }
    // Clamp scroll progress between 0 and 1
    scrollProgress = Math.max(0, Math.min(1, scrollProgress));
    // Ultra fast transitions with reduced delay
    // Use very aggressive exponential curve with minimal adjustment
    const ultraFastProgress = Math.pow(scrollProgress, 0.17);
    
    // Calculate which image should be shown based on ultra accelerated scroll progress
    let imageIndex;
    
    // Special handling for the last image - reduced delay zone
    if (ultraFastProgress >= 1) {
      // Last 25% of scroll is dedicated to the final image (reduced from 32%)
      imageIndex = contentData.length - 1;
    } else {
      // First 75% of scroll handles the first images with ultra fast transitions
      const adjustedProgress = ultraFastProgress / 0.75;
      // Triple acceleration for maximum sensitivity
      const hyperFastProgress = Math.pow(adjustedProgress, 0.32);
      imageIndex = Math.floor(hyperFastProgress * (contentData.length - 1));
    }
    
    setCurrentImageIndex(imageIndex);
  };
  window.addEventListener('scroll', handleScroll);
  handleScroll(); // Initial check
  return () => window.removeEventListener('scroll', handleScroll);
}, [contentData.length]);
  

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

  const techTexts = [
    "NEXT-GEN",
    "AI PROCESSING",
    "PIXEL PERFECT",
    "FUTURE READY"
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



<div className="py-12 sm:py-16 lg:py-24 mx-3 sm:mx-6 bg-white/60 backdrop-blur-sm relative overflow-hidden rounded-2xl sm:rounded-3xl">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Title */}
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="italic text text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light tracking-tight text-slate-900 mb-2">
            Powered by
          </h2>
          <div className="text-lg sm:text-xl md:text-2xl font-light text-slate-600">
            Top Technologies
          </div>
        </div>

        {/* Carrousel container */}
        <div className="relative overflow-hidden">
    
          <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-24 lg:w-32 bg-gradient-to-r from-white/80 via-white/40 to-transparent z-10 pointer-events-none"></div>
          <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-24 lg:w-32 bg-gradient-to-l from-white/80 via-white/40 to-transparent z-10 pointer-events-none"></div>
          
          {/* Infinite Carrousel */}
          <div 
          className="flex"
          style={{
            transform: `translateX(${currentOffset}px)`,
            transition: isAnimating ? 'transform 0.5s ease-in-out' : 'none'
          }}
>
            {duplicatedTechnologies.map((tech, index) => (
              <div
                key={`${tech.name}-${index}`}
                className="flex-shrink-0 mx-4 sm:mx-6 lg:mx-8 flex flex-col items-center group transition-all duration-300 hover:transform hover:scale-110"
              >
                {/* Icon */}
                <div className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 flex items-center justify-center text-slate-700 group-hover:text-slate-900 transition-colors duration-300 bg-white/50 rounded-2xl shadow-lg group-hover:shadow-xl backdrop-blur-sm border border-white/20">
                  {tech.icon}
                </div>
                
                {/* Technology name */}
                <span className="mt-2 sm:mt-3 text-xs sm:text-sm font-medium text-slate-600 group-hover:text-slate-800 transition-colors duration-300">
                  {tech.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      
      </div>
</div>
     

{/* Main section scroll sticky - Mobile Optimized */}
<div
  ref={sectionRef}
  className="relative"
  style={{ height: `${contentData.length * 50}vh` }}
>
  <div className="sticky top-0 h-screen flex flex-col">
    <div className="py-4 sm:py-6 lg:py-8 mx-3 sm:mx-6 bg-gradient-to-br from-slate-50/95 via-white/90 to-slate-50/95 backdrop-blur-2xl relative overflow-hidden rounded-xl sm:rounded-2xl lg:rounded-[2rem] shadow-lg sm:shadow-xl shadow-slate-900/5 border border-slate-200/50 h-full">
      
      {/* Subtle background elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.06),transparent_50%)] sm:bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.08),transparent_50%)] opacity-60"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(147,51,234,0.04),transparent_50%)] sm:bg-[radial-gradient(circle_at_70%_80%,rgba(147,51,234,0.06),transparent_50%)] opacity-50"></div>

      {/* Floating refined elements - hidden on mobile */}
      <div className="hidden sm:block absolute top-1/4 right-1/4 w-px h-24 bg-gradient-to-b from-transparent via-slate-300/40 to-transparent rotate-12 opacity-60"></div>
      <div className="hidden sm:block absolute bottom-1/3 left-1/4 w-16 h-px bg-gradient-to-r from-transparent via-slate-300/30 to-transparent opacity-40"></div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 h-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8 lg:gap-20 items-center h-full">
          
          {/* Premium image container */}
          <div className="relative w-full h-64 sm:h-80 lg:h-[500px] xl:h-[40rem] flex items-center justify-center order-1 mb-0 sm:mb-0">
            <div className="relative group">
              {/* Glow effect */}
              <div className="absolute -inset-4 sm:-inset-8 bg-gradient-to-br from-blue-500/3 via-transparent to-purple-500/3 sm:from-blue-500/5 sm:to-purple-500/5 rounded-2xl sm:rounded-[3rem] blur-2xl sm:blur-3xl opacity-0 group-hover:opacity-100 transition-all duration-1000"></div>
              
              <div className="w-64 h-72 sm:w-72 sm:h-80 lg:w-80 lg:h-96 rounded-xl sm:rounded-2xl overflow-hidden shadow-xl sm:shadow-2xl shadow-slate-900/10 ring-1 ring-slate-200/60 group-hover:shadow-slate-900/15 group-hover:ring-slate-300/80 transform transition-all duration-700 hover:scale-[1.02] bg-white/60 backdrop-blur-sm relative">
                
                {/* Images with transition */}
                {contentData.map((content, index) => (
                  <img
                    key={index}
                    src={content.url}
                    alt={content.alt}
                    className={`absolute top-0 left-0 w-full h-full object-cover transition-all duration-1000 group-hover:scale-105 ${
                      index === currentImageIndex
                        ? 'opacity-100 z-10'
                        : 'opacity-0 z-0'
                    }`}
                  />
                ))}

                {/* Subtle overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 via-transparent to-white/10 group-hover:from-slate-900/10 transition-all duration-500 z-20"></div>

                {/* Minimal corner accents */}
                <div className="absolute top-2 left-2 sm:top-4 sm:left-4 w-3 h-3 sm:w-4 sm:h-4 border-l border-t border-white/80 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-30"></div>
                <div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 w-3 h-3 sm:w-4 sm:h-4 border-r border-b border-white/80 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-30"></div>
              </div>
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