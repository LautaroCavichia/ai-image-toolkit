import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faImage,
  faArrowsUpDown,
  faExpand,
  faWandMagicSparkles,
  faPalette,
  faArrowRight
} from '@fortawesome/free-solid-svg-icons';
import AboutSection from '../components/AboutSection/AboutSection';
import AboutUs from '../components/AboutUs/AboutUs';
import BeforeAfterSlider from '../components/ImageSlider/BeforeAfterSlider';
import ApiSection from '../components/ApiSection/ApiSection';
import ContactForm from '../components/ContactForm/ContactForm';
import './HomePage.css';

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
    description: 'Remove backgrounds from images with AI precision',
    icon: faImage,
    path: '/background-removal',
    features: ['Instant processing', 'High accuracy', 'Bulk processing'],
    color: '#007bff'
  },
  {
    id: 'upscale',
    name: 'AI Upscaling',
    description: 'Enhance image resolution with advanced AI',
    icon: faArrowsUpDown,
    path: '/upscale',
    features: ['2x & 4x scaling', 'AI enhancement', 'Detail preservation'],
    color: '#28a745'
  },
  {
    id: 'enlarge',
    name: 'Smart Enlargement',
    description: 'Expand images with intelligent content generation',
    icon: faExpand,
    path: '/enlarge',
    features: ['Aspect ratio control', 'Content-aware fill', 'Natural extension'],
    color: '#ffc107'
  },
  {
    id: 'object-removal',
    name: 'Object Removal',
    description: 'Remove unwanted objects seamlessly',
    icon: faWandMagicSparkles,
    path: '/object-removal',
    features: ['Precision selection', 'Smart inpainting', 'Edge detection'],
    color: '#dc3545'
  },
  {
    id: 'style-transfer',
    name: 'Style Transfer',
    description: 'Transform images with artistic styles',
    icon: faPalette,
    path: '/style-transfer',
    features: ['20+ art styles', 'Custom prompts', 'Adjustable strength'],
    color: '#6f42c1',
    comingSoon: true
  }
];

const HomePage: React.FC = () => {
  return (
    <div className="homepage">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-background">
          <div className="background-shapes">
            <div className="shape shape-1"></div>
            <div className="shape shape-2"></div>
            <div className="shape shape-3"></div>
          </div>
          <div className="pattern"></div>
        </div>
        
        <div className="hero-content">
          <motion.h1 
            className="hero-title"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.8, 
              delay: 0.3,
              type: "spring",
              stiffness: 100
            }}
          >
            Transform Images with AI Magic
          </motion.h1>
          <motion.p 
            className="hero-subtitle"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            Choose from our powerful AI services to enhance, modify, and transform your images
          </motion.p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="services-section">
        <div className="container">
          <motion.div
            className="section-header"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            <h2>Our AI Services</h2>
            <p>Professional-grade image processing tools powered by cutting-edge AI</p>
          </motion.div>

          <div className="services-grid">
            {services.map((service, index) => (
              <motion.div
                key={service.id}
                className={`service-card ${service.disabled ? 'disabled' : ''} ${service.comingSoon ? 'coming-soon' : ''}`}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.9 + index * 0.1 }}
                whileHover={!service.disabled && !service.comingSoon ? { y: -5, transition: { duration: 0.2 } } : {}}
              >
                {service.comingSoon && (
                  <div className="coming-soon-badge">Coming Soon</div>
                )}
                {service.disabled && (
                  <div className="disabled-badge">Temporarily Unavailable</div>
                )}
                
                <div className="service-icon" style={{ color: service.disabled ? '#6c757d' : service.color }}>
                  <FontAwesomeIcon icon={service.icon} />
                </div>
                <h3 className="service-name">{service.name}</h3>
                <p className="service-description">{service.description}</p>
                
                <ul className="service-features">
                  {service.features.map((feature, idx) => (
                    <li key={idx}>{feature}</li>
                  ))}
                </ul>
                
                {service.disabled || service.comingSoon ? (
                  <div 
                    className="service-link disabled"
                    style={{ borderColor: '#6c757d', color: '#6c757d' }}
                  >
                    <span>{service.comingSoon ? 'Coming Soon' : 'Unavailable'}</span>
                  </div>
                ) : (
                  <Link 
                    to={service.path} 
                    className="service-link"
                    style={{ borderColor: service.color }}
                  >
                    <span>Try it now</span>
                    <FontAwesomeIcon icon={faArrowRight} />
                  </Link>
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

      {/* Before/After Demo */}
      <BeforeAfterSlider 
        beforeSrc="/assets/before.png"
        afterSrc="/assets/after.png"
        title="Unmatched Quality Results"
        subtitle="Experience the difference with our professional transformation. Slide to reveal the stunning before and after comparison."
      />

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