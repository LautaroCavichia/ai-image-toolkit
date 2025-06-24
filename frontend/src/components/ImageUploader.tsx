import React, { useState } from 'react';
import { JobTypeEnum } from '../types';
import { uploadImageAndCreateJob } from '../services/apiService';

interface ImageUploaderProps {
  onJobCreated: (jobId: string) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onJobCreated }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [jobType, setJobType] = useState<JobTypeEnum>(JobTypeEnum.BG_REMOVAL);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setError('');

    try {
      const response = await uploadImageAndCreateJob(selectedFile, jobType);
      onJobCreated(response.jobId);
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
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
          >
            <option value={JobTypeEnum.BG_REMOVAL}>Background Removal</option>
            <option value={JobTypeEnum.UPSCALE}>Upscale</option>
            <option value={JobTypeEnum.ENLARGE}>Enlarge</option>
            <option value={JobTypeEnum.STYLE_TRANSFER}>Style Transfer</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Choose Image
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {selectedFile && (
          <div className="text-sm text-gray-600">
            Selected: {selectedFile.name}
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={!selectedFile || loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Uploading...' : 'Upload & Process'}
        </button>
      </div>
    </div>
  );
};

export default ImageUploader;