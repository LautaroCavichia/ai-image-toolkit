import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExpand, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import ImageUploader from '../components/shared/ImageUploader';
import { Job } from '../services/imageService';
import { toast } from 'react-toastify';

interface EnlargePageProps {
  onBack: () => void;
}

const EnlargePage: React.FC<EnlargePageProps> = ({ onBack }) => {
  const [currentJob, setCurrentJob] = useState<Job | null>(null);

  const handleJobCreated = (job: Job) => {
    setCurrentJob(job);
    toast.success("Image enlargement job submitted successfully!");
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
            <FontAwesomeIcon icon={faExpand} />
          </div>
          <h1 className="hero-title">Image Enlargement</h1>
          <p className="hero-description">
            Expand your images with intelligent content-aware fill. Perfect for 
            changing aspect ratios and creating larger canvases.
          </p>
        </motion.div>
      </div>

      <motion.div 
        className="service-content"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <ImageUploader 
          onJobCreated={handleJobCreated}
          jobType="ENLARGE"
        />

        <div className="service-instructions">
          <h3 className="instructions-title">How to Enlarge Images</h3>
          <div className="instructions-list">
            <div className="instruction-step">
              <div className="step-number">1</div>
              <h4 className="step-title">Upload Your Image</h4>
              <p className="step-description">
                Choose an image you want to expand. Works best with images that have room for natural extension.
              </p>
            </div>
            <div className="instruction-step">
              <div className="step-number">2</div>
              <h4 className="step-title">Choose Output Quality</h4>
              <p className="step-description">
                Standard offers quick canvas expansion, while Premium provides advanced content-aware fill.
              </p>
            </div>
            <div className="instruction-step">
              <div className="step-number">3</div>
              <h4 className="step-title">Smart Extension</h4>
              <p className="step-description">
                AI analyzes your image context and intelligently fills the expanded areas with matching content.
              </p>
            </div>
          </div>
        </div>
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

export default EnlargePage;