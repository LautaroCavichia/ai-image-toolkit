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

export interface EnlargeConfig {
  aspectRatio: 'portrait' | 'landscape' | 'square';
  position: string;
  quality: 'FREE' | 'PREMIUM';
}

interface EnlargeConfigProps {
  config: EnlargeConfig;
  onChange: (config: EnlargeConfig) => void;
}

const EnlargeConfigComponent: React.FC<EnlargeConfigProps> = ({ config, onChange }) => {
  const [selectedAspect, setSelectedAspect] = useState<'portrait' | 'landscape' | 'square'>(config.aspectRatio);
  const [selectedPosition, setSelectedPosition] = useState<string>(config.position);
  const [selectedQuality, setSelectedQuality] = useState<'FREE' | 'PREMIUM'>(config.quality);

  const aspectRatios = [
    {
      type: 'square' as const,
      label: 'Square',
      description: '1:1 aspect ratio, perfect for social media',
      icon: faSquare,
      positions: [
        { value: 'center', label: 'Center', icon: faCrosshairs },
        { value: 'top-left', label: 'Top Left', icon: faArrowUp },
        { value: 'top-right', label: 'Top Right', icon: faArrowUp },
        { value: 'bottom-left', label: 'Bottom Left', icon: faArrowDown },
        { value: 'bottom-right', label: 'Bottom Right', icon: faArrowDown }
      ]
    },
    {
      type: 'portrait' as const,
      label: 'Portrait',
      description: '3:4 aspect ratio, ideal for mobile and prints',
      icon: faImagePortrait,
      positions: [
        { value: 'center', label: 'Center', icon: faCrosshairs },
        { value: 'up', label: 'Top', icon: faArrowUp },
        { value: 'down', label: 'Bottom', icon: faArrowDown }
      ]
    },
    {
      type: 'landscape' as const,
      label: 'Landscape',
      description: '4:3 aspect ratio, great for displays and presentations',
      icon: faPanorama,
      positions: [
        { value: 'center', label: 'Center', icon: faCrosshairs },
        { value: 'left', label: 'Left', icon: faArrowLeft },
        { value: 'right', label: 'Right', icon: faArrowRight }
      ]
    }
  ];

  const qualityOptions = [
    {
      type: 'FREE' as const,
      label: 'Standard Quality',
      description: 'Basic content-aware fill',
      icon: faExpand,
      tokenCost: 0,
      features: ['Edge extension', 'Basic blending', 'Standard processing']
    },
    {
      type: 'PREMIUM' as const,
      label: 'Premium Quality',
      description: 'Advanced generative fill with AI',
      icon: faExpand,
      tokenCost: 1,
      features: ['AI-powered content generation', 'Seamless blending', 'Context-aware fill']
    }
  ];

  const handleAspectChange = (aspect: 'portrait' | 'landscape' | 'square') => {
    setSelectedAspect(aspect);
    // Reset position to center when aspect changes
    setSelectedPosition('center');
    
    const newConfig = {
      aspectRatio: aspect,
      position: 'center',
      quality: selectedQuality
    };
    onChange(newConfig);
  };

  const handlePositionChange = (position: string) => {
    setSelectedPosition(position);
    
    const newConfig = {
      aspectRatio: selectedAspect,
      position: position,
      quality: selectedQuality
    };
    onChange(newConfig);
  };

  const handleQualityChange = (quality: 'FREE' | 'PREMIUM') => {
    setSelectedQuality(quality);
    
    const newConfig = {
      aspectRatio: selectedAspect,
      position: selectedPosition,
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
              </div>
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {currentAspect && (
          <motion.div 
            className="config-section"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <h4 className="config-title">Position Original Image</h4>
            <p className="config-subtitle">
              Choose where to place your original image. New content will be generated to fill the remaining space.
            </p>
            <div className="position-grid">
              {currentAspect.positions.map((position) => (
                <div
                  key={position.value}
                  className={`position-option ${selectedPosition === position.value ? 'active' : ''}`}
                  onClick={() => handlePositionChange(position.value)}
                >
                  <div className="position-icon">
                    <FontAwesomeIcon icon={position.icon} />
                  </div>
                  <span className="position-label">{position.label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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

      <div className="config-preview">
        <div className="preview-container">
          <div className={`preview-canvas ${selectedAspect}`}>
            <div className={`original-position ${selectedPosition}`}>
              Original
            </div>
            <div className="fill-areas">
              <span>AI Fill</span>
            </div>
          </div>
          <div className="preview-info">
            <h5>Preview</h5>
            <p>Your original image will be positioned at <strong>{selectedPosition}</strong> in a <strong>{selectedAspect}</strong> format.</p>
            <p>AI will generate content to fill the remaining space seamlessly.</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default EnlargeConfigComponent;