// src/components/ImageUploader/ImageUploader.tsx
import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUpload, 
  faImage, 
  faSpinner,
  faExpand,
  faArrowsUpDown
} from '@fortawesome/free-solid-svg-icons';
import { uploadImageAndCreateJob } from '../../services/apiService';
import { JobResponseDTO, JobTypeEnum } from '../../types';
import './ImageUploader.css';

interface ImageUploaderProps {
  onJobCreated: (job: JobResponseDTO) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onJobCreated }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [jobType, setJobType] = useState<JobTypeEnum>(JobTypeEnum.BG_REMOVAL);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (file: File) => {
    setSelectedFile(file);
    setError(null);
    
    // Create preview
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

  const handleJobTypeChange = (type: JobTypeEnum) => {
    setJobType(type);
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      setError('Please select an image file');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const job = await uploadImageAndCreateJob(selectedFile, jobType);
      onJobCreated(job);
      // Keep the preview but reset loading
      setIsLoading(false);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to upload image and create job');
      console.error(err);
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

  const getJobTypeIcon = (type: JobTypeEnum) => {
    switch (type) {
      case JobTypeEnum.BG_REMOVAL:
        return <FontAwesomeIcon icon={faImage} />;
      case JobTypeEnum.UPSCALE:
        return <FontAwesomeIcon icon={faArrowsUpDown} />;
      case JobTypeEnum.ENLARGE:
        return <FontAwesomeIcon icon={faExpand} />;
      default:
        return <FontAwesomeIcon icon={faImage} />;
    }
  };

  return (
    <div className="image-uploader-container">
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
              <img 
                src={preview} 
                alt="Preview" 
                className="image-preview" 
              />
              <button 
                className="remove-image-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  resetUploader();
                }}
              >
                ×
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
            <div className="job-type-selector">
              <p className="selector-label">Select Processing Type:</p>
              <div className="job-type-options">
                {Object.values(JobTypeEnum).map((type) => (
                  <button
                    key={type}
                    className={`job-type-btn ${jobType === type ? 'active' : ''}`}
                    onClick={() => handleJobTypeChange(type)}
                  >
                    <span className="job-type-icon">{getJobTypeIcon(type)}</span>
                    <span className="job-type-label">{type.replace('_', ' ')}</span>
                  </button>
                ))}
              </div>
            </div>
            
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
                  {getJobTypeIcon(jobType)}
                  <span>Process Image</span>
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

export default ImageUploader;