import React, { useState } from 'react';
import { faArrowsUpDown, faCoins, faCrown } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { motion, AnimatePresence } from 'framer-motion';
import ServiceUploader from '../components/ServiceUploader/ServiceUploader';
import { JobResponseDTO, JobTypeEnum } from '../types';
import './ServicePage.css';

interface UpscalePageProps {
  onJobCreated: (job: JobResponseDTO) => void;
}

interface UpscaleQuality {
  type: 'FREE' | 'PREMIUM';
  label: string;
  description: string;
  icon: any;
  tokenCost: number;
  scale: string;
  processing: string;
}

const UpscalePage: React.FC<UpscalePageProps> = ({ onJobCreated }) => {
  const [upscaleQuality, setUpscaleQuality] = useState<'FREE' | 'PREMIUM'>('FREE');

  const upscaleQualityOptions: UpscaleQuality[] = [
    {
      type: 'FREE',
      label: 'Standard Quality',
      description: 'Fast 2x upscaling with good quality',
      icon: faArrowsUpDown,
      tokenCost: 0,
      scale: '2x',
      processing: 'Fast (~30s)'
    },
    {
      type: 'PREMIUM',
      label: 'Premium Quality',
      description: 'High-quality 4x upscaling with AI enhancement',
      icon: faCrown,
      tokenCost: 1,
      scale: '4x',
      processing: 'Slower (~2-3min)'
    }
  ];

  const getJobConfig = () => ({
    quality: upscaleQuality,
    scale: upscaleQuality === 'PREMIUM' ? 4 : 2
  });

  const getTokenCost = () => upscaleQuality === 'PREMIUM' ? 1 : 0;

  const UpscaleConfiguration = () => (
    <motion.div 
      className="upscale-quality-selector"
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      transition={{ duration: 0.3 }}
    >
      <p className="selector-label">Choose Upscaling Quality:</p>
      <div className="quality-options">
        {upscaleQualityOptions.map((option) => (
          <div
            key={option.type}
            className={`quality-option ${upscaleQuality === option.type ? 'active' : ''}`}
            onClick={() => setUpscaleQuality(option.type)}
          >
            <div className="quality-header">
              <div className="quality-icon">
                <FontAwesomeIcon icon={option.icon} />
              </div>
              <div className="quality-info">
                <h4 className="quality-title">{option.label}</h4>
                <p className="quality-description">{option.description}</p>
              </div>
              {option.tokenCost > 0 && (
                <div className="quality-cost">
                  <FontAwesomeIcon icon={faCoins} />
                  <span>{option.tokenCost}</span>
                </div>
              )}
            </div>
            <div className="quality-details">
              <div className="quality-detail">
                <span className="detail-label">Scale:</span>
                <span className="detail-value">{option.scale}</span>
              </div>
              <div className="quality-detail">
                <span className="detail-label">Speed:</span>
                <span className="detail-value">{option.processing}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );

  return (
    <div className="service-page">
      <ServiceUploader
        jobType={JobTypeEnum.UPSCALE}
        onJobCreated={onJobCreated}
        title="AI Upscaling"
        description="Enhance your images with AI-powered upscaling. Increase resolution while preserving and enhancing details."
        icon={faArrowsUpDown}
        getJobConfig={getJobConfig}
        getTokenCost={getTokenCost}
      >
        <UpscaleConfiguration />
      </ServiceUploader>
      
      <div className="service-info-section">
        <div className="container">
          <div className="info-grid">
            <div className="info-card">
              <h3>Smart Enhancement</h3>
              <p>Our AI doesn't just resize - it intelligently enhances details, sharpens edges, and reduces artifacts.</p>
            </div>
            <div className="info-card">
              <h3>Multiple Scales</h3>
              <p>Choose between 2x fast upscaling or 4x premium enhancement based on your needs and budget.</p>
            </div>
            <div className="info-card">
              <h3>Quality Preservation</h3>
              <p>Advanced neural networks ensure the upscaled image maintains the original's character and quality.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpscalePage;