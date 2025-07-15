import React, { useState } from 'react';
import { JobTypeEnum } from '../types';
import { uploadImageAndCreateJob } from '../services/apiService';
import DragDropUploader from './DragDropUploader';

interface ImageUploaderProps {
  onJobCreated: (jobId: string) => void;
  onImageSelected: (file: File, preview: string | null) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onJobCreated, onImageSelected }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [jobType, setJobType] = useState<JobTypeEnum>(JobTypeEnum.BG_REMOVAL);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setError('');
    
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setPreview(result);
      onImageSelected(file, result); 
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = () => {
    if (!selectedFile) return;


    setLoading(true);
    setError('');
    
  
    const tempJobId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
    onJobCreated(tempJobId);

 
    uploadImageAndCreateJob(selectedFile, jobType)
      .then(response => {
        console.log('Job completed:', response.jobId);
        
         onJobCreated(response.jobId);
      })
      .catch(err => {
        setError(err.message || 'Upload failed');
        console.error('Job failed:', err);
        
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const getButtonText = () => {
    if (loading) return 'Processing...';
    if (selectedFile) return 'Upload & Process';
    return 'Select an image first';
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Upload Image</h3>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Job Type
          </label>
          <select
            value={jobType}
            onChange={(e) => setJobType(e.target.value as JobTypeEnum)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          >
            <option value={JobTypeEnum.BG_REMOVAL}>Background Removal</option>
            <option value={JobTypeEnum.UPSCALE}>Upscale</option>
            <option value={JobTypeEnum.ENLARGE}>Enlarge</option>
          </select>
        </div>

        <DragDropUploader
          onFileSelect={handleFileSelect}
          preview={preview}
          maxSize={10}
        />

        {selectedFile && (
          <div className="text-center text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
            <strong>File:</strong> {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={!selectedFile || loading}
          className={`w-full py-2 px-4 rounded-md font-medium transition-all duration-200 ${
            loading 
              ? 'bg-blue-500 text-white cursor-not-allowed' 
              : !selectedFile 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800'
          }`}
        >
          {loading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Processing...</span>
            </div>
          ) : (
            getButtonText()
          )}
        </button>
      </div>
    </div>
  );
};

export default ImageUploader;