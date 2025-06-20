import React, { useState } from 'react';
import { faExpand } from '@fortawesome/free-solid-svg-icons';
import ServiceUploader from '../components/ServiceUploader/ServiceUploader';
import EnlargeConfigComponent, { EnlargeConfig } from '../components/EnlargeConfig/EnlargeConfig';
import { JobResponseDTO, JobTypeEnum } from '../types';
import './ServicePage.css';

interface EnlargePageProps {
  onJobCreated: (job: JobResponseDTO) => void;
}

const EnlargePage: React.FC<EnlargePageProps> = ({ onJobCreated }) => {
  const [enlargeConfig, setEnlargeConfig] = useState<EnlargeConfig>({
    aspectRatio: 'square',
    quality: 'FREE'
  });

  const handleEnlargeConfigChange = (config: EnlargeConfig) => {
    setEnlargeConfig(config);
  };

  const getJobConfig = () => ({
    aspectRatio: enlargeConfig.aspectRatio,
    quality: enlargeConfig.quality
  });

  const getTokenCost = () => enlargeConfig.quality === 'PREMIUM' ? 1 : 0;

  return (
    <div className="service-page">
      <ServiceUploader
        jobType={JobTypeEnum.ENLARGE}
        onJobCreated={onJobCreated}
        title="Smart Enlargement"
        description="Expand your images intelligently with AI-generated content that seamlessly extends the original scene."
        icon={faExpand}
        getJobConfig={getJobConfig}
        getTokenCost={getTokenCost}
      >
        <EnlargeConfigComponent
          config={enlargeConfig}
          onChange={handleEnlargeConfigChange}
        />
      </ServiceUploader>
      
      <div className="service-info-section">
        <div className="container">
          <div className="info-grid">
            <div className="info-card">
              <h3>Content-Aware Fill</h3>
              <p>AI analyzes your image context to generate natural, seamless extensions that match the original scene.</p>
            </div>
            <div className="info-card">
              <h3>Aspect Ratio Control</h3>
              <p>Choose from square, portrait, or landscape formats. Your original image stays centered and preserved.</p>
            </div>
            <div className="info-card">
              <h3>Premium Diffusion</h3>
              <p>Premium quality uses Stable Diffusion inpainting for photorealistic environment generation.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnlargePage;