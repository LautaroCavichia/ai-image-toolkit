import React, { useState, useEffect } from 'react';
import { JobResponseDTO, JobStatusEnum } from '../types';
import { getJobStatus } from '../services/apiService';
import { unlockPremiumQuality } from '../services/tokenService';

interface JobStatusProps {
  jobId: string;
  onJobCompleted?: (job: JobResponseDTO) => void;
}

const JobStatus: React.FC<JobStatusProps> = ({ jobId, onJobCompleted }) => {
  const [job, setJob] = useState<JobResponseDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [unlocking, setUnlocking] = useState(false);

  useEffect(() => {
    const pollJobStatus = async () => {
      try {
        const response = await getJobStatus(jobId);
        setJob(response);
        
        if (response.status === JobStatusEnum.COMPLETED || response.status === JobStatusEnum.FAILED) {
          setLoading(false);
          if (response.status === JobStatusEnum.COMPLETED && onJobCompleted) {
            onJobCompleted(response);
          }
        }
      } catch (err: any) {
        setError(err.message || 'Failed to get job status');
        setLoading(false);
      }
    };

    const interval = setInterval(pollJobStatus, 2000);
    pollJobStatus();

    return () => clearInterval(interval);
  }, [jobId, onJobCompleted]);

  const handleUnlockPremium = async () => {
    if (!job) return;
    
    setUnlocking(true);
    try {
      await unlockPremiumQuality(job.jobId);
      const updatedJob = await getJobStatus(job.jobId);
      setJob(updatedJob);
    } catch (err: any) {
      setError(err.message || 'Failed to unlock premium quality');
    } finally {
      setUnlocking(false);
    }
  };

  const getStatusColor = (status: JobStatusEnum) => {
    switch (status) {
      case JobStatusEnum.COMPLETED:
        return 'text-green-600 bg-green-100';
      case JobStatusEnum.FAILED:
        return 'text-red-600 bg-red-100';
      case JobStatusEnum.PROCESSING:
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-yellow-600 bg-yellow-100';
    }
  };

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Job Status</h3>
      
      {job && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">Status:</span>
            <span className={`px-2 py-1 rounded text-sm ${getStatusColor(job.status)}`}>
              {job.status}
            </span>
          </div>

          <div className="text-sm text-gray-600">
            <div>Job ID: {job.jobId}</div>
            <div>Type: {job.jobType}</div>
            <div>Created: {new Date(job.createdAt).toLocaleString()}</div>
            {job.completedAt && (
              <div>Completed: {new Date(job.completedAt).toLocaleString()}</div>
            )}
          </div>

          {loading && job.status !== JobStatusEnum.COMPLETED && job.status !== JobStatusEnum.FAILED && (
            <div className="text-blue-600">
              <div className="animate-spin inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2"></div>
              Processing...
            </div>
          )}

          {job.status === JobStatusEnum.COMPLETED && (
            <div className="space-y-4">
              {job.thumbnailUrl && (
                <div>
                  <h4 className="font-medium mb-2">Result Preview:</h4>
                  <img 
                    src={job.thumbnailUrl} 
                    alt="Result preview" 
                    className="max-w-xs rounded border"
                  />
                </div>
              )}

              {!job.isPremiumQuality && (
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded">
                  <p className="text-sm text-yellow-800 mb-2">
                    This is a free quality result. Unlock premium quality for better resolution.
                  </p>
                  <button
                    onClick={handleUnlockPremium}
                    disabled={unlocking}
                    className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 disabled:opacity-50"
                  >
                    {unlocking ? 'Unlocking...' : `Unlock Premium (${job.tokenCost || 1} tokens)`}
                  </button>
                </div>
              )}

              {job.processedImageUrl && (
                <div>
                  <a 
                    href={job.processedImageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 inline-block"
                  >
                    Download Full Resolution
                  </a>
                </div>
              )}
            </div>
          )}

          {job.status === JobStatusEnum.FAILED && job.errorMessage && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              Error: {job.errorMessage}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default JobStatus;