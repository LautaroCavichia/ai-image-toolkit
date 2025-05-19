import React, { useState, ChangeEvent, FormEvent } from 'react';
import { uploadImageAndCreateJob } from '../services/apiService';
import { JobResponseDTO, JobTypeEnum } from '../types';

interface ImageUploaderProps {
  onJobCreated: (job: JobResponseDTO) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onJobCreated }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [jobType, setJobType] = useState<JobTypeEnum>(JobTypeEnum.BG_REMOVAL);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  // TODO: Get userId from an auth context or input for now
  const tempUserId = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11"; // FIXME: Replace with actual or input

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleJobTypeChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setJobType(event.target.value as JobTypeEnum);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedFile) {
      setError('Please select a file.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const job = await uploadImageAndCreateJob(selectedFile, tempUserId, jobType);
      onJobCreated(job);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to upload image and create job.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2>Upload Image</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="file">Choose image:</label>
          <input type="file" id="file" onChange={handleFileChange} accept="image/*" />
        </div>
        <div>
          <label htmlFor="jobType">Select Task:</label>
          <select id="jobType" value={jobType} onChange={handleJobTypeChange}>
            {Object.values(JobTypeEnum).map((type) => (
              <option key={type} value={type}>
                {type.replace('_', ' ')}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" disabled={isLoading || !selectedFile}>
          {isLoading ? 'Processing...' : 'Upload and Start Job'}
        </button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default ImageUploader;