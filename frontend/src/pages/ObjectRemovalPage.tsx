import React, { useState } from 'react';
import { faWandMagicSparkles } from '@fortawesome/free-solid-svg-icons';
import ServiceUploader from '../components/ServiceUploader/ServiceUploader';
import ObjectRemovalConfigComponent, { ObjectRemovalConfig } from '../components/ObjectRemover/ObjectRemover';
import { JobResponseDTO, JobTypeEnum } from '../types';
import './ServicePage.css';

interface ObjectRemovalPageProps {
  onJobCreated: (job: JobResponseDTO) => void;
}

const ObjectRemovalPage: React.FC<ObjectRemovalPageProps> = ({ onJobCreated }) => {
  const [objectRemovalConfig, setObjectRemovalConfig] = useState<ObjectRemovalConfig>({
    method: 'BOUNDING_BOX',
    quality: 'FREE'
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleObjectRemovalConfigChange = (config: ObjectRemovalConfig) => {
    setObjectRemovalConfig(config);
  };

  const getJobConfig = () => {
    const config: any = {
      method: objectRemovalConfig.method,
      quality: objectRemovalConfig.quality
    };
    
    if (objectRemovalConfig.coordinates) {
      config.coordinates = objectRemovalConfig.coordinates;
    }
    
    return config;
  };

  const getTokenCost = () => {
    let cost = 0;
    if (objectRemovalConfig.quality === 'PREMIUM') {
      cost += 1;
    }
    return cost;
  };

  // We need to capture the image preview from ServiceUploader
  const ObjectRemovalConfiguration = () => (
    <ObjectRemovalConfigComponent
      config={objectRemovalConfig}
      onChange={handleObjectRemovalConfigChange}
      imagePreview={imagePreview || undefined}
    />
  );

  return (
    <div className="service-page">
      <ServiceUploader
        jobType={'OBJECT_REMOVAL' as JobTypeEnum}
        onJobCreated={onJobCreated}
        title="Object Removal"
        description="Remove unwanted objects from your images with precision AI inpainting technology."
        icon={faWandMagicSparkles}
        getJobConfig={getJobConfig}
        getTokenCost={getTokenCost}
      >
        <ObjectRemovalConfiguration />
      </ServiceUploader>
      
      <div className="service-info-section">
        <div className="container">
          <div className="info-grid">
            <div className="info-card">
              <h3>Precision Selection</h3>
              <p>Draw bounding boxes around objects for automatic detection or use our smart flood-fill algorithm.</p>
            </div>
            <div className="info-card">
              <h3>Intelligent Inpainting</h3>
              <p>Advanced AI fills in the removed areas with content that matches the surrounding environment.</p>
            </div>
            <div className="info-card">
              <h3>Edge Detection</h3>
              <p>Sophisticated algorithms detect object boundaries for clean, natural-looking results.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ObjectRemovalPage;