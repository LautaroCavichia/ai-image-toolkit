// src/components/Footer/Footer.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTwitter, 
  faFacebookF, 
  faInstagram, 
  faLinkedinIn, 
  faYoutube 
} from '@fortawesome/free-brands-svg-icons';
import './Footer.css';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-column">
          <div className="footer-logo">
            <div className="logo-icon-footer">
              <div className="logo-square"></div>
              <div className="logo-circle"></div>
            </div>
            <span className="footer-logo-text">PixelPerfect AI</span>
          </div>
          <p className="footer-description">
            Transforming images with AI technology. Our platform makes professional-quality 
            image editing accessible to everyone through innovative algorithms and an intuitive interface.
          </p>
          
          <div className="footer-social">
            <motion.a 
              href="#" 
              className="footer-social-link"
              whileHover={{ y: -5 }}
              whileTap={{ scale: 0.95 }}
            >
              <FontAwesomeIcon icon={faTwitter} />
            </motion.a>
            <motion.a 
              href="#" 
              className="footer-social-link"
              whileHover={{ y: -5 }}
              whileTap={{ scale: 0.95 }}
            >
              <FontAwesomeIcon icon={faFacebookF} />
            </motion.a>
            <motion.a 
              href="#" 
              className="footer-social-link"
              whileHover={{ y: -5 }}
              whileTap={{ scale: 0.95 }}
            >
              <FontAwesomeIcon icon={faInstagram} />
            </motion.a>
            <motion.a 
              href="#" 
              className="footer-social-link"
              whileHover={{ y: -5 }}
              whileTap={{ scale: 0.95 }}
            >
              <FontAwesomeIcon icon={faLinkedinIn} />
            </motion.a>
            <motion.a 
              href="#" 
              className="footer-social-link"
              whileHover={{ y: -5 }}
              whileTap={{ scale: 0.95 }}
            >
              <FontAwesomeIcon icon={faYoutube} />
            </motion.a>
          </div>
        </div>
        
        <div className="footer-column">
          <h3 className="footer-title">Services</h3>
          <div className="footer-links">
            <motion.a 
              href="#" 
              className="footer-link"
              whileHover={{ x: 5 }}
            >
              Background Removal
            </motion.a>
            <motion.a 
              href="#" 
              className="footer-link"
              whileHover={{ x: 5 }}
            >
              Image Upscaling
            </motion.a>
            <motion.a 
              href="#" 
              className="footer-link"
              whileHover={{ x: 5 }}
            >
              Image Enlargement
            </motion.a>
            <motion.a 
              href="#" 
              className="footer-link"
              whileHover={{ x: 5 }}
            >
              Batch Processing
            </motion.a>
            <motion.a 
              href="#" 
              className="footer-link"
              whileHover={{ x: 5 }}
            >
              API Integration
            </motion.a>
          </div>
        </div>
        
        <div className="footer-column">
          <h3 className="footer-title">Company</h3>
          <div className="footer-links">
            <motion.a 
              href="#home" 
              className="footer-link"
              whileHover={{ x: 5 }}
            >
              Home
            </motion.a>
            <motion.a 
              href="#features" 
              className="footer-link"
              whileHover={{ x: 5 }}
            >
              About Us
            </motion.a>
            <motion.a 
              href="#" 
              className="footer-link"
              whileHover={{ x: 5 }}
            >
              Careers
            </motion.a>
            <motion.a 
              href="#" 
              className="footer-link"
              whileHover={{ x: 5 }}
            >
              Blog
            </motion.a>
            <motion.a 
              href="#" 
              className="footer-link"
              whileHover={{ x: 5 }}
            >
              Press Kit
            </motion.a>
          </div>
        </div>
        
        <div className="footer-column">
          <h3 className="footer-title">Resources</h3>
          <div className="footer-links">
            <motion.a 
              href="#" 
              className="footer-link"
              whileHover={{ x: 5 }}
            >
              Documentation
            </motion.a>
            <motion.a 
              href="#" 
              className="footer-link"
              whileHover={{ x: 5 }}
            >
              Help Center
            </motion.a>
            <motion.a 
              href="#" 
              className="footer-link"
              whileHover={{ x: 5 }}
            >
              Tutorials
            </motion.a>
            <motion.a 
              href="#api" 
              className="footer-link"
              whileHover={{ x: 5 }}
            >
              API Reference
            </motion.a>
            <motion.a 
              href="#" 
              className="footer-link"
              whileHover={{ x: 5 }}
            >
              Status
            </motion.a>
          </div>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>© {currentYear} PixelPerfect AI. All rights reserved.</p>
        <div className="footer-legal-links">
          <a href="#" className="footer-legal-link">Terms of Service</a>
          <a href="#" className="footer-legal-link">Privacy Policy</a>
          <a href="#" className="footer-legal-link">Cookies</a>
          <a href="#" className="footer-legal-link">Accessibility</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;