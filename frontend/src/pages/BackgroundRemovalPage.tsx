import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faImage, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import ImageUploader from '../components/shared/ImageUploader';
import { Job } from '../services/imageService';
import { toast } from 'react-toastify';

interface BackgroundRemovalPageProps {
  onBack: () => void;
}

const BackgroundRemovalPage: React.FC<BackgroundRemovalPageProps> = ({ onBack }) => {
  const [currentJob, setCurrentJob] = useState<Job | null>(null);

  const handleJobCreated = (job: Job) => {
    setCurrentJob(job);
    toast.success("Background removal job submitted successfully!");
  };

  return (
    <div className="service-page">
      <div className="service-hero">
        <button className="back-button" onClick={onBack}>
          <FontAwesomeIcon icon={faArrowLeft} />
          Back
        </button>
        
        <motion.div 
          className="hero-content"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="hero-icon">
            <FontAwesomeIcon icon={faImage} />
          </div>
          <h1 className="hero-title">Background Removal</h1>
          <p className="hero-description">
            Remove backgrounds from your images instantly with AI-powered precision. 
            Perfect for product photos, portraits, and creative designs.
          </p>
        </motion.div>
      </div>

      <motion.div 
        className="service-content"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className="service-instructions">
          <h3 className="instructions-title">How to Remove Backgrounds</h3>
          <div className="instructions-list">
            <div className="instruction-step">
              <div className="step-number">1</div>
              <h4 className="step-title">Upload Your Image</h4>
              <p className="step-description">
                Drag and drop or click to select an image. Works best with clear subjects and distinct edges.
              </p>
            </div>
            <div className="instruction-step">
              <div className="step-number">2</div>
              <h4 className="step-title">Choose Quality</h4>
              <p className="step-description">
                Select Standard for fast processing or Premium for enhanced edge detection and fine details.
              </p>
            </div>
            <div className="instruction-step">
              <div className="step-number">3</div>
              <h4 className="step-title">Process & Download</h4>
              <p className="step-description">
                Our AI will automatically detect and remove the background, giving you a transparent PNG.
              </p>
            </div>
          </div>
        </div>

        <ImageUploader 
          onJobCreated={handleJobCreated}
          jobType="BG_REMOVAL"
        />
      </motion.div>

      {currentJob && (
        <motion.div 
          className="job-status"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h3>Job Status: {currentJob.status}</h3>
          <p>Job ID: {currentJob.id}</p>
          {currentJob.progress > 0 && (
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${currentJob.progress}%` }}
              />
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default BackgroundRemovalPage;