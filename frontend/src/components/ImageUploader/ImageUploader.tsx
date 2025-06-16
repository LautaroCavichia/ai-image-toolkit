// src/components/ImageUploader/ImageUploader.tsx
import React, { useState, useCallback, useRef, useEffect } from 'react';
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
import { uploadImageAndCreateJob } from '../../services/apiService';
import { JobResponseDTO, JobTypeEnum } from '../../types';
import EnlargeConfigComponent, { EnlargeConfig } from '../EnlargeConfig/EnlargeConfig';
import ObjectRemovalConfigComponent, { ObjectRemovalConfig } from '../ObjectRemover/ObjectRemover';
import './ImageUploader.css';

interface ImageUploaderProps {
  onJobCreated: (job: JobResponseDTO) => void;
}

interface UpscaleQuality {
  type: 'FREE' | 'PREMIUM';
  label: string;
  description: string;
  icon: any;
  tokenCost: number;
  scale: string;
  processing: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onJobCreated }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [jobType, setJobType] = useState<JobTypeEnum>(JobTypeEnum.BG_REMOVAL);
  const [upscaleQuality, setUpscaleQuality] = useState<'FREE' | 'PREMIUM'>('FREE');
  const [enlargeConfig, setEnlargeConfig] = useState<EnlargeConfig>({
    aspectRatio: 'square',
    quality: 'FREE'
  });
  const [objectRemovalConfig, setObjectRemovalConfig] = useState<ObjectRemovalConfig>({
    method: 'BOUNDING_BOX',
    quality: 'FREE'
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [showUpscaleOptions, setShowUpscaleOptions] = useState<boolean>(false);
  const [showEnlargeOptions, setShowEnlargeOptions] = useState<boolean>(false);
  const [showObjectRemovalOptions, setShowObjectRemovalOptions] = useState<boolean>(false);
  const [tokenReady, setTokenReady] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getJwtToken = () => localStorage.getItem("token");
  useEffect(() => {
    const validateToken = async () => {
      try {
        const token = getJwtToken; 
        
        if (!token) {
          // No hay token, redirigir
          window.location.href = '/login';
          return;
        }
        
        // Token válido
        setTokenReady(true);
        
      } catch (error) {
        console.error('Error validating token:', error);
        window.location.href = '/login';
      }
    };

    validateToken();
    
  }, []); 

  const upscaleQualityOptions: UpscaleQuality[] = [
    {
      type: 'FREE',
      label: 'Standard Quality',
      description: 'Fast 2x upscaling with good quality',
      icon: faArrowsUpDown,
      tokenCost: 0,
      scale: '2x',
      processing: 'Fast (~30s)'
    },
    {
      type: 'PREMIUM',
      label: 'Premium Quality',
      description: 'High-quality 4x upscaling with AI enhancement',
      icon: faCrown,
      tokenCost: 1,
      scale: '4x',
      processing: 'Slower (~2-3min)'
    }
  ];

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

  const handleJobTypeChange = (type: JobTypeEnum) => {
    setJobType(type);
    setShowUpscaleOptions(type === JobTypeEnum.UPSCALE);
    setShowEnlargeOptions(type === JobTypeEnum.ENLARGE);
    setShowObjectRemovalOptions(type === 'OBJECT_REMOVAL' as JobTypeEnum);
  };

  const handleEnlargeConfigChange = (config: EnlargeConfig) => {
    setEnlargeConfig(config);
  };

  const handleObjectRemovalConfigChange = (config: ObjectRemovalConfig) => {
    setObjectRemovalConfig(config);
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      setError('Please select an image file');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const jobConfig: any = {};

      if (jobType === JobTypeEnum.UPSCALE) {
        jobConfig.quality = upscaleQuality;
        jobConfig.scale = upscaleQuality === 'PREMIUM' ? 4 : 2;
      } else if (jobType === JobTypeEnum.ENLARGE) {
        jobConfig.aspectRatio = enlargeConfig.aspectRatio;
        jobConfig.quality = enlargeConfig.quality;
      } else if (jobType === 'OBJECT_REMOVAL' as JobTypeEnum) {
        jobConfig.method = objectRemovalConfig.method;
        jobConfig.quality = objectRemovalConfig.quality;
     
        
        if (objectRemovalConfig.coordinates) {
          jobConfig.coordinates = objectRemovalConfig.coordinates;
        }
        
        
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
    setShowUpscaleOptions(false);
    setShowEnlargeOptions(false);
    setShowObjectRemovalOptions(false);
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
      case 'OBJECT_REMOVAL' as JobTypeEnum:
        return <FontAwesomeIcon icon={faWandMagicSparkles} />;
      default:
        return <FontAwesomeIcon icon={faImage} />;
    }
  };

  const getJobTypeLabel = (type: JobTypeEnum) => {
    switch (type) {
      case JobTypeEnum.BG_REMOVAL:
        return 'Background Removal';
      case JobTypeEnum.UPSCALE:
        return 'AI Upscaling';
      case JobTypeEnum.ENLARGE:
        return 'Image Enlargement';
      case 'OBJECT_REMOVAL' as JobTypeEnum:
        return 'Object Removal';
    }
  };

  // Function for calculating job cost
  const getTokenCost = () => {
    if (jobType === JobTypeEnum.UPSCALE && upscaleQuality === 'PREMIUM') {
      return 1;
    }
    if (jobType === JobTypeEnum.ENLARGE && enlargeConfig.quality === 'PREMIUM') {
      return 1;
    }
    if (jobType === 'OBJECT_REMOVAL' as JobTypeEnum) {
      let cost = 0;
      
      // Method cost
     
      // Quality cost
      if (objectRemovalConfig.quality === 'PREMIUM') {
        cost += 1;
      }
      
      return cost;
    }
    return 0;
  };

  if (!tokenReady) {
    return <FontAwesomeIcon icon={faSpinner} className="spinner" />;
  }

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
            <div className="job-type-selector">
              <p className="selector-label">Select Processing Type:</p>
              <div className="job-type-options">
                {[...Object.values(JobTypeEnum), 'OBJECT_REMOVAL' as JobTypeEnum].map((type) => (
                  <button
                    key={type}
                    className={`job-type-btn ${jobType === type ? 'active' : ''}`}
                    onClick={() => handleJobTypeChange(type)}
                  >
                    <span className="job-type-icon">{getJobTypeIcon(type)}</span>
                    <span className="job-type-label">{getJobTypeLabel(type)}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Upscaling options */}
            <AnimatePresence>
              {showUpscaleOptions && (
                <motion.div 
                  className="upscale-quality-selector"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <p className="selector-label">Choose Upscaling Quality:</p>
                  <div className="quality-options">
                    {upscaleQualityOptions.map((option) => (
                      <div
                        key={option.type}
                        className={`quality-option ${upscaleQuality === option.type ? 'active' : ''}`}
                        onClick={() => setUpscaleQuality(option.type)}
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
                        <div className="quality-details">
                          <div className="quality-detail">
                            <span className="detail-label">Scale:</span>
                            <span className="detail-value">{option.scale}</span>
                          </div>
                          <div className="quality-detail">
                            <span className="detail-label">Speed:</span>
                            <span className="detail-value">{option.processing}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Enlargement Options */}
            <AnimatePresence>
              {showEnlargeOptions && (
                <EnlargeConfigComponent
                  config={enlargeConfig}
                  onChange={handleEnlargeConfigChange}
                />
              )}
            </AnimatePresence>

            {/* Object Removal Options */}
            <AnimatePresence>
              {showObjectRemovalOptions && (
                <ObjectRemovalConfigComponent
                  config={objectRemovalConfig}
                  onChange={handleObjectRemovalConfigChange}
                  imagePreview={preview}
                />
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
                  {getJobTypeIcon(jobType)}
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