import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWandMagicSparkles, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import ImageUploader from '../components/shared/ImageUploader';
import { Job } from '../services/imageService';
import { toast } from 'react-toastify';

interface ObjectRemovalPageProps {
  onBack: () => void;
}

const ObjectRemovalPage: React.FC<ObjectRemovalPageProps> = ({ onBack }) => {
  const [currentJob, setCurrentJob] = useState<Job | null>(null);

  const handleJobCreated = (job: Job) => {
    setCurrentJob(job);
    toast.success("Object removal job submitted successfully!");
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
            <FontAwesomeIcon icon={faWandMagicSparkles} />
          </div>
          <h1 className="hero-title">Object Removal</h1>
          <p className="hero-description">
            Remove unwanted objects from your images with AI magic. Clean up photos 
            by removing people, objects, or any unwanted elements seamlessly.
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
          <h3 className="instructions-title">How to Remove Objects</h3>
          <div className="instructions-list">
            <div className="instruction-step">
              <div className="step-number">1</div>
              <h4 className="step-title">Upload Your Image</h4>
              <p className="step-description">
                Select an image with unwanted objects. Works best with objects that have clear boundaries.
              </p>
            </div>
            <div className="instruction-step">
              <div className="step-number">2</div>
              <h4 className="step-title">Choose Removal Method</h4>
              <p className="step-description">
                Standard uses smart detection, while Premium offers advanced generative fill for seamless results.
              </p>
            </div>
            <div className="instruction-step">
              <div className="step-number">3</div>
              <h4 className="step-title">Magic Removal</h4>
              <p className="step-description">
                AI identifies and removes objects, then intelligently fills the space with matching background content.
              </p>
            </div>
          </div>
        </div>

        <ImageUploader 
          onJobCreated={handleJobCreated}
          jobType="OBJECT_REMOVAL"
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

export default ObjectRemovalPage;