import React from 'react';
import { faImage } from '@fortawesome/free-solid-svg-icons';
import ServiceUploader from '../components/ServiceUploader/ServiceUploader';
import BeforeAfterSlider from '../components/ImageSlider/BeforeAfterSlider';
import { JobResponseDTO, JobTypeEnum } from '../types';
import { motion } from 'framer-motion';
import './ServicePage.css';

interface BackgroundRemovalPageProps {
  onJobCreated: (job: JobResponseDTO) => void;
}

const BackgroundRemovalPage: React.FC<BackgroundRemovalPageProps> = ({ onJobCreated }) => {
  // Service-specific accent color
  const serviceColor = 'var(--color-service-background)';

  return (
    <div className="service-page" style={{'--service-accent': serviceColor} as React.CSSProperties}>
      <ServiceUploader
        jobType={JobTypeEnum.BG_REMOVAL}
        onJobCreated={onJobCreated}
        title="Background Removal"
        description="Remove backgrounds from images with AI precision. Perfect for product photos, portraits, and creating transparent images."
        icon={faImage}
        getTokenCost={() => 0} // Background removal is free
      />
      
      {/* Instructions & Demo Section */}
      <div className="service-demo-section">
        <div className="service-container">
          {/* Instructions */}
          <motion.div 
            className="instructions-card glass-card"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="instructions-header">
              <div className="instruction-icon">
                <faImage />
              </div>
              <h2 className="instructions-title">How to Use Background Removal</h2>
            </div>
            
            <div className="instructions-steps">
              <div className="step">
                <div className="step-number">1</div>
                <div className="step-content">
                  <h4>Upload Your Image</h4>
                  <p>Choose any JPG, PNG, GIF, or WEBP image up to 10MB</p>
                </div>
              </div>
              
              <div className="step">
                <div className="step-number">2</div>
                <div className="step-content">
                  <h4>AI Processing</h4>
                  <p>Our advanced AI automatically detects and removes the background</p>
                </div>
              </div>
              
              <div className="step">
                <div className="step-number">3</div>
                <div className="step-content">
                  <h4>Download Result</h4>
                  <p>Get your image with transparent background in PNG format</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Before/After Demo */}
          <motion.div 
            className="demo-section"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="demo-header">
              <h3 className="demo-title gradient-text">See the Magic in Action</h3>
              <p className="demo-subtitle">Experience professional-quality background removal</p>
            </div>
            
            <div className="slider-container">
              <BeforeAfterSlider
                beforeSrc="/api/placeholder/600/400?text=Original+Image"
                afterSrc="/api/placeholder/600/400?text=Background+Removed"
                title="Professional Background Removal"
                subtitle="Slide to see the transformation"
                autoPlaySpeed={6000}
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <div className="service-features-section">
        <div className="service-container">
          <motion.div 
            className="features-header"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h3 className="features-title">Why Choose Our Background Removal?</h3>
          </motion.div>

          <div className="features-grid">
            <motion.div 
              className="feature-card glass-card glass-hover"
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <div className="feature-icon">⚡</div>
              <h4>Instant Processing</h4>
              <p>Get results in seconds with our advanced AI model that accurately detects and removes backgrounds.</p>
            </motion.div>

            <motion.div 
              className="feature-card glass-card glass-hover"
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="feature-icon">🎯</div>
              <h4>High Precision</h4>
              <p>Advanced edge detection ensures clean cuts around hair, fur, and complex shapes.</p>
            </motion.div>

            <motion.div 
              className="feature-card glass-card glass-hover"
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="feature-icon">📁</div>
              <h4>Multiple Formats</h4>
              <p>Supports JPG, PNG, GIF, and WEBP. Output includes transparent PNG for maximum flexibility.</p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BackgroundRemovalPage;