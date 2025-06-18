// src/components/sections/ContactSection/ContactSection.tsx
import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPaperPlane, 
  faSpinner,
  faCheck,
  faExclamationTriangle,
  faEnvelope,
  faPhone,
  faMapMarkerAlt
} from '@fortawesome/free-solid-svg-icons';
import Card from '../../shared/Card';
import './ContactSection.css';

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

const ContactSection: React.FC = () => {
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

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

      // Content animation
      gsap.fromTo(".contact-card", {
        opacity: 0,
        y: 40,
        scale: 0.95,
      }, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.6,
        stagger: 0.2,
        ease: "power2.out",
        scrollTrigger: {
          trigger: contentRef.current,
          start: "top 80%",
          end: "bottom 20%",
          toggleActions: "play none none reverse",
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formState.name || !formState.email || !formState.message) {
      setStatus('error');
      setErrorMessage('Please fill out all required fields.');
      return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formState.email)) {
      setStatus('error');
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    
    setStatus('submitting');
    
    // Simulate API call - replace with actual API call
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setStatus('success');
      setFormState({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
      setTimeout(() => {
        setStatus('idle');
      }, 3000);
    } catch (error) {
      setStatus('error');
      setErrorMessage('Something went wrong. Please try again later.');
      setTimeout(() => {
        setStatus('idle');
        setErrorMessage(null);
      }, 3000);
    }
  };
  
  return (
    <section ref={sectionRef} className="contact-section" id="contact">
      <div className="contact-container">
        {/* Header */}
        <div ref={headerRef} className="contact-header">
          <h2 className="contact-title">Get in Touch</h2>
          <p className="contact-subtitle">
            Have questions about our services? Want to discuss integrating PixelPerfect AI into your workflow? 
            We'd love to hear from you!
          </p>
        </div>
        
        {/* Content */}
        <div ref={contentRef} className="contact-content">
          {/* Contact Info */}
          <div className="contact-info">
            <Card variant="glass" padding="xl" className="contact-card info-card">
              <div className="contact-info-item">
                <div className="contact-icon email-icon">
                  <FontAwesomeIcon icon={faEnvelope} />
                </div>
                <div className="contact-details">
                  <h3 className="contact-info-title">Email Us</h3>
                  <p className="contact-info-text">contact@pixelperfect.ai</p>
                  <p className="contact-info-description">
                    For general inquiries and support
                  </p>
                </div>
              </div>
            </Card>
            
            <Card variant="glass" padding="xl" className="contact-card info-card">
              <div className="contact-info-item">
                <div className="contact-icon phone-icon">
                  <FontAwesomeIcon icon={faPhone} />
                </div>
                <div className="contact-details">
                  <h3 className="contact-info-title">Call Us</h3>
                  <p className="contact-info-text">+39 333 33333</p>
                  <p className="contact-info-description">
                    Monday to Friday, 9 AM - 6 PM CET
                  </p>
                </div>
              </div>
            </Card>
            
            <Card variant="glass" padding="xl" className="contact-card info-card">
              <div className="contact-info-item">
                <div className="contact-icon location-icon">
                  <FontAwesomeIcon icon={faMapMarkerAlt} />
                </div>
                <div className="contact-details">
                  <h3 className="contact-info-title">Visit Us</h3>
                  <p className="contact-info-text">123 PixelPerfect<br/>La Falda, CBA</p>
                  <p className="contact-info-description">
                    Our office in beautiful Argentina
                  </p>
                </div>
              </div>
            </Card>
          </div>
          
          {/* Contact Form */}
          <div className="contact-form-container">
            <Card variant="glass" padding="xl" className="contact-card form-card">
              <h3 className="form-title">Send Us a Message</h3>
              
              <form className="contact-form" onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="name" className="form-label">Name *</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      className="form-input"
                      placeholder="Your name"
                      value={formState.name}
                      onChange={handleInputChange}
                      disabled={status === 'submitting' || status === 'success'}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="email" className="form-label">Email *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      className="form-input"
                      placeholder="Your email address"
                      value={formState.email}
                      onChange={handleInputChange}
                      disabled={status === 'submitting' || status === 'success'}
                      required
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="subject" className="form-label">Subject</label>
                  <select
                    id="subject"
                    name="subject"
                    className="form-input"
                    value={formState.subject}
                    onChange={handleInputChange}
                    disabled={status === 'submitting' || status === 'success'}
                  >
                    <option value="">Select a subject</option>
                    <option value="General Inquiry">General Inquiry</option>
                    <option value="API Integration">API Integration</option>
                    <option value="Enterprise Plan">Enterprise Plan</option>
                    <option value="Partnership">Partnership</option>
                    <option value="Support">Technical Support</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="message" className="form-label">Message *</label>
                  <textarea
                    id="message"
                    name="message"
                    className="form-textarea"
                    placeholder="Your message"
                    value={formState.message}
                    onChange={handleInputChange}
                    disabled={status === 'submitting' || status === 'success'}
                    required
                    rows={6}
                  ></textarea>
                </div>
                
                {/* Status Messages */}
                {status === 'error' && (
                  <div className="form-message form-error">
                    <FontAwesomeIcon icon={faExclamationTriangle} />
                    <span>{errorMessage}</span>
                  </div>
                )}
                
                {status === 'success' && (
                  <div className="form-message form-success">
                    <FontAwesomeIcon icon={faCheck} />
                    <span>Message sent successfully!</span>
                  </div>
                )}
                
                <button 
                  type="submit"
                  className={`submit-button ${status === 'success' ? 'success' : ''}`}
                  disabled={status === 'submitting' || status === 'success'}
                >
                  {status === 'submitting' ? (
                    <>
                      <FontAwesomeIcon icon={faSpinner} className="spinner" />
                      <span>Sending...</span>
                    </>
                  ) : status === 'success' ? (
                    <>
                      <FontAwesomeIcon icon={faCheck} />
                      <span>Sent!</span>
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faPaperPlane} />
                      <span>Send Message</span>
                    </>
                  )}
                </button>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;