// src/components/AboutSection/AboutSection.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faImage, 
  faServer, 
  faCode,
  faMagicWandSparkles,
  faShieldHalved,
  faCloudArrowUp
} from '@fortawesome/free-solid-svg-icons';
import './AboutSection.css';

const AboutSection: React.FC = () => {
  return (
    <section className="about-section" id="about">
      <div className="about-container">
        <div className="about-header">
          <motion.h2 
            className="about-title"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            How PixelPerfect Works
          </motion.h2>
          <motion.p 
            className="about-subtitle"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Our cutting-edge platform uses AI to transform your images in seconds. 
            See how our advanced technology stack makes image enhancement effortless.
          </motion.p>
        </div>

        <motion.div 
          className="features-grid"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="feature-card">
            <div className="feature-icon">
              <FontAwesomeIcon icon={faImage} />
            </div>
            <h3 className="feature-title">Smart Image Processing</h3>
            <p className="feature-description">
              Our AI models are trained on millions of images to provide professional-grade 
              background removal, upscaling, and image enhancement.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <FontAwesomeIcon icon={faMagicWandSparkles} />
            </div>
            <h3 className="feature-title">Real-time Enhancement</h3>
            <p className="feature-description">
              Watch your images transform almost instantly with our optimized processing pipeline. 
              What used to take hours in Photoshop now takes just seconds.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <FontAwesomeIcon icon={faCloudArrowUp} />
            </div>
            <h3 className="feature-title">Easy Upload & Download</h3>
            <p className="feature-description">
              Simply drag and drop your images, choose your enhancement, and download the 
              results. We support all standard image formats.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <FontAwesomeIcon icon={faServer} />
            </div>
            <h3 className="feature-title">Microservices Architecture</h3>
            <p className="feature-description">
              Our application is built on a modern microservices architecture that ensures 
              scalability and reliability even during high-demand periods.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <FontAwesomeIcon icon={faShieldHalved} />
            </div>
            <h3 className="feature-title">Secure Processing</h3>
            <p className="feature-description">
              Your images and data are processed securely and never shared with third parties. 
              We prioritize privacy and security in every aspect of our service.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <FontAwesomeIcon icon={faCode} />
            </div>
            <h3 className="feature-title">Developer Friendly</h3>
            <p className="feature-description">
              Our platform is built with developers in mind, offering a clean and 
              well-documented API for integration into your own applications.
            </p>
          </div>
        </motion.div>

        <motion.div 
          className="tech-stack"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h3 className="tech-stack-title">Powered by Modern Technologies</h3>
          <div className="tech-logos">
            <div className="tech-logo">
              <img 
                src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" 
                alt="React" 
                className="tech-logo-img" 
              />
              <span className="tech-name">React</span>
            </div>
            <div className="tech-logo">
              <img 
                src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg" 
                alt="TypeScript" 
                className="tech-logo-img" 
              />
              <span className="tech-name">TypeScript</span>
            </div>
            <div className="tech-logo">
              <img 
                src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/spring/spring-original.svg" 
                alt="Spring Boot" 
                className="tech-logo-img" 
              />
              <span className="tech-name">Spring Boot</span>
            </div>
            <div className="tech-logo">
              <img 
                src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg" 
                alt="Python" 
                className="tech-logo-img" 
              />
              <span className="tech-name">Python</span>
            </div>
            <div className="tech-logo">
              <img 
                src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg" 
                alt="PostgreSQL" 
                className="tech-logo-img" 
              />
              <span className="tech-name">PostgreSQL</span>
            </div>
            <div className="tech-logo">
              <img 
                src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg" 
                alt="Docker" 
                className="tech-logo-img" 
              />
              <span className="tech-name">Docker</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutSection;