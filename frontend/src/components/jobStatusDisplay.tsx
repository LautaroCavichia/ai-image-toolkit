import React, { useState, useEffect } from 'react';
import { getJobStatus } from '../services/apiService';
import { JobResponseDTO, JobStatusEnum } from '../types';

interface JobStatusDisplayProps {
  initialJob: JobResponseDTO;
}

const JobStatusDisplay: React.FC<JobStatusDisplayProps> = ({ initialJob }) => {
  const [job, setJob] = useState<JobResponseDTO>(initialJob);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setJob(initialJob); // Update if initialJob prop changes
  }, [initialJob]);

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
  }, [job.jobId, job.status]); // Rerun effect if jobId or status changes

  return (
    <div>
      <h3>Job Status (ID: {job.jobId})</h3>
      <p><strong>Type:</strong> {job.jobType?.replace('_', ' ')}</p>
      <p><strong>Status:</strong> {job.status}</p>
      {job.status === JobStatusEnum.PROCESSING && <p>Processing started...</p>}
      {job.status === JobStatusEnum.COMPLETED && job.processedImageUrl && (
        <div>
          <p><strong>Processing Complete!</strong></p>
          <p>Download/View: <a href={job.processedImageUrl} target="_blank" rel="noopener noreferrer">{job.processedImageUrl}</a></p>
          {/* FIXME: For local file paths, this link won't work directly */}
          <img src={job.processedImageUrl} alt="Processed" style={{maxWidth: '300px', border: '1px solid #ccc'}}/>
        </div>
      )}
      {job.status === JobStatusEnum.FAILED && (
        <p style={{ color: 'red' }}>
          <strong>Job Failed:</strong> {job.errorMessage || 'An unknown error occurred.'}
        </p>
      )}
      {error && <p style={{ color: 'red' }}>Polling Error: {error}</p>}
      <p><small>Created At: {new Date(job.createdAt).toLocaleString()}</small></p>
      {job.completedAt && <p><small>Completed At: {new Date(job.completedAt).toLocaleString()}</small></p>}
    </div>
  );
};

export default JobStatusDisplay;