import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUpload, 
  faImage, 
  faSpinner,
  faTimes,
  faCoins
} from '@fortawesome/free-solid-svg-icons';
import { uploadImageAndCreateJob } from '../../services/apiService';
import { JobResponseDTO, JobTypeEnum } from '../../types';
import './ServiceUploader.css';

interface ServiceUploaderProps {
  jobType: JobTypeEnum;
  onJobCreated: (job: JobResponseDTO) => void;
  children?: React.ReactNode; // For service-specific configuration components
  getJobConfig?: () => any; // Function to get job-specific configuration
  getTokenCost?: () => number; // Function to calculate token cost
  title: string;
  description: string;
  icon: any;
}

const ServiceUploader: React.FC<ServiceUploaderProps> = ({ 
  jobType,
  onJobCreated,
  children,
  getJobConfig,
  getTokenCost,
  title,
  description,
  icon
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [tokenReady, setTokenReady] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getJwtToken = () => localStorage.getItem("token");
  
  useEffect(() => {
    const validateToken = async () => {
      try {
        const token = getJwtToken();
        
        if (!token) {
          window.location.href = '/login';
          return;
        }
        
        setTokenReady(true);
        
      } catch (error) {
        console.error('Error validating token:', error);
        window.location.href = '/login';
      }
    };

    validateToken();
  }, []); 

  const handleFileChange = (file: File) => {
    setSelectedFile(file);
    setError(null);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      handleFileChange(event.target.files[0]);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        handleFileChange(file);
      } else {
        setError('Please upload an image file');
      }
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleSubmit = async () => {
    if (!selectedFile) {
      setError('Please select an image file');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const jobConfig = getJobConfig ? getJobConfig() : {};
      const job = await uploadImageAndCreateJob(selectedFile, jobType, jobConfig);
      onJobCreated(job);
      
    } catch (err: any) {
      const backendErrorMsg = err.response?.data?.errorMessage || err.response?.data?.message;
      setError(backendErrorMsg || err.message || 'Failed to upload image and create job');
    } finally {
      setIsLoading(false);
    }
  };

  const resetUploader = () => {
    setSelectedFile(null);
    setPreview(null);
    setError(null);
  };

  const openFileSelector = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const tokenCost = getTokenCost ? getTokenCost() : 0;

  if (!tokenReady) {
    return (
      <div className="service-uploader-loading">
        <FontAwesomeIcon icon={faSpinner} className="spinner" />
      </div>
    );
  }

  return (
    <div className="service-uploader-container">
      <div className="service-header">
        <div className="service-icon">
          <FontAwesomeIcon icon={icon} />
        </div>
        <div className="service-info">
          <h1 className="service-title">{title}</h1>
          <p className="service-description">{description}</p>
        </div>
      </div>

      <div className="uploader-content">
        <div 
          className={`drop-area ${isDragging ? 'dragging' : ''} ${preview ? 'has-preview' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={preview ? undefined : openFileSelector}
        >
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleInputChange}
            accept="image/*"
            style={{ display: 'none' }}
          />
          
          {!preview ? (
            <div className="upload-placeholder">
              <FontAwesomeIcon icon={faUpload} className="upload-icon" />
              <p>Drag & drop image or click to browse</p>
              <span className="upload-hint">Supported formats: JPG, PNG, GIF, WEBP</span>
            </div>
          ) : (
            <div className="image-preview-container">
              <motion.img
                src={preview}
                alt="Preview"
                className="image-preview"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
              />
              <button 
                className="remove-image-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  resetUploader();
                }}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
          )}
        </div>
        
        {preview && (
          <motion.div 
            className="image-actions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Service-specific configuration */}
            {children}
            
            <motion.button 
              className="process-button"
              onClick={handleSubmit}
              disabled={isLoading}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              {isLoading ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} className="spinner" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={icon} />
                  <span>Process Image</span>
                  {tokenCost > 0 && (
                    <div className="button-token-cost">
                      <FontAwesomeIcon icon={faCoins} />
                      <span>{tokenCost}</span>
                    </div>
                  )}
                </>
              )}
            </motion.button>
            
            {error && (
              <motion.div 
                className="error-message"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {error}
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ServiceUploader;