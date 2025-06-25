import React, { useState, useEffect } from 'react';
import { JobResponseDTO, JobStatusEnum } from '../types';
import { getJobStatus } from '../services/apiService';
import { unlockPremiumQuality } from '../services/tokenService';
import { Clock, CheckCircle, XCircle, Loader2, Download, Unlock, Star } from 'lucide-react';

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

  const getStatusConfig = (status: JobStatusEnum) => {
    switch (status) {
      case JobStatusEnum.COMPLETED:
        return {
          color: 'text-green-600',
          bg: 'bg-green-50',
          border: 'border-green-200',
          icon: CheckCircle
        };
      case JobStatusEnum.FAILED:
        return {
          color: 'text-red-600',
          bg: 'bg-red-50',
          border: 'border-red-200',
          icon: XCircle
        };
      case JobStatusEnum.PROCESSING:
        return {
          color: 'text-blue-600',
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          icon: Loader2
        };
      default:
        return {
          color: 'text-yellow-600',
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          icon: Clock
        };
    }
  };

  if (error) {
    return (
      <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-slate-200/50">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-center">
          <XCircle className="mx-auto mb-2" size={24} />
          <p className="font-medium">Something went wrong</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-slate-200/50">
      <h3 className="text-2xl font-medium text-slate-900 mb-6">Processing Status</h3>
      
      {job && (
        <div className="space-y-6">
          {/* Status Display */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {(() => {
                const config = getStatusConfig(job.status);
                const StatusIcon = config.icon;
                return (
                  <>
                    <div className={`w-12 h-12 ${config.bg} ${config.border} border rounded-2xl flex items-center justify-center`}>
                      <StatusIcon 
                        className={`${config.color} ${job.status === JobStatusEnum.PROCESSING ? 'animate-spin' : ''}`} 
                        size={20} 
                      />
                    </div>
                    <div>
                      <div className="font-medium text-slate-900 capitalize">{job.status.toLowerCase()}</div>
                      <div className="text-sm text-slate-600">Job ID: {job.jobId.slice(0, 8)}...</div>
                    </div>
                  </>
                );
              })()}
            </div>
            <div className="text-right text-sm text-slate-500">
              <div>Created: {new Date(job.createdAt).toLocaleTimeString()}</div>
              {job.completedAt && (
                <div>Finished: {new Date(job.completedAt).toLocaleTimeString()}</div>
              )}
            </div>
          </div>

          {/* Processing Message */}
          {loading && job.status !== JobStatusEnum.COMPLETED && job.status !== JobStatusEnum.FAILED && (
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl">
              <div className="flex items-center gap-3 text-blue-700">
                <Loader2 className="animate-spin" size={20} />
                <div>
                  <div className="font-medium">AI is working its magic...</div>
                  <div className="text-sm">This usually takes 10-30 seconds</div>
                </div>
              </div>
            </div>
          )}

          {/* Completed Results */}
          {job.status === JobStatusEnum.COMPLETED && (
            <div className="space-y-6">
              {/* Preview */}
              {job.thumbnailUrl && (
                <div>
                  <h4 className="font-medium text-slate-900 mb-3">Your Result</h4>
                  <div className="relative inline-block">
                    <img 
                      src={job.thumbnailUrl} 
                      alt="Processed result" 
                      className="max-w-full h-auto max-h-64 rounded-2xl border shadow-lg"
                    />
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center">
                      <CheckCircle size={16} />
                    </div>
                  </div>
                </div>
              )}

              {/* Premium Unlock */}
              {!job.isPremiumQuality && (
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 p-6 rounded-2xl">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center">
                      <Star className="text-purple-600" size={20} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-slate-900 mb-2">Unlock Premium Quality</h4>
                      <p className="text-sm text-slate-700 mb-4">
                        Get the full resolution version with enhanced quality and precision.
                      </p>
                      <button
                        onClick={handleUnlockPremium}
                        disabled={unlocking}
                        className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl font-medium transition-colors duration-200 disabled:opacity-50"
                      >
                        {unlocking ? (
                          <>
                            <Loader2 className="animate-spin" size={16} />
                            Unlocking...
                          </>
                        ) : (
                          <>
                            <Unlock size={16} />
                            Unlock Premium ({job.tokenCost || 1} token)
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Download */}
              {job.processedImageUrl && (
                <div className="bg-green-50 border border-green-200 p-6 rounded-2xl">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
                      <Download className="text-green-600" size={20} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-slate-900 mb-1">Ready for Download</h4>
                      <p className="text-sm text-slate-600">Your image with transparent background</p>
                    </div>
                    <a 
                      href={job.processedImageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-medium transition-colors duration-200 shadow-lg hover:shadow-xl"
                    >
                      <Download size={16} />
                      Download
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Failed Status */}
          {job.status === JobStatusEnum.FAILED && job.errorMessage && (
            <div className="bg-red-50 border border-red-200 p-6 rounded-2xl">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center">
                  <XCircle className="text-red-600" size={20} />
                </div>
                <div>
                  <h4 className="font-medium text-slate-900 mb-2">Processing Failed</h4>
                  <p className="text-sm text-red-700">{job.errorMessage}</p>
                  <p className="text-xs text-slate-500 mt-2">Try uploading a different image or contact support if the issue persists.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default JobStatus;