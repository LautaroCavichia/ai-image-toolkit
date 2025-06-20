// src/components/AboutSection/AboutSection.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBrain, 
  faBolt, 
  faShield,
  faRocket,
  faLayerGroup,
  faCode,
  faChevronRight
} from '@fortawesome/free-solid-svg-icons';
import './AboutSection.css';

const workflowSteps = [
  {
    id: 1,
    icon: faLayerGroup,
    title: "Upload Your Image",
    description: "Drag & drop or select your image in any format",
    details: "Support for JPEG, PNG, WebP, and more"
  },
  {
    id: 2,
    icon: faBrain,
    title: "AI Processing",
    description: "Our advanced neural networks analyze and enhance",
    details: "Trained on millions of professional images"
  },
  {
    id: 3,
    icon: faBolt,
    title: "Instant Results",
    description: "Download your enhanced image in seconds",
    details: "Lightning-fast processing pipeline"
  }
];

const features = [
  {
    icon: faRocket,
    title: "Lightning Fast",
    description: "State-of-the-art optimization delivers results in seconds, not minutes.",
    color: "--color-accent-400",
    gradient: "--gradient-accent"
  },
  {
    icon: faBrain,
    title: "AI-Powered",
    description: "Advanced neural networks trained on millions of professional images.",
    color: "--color-primary-400", 
    gradient: "--gradient-primary"
  },
  {
    icon: faShield,
    title: "Secure & Private",
    description: "Your images are processed securely and never stored or shared.",
    color: "--color-secondary-400",
    gradient: "--gradient-secondary"
  },
  {
    icon: faCode,
    title: "Developer Ready",
    description: "Clean REST API with comprehensive documentation for easy integration.",
    color: "--color-primary-600",
    gradient: "--gradient-primary"
  }
];

const techStack = [
  { name: "React", icon: "react", color: "#61DAFB" },
  { name: "TypeScript", icon: "typescript", color: "#3178C6" },
  { name: "Python", icon: "python", color: "#3776AB" },
  { name: "Spring Boot", icon: "spring", color: "#6DB33F" },
  { name: "PostgreSQL", icon: "postgresql", color: "#336791" },
  { name: "Docker", icon: "docker", color: "#2496ED" }
];

const AboutSection: React.FC = () => {
  return (
    <section className="about-section" id="about">
      <div className="about-container">
        {/* Header */}
        <motion.div 
          className="about-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="about-title gradient-text">How PixelPerfect Works</h2>
          <p className="about-subtitle">
            Transform your images in three simple steps using cutting-edge AI technology.
            <br />Professional results without the complexity.
          </p>
        </motion.div>

        {/* Workflow Steps */}
        <motion.div 
          className="workflow-container"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="workflow-steps">
            {workflowSteps.map((step, index) => (
              <motion.div
                key={step.id}
                className="workflow-step glass-card glass-hover"
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                whileInView={{ 
                  opacity: 1, 
                  y: 0, 
                  scale: 1,
                  transition: { delay: index * 0.1, duration: 0.6 }
                }}
                viewport={{ once: true }}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
              >
                <div className="step-number">
                  <span>{step.id}</span>
                </div>
                
                <div className="step-icon">
                  <FontAwesomeIcon icon={step.icon} />
                  <div className="step-icon-glow"></div>
                </div>
                
                <div className="step-content">
                  <h3 className="step-title">{step.title}</h3>
                  <p className="step-description">{step.description}</p>
                  <span className="step-details">{step.details}</span>
                </div>
                
                {index < workflowSteps.length - 1 && (
                  <div className="step-arrow">
                    <FontAwesomeIcon icon={faChevronRight} />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Features Grid */}
        <motion.div 
          className="features-section"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <h3 className="features-title">Why Choose PixelPerfect?</h3>
          <div className="features-grid">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="feature-card glass-card glass-hover"
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                whileInView={{ 
                  opacity: 1, 
                  y: 0, 
                  scale: 1,
                  transition: { delay: index * 0.1, duration: 0.6 }
                }}
                viewport={{ once: true }}
                whileHover={{ 
                  y: -5, 
                  scale: 1.02,
                  transition: { duration: 0.3 }
                }}
                style={{'--feature-color': `var(${feature.color})`} as React.CSSProperties}
              >
                <div className="feature-icon">
                  <FontAwesomeIcon icon={feature.icon} />
                  <div className="feature-icon-bg"></div>
                </div>
                <h4 className="feature-title">{feature.title}</h4>
                <p className="feature-description">{feature.description}</p>
                <div className="feature-glow"></div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Tech Stack */}
        <motion.div 
          className="tech-stack-section"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <h3 className="tech-stack-title">Built with Modern Technologies</h3>
          <div className="tech-stack-grid">
            {techStack.map((tech, index) => (
              <motion.div
                key={tech.name}
                className="tech-item glass-hover"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ 
                  opacity: 1, 
                  scale: 1,
                  transition: { delay: index * 0.1, duration: 0.5 }
                }}
                viewport={{ once: true }}
                whileHover={{ 
                  scale: 1.05,
                  y: -3,
                  transition: { duration: 0.2 }
                }}
              >
                <div className="tech-icon">
                  <img 
                    src={`https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${tech.icon}/${tech.icon}-original.svg`}
                    alt={tech.name}
                    style={{'--tech-color': tech.color} as React.CSSProperties}
                  />
                </div>
                <span className="tech-name">{tech.name}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutSection;