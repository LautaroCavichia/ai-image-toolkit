import React, { useState, useEffect, useMemo } from 'react';
import { JobResponseDTO, JobStatusEnum } from '../types';
import { getJobStatus } from '../services/apiService';
import { unlockPremiumQuality } from '../services/tokenService';
import { Clock, CheckCircle, XCircle, Loader2, Download, Unlock, Star } from 'lucide-react';

interface JobStatusProps {
  jobId: string;
  initialImageUrl: string;
  onJobCompleted?: (job: JobResponseDTO) => void;
}

const JobStatus: React.FC<JobStatusProps> = ({ jobId, initialImageUrl, onJobCompleted }) => {
  const [job, setJob] = useState<JobResponseDTO | null>(null);
  const [error, setError] = useState('');
  const [unlocking, setUnlocking] = useState(false);

  useEffect(() => {
    (window as any)._mockJob = {
      jobId: jobId,
      status: JobStatusEnum.PENDING,
      createdAt: new Date().toISOString(),
      completedAt: null,
      thumbnailUrl: null,
      processedImageUrl: null,
      isPremiumQuality: false,
      tokenCost: 1,
      errorMessage: '',
    };

    const pollJobStatus = async () => {
      try {
        const response = await getJobStatus(jobId);
        setJob(response);

        if (response.status === JobStatusEnum.COMPLETED || response.status === JobStatusEnum.FAILED) {
          if (response.status === JobStatusEnum.COMPLETED && onJobCompleted) {
            onJobCompleted(response);
          }
          clearInterval(interval);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to get job status');
        clearInterval(interval);
      }
    };

    const interval = setInterval(pollJobStatus, 3500);
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

  const isProcessing = useMemo(() => {
    if (JobStatusEnum.PENDING === job?.status || JobStatusEnum.QUEUED === job?.status || JobStatusEnum.PROCESSING === job?.status) {
      return true;
    }
    return false;
  }, [job]);

  const isCompleted = useMemo(() => job?.status === JobStatusEnum.COMPLETED, [job]);
  const isFailed = useMemo(() => job?.status === JobStatusEnum.FAILED, [job]);

  const statusConfig = useMemo(() => {
    switch (job?.status) {
      case JobStatusEnum.COMPLETED:
        return { text: 'Completed', icon: CheckCircle, color: 'text-green-500' };
      case JobStatusEnum.FAILED:
        return { text: 'Failed', icon: XCircle, color: 'text-red-500' };
      case JobStatusEnum.PROCESSING:
        return { text: 'Processing...', icon: Loader2, color: 'text-blue-500', spin: true };
      default:
        return { text: 'Pending...', icon: Clock, color: 'text-neutral-500' };
    }
  }, [job]);

  const StatusIcon = statusConfig.icon;

  if (error) {
    return (
      <div className="w-full max-w-md mx-auto bg-white/70 backdrop-blur-2xl p-6 rounded-[28px] shadow-2xl border border-black/5 font-sans">
        <div className="bg-red-50 text-red-700 px-4 py-3 rounded-2xl text-center">
          <XCircle className="mx-auto mb-2 text-red-500" size={32} />
          <p className="font-semibold text-lg">An Error Occurred</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto bg-white/70 backdrop-blur-2xl p-4 sm:p-6 rounded-[28px] shadow-2xl border border-black/5 font-sans text-neutral-800">
      <div className="space-y-6">

        <div className="aspect-w-4 aspect-h-3 bg-neutral-200 rounded-2xl overflow-hidden relative border border-black/5">
          {/* Initial image always rendered */}
          <img
  src={initialImageUrl}
  alt="Initial upload"
  className={`w-full h-full object-cover transition-opacity duration-500 ${isCompleted ? 'opacity-0' : 'opacity-100'} z-10`}
/>


          {/* Processing overlay */}
          <div className={`absolute inset-0 z-20 bg-black/20 backdrop-blur-sm flex flex-col items-center justify-center text-white transition-opacity duration-500 ${isProcessing ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>

            <div className="w-16 h-16 border-2 border-white/50 rounded-full animate-spin" style={{ borderTopColor: 'white' }}></div>
            <p className="mt-4 font-medium">AI is working its magic...</p>
            <p className="text-sm opacity-80">This can take up to 30 seconds</p>
          </div>

          {/* Processed image */}
          <img
            key={job?.thumbnailUrl}
            src={job?.thumbnailUrl || ''}
            alt="Processed result"
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-in-out ${isCompleted ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
          />
        </div>


        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <StatusIcon className={`${statusConfig.color} ${statusConfig.spin ? 'animate-spin' : ''}`} size={24} />
              <span className="font-semibold text-lg text-neutral-900">{statusConfig.text}</span>
            </div>
            {job && <span className="text-sm text-neutral-500">Job ID: {job.jobId.slice(0, 8)}...</span>}
          </div>
        </div>

        {isCompleted && job && (
          <div className="space-y-4 animate-fade-in">
            {!job.isPremiumQuality && (
              <div className="bg-neutral-100/80 border border-black/5 p-4 rounded-2xl">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Star className="text-purple-600" size={20} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-neutral-900">Unlock Premium Quality</h4>
                    <p className="text-sm text-neutral-600">Get full resolution & enhanced precision.</p>
                  </div>
                  <button
                    onClick={handleUnlockPremium}
                    disabled={unlocking}
                    className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200 disabled:opacity-60 disabled:pointer-events-none whitespace-nowrap"
                  >
                    {unlocking ? (
                      <Loader2 className="animate-spin" size={16} />
                    ) : (
                      <>
                        <Unlock size={14} />
                        <span>Unlock ({job.tokenCost || 1})</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {job.processedImageUrl && (
              <a
                href={job.processedImageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl focus:ring-4 focus:ring-blue-300 focus:outline-none"
              >
                <Download size={18} />
                Download Image
              </a>
            )}
          </div>
        )}

        {isFailed && job?.errorMessage && (
          <div className="bg-red-50/80 border border-red-500/20 p-4 rounded-2xl animate-fade-in">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <XCircle className="text-red-600" size={20} />
              </div>
              <div>
                <h4 className="font-semibold text-neutral-900">Processing Failed</h4>
                <p className="text-sm text-red-700">{job.errorMessage || 'An unknown error occurred.'}</p>
                <p className="text-xs text-neutral-500 mt-1">Please try a different image.</p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default JobStatus;