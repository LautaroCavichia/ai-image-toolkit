// src/components/JobStatus/JobStatusDisplay.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCheckCircle, 
  faExclamationTriangle, 
  faSpinner, 
  faDownload, 
  faSync,
  faLock,
  faCrown
} from '@fortawesome/free-solid-svg-icons';
import { getJobStatus } from '../../services/apiService';
import { unlockPremiumQuality } from '../../services/tokenService';
import { JobResponseDTO, JobStatusEnum } from '../../types';
import { isGuestUser } from '../../services/authService';
import './JobStatusDisplay.css';

interface JobStatusDisplayProps {
  initialJob: JobResponseDTO;
  onTokenBalanceChange: (balance: number) => void;
  onShowGuestConversion?: () => void;
}

const JobStatusDisplay: React.FC<JobStatusDisplayProps> = ({ 
  initialJob, 
  onTokenBalanceChange,
  onShowGuestConversion
}) => {
  const [job, setJob] = useState<JobResponseDTO>(initialJob);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [isUnlocking, setIsUnlocking] = useState<boolean>(false);
  const [unlockError, setUnlockError] = useState<string | null>(null);

  useEffect(() => {
    setJob(initialJob); // Update if initialJob prop changes
  }, [initialJob]);

  useEffect(() => {
    // Simulate progress during processing states
    if (job.status === JobStatusEnum.PENDING || 
        job.status === JobStatusEnum.QUEUED || 
        job.status === JobStatusEnum.PROCESSING) {
      const interval = setInterval(() => {
        setProgress(prev => {
          // Cap at 90% for PROCESSING until completion confirmed
          const cap = job.status === JobStatusEnum.PROCESSING ? 90 : 40;
          return Math.min(prev + Math.random() * 5, cap);
        });
      }, 500);
      
      return () => clearInterval(interval);
    } else if (job.status === JobStatusEnum.COMPLETED) {
      setProgress(100);
    }
  }, [job.status]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout | undefined;

    const fetchStatus = async () => {
      if (!job.jobId || job.status === JobStatusEnum.COMPLETED || job.status === JobStatusEnum.FAILED) {
        if (intervalId) clearInterval(intervalId);
        return;
      }
      
      try {
        const updatedJob = await getJobStatus(job.jobId);
        setJob(updatedJob);
        setError(null);
      } catch (err: any) {
        console.error('Failed to fetch job status:', err);
        setError(err.response?.data?.message || err.message || 'Failed to fetch job status.');
        // Optionally stop polling on certain errors
        if (intervalId) clearInterval(intervalId);
      }
    };

    // Start polling if the job is in a pending/processing state
    if (job.status === JobStatusEnum.PENDING || job.status === JobStatusEnum.QUEUED || job.status === JobStatusEnum.PROCESSING) {
      intervalId = setInterval(fetchStatus, 3000); // Poll every 3 seconds
    }

    return () => { // Cleanup function
      if (intervalId) clearInterval(intervalId);
    };
  }, [job.jobId, job.status]);

  const getStatusIcon = () => {
    switch (job.status) {
      case JobStatusEnum.COMPLETED:
        return <FontAwesomeIcon icon={faCheckCircle} className="status-icon success" />;
      case JobStatusEnum.FAILED:
        return <FontAwesomeIcon icon={faExclamationTriangle} className="status-icon error" />;
      case JobStatusEnum.CANCELLED:
        return <FontAwesomeIcon icon={faExclamationTriangle} className="status-icon warning" />;
      default:
        return <FontAwesomeIcon icon={faSpinner} className="status-icon spinner" />;
    }
  };

  const handleUnlockPremium = async () => {
    if (!job.jobId) return;
    
    // Check if guest user
    if (isGuestUser() && onShowGuestConversion) {
      onShowGuestConversion();
      return;
    }
    
    setIsUnlocking(true);
    setUnlockError(null);
    
    try {
      const updatedJob = await unlockPremiumQuality(job.jobId);
      setJob(updatedJob);
      
      // Update token balance
      if (updatedJob.tokenBalance !== undefined) {
        onTokenBalanceChange(updatedJob.tokenBalance);
      }
    } catch (err: any) {
      console.error('Failed to unlock premium quality:', err);
      setUnlockError(err.response?.data || 'Insufficient tokens. Please purchase more tokens.');
    } finally {
      setIsUnlocking(false);
    }
  };

  const renderJobDetails = () => {
    return (
      <div className="job-details">
        <div className="job-info">
          <div className="job-info-row">
            <span className="job-label">Job ID:</span>
            <span className="job-value">{job.jobId.substring(0, 8)}...</span>
          </div>
          <div className="job-info-row">
            <span className="job-label">Type:</span>
            <span className="job-value highlight">{job.jobType.replace('_', ' ')}</span>
          </div>
          <div className="job-info-row">
            <span className="job-label">Status:</span>
            <div className="status-badge">
              {getStatusIcon()}
              <span>{job.status}</span>
            </div>
          </div>
          <div className="job-info-row">
            <span className="job-label">Created:</span>
            <span className="job-value">{new Date(job.createdAt).toLocaleString()}</span>
          </div>
          {job.completedAt && (
            <div className="job-info-row">
              <span className="job-label">Completed:</span>
              <span className="job-value">{new Date(job.completedAt).toLocaleString()}</span>
            </div>
          )}
          {job.tokenCost !== undefined && (
            <div className="job-info-row">
              <span className="job-label">Premium Cost:</span>
              <span className="job-value token-cost">
                <FontAwesomeIcon icon={faCrown} className="crown-icon" /> 
                {job.tokenCost} {job.tokenCost === 1 ? 'Token' : 'Tokens'}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderProgressIndicator = () => {
    return (
      <div className="progress-container">
        <div className="progress-bar-container">
          <div 
            className="progress-bar" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <div className="progress-percentage">{Math.round(progress)}%</div>
      </div>
    );
  };

  const renderResult = () => {
    if (job.status === JobStatusEnum.COMPLETED) {
      return (
        <motion.div 
          className="result-container"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h3 className="result-title">Processing Complete!</h3>
          
          <div className="result-image-container">
            <img 
              // src={job.isPremiumQuality ? job.processedImageUrl : job.thumbnailUrl} 
              src={job.isPremiumQuality ? "http://localhost:4000/" + job.jobId + "_bg_removed.png" : "http://localhost:4000/" + job.jobId + "_bg_removed_thumbnail.png"} 
              alt="Processed"   
              className="result-image"
            />
            {!job.isPremiumQuality && (
              <div className="quality-indicator free">Free Preview</div>
            )}
            {job.isPremiumQuality && (
              <div className="quality-indicator premium">
                <FontAwesomeIcon icon={faCrown} /> Premium Quality
              </div>
            )}
          </div>

          <div className="download-options">
            {/* Free Download Button - Always available */}
            {job.thumbnailUrl && (
              <motion.a 
                href={job.thumbnailUrl} 
                download
                target="_blank" 
                rel="noopener noreferrer"
                className="download-button free"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FontAwesomeIcon icon={faDownload} />
                <span>Download Free</span>
                <span className="quality-label">Low Quality</span>
              </motion.a>
            )}
            
            {/* Premium Download Button - Conditional */}
            {job.isPremiumQuality && job.processedImageUrl ? (
              <motion.a 
                href={job.processedImageUrl} 
                download
                target="_blank" 
                rel="noopener noreferrer"
                className="download-button premium"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FontAwesomeIcon icon={faCrown} />
                <span>Download Premium</span>
                <span className="quality-label">HD Quality</span>
              </motion.a>
            ) : (
              <motion.button 
                className="download-button premium unlock"
                onClick={handleUnlockPremium}
                disabled={isUnlocking}
                whileHover={{ scale: isUnlocking ? 1 : 1.05 }}
                whileTap={{ scale: isUnlocking ? 1 : 0.95 }}
              >
                {isUnlocking ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} className="spinner" />
                    <span>Unlocking...</span>
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faLock} />
                    <span>Unlock Premium</span>
                    <span className="quality-label">
                      {job.tokenCost} {job.tokenCost === 1 ? 'Token' : 'Tokens'}
                    </span>
                  </>
                )}
              </motion.button>
            )}
          </div>
          
          {unlockError && (
            <motion.div 
              className="unlock-error"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {unlockError}
            </motion.div>
          )}
          
        </motion.div>
      );
    }
    return null;
  };

  const renderError = () => {
    if (job.status === JobStatusEnum.FAILED) {
      return (
        <div className="error-container">
          <FontAwesomeIcon icon={faExclamationTriangle} className="error-icon" />
          <h3 className="error-title">Processing Failed</h3>
          <p className="error-message">{job.errorMessage || 'An unknown error occurred.'}</p>
          <p className="error-hint">Please try again with a different image or processing option.</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="job-status-display">
      <h2 className="job-status-title">
        {getStatusIcon()}
        <span>Job Status</span>
      </h2>
      
      {renderJobDetails()}
      
      {(job.status === JobStatusEnum.PENDING || 
        job.status === JobStatusEnum.QUEUED || 
        job.status === JobStatusEnum.PROCESSING) && 
        renderProgressIndicator()
      }
      
      {renderResult()}
      {renderError()}
      
      {error && (
        <div className="poll-error">
          <p>{error}</p>
          <button 
            className="retry-button"
            onClick={() => getJobStatus(job.jobId).then(setJob).catch(() => {})}
          >
            <FontAwesomeIcon icon={faSync} className="retry-icon" />
            <span>Retry</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default JobStatusDisplay;