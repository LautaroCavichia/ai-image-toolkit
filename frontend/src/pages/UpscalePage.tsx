import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowsUpDown, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import ImageUploader from '../components/shared/ImageUploader';
import { Job } from '../services/imageService';
import { toast } from 'react-toastify';

interface UpscalePageProps {
  onBack: () => void;
}

const UpscalePage: React.FC<UpscalePageProps> = ({ onBack }) => {
  const [currentJob, setCurrentJob] = useState<Job | null>(null);

  const handleJobCreated = (job: Job) => {
    setCurrentJob(job);
    toast.success("Upscale job submitted successfully!");
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
            <FontAwesomeIcon icon={faArrowsUpDown} />
          </div>
          <h1 className="hero-title">AI Image Upscaling</h1>
          <p className="hero-description">
            Enhance your images with AI-powered upscaling. Increase resolution up to 4x 
            while maintaining sharp details and quality.
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
          <h3 className="instructions-title">How to Upscale Images</h3>
          <div className="instructions-list">
            <div className="instruction-step">
              <div className="step-number">1</div>
              <h4 className="step-title">Upload Your Image</h4>
              <p className="step-description">
                Select an image you want to enhance. Lower resolution images will see the most dramatic improvements.
              </p>
            </div>
            <div className="instruction-step">
              <div className="step-number">2</div>
              <h4 className="step-title">Select Scale Factor</h4>
              <p className="step-description">
                Choose 2x for Standard quality or 4x for Premium. Premium uses advanced AI models for superior results.
              </p>
            </div>
            <div className="instruction-step">
              <div className="step-number">3</div>
              <h4 className="step-title">AI Enhancement</h4>
              <p className="step-description">
                Our neural networks will intelligently enhance details and increase resolution while preserving quality.
              </p>
            </div>
          </div>
        </div>

        <ImageUploader 
          onJobCreated={handleJobCreated}
          jobType="UPSCALE"
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

export default UpscalePage;