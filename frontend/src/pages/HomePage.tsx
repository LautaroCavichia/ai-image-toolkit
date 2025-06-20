import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faImage,
  faArrowsUpDown,
  faExpand,
  faWandMagicSparkles,
  faPalette,
  faArrowRight,
  faRocket,
  faShieldAlt,
  faLightbulb
} from '@fortawesome/free-solid-svg-icons';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import PixelPerfectLogo from '../components/Logo/PixelPerfectLogo';
import AboutSection from '../components/AboutSection/AboutSection';
import AboutUs from '../components/AboutUs/AboutUs';
import ApiSection from '../components/ApiSection/ApiSection';
import ContactForm from '../components/ContactForm/ContactForm';
import './HomePage.css';

gsap.registerPlugin(ScrollTrigger);

interface Service {
  id: string;
  name: string;
  description: string;
  icon: any;
  path: string;
  features: string[];
  color: string;
  disabled?: boolean;
  comingSoon?: boolean;
}

const services: Service[] = [
  {
    id: 'bg-removal',
    name: 'Background Removal',
    description: 'Remove backgrounds from images with AI precision and professional quality',
    icon: faImage,
    path: '/background-removal',
    features: ['Instant processing', 'High accuracy', 'Bulk processing', 'Edge refinement'],
    color: 'var(--color-service-background)'
  },
  {
    id: 'upscale',
    name: 'AI Upscaling',
    description: 'Enhance image resolution with advanced AI while preserving details',
    icon: faArrowsUpDown,
    path: '/upscale',
    features: ['2x & 4x scaling', 'AI enhancement', 'Detail preservation', 'Noise reduction'],
    color: 'var(--color-service-upscale)'
  },
  {
    id: 'enlarge',
    name: 'Smart Enlargement',
    description: 'Expand images intelligently with context-aware content generation',
    icon: faExpand,
    path: '/enlarge',
    features: ['Aspect ratio control', 'Content-aware fill', 'Natural extension', 'Smart cropping'],
    color: 'var(--color-service-enlarge)'
  },
  {
    id: 'object-removal',
    name: 'Object Removal',
    description: 'Remove unwanted objects seamlessly with advanced inpainting',
    icon: faWandMagicSparkles,
    path: '/object-removal',
    features: ['Precision selection', 'Smart inpainting', 'Edge detection', 'Batch processing'],
    color: 'var(--color-service-object)'
  },
  {
    id: 'style-transfer',
    name: 'Style Transfer',
    description: 'Transform images with artistic styles using cutting-edge AI',
    icon: faPalette,
    path: '/style-transfer',
    features: ['20+ art styles', 'Custom prompts', 'Adjustable strength', 'Real-time preview'],
    color: 'var(--color-service-style)',
    comingSoon: true
  }
];

const HomePage: React.FC = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const servicesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero background animations
      gsap.to('.floating-shape', {
        y: -20,
        duration: 3,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
        stagger: 0.5
      });

      // Title gradient animation
      gsap.to('.hero-title', {
        backgroundPosition: '200% center',
        duration: 8,
        ease: 'linear',
        repeat: -1
      });

      // Services cards animation on scroll
      if (servicesRef.current) {
        gsap.fromTo(servicesRef.current.children,
          {
            opacity: 0,
            y: 60,
            scale: 0.8
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.8,
            stagger: 0.15,
            ease: 'back.out(1.7)',
            scrollTrigger: {
              trigger: servicesRef.current,
              start: 'top 80%',
              end: 'bottom 20%',
              toggleActions: 'play none none reverse'
            }
          }
        );
      }
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="homepage" ref={heroRef}>
      {/* Hero Section */}
      <section className="hero-section">
        {/* Animated Background */}
        <div className="hero-background">
          <div className="hero-particles">
            <div className="particle particle-1"></div>
            <div className="particle particle-2"></div>
            <div className="particle particle-3"></div>
            <div className="particle particle-4"></div>
            <div className="particle particle-5"></div>
            <div className="particle particle-6"></div>
          </div>
          <div className="mesh-gradient"></div>
          <div className="hero-grid"></div>
        </div>
        
        <div className="hero-container">
          <div className="hero-content">
            {/* Logo Section */}
            <motion.div
              className="hero-logo-section"
              initial={{ opacity: 0, scale: 0.8, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ 
                duration: 1.2, 
                delay: 0.3,
                type: "spring",
                stiffness: 80
              }}
            >
              <PixelPerfectLogo size={320} animated={true} glowOnHover={true} />
            </motion.div>

            {/* Title & Subtitle */}
            <motion.div 
              className="hero-text-section"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 1, 
                delay: 1.2,
                type: "spring",
                stiffness: 100
              }}
            >
              <h1 className="hero-title">
                <span className="title-main gradient-text">PixelPerfect</span>
                <span className="title-accent">AI Studio</span>
              </h1>
              
              <p className="hero-subtitle">
                Transform your creative vision into reality with professional-grade AI image processing.
                <span className="subtitle-highlight">Intelligent. Instant. Flawless.</span>
              </p>
            </motion.div>

            {/* CTA Section */}
            <motion.div 
              className="hero-cta-section"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.8 }}
            >
              <div className="cta-buttons">
                <Link to="/background-removal" className="cta-primary glass-hover">
                  <span className="cta-text">Start Creating</span>
                  <div className="cta-icon">
                    <FontAwesomeIcon icon={faRocket} />
                  </div>
                  <div className="cta-glow"></div>
                </Link>
                
                <a href="#services" className="cta-secondary glass-hover">
                  <span className="cta-text">Explore Tools</span>
                  <div className="cta-arrow">
                    <FontAwesomeIcon icon={faArrowRight} />
                  </div>
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="services-section" id="services">
        <div className="container">
          <motion.div
            className="section-header"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="section-title gradient-text">Our AI Services</h2>
            <p className="section-subtitle">
              Professional-grade image processing tools powered by cutting-edge artificial intelligence.
              Choose the perfect solution for your creative needs.
            </p>
          </motion.div>

          <div className="services-grid" ref={servicesRef}>
            {services.map((service, index) => (
              <motion.div
                key={service.id}
                className={`service-card ${service.disabled ? 'disabled' : ''} ${service.comingSoon ? 'coming-soon' : ''}`}
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                whileInView={{ 
                  opacity: 1, 
                  y: 0, 
                  scale: 1,
                  transition: { delay: index * 0.1, duration: 0.6, ease: "easeOut" }
                }}
                viewport={{ once: true }}
                whileHover={{ 
                  y: -5,
                  scale: 1.02,
                  transition: { duration: 0.3, ease: "easeOut" }
                }}
              >
                {/* Status Badge */}
                {service.comingSoon && (
                  <div className="service-status coming-soon">
                    Coming Soon
                  </div>
                )}
                {service.disabled && (
                  <div className="service-status disabled">
                    Unavailable
                  </div>
                )}
                
                {/* Service Icon - Large */}
                <div className="service-icon-large" style={{'--service-color': service.color} as React.CSSProperties}>
                  <FontAwesomeIcon icon={service.icon} />
                </div>
                
                {/* Service Title */}
                <h3 className="service-title">{service.name}</h3>
                
                {/* Service Link */}
                {!service.disabled && !service.comingSoon ? (
                  <Link to={service.path} className="service-link-minimal">
                    <FontAwesomeIcon icon={faArrowRight} />
                  </Link>
                ) : (
                  <div className="service-link-disabled">
                    <FontAwesomeIcon icon={service.comingSoon ? faRocket : faArrowRight} />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <AboutSection />
      
      {/* Features Section */}
      <div id="features">
        <AboutUs />
      </div>

      {/* API Section */}
      <div id="api">
        <ApiSection />
      </div>

      {/* Contact Form */}
      <div id="contact">
        <ContactForm />
      </div>
    </div>
  );
};

export default HomePage;