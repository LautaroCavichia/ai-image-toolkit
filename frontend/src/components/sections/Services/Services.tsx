// src/components/sections/Services/Services.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faScissors, 
  faSearchPlus, 
  faExpand, 
  faEraser,
  faUserCog as faUsersCrown,
  faPalette,
  faClock,
  faCheck,
  faLock
} from '@fortawesome/free-solid-svg-icons';
import AnimatedText from '../../shared/AnimatedText/AnimatedText';
import ScrollReveal from '../../shared/ScrollReveal';
import Card from '../../shared/Card';
import './Services.css';

const services = [
  {
    name: 'Background Removal',
    description: 'Remove backgrounds instantly with pixel-perfect precision powered by deep AI segmentation.',
    icon: faScissors,
    gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
    color: '#8b5cf6',
    disabled: false,
    features: ['Edge Detection', 'Hair Details', 'Complex Backgrounds'],
    processingTime: '3-8s',
    accuracy: '99.7%'
  },
  {
    name: 'AI Upscaling',
    description: 'Enhance image resolution up to 4x using advanced super-resolution models.',
    icon: faSearchPlus,
    gradient: 'linear-gradient(135deg, #3b82f6, #2563eb)',
    color: '#3b82f6',
    disabled: false,
    features: ['4x Resolution', 'Quality Preserve', 'Detail Enhancement'],
    processingTime: '5-12s',
    accuracy: '98.5%'
  },
  {
    name: 'Smart Enlarge',
    description: 'Expand image borders while maintaining scene coherence and visual context.',
    icon: faExpand,
    gradient: 'linear-gradient(135deg, #10b981, #059669)',
    color: '#10b981',
    disabled: false,
    features: ['Context Aware', 'Natural Extension', 'Scene Coherence'],
    processingTime: '8-15s',
    accuracy: '96.8%'
  },
  {
    name: 'Object Removal',
    description: 'Erase unwanted elements with generative fill and intelligent inpainting.',
    icon: faEraser,
    gradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
    color: '#f59e0b',
    disabled: false,
    features: ['Smart Select', 'Generative Fill', 'Seamless Blend'],
    processingTime: '6-10s',
    accuracy: '97.2%'
  },
  {
    name: 'Face Swap',
    description: 'Swap faces across images with realism and control using advanced deepfake technology.',
    icon: faUsersCrown,
    gradient: 'linear-gradient(135deg, #ef4444, #dc2626)',
    color: '#ef4444',
    disabled: true,
    features: ['Realistic Swap', 'Expression Match', 'Lighting Adapt'],
    processingTime: 'Coming Soon',
    accuracy: 'TBD'
  },
  {
    name: 'Style Transfer',
    description: 'Apply artistic styles to your images with deep neural style transformation.',
    icon: faPalette,
    gradient: 'linear-gradient(135deg, #a855f7, #9333ea)',
    color: '#a855f7',
    disabled: true,
    features: ['Artistic Styles', 'Custom Models', 'Style Blending'],
    processingTime: 'Coming Soon',
    accuracy: 'TBD'
  },
];

const Services: React.FC = () => {
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.7,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  return (
    <section className="services-section" id="services">
      <div className="services-container">
        {/* Header */}
        <ScrollReveal>
          <div className="services-header">
            <AnimatedText
              as="h2"
              className="services-title"
              animation="fadeInUp"
            >
              AI-Powered Services
            </AnimatedText>
            <AnimatedText
              as="p"
              className="services-subtitle"
              animation="fadeInUp"
              delay={0.2}
            >
              Professional-grade microservices for automated image editing. 
              Built to scale, designed to integrate seamlessly into your workflow.
            </AnimatedText>
          </div>
        </ScrollReveal>

        {/* Services Grid */}
        <motion.div 
          className="services-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {services.map((service) => (
            <motion.div key={service.name} variants={itemVariants}>
              <Card
                variant="glass"
                padding="xl"
                hover={!service.disabled}
                glow={!service.disabled}
                className={`service-card ${service.disabled ? 'service-disabled' : ''}`}
              >
                {/* Service Icon & Status */}
                <div className="service-header">
                  <div 
                    className="service-icon"
                    style={{ background: service.gradient }}
                  >
                    <FontAwesomeIcon icon={service.icon} />
                  </div>
                  <div className="service-status">
                    {service.disabled ? (
                      <span className="status-badge coming-soon">
                        <FontAwesomeIcon icon={faClock} />
                        Coming Soon
                      </span>
                    ) : (
                      <span className="status-badge available">
                        <FontAwesomeIcon icon={faCheck} />
                        Available
                      </span>
                    )}
                  </div>
                </div>

                {/* Service Content */}
                <div className="service-content">
                  <h3 className="service-name">{service.name}</h3>
                  <p className="service-description">{service.description}</p>

                  {/* Features */}
                  <div className="service-features">
                    {service.features.map((feature, idx) => (
                      <span key={idx} className="feature-tag">
                        {feature}
                      </span>
                    ))}
                  </div>

                  {/* Stats */}
                  <div className="service-stats">
                    <div className="stat">
                      <span className="stat-label">Processing</span>
                      <span className="stat-value">{service.processingTime}</span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Accuracy</span>
                      <span className="stat-value">{service.accuracy}</span>
                    </div>
                  </div>
                </div>

                {/* Glass overlay effect */}
                <div 
                  className="service-glow"
                  style={{ 
                    background: `radial-gradient(circle at 50% 0%, ${service.color}15, transparent 70%)` 
                  }}
                />
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom CTA */}
        <ScrollReveal delay={0.6}>
          <div className="services-cta">
            <motion.div 
              className="cta-content"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <h3 className="cta-title">Ready to Transform Your Images?</h3>
              <p className="cta-subtitle">
                Start with our free tier and scale as you grow. No setup required.
              </p>
              <div className="cta-stats">
                <div className="cta-stat">
                  <FontAwesomeIcon icon={faLock} />
                  <span>Enterprise Security</span>
                </div>
                <div className="cta-stat">
                  <FontAwesomeIcon icon={faCheck} />
                  <span>99.9% Uptime SLA</span>
                </div>
              </div>
            </motion.div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default Services;
