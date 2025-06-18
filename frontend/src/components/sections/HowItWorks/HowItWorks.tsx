// src/components/sections/HowItWorks/HowItWorks.tsx
import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUpload, 
  faMagicWandSparkles, 
  faDownload,
  faArrowRight
} from '@fortawesome/free-solid-svg-icons';
import Card from '../../shared/Card';
import './HowItWorks.css';

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

const HowItWorks: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const stepsRef = useRef<HTMLDivElement>(null);

  const steps = [
    {
      number: '01',
      title: 'Upload Your Image',
      description: 'Simply drag and drop your image or click to browse. We support all major formats including JPG, PNG, and WebP.',
      icon: faUpload,
      color: '#8b5cf6'
    },
    {
      number: '02',
      title: 'Choose AI Service',
      description: 'Select from our powerful AI tools: background removal, upscaling, enlargement, or object removal.',
      icon: faMagicWandSparkles,
      color: '#3b82f6'
    },
    {
      number: '03',
      title: 'Download Result',
      description: 'Get your enhanced image in seconds. High-quality results ready for professional use.',
      icon: faDownload,
      color: '#10b981'
    }
  ];

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

      // Steps animation
      gsap.fromTo(".step-card", {
        opacity: 0,
        y: 50,
        scale: 0.9,
      }, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.6,
        stagger: 0.2,
        ease: "power2.out",
        scrollTrigger: {
          trigger: stepsRef.current,
          start: "top 80%",
          end: "bottom 20%",
          toggleActions: "play none none reverse",
        }
      });

      // Arrow animations
      gsap.fromTo(".step-arrow", {
        opacity: 0,
        x: -20,
      }, {
        opacity: 1,
        x: 0,
        duration: 0.4,
        stagger: 0.2,
        ease: "power2.out",
        delay: 0.8,
        scrollTrigger: {
          trigger: stepsRef.current,
          start: "top 80%",
          end: "bottom 20%",
          toggleActions: "play none none reverse",
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="how-it-works-section" id="how-it-works">
      <div className="how-it-works-container">
        {/* Header */}
        <div ref={headerRef} className="how-it-works-header">
          <h2 className="how-it-works-title">How It Works</h2>
          <p className="how-it-works-subtitle">
            Transform your images in three simple steps. Our AI-powered platform makes professional image editing accessible to everyone.
          </p>
        </div>

        {/* Steps */}
        <div ref={stepsRef} className="steps-container">
          {steps.map((step, index) => (
            <React.Fragment key={step.number}>
              <Card className="step-card" variant="glass" padding="xl" hover>
                <div className="step-number" style={{ color: step.color }}>
                  {step.number}
                </div>
                
                <div className="step-icon" style={{ background: `linear-gradient(135deg, ${step.color}, ${step.color}dd)` }}>
                  <FontAwesomeIcon icon={step.icon} />
                </div>
                
                <div className="step-content">
                  <h3 className="step-title">{step.title}</h3>
                  <p className="step-description">{step.description}</p>
                </div>
              </Card>
              
              {index < steps.length - 1 && (
                <div className="step-arrow">
                  <FontAwesomeIcon icon={faArrowRight} />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* CTA */}
        <div className="how-it-works-cta">
          <h3 className="cta-title">Ready to Get Started?</h3>
          <p className="cta-description">
            Join thousands of users who trust our AI-powered image processing tools for their professional needs.
          </p>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;