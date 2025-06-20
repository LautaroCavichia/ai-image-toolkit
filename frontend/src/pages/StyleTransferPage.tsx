import React, { useState } from 'react';
import { faPalette } from '@fortawesome/free-solid-svg-icons';
import ServiceUploader from '../components/ServiceUploader/ServiceUploader';
import StyleSelector, { StyleConfig } from '../components/StyleSelector/StyleSelector';
import { JobResponseDTO, JobTypeEnum } from '../types';
import './ServicePage.css';

interface StyleTransferPageProps {
  onJobCreated: (job: JobResponseDTO) => void;
}

const StyleTransferPage: React.FC<StyleTransferPageProps> = ({ onJobCreated }) => {
  const [styleConfig, setStyleConfig] = useState<StyleConfig>({
    style: 'Ghibli',
    prompt: 'Studio Ghibli style, anime, detailed backgrounds, warm colors',
    strength: 1.0,
    quality: 'FREE'
  });

  const handleStyleConfigChange = (config: StyleConfig) => {
    setStyleConfig(config);
  };

  const getJobConfig = () => ({
    style: styleConfig.style,
    prompt: styleConfig.prompt,
    strength: styleConfig.strength,
    quality: styleConfig.quality
  });

  const getTokenCost = () => styleConfig.quality === 'PREMIUM' ? 2 : 0;

  return (
    <div className="service-page">
      <ServiceUploader
        jobType={JobTypeEnum.STYLE_TRANSFER}
        onJobCreated={onJobCreated}
        title="Style Transfer"
        description="Transform your images with artistic styles powered by advanced AI. Choose from 20+ unique art styles or create custom prompts."
        icon={faPalette}
        getJobConfig={getJobConfig}
        getTokenCost={getTokenCost}
      >
        <StyleSelector
          config={styleConfig}
          onChange={handleStyleConfigChange}
        />
      </ServiceUploader>
      
      <div className="service-info-section">
        <div className="container">
          <div className="info-grid">
            <div className="info-card">
              <h3>20+ Art Styles</h3>
              <p>From Studio Ghibli anime to Van Gogh paintings, explore a wide variety of artistic transformations.</p>
            </div>
            <div className="info-card">
              <h3>Custom Prompts</h3>
              <p>Add your own description to guide the AI and create unique artistic interpretations.</p>
            </div>
            <div className="info-card">
              <h3>Adjustable Strength</h3>
              <p>Control how strongly the style is applied - from subtle hints to complete artistic transformation.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StyleTransferPage;