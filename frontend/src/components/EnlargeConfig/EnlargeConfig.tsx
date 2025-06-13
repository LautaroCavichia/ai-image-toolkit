// src/components/EnlargeConfig/EnlargeConfig.tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faExpand,
  faSquare,
  faPanorama,
  faImagePortrait,
  faArrowsAltH,
  faArrowsAltV,
  faCrosshairs,
  faArrowUp,
  faArrowDown,
  faArrowLeft,
  faArrowRight,
  faCoins
} from '@fortawesome/free-solid-svg-icons';
import './EnlargeConfig.css';

// Updated interface to match backend expectations
export interface EnlargeConfig {
  aspectRatio: 'portrait' | 'landscape' | 'square';
  // Removed position as backend doesn't use it - always centers and expands
  quality: 'FREE' | 'PREMIUM';
}

interface EnlargeConfigProps {
  config: EnlargeConfig;
  onChange: (config: EnlargeConfig) => void;
}

const EnlargeConfigComponent: React.FC<EnlargeConfigProps> = ({ config, onChange }) => {
  const [selectedAspect, setSelectedAspect] = useState<'portrait' | 'landscape' | 'square'>(config.aspectRatio);
  const [selectedQuality, setSelectedQuality] = useState<'FREE' | 'PREMIUM'>(config.quality);
  

  const aspectRatios = [
    {
      type: 'square' as const,
      label: 'Square',
      description: 'Expands image to 1:1 ratio with balanced natural environment',
      icon: faSquare,
      expansionInfo: 'Expands equally in all directions'
    },
    {
      type: 'portrait' as const,
      label: 'Portrait',
      description: 'Expands to 3:4 ratio with vertical scene extension',
      icon: faImagePortrait,
      expansionInfo: 'Focuses on vertical expansion with environmental depth'
    },
    {
      type: 'landscape' as const,
      label: 'Landscape',
      description: 'Expands to 4:3 ratio with natural outdoor environment',
      icon: faPanorama,
      expansionInfo: 'Emphasizes horizontal expansion with terrain continuation'
    }
  ];

  const qualityOptions = [
    {
      type: 'FREE' as const,
      label: 'Standard Quality',
      description: 'Basic content-aware expansion',
      icon: faExpand,
      tokenCost: 0,
      features: ['Edge extension', 'Basic blending', 'Standard processing'],
      details: 'Simple enlargement with basic fill'
    },
    {
      type: 'PREMIUM' as const,
      label: 'Premium Quality',
      description: 'AI-powered generative fill with Stable Diffusion',
      icon: faExpand,
      tokenCost: 1,
      features: [
        'Stable Diffusion inpainting model',
        'Context-aware natural environments',
        'Seamless multi-directional expansion',
        'Advanced prompting for realistic results',
        'Optimized for landscape/portrait/square formats'
      ],
      details: 'Uses runwayml/stable-diffusion-inpainting with aspect-specific prompts'
    }
  ];

  const handleAspectChange = (aspect: 'portrait' | 'landscape' | 'square') => {
    setSelectedAspect(aspect);
    
    const newConfig = {
      aspectRatio: aspect,
      quality: selectedQuality
    };
    onChange(newConfig);
  };

  const handleQualityChange = (quality: 'FREE' | 'PREMIUM') => {
    setSelectedQuality(quality);
    
    const newConfig = {
      aspectRatio: selectedAspect,
      quality: quality
    };
    onChange(newConfig);
  };

  const currentAspect = aspectRatios.find(a => a.type === selectedAspect);

  return (
    <motion.div 
      className="enlarge-config"
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="config-section">
        <h4 className="config-title">Choose Target Aspect Ratio</h4>
        <p className="config-subtitle">
          Your image will be intelligently expanded to the selected aspect ratio with AI-generated content.
        </p>
        <div className="aspect-ratio-grid">
          {aspectRatios.map((aspect) => (
            <div
              key={aspect.type}
              className={`aspect-option ${selectedAspect === aspect.type ? 'active' : ''}`}
              onClick={() => handleAspectChange(aspect.type)}
            >
              <div className="aspect-icon">
                <FontAwesomeIcon icon={aspect.icon} />
              </div>
              <div className="aspect-info">
                <h5 className="aspect-label">{aspect.label}</h5>
                <p className="aspect-description">{aspect.description}</p>
                <div className="expansion-info">
                  <small>{aspect.expansionInfo}</small>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="config-section">
        <h4 className="config-title">Quality Level</h4>
        <div className="quality-grid">
          {qualityOptions.map((quality) => (
            <div
              key={quality.type}
              className={`quality-option ${selectedQuality === quality.type ? 'active' : ''}`}
              onClick={() => handleQualityChange(quality.type)}
            >
              <div className="quality-header">
                <div className="quality-icon">
                  <FontAwesomeIcon icon={quality.icon} />
                </div>
                <div className="quality-info">
                  <h5 className="quality-label">{quality.label}</h5>
                  <p className="quality-description">{quality.description}</p>
                  <small className="quality-details">{quality.details}</small>
                </div>
                {quality.tokenCost > 0 && (
                  <div className="quality-cost">
                    <FontAwesomeIcon icon={faCoins} />
                    <span>{quality.tokenCost}</span>
                  </div>
                )}
              </div>
              <div className="quality-features">
                {quality.features.map((feature, index) => (
                  <div key={index} className="quality-feature">
                    <span>✓</span>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      
          <div className="preview-info">
            <h5>How It Works</h5>
            <p>Your original image will be <strong>centered</strong> in a larger <strong>{selectedAspect}</strong> canvas.</p>
            <p>AI will intelligently generate natural content to fill the surrounding areas based on your image's context.</p>
            {selectedQuality === 'PREMIUM' && (
              <div className="premium-info">
                <p><strong>Premium Features:</strong></p>
                <ul>
                  <li>Uses Stable Diffusion inpainting model</li>
                  <li>Context-aware environment generation</li>
                  <li>Aspect-specific optimized prompts</li>
                  <li>Advanced blending and transitions</li>
                </ul>
              </div>
            )}
          </div>
        
    


    </motion.div>
  );
};

export default EnlargeConfigComponent;