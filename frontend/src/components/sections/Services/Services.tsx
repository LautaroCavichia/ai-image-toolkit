// src/components/sections/Services/Services.tsx
import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faScissors, 
  faSearchPlus, 
  faExpand, 
  faEraser,
  faUserCog as faUsersCrown,
  faPalette,
  faClock,
  faCheck
} from '@fortawesome/free-solid-svg-icons';
import Card from '../../shared/Card';
import './Services.css';

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

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
    accuracy: '99.7%',
    serviceKey: 'background-removal' as const
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
    accuracy: '98.5%',
    serviceKey: 'upscale' as const
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
    accuracy: '96.8%',
    serviceKey: 'enlarge' as const
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
    accuracy: '97.2%',
    serviceKey: 'object-removal' as const
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
    accuracy: 'TBD',
    serviceKey: null
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
    accuracy: 'TBD',
    serviceKey: null
  },
];

interface ServicesProps {
  onServiceClick?: (servicePage: 'background-removal' | 'upscale' | 'enlarge' | 'object-removal') => void;
}

const Services: React.FC<ServicesProps> = ({ onServiceClick }) => {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Header animation
      if (headerRef.current?.children) {
        gsap.fromTo(headerRef.current.children, {
          opacity: 0,
          y: 30,
        }, {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.2,
          ease: "power2.out",
          scrollTrigger: {
            trigger: headerRef.current,
            start: "top 80%",
            end: "bottom 20%",
            toggleActions: "play none none reverse",
          }
        });
      }

      // Service cards animation
      gsap.fromTo(".service-card", {
        opacity: 0,
        y: 50,
        scale: 0.9,
      }, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.6,
        stagger: 0.15,
        ease: "power2.out",
        scrollTrigger: {
          trigger: cardsRef.current,
          start: "top 80%",
          end: "bottom 20%",
          toggleActions: "play none none reverse",
        }
      });

      // Tech logos animation
      gsap.fromTo(".tech-logo", {
        opacity: 0,
        scale: 0.8,
      }, {
        opacity: 1,
        scale: 1,
        duration: 0.4,
        stagger: 0.1,
        ease: "back.out(1.2)",
        scrollTrigger: {
          trigger: ".tech-logos",
          start: "top 80%",
          end: "bottom 20%",
          toggleActions: "play none none reverse",
        }
      });

      // Stats animation
      gsap.fromTo(".stat-item", {
        opacity: 0,
        scale: 0.8,
      }, {
        opacity: 1,
        scale: 1,
        duration: 0.5,
        stagger: 0.1,
        ease: "back.out(1.2)",
        scrollTrigger: {
          trigger: ".stats-grid",
          start: "top 80%",
          end: "bottom 20%",
          toggleActions: "play none none reverse",
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="services-section" id="services">
      <div className="services-container">
        {/* Header */}
        <div ref={headerRef} className="services-header">
          <h2 className="services-title">AI-Powered Services</h2>
          <p className="services-subtitle">
            Professional-grade microservices for automated image editing. 
            Built to scale, designed to integrate seamlessly into your workflow.
          </p>
        </div>

        {/* Services Grid */}
        <div ref={cardsRef} className="services-grid">
          {services.map((service) => (
            <div 
              key={service.name}
              onClick={() => {
                if (!service.disabled && service.serviceKey && onServiceClick) {
                  onServiceClick(service.serviceKey);
                }
              }}
              style={{ cursor: !service.disabled && service.serviceKey ? 'pointer' : 'default' }}
            >
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
            </div>
          ))}
        </div>

        {/* Tech Stack */}
        <div className="tech-stack">
          <h3 className="tech-stack-title">Powered by Modern Technologies</h3>
          
          <div className="tech-logos">
            {[
              { name: 'React', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg' },
              { name: 'TypeScript', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg' },
              { name: 'Spring Boot', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/spring/spring-original.svg' },
              { name: 'Python', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg' },
              { name: 'PostgreSQL', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg' },
            ].map((tech) => (
              <div key={tech.name} className="tech-logo">
                <img 
                  src={tech.icon}
                  alt={tech.name}
                  className="tech-logo-img" 
                />
                <span className="tech-name">{tech.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;
