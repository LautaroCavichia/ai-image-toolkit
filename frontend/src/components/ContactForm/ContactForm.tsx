// src/components/ContactForm/ContactForm.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPaperPlane, 
  faSpinner,
  faCheck,
  faExclamationTriangle
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
        <motion.h2 
          className="section-title"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          Get in Touch
        </motion.h2>
        
        <motion.p 
          className="section-subtitle"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Have questions about our services? Want to discuss integrating PixelPerfect AI into your workflow? 
          We'd love to hear from you!
        </motion.p>
        
        <motion.div 
          className="contact-container"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="contact-info">
            <div className="contact-card">
              <div className="contact-icon email-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
              </div>
              <h3 className="contact-info-title">Email Us</h3>
              <p className="contact-info-text">contact@pixelperfect.ai</p>
            </div>
            
            <div className="contact-card">
              <div className="contact-icon phone-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
              </div>
              <h3 className="contact-info-title">Call Us</h3>
              <p className="contact-info-text">+39 333 33333</p>
            </div>
            
            <div className="contact-card">
              <div className="contact-icon location-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
              </div>
              <h3 className="contact-info-title">Visit Us</h3>
              <p className="contact-info-text">123 PixelPerfect<br/>La Falda, CBA</p>
            </div>
          </div>
          
          <div className="contact-form-container">
            <h3 className="form-title">Send Us a Message</h3>
            
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