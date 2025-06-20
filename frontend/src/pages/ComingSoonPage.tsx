import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faEnvelope, faBell } from '@fortawesome/free-solid-svg-icons';
import './ComingSoonPage.css';

interface ComingSoonPageProps {
  serviceName: string;
  serviceIcon?: any;
  serviceColor?: string;
  description?: string;
}

const ComingSoonPage: React.FC<ComingSoonPageProps> = ({ 
  serviceName, 
  serviceIcon, 
  serviceColor = '#ff9800',
  description = "We're working hard to bring you this amazing feature."
}) => {
  return (
    <div className="coming-soon-page">
      <div className="coming-soon-container">
        <motion.div
          className="coming-soon-content"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {serviceIcon && (
            <motion.div 
              className="service-icon-large"
              style={{ color: serviceColor }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <FontAwesomeIcon icon={serviceIcon} />
            </motion.div>
          )}
          
          <motion.div
            className="coming-soon-badge"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            Coming Soon
          </motion.div>
          
          <motion.h1
            className="coming-soon-title"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            {serviceName}
          </motion.h1>
          
          <motion.p
            className="coming-soon-description"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            {description}
          </motion.p>
          
          <motion.div
            className="coming-soon-features"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.0 }}
          >
            <h3>What to expect:</h3>
            <ul>
              <li>State-of-the-art AI technology</li>
              <li>Lightning-fast processing</li>
              <li>Professional-quality results</li>
              <li>Easy-to-use interface</li>
            </ul>
          </motion.div>
          
          <motion.div
            className="coming-soon-actions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.2 }}
          >
            <Link to="/" className="back-button">
              <FontAwesomeIcon icon={faArrowLeft} />
              <span>Explore Other Services</span>
            </Link>
            
            <div className="notify-section">
              <FontAwesomeIcon icon={faBell} />
              <span>Get notified when this feature launches!</span>
              <Link to="/#contact" className="notify-button">
                <FontAwesomeIcon icon={faEnvelope} />
                <span>Contact Us</span>
              </Link>
            </div>
          </motion.div>
        </motion.div>
        
        <motion.div
          className="coming-soon-animation"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          <div className="floating-shapes">
            <div className="shape shape-1"></div>
            <div className="shape shape-2"></div>
            <div className="shape shape-3"></div>
            <div className="shape shape-4"></div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ComingSoonPage;