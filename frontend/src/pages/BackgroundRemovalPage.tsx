import React from 'react';
import { faImage } from '@fortawesome/free-solid-svg-icons';
import ServiceUploader from '../components/ServiceUploader/ServiceUploader';
import { JobResponseDTO, JobTypeEnum } from '../types';
import './ServicePage.css';

interface BackgroundRemovalPageProps {
  onJobCreated: (job: JobResponseDTO) => void;
}

const BackgroundRemovalPage: React.FC<BackgroundRemovalPageProps> = ({ onJobCreated }) => {
  return (
    <div className="service-page">
      <ServiceUploader
        jobType={JobTypeEnum.BG_REMOVAL}
        onJobCreated={onJobCreated}
        title="Background Removal"
        description="Remove backgrounds from images with AI precision. Perfect for product photos, portraits, and creating transparent images."
        icon={faImage}
        getTokenCost={() => 0} // Background removal is free
      />
      
      {/* Additional service information */}
      <div className="service-info-section">
        <div className="container">
          <div className="info-grid">
            <div className="info-card">
              <h3>Instant Processing</h3>
              <p>Get results in seconds with our advanced AI model that accurately detects and removes backgrounds.</p>
            </div>
            <div className="info-card">
              <h3>High Precision</h3>
              <p>Advanced edge detection ensures clean cuts around hair, fur, and complex shapes.</p>
            </div>
            <div className="info-card">
              <h3>Multiple Formats</h3>
              <p>Supports JPG, PNG, GIF, and WEBP. Output includes transparent PNG for maximum flexibility.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BackgroundRemovalPage;