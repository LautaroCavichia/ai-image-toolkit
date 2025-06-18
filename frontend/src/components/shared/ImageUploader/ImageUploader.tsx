import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { 
  faUpload, 
  faImage, 
  faSpinner,
  faExpand,
  faArrowsUpDown,
  faCrown,
  faCoins,
  faWandMagicSparkles
} from '@fortawesome/free-solid-svg-icons';
import { uploadImageAndCreateJob } from '../../../services/imageService';
import { Job } from '../../../services/imageService';
import './ImageUploader.css';

interface ImageUploaderProps {
  onJobCreated: (job: Job) => void;
  jobType: string;
  title?: string;
}

interface QualityOption {
  type: 'FREE' | 'PREMIUM';
  label: string;
  description: string;
  icon: any;
  tokenCost: number;
  scale?: string;
  processing?: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onJobCreated, jobType, title }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [quality, setQuality] = useState<'FREE' | 'PREMIUM'>('FREE');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [showQualityOptions, setShowQualityOptions] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const qualityOptions: QualityOption[] = [
    {
      type: 'FREE',
      label: 'Standard Quality',
      description: 'Fast processing with good quality',
      icon: faArrowsUpDown,
      tokenCost: 0,
      scale: jobType === 'UPSCALE' ? '2x' : undefined,
      processing: 'Fast (~30s)'
    },
    {
      type: 'PREMIUM',
      label: 'Premium Quality',
      description: 'High-quality processing with AI enhancement',
      icon: faCrown,
      tokenCost: 1,
      scale: jobType === 'UPSCALE' ? '4x' : undefined,
      processing: 'Slower (~2-3min)'
    }
  ];

  const handleFileChange = (file: File) => {
    setSelectedFile(file);
    setError(null);
    setShowQualityOptions(true);

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
      const jobConfig: any = {};

      if (jobType === 'UPSCALE') {
        jobConfig.quality = quality;
        jobConfig.scale = quality === 'PREMIUM' ? 4 : 2;
      } else if (jobType === 'ENLARGE') {
        jobConfig.aspectRatio = 'square';
        jobConfig.quality = quality;
      } else if (jobType === 'OBJECT_REMOVAL') {
        jobConfig.method = 'BOUNDING_BOX';
        jobConfig.quality = quality;
      }

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
    setShowQualityOptions(false);
  };

  const openFileSelector = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const getJobTypeIcon = () => {
    switch (jobType) {
      case 'BG_REMOVAL':
        return <FontAwesomeIcon icon={faImage} />;
      case 'UPSCALE':
        return <FontAwesomeIcon icon={faArrowsUpDown} />;
      case 'ENLARGE':
        return <FontAwesomeIcon icon={faExpand} />;
      case 'OBJECT_REMOVAL':
        return <FontAwesomeIcon icon={faWandMagicSparkles} />;
      default:
        return <FontAwesomeIcon icon={faImage} />;
    }
  };

  const getTokenCost = () => {
    return quality === 'PREMIUM' ? 1 : 0;
  };

  return (
    <div className="image-uploader-container">
      {title && <h2 className="uploader-title">{title}</h2>}
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
            <AnimatePresence>
              {showQualityOptions && (
                <motion.div 
                  className="quality-selector"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <p className="selector-label">Choose Processing Quality:</p>
                  <div className="quality-options">
                    {qualityOptions.map((option) => (
                      <div
                        key={option.type}
                        className={`quality-option ${quality === option.type ? 'active' : ''}`}
                        onClick={() => setQuality(option.type)}
                      >
                        <div className="quality-header">
                          <div className="quality-icon">
                            <FontAwesomeIcon icon={option.icon} />
                          </div>
                          <div className="quality-info">
                            <h4 className="quality-title">{option.label}</h4>
                            <p className="quality-description">{option.description}</p>
                          </div>
                          {option.tokenCost > 0 && (
                            <div className="quality-cost">
                              <FontAwesomeIcon icon={faCoins} />
                              <span>{option.tokenCost}</span>
                            </div>
                          )}
                        </div>
                        {(option.scale || option.processing) && (
                          <div className="quality-details">
                            {option.scale && (
                              <div className="quality-detail">
                                <span className="detail-label">Scale:</span>
                                <span className="detail-value">{option.scale}</span>
                              </div>
                            )}
                            <div className="quality-detail">
                              <span className="detail-label">Speed:</span>
                              <span className="detail-value">{option.processing}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
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
                  {getJobTypeIcon()}
                  <span>Process Image</span>
                  {getTokenCost() > 0 && (
                    <div className="button-token-cost">
                      <FontAwesomeIcon icon={faCoins} />
                      <span>{getTokenCost()}</span>
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

export default ImageUploader;