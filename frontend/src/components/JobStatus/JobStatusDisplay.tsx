// src/components/JobStatus/JobStatusDisplay.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCheckCircle, 
  faExclamationTriangle, 
  faSpinner, 
  faDownload, 
  faSync 
} from '@fortawesome/free-solid-svg-icons';
import { getJobStatus } from '../../services/apiService';
import { JobResponseDTO, JobStatusEnum } from '../../types';
import './JobStatusDisplay.css';

interface JobStatusDisplayProps {
  initialJob: JobResponseDTO;
  onTokenBalanceChange: (balance: number) => void; //TODO
  onShowGuestConversion?: () => void; //TODO
}

const JobStatusDisplay: React.FC<JobStatusDisplayProps> = ({ initialJob }) => {
  const [job, setJob] = useState<JobResponseDTO>(initialJob);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);

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
    if (job.status === JobStatusEnum.COMPLETED && job.processedImageUrl) {
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
              src={job.processedImageUrl} 
              alt="Processed" 
              className="result-image"
            />
          </div>
          <motion.a 
            href={job.processedImageUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="download-button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FontAwesomeIcon icon={faDownload} />
            <span>Download Result</span>
          </motion.a>
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