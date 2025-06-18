// src/components/sections/ContactSection/ContactForm.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPaperPlane, 
  faSpinner,
  faCheck,
  faExclamationTriangle,
  faEnvelope,
  faPhone,
  faMapMarkerAlt,
  faClock,
  faUsers,
  faRocket
} from '@fortawesome/free-solid-svg-icons';
import './ContactForm.css';

const ContactForm: React.FC = () => {
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
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
    <section className="contact-section section">
      <div className="section-container">
        <motion.div 
          className="contact-hero"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="contact-title">
            Let's Build
            <span className="gradient-text"> Something Amazing</span>
            <br />Together
          </h2>
          <p className="contact-subtitle">
            Ready to transform your image processing workflow? Our team of experts is here to help you 
            integrate cutting-edge AI technology into your projects.
          </p>
        </motion.div>
        
        <motion.div 
          className="contact-container"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="contact-info">
            <motion.div 
              className="contact-card primary"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              whileHover={{ y: -5 }}
            >
              <div className="contact-icon email-icon">
                <FontAwesomeIcon icon={faEnvelope} />
              </div>
              <h3 className="contact-info-title">Email Us</h3>
              <p className="contact-info-text">contact@pixelperfect.ai</p>
              <p className="contact-info-detail">We respond within 24 hours</p>
            </motion.div>
            
            <motion.div 
              className="contact-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              whileHover={{ y: -5 }}
            >
              <div className="contact-icon phone-icon">
                <FontAwesomeIcon icon={faPhone} />
              </div>
              <h3 className="contact-info-title">Call Us</h3>
              <p className="contact-info-text">+1 (555) 123-4567</p>
              <p className="contact-info-detail">Mon-Fri, 9AM-6PM EST</p>
            </motion.div>
            
            <motion.div 
              className="contact-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              whileHover={{ y: -5 }}
            >
              <div className="contact-icon location-icon">
                <FontAwesomeIcon icon={faMapMarkerAlt} />
              </div>
              <h3 className="contact-info-title">Visit Us</h3>
              <p className="contact-info-text">123 Innovation Drive<br/>San Francisco, CA 94105</p>
              <p className="contact-info-detail">By appointment only</p>
            </motion.div>
            
            <motion.div 
              className="contact-card accent"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              whileHover={{ y: -5 }}
            >
              <div className="contact-icon enterprise-icon">
                <FontAwesomeIcon icon={faRocket} />
              </div>
              <h3 className="contact-info-title">Enterprise</h3>
              <p className="contact-info-text">Custom solutions for scale</p>
              <p className="contact-info-detail">Book a consultation</p>
            </motion.div>
          </div>
          
          <div className="contact-form-container">
            <motion.div 
              className="form-header"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <h3 className="form-title">Send Us a Message</h3>
              <p className="form-subtitle">Tell us about your project and we'll get back to you within 24 hours.</p>
            </motion.div>
            
            <form className="contact-form" onSubmit={handleSubmit}>
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
                  <option value="API Integration">API Integration & Development</option>
                  <option value="Enterprise Plan">Enterprise Solutions</option>
                  <option value="Partnership">Partnership Opportunities</option>
                  <option value="Support">Technical Support</option>
                  <option value="Custom Development">Custom AI Development</option>
                  <option value="Consulting">AI Consulting Services</option>
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
                ></textarea>
              </div>
              
              {status === 'error' && (
                <div className="form-error">
                  <FontAwesomeIcon icon={faExclamationTriangle} />
                  <span>{errorMessage}</span>
                </div>
              )}
              
              {status === 'success' && (
                <div className="form-success">
                  <FontAwesomeIcon icon={faCheck} />
                  <span>Message sent successfully!</span>
                </div>
              )}
              
              <motion.button 
                type="submit"
                className={`submit-button ${status === 'success' ? 'success' : ''}`}
                disabled={status === 'submitting' || status === 'success'}
                whileHover={{ scale: status === 'submitting' || status === 'success' ? 1 : 1.05 }}
                whileTap={{ scale: status === 'submitting' || status === 'success' ? 1 : 0.95 }}
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
              </motion.button>
            </form>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ContactForm;