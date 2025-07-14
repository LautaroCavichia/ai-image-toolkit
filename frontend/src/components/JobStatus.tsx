import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { JobResponseDTO, JobStatusEnum } from '../types';
import { getJobStatus } from '../services/apiService';
import { unlockPremiumQuality } from '../services/tokenService';
import { Clock, CheckCircle, XCircle, Loader2, Download, Unlock, Star, Sparkles, Scissors, Maximize, Expand } from 'lucide-react';
import { gsap } from 'gsap';

interface JobStatusProps {
  jobId: string;
  initialImageUrl?: string;
  variant?: string;
  serviceType?: 'background-removal' | 'upscale' | 'enlarge' | 'object-removal';
  onJobCompleted?: (job: JobResponseDTO) => void;
}

// Global proteccion for DevTools
const setupGlobalProtection = () => {
  // Detect DevTools
  let devtools = { open: false };
  
  setInterval(() => {
    if (window.outerHeight - window.innerHeight > 160 || window.outerWidth - window.innerWidth > 160) {
      if (!devtools.open) {
        devtools.open = true;
        document.body.innerHTML = `
          <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: #000; color: #fff; display: flex; align-items: center; justify-content: center; z-index: 999999; font-family: Arial;">
            <div style="text-align: center;">
              <h1>🚫 Access Denied</h1>
              <p>Developer tools are not allowed on this page.</p>
              <p>Please close DevTools and refresh the page.</p>
            </div>
          </div>
        `;
      }
    }
  }, 100);

  // Block specific keys
  document.addEventListener('keydown', (e) => {
    if (e.key === 'F12' || 
        (e.ctrlKey && e.shiftKey && e.key === 'I') ||
        (e.ctrlKey && e.shiftKey && e.key === 'J') ||
        (e.ctrlKey && e.shiftKey && e.key === 'C') ||
        (e.ctrlKey && e.key === 'U') ||
        (e.ctrlKey && e.key === 'S') ||
        (e.ctrlKey && e.key === 'P')) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  });

  // Protection for text selecting
  document.addEventListener('selectstart', (e) => {
    e.preventDefault();
    return false;
  });

  // Protection for drag and drop
  document.addEventListener('dragstart', (e) => {
    e.preventDefault();
    return false;
  });

  // Protection for  right click global
  document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    return false;
  });

  // Clean console periodically
  setInterval(() => {
    console.clear();
    console.log('%cStop!', 'color: red; font-size: 50px; font-weight: bold;');
    console.log('%cThis is a browser feature intended for developers. Content is protected.', 'color: red; font-size: 16px;');
  }, 1000);
};

const JobStatus: React.FC<JobStatusProps> = ({ jobId, initialImageUrl, serviceType = 'background-removal', onJobCompleted }) => {
  const [job, setJob] = useState<JobResponseDTO | null>(null);
  const [error, setError] = useState('');
  const [unlocking, setUnlocking] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const processedCanvasRef = useRef<HTMLCanvasElement>(null);
  const [progress, setProgress] = useState(0);
  const [isDevToolsOpen, setIsDevToolsOpen] = useState(false);

  
  useEffect(() => {
    setupGlobalProtection();
    
    // Detect if devtools is open
    const detectDevTools = () => {
      const threshold = 160;
      if (window.outerHeight - window.innerHeight > threshold || 
          window.outerWidth - window.innerWidth > threshold) {
        setIsDevToolsOpen(true);
      } else {
        setIsDevToolsOpen(false);
      }
    };

    const interval = setInterval(detectDevTools, 100);
    return () => clearInterval(interval);
  }, []);

  
  const originalCanvasRef = useRef<HTMLCanvasElement>(null);


  const renderImageToCanvas = useCallback((canvas: HTMLCanvasElement, src: string) => {
    if (!canvas || !src) return;
    
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx!.drawImage(img, 0, 0);
      
      // Añadir marca de agua invisible
      ctx!.globalAlpha = 0.01;
      ctx!.fillStyle = 'white';
      ctx!.font = '20px Arial';
      ctx!.fillText('Protected Content', 10, 30);
    };
    
    img.crossOrigin = 'anonymous';
    img.src = src;
  }, []);


  useEffect(() => {
    if (originalCanvasRef.current && initialImageUrl) {
      renderImageToCanvas(originalCanvasRef.current, initialImageUrl);
    }
  }, [initialImageUrl, renderImageToCanvas]);


  useEffect(() => {
    if (processedCanvasRef.current && job?.thumbnailUrl) {
      renderImageToCanvas(processedCanvasRef.current, job.thumbnailUrl);
    }
  }, [job?.thumbnailUrl, renderImageToCanvas]);


  const preventRightClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    return false;
  };

  const preventDragStart = (e: React.DragEvent) => {
    e.preventDefault();
    return false;
  };

  const preventSelection = (e: React.MouseEvent) => {
    e.preventDefault();
    return false;
  };

  const preventInspect = (e: React.KeyboardEvent) => {
    if (e.key === 'F12' || 
        (e.ctrlKey && e.shiftKey && e.key === 'I') ||
        (e.ctrlKey && e.shiftKey && e.key === 'C') ||
        (e.ctrlKey && e.key === 'U') ||
        (e.ctrlKey && e.key === 'S')) {
      e.preventDefault();
      return false;
    }
  };


  const downloadImage = async (imageUrl: string, fileName: string = 'image.png'): Promise<void> => {
  try {
    
    const response = await fetch(imageUrl);
    
    if (!response.ok) {
      throw new Error(`Error downloading image: ${response.status}`);
    }

 
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.startsWith('image/')) {
      throw new Error('Invalid image format');
    }

    const blob = await response.blob();
    
  
    const fileExtension = contentType.split('/')[1] || 'png';
    const finalFileName = fileName.includes('.') ? fileName : `${fileName}.${fileExtension}`;
    
    const blobUrl = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = finalFileName;
    link.style.display = 'none';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
    
  } catch (error) {
    console.error('Download failed:', error);
    

  
  }
};


  // Service-specific configuration
  const serviceConfig = useMemo(() => {
    const configs = {
      'background-removal': {
        icon: Scissors,
        accentColor: 'from-rose-500 to-pink-600',
        ringColor: 'ring-rose-500/20',
        bgGradient: 'from-rose-50 to-pink-50',
        phrases: {
          processing: ['Slicing through backgrounds like butter...', 'Making backgrounds disappear like magic...', 'Cutting out the noise, keeping the art...'],
          completed: ['Background? What background!', 'Clean slate, pure vision.', 'Boom. Background deleted.']
        }
      },
      'upscale': {
        icon: Maximize,
        accentColor: 'from-blue-500 to-indigo-600',
        ringColor: 'ring-blue-500/20',
        bgGradient: 'from-blue-50 to-indigo-50',
        phrases: {
          processing: ['Enhancing every pixel with precision...', 'Upscaling your vision to perfection...', 'Making small images think big...'],
          completed: ['Pixel perfect. Always.', 'Now that\'s what I call HD!', 'Resolution rebellion complete.']
        }
      },
      'enlarge': {
        icon: Expand,
        accentColor: 'from-green-500 to-emerald-600',
        ringColor: 'ring-green-500/20',
        bgGradient: 'from-green-50 to-emerald-50',
        phrases: {
          processing: ['Expanding boundaries, breaking limits...', 'Giving your image room to breathe...', 'Making space for greatness...'],
          completed: ['Size matters. You got it.', 'Boundaries? We don\'t know her.', 'Space created, limits destroyed.']
        }
      },
      'object-removal': {
        icon: Sparkles,
        accentColor: 'from-purple-500 to-violet-600',
        ringColor: 'ring-purple-500/20',
        bgGradient: 'from-purple-50 to-violet-50',
        phrases: {
          processing: ['Erasing the unwanted, perfecting the shot...', 'Making distractions vanish into thin air...', 'Cleaning up reality, one pixel at a time...'],
          completed: ['Distraction deleted. Perfection achieved.', 'What photobomb? I see none.', 'Reality, but better.']
        }
      }
    };
    return configs[serviceType];
  }, [serviceType]);

  const getRandomPhrase = useCallback((type: 'processing' | 'completed') => {
    const phrases = serviceConfig.phrases[type];
    return phrases[Math.floor(Math.random() * phrases.length)];
  }, [serviceConfig.phrases]);

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

  // Entrance animation
  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(containerRef.current, 
        { opacity: 0, y: 40, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: "power3.out" }
      );
      
      containerRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
    }
  }, []);

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
    const ServiceIcon = serviceConfig.icon;
    switch (job?.status) {
      case JobStatusEnum.COMPLETED:
        return { 
          text: getRandomPhrase('completed'), 
          icon: CheckCircle, 
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          pulse: false
        };
      case JobStatusEnum.FAILED:
        return { 
          text: 'Something went wrong. Try again?', 
          icon: XCircle, 
          color: 'text-red-600',
          bgColor: 'bg-red-100',
          pulse: false
        };
      case JobStatusEnum.PROCESSING:
        return { 
          text: getRandomPhrase('processing'), 
          icon: ServiceIcon, 
          color: 'text-slate-600',
          bgColor: `bg-gradient-to-r ${serviceConfig.accentColor}`,
          pulse: true
        };
      default:
        return { 
          text: 'Getting ready to rebel...', 
          icon: Clock, 
          color: 'text-slate-500',
          bgColor: 'bg-slate-100',
          pulse: false
        };
    }
  }, [job, serviceConfig, getRandomPhrase]);

  const StatusIcon = statusConfig.icon;

  // Processing animation effects
  useEffect(() => {
    let tl: gsap.core.Timeline | null = null;
    
    if (isProcessing && overlayRef.current) {
      tl = gsap.timeline({ repeat: -1 });
      tl.to(overlayRef.current, { 
        background: `linear-gradient(45deg, rgba(0,0,0,0.1), rgba(255,255,255,0.1))`,
        duration: 2,
        ease: "power2.inOut"
      })
      .to(overlayRef.current, { 
        background: `linear-gradient(45deg, rgba(255,255,255,0.1), rgba(0,0,0,0.1))`,
        duration: 2,
        ease: "power2.inOut"
      });
    }
    
    return () => {
      if (tl) {
        tl.kill();
      }
    };
  }, [isProcessing]);

  useEffect(() => {
    if (!isProcessing) {
      setProgress(0);
      return;
    }

    let timeElapsed = 0;
    const interval = setInterval(() => {
      timeElapsed += 300;
      
      setProgress((prev) => {
        if (prev >= 70) {
          return Math.min(prev + Math.random() * 0.5, 85);
        }
        if (prev >= 50) {
          return prev + Math.random() * 1;
        }
        return prev + Math.random() * 3;
      });
    }, 300);

    return () => clearInterval(interval);
  }, [isProcessing]);

  // Pantalla de bloqueo si DevTools están abiertas
  if (isDevToolsOpen) {
    return (
      <div className="fixed inset-0 bg-black text-white flex items-center justify-center z-50">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">🚫 Access Denied</h1>
          <p className="text-xl mb-2">Developer tools are not allowed on this page.</p>
          <p className="text-lg">Please close DevTools and refresh the page.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div 
        ref={containerRef} 
        className="w-full max-w-lg mx-auto select-none"
        onContextMenu={preventRightClick}
        onKeyDown={preventInspect}
        tabIndex={0}
        style={{ 
          userSelect: 'none',
          WebkitUserSelect: 'none',
          MozUserSelect: 'none',
          msUserSelect: 'none'
        }}
      >
        <div className="bg-white/95 backdrop-blur-3xl rounded-3xl p-8 shadow-2xl border border-white/30 ring-1 ring-slate-900/5 transition-all duration-300">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto">
              <XCircle className="text-red-600" size={32} />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Oops, something rebelled!</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{error}</p>
              <p className="text-xs text-slate-500 mt-2">Even rebels need a second chance. Try again?</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef} 
      className="w-full max-w-lg mx-auto select-none"
      onContextMenu={preventRightClick}
      onKeyDown={preventInspect}
      tabIndex={0}
      style={{ 
        userSelect: 'none',
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none'
      }}
    >
      {/* Overlay de protección global */}
      <div 
        className="fixed inset-0 pointer-events-none z-40"
        onContextMenu={preventRightClick}
        onKeyDown={preventInspect}
        style={{ 
          userSelect: 'none',
          WebkitUserSelect: 'none',
          MozUserSelect: 'none',
          msUserSelect: 'none'
        }}
      />
      
      <div className="bg-white/95 backdrop-blur-3xl rounded-3xl p-8 shadow-2xl border border-white/30 ring-1 ring-slate-900/5 transition-all duration-300 hover:shadow-3xl relative z-50">
        
        {/* Image Container */}
        <div ref={imageRef} className="relative mb-8">
          <div className="aspect-[4/3] bg-slate-50 rounded-2xl overflow-hidden relative ring-1 ring-slate-900/5 shadow-inner">
            {/* Capa de protección adicional */}
            <div 
              className="absolute inset-0 z-10 bg-transparent"
              onContextMenu={preventRightClick}
              onDragStart={preventDragStart}
              onMouseDown={preventSelection}
              style={{ 
                userSelect: 'none',
                WebkitUserSelect: 'none',
                MozUserSelect: 'none',
                msUserSelect: 'none'
              }}
            />
            
            {/* Original Image */}
            <canvas
              ref={originalCanvasRef}
              className={`w-full h-full object-contain transition-all duration-700 select-none ${isCompleted ? 'opacity-0 scale-105' : 'opacity-100 scale-100'}`}
              onContextMenu={preventRightClick}
              onDragStart={preventDragStart}
              onMouseDown={preventSelection}
              style={{ 
                userSelect: 'none',
                WebkitUserSelect: 'none',
                MozUserSelect: 'none',
                msUserSelect: 'none',
                pointerEvents: 'none'
              }}
            />
            
            {/* Processing Overlay */}
            <div 
              ref={overlayRef}
              className={`absolute inset-0 backdrop-blur-sm flex flex-col items-center justify-center transition-all duration-500 bg-black/20 z-20 ${isProcessing ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            >
              <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-6 ${statusConfig.bgColor} ${statusConfig.pulse ? 'animate-pulse' : ''}`}>
                <StatusIcon className="text-white" size={32} />
              </div>
              <div className="text-center text-white">
                <p className="font-semibold text-lg mb-2">{statusConfig.text}</p>
                <p className="text-sm opacity-90">This usually takes 15-30 seconds</p>
              </div>
              
              <div className="w-80 h-1 bg-white/20 rounded-full mt-6 overflow-hidden">
                <div 
                  className="h-full bg-white rounded-full transition-all duration-300 ease-out"
                  style={{ 
                    width: `${progress}%`,
                    transform: `translateX(-${100 - progress}%)`,
                    animation: 'slideIn 0.3s ease-out'
                  }}
                />
              </div>
            </div>
            
            {/* Processed Image */}
            <canvas
              ref={processedCanvasRef}
              className={`absolute inset-0 w-full h-full object-cover transition-all duration-1000 select-none ${isCompleted ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
              onContextMenu={preventRightClick}
              onDragStart={preventDragStart}
              onMouseDown={preventSelection}
              style={{ 
                userSelect: 'none',
                WebkitUserSelect: 'none',
                MozUserSelect: 'none',
                msUserSelect: 'none',
                pointerEvents: 'none'
              }}
            />
            
            {/* Overlay de protección adicional para imagen procesada */}
            <div 
              className={`absolute inset-0 bg-transparent z-30 ${isCompleted ? 'block' : 'hidden'}`}
              onContextMenu={preventRightClick}
              onDragStart={preventDragStart}
              onMouseDown={preventSelection}
            />
            
            {/* Completion Celebration Overlay */}
            {isCompleted && (
              <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg z-40">
                ✨ Done!
              </div>
            )}
          </div>
        </div>

        {/* Status Section */}
        <div className="space-y-6">
          <div className="text-center">
            <div className={`inline-flex items-center gap-3 px-4 py-2 rounded-full ${statusConfig.bgColor} ${serviceConfig.ringColor} ring-1`}>
              <StatusIcon className={`${statusConfig.color} ${statusConfig.pulse ? 'animate-pulse' : ''}`} size={20} />
              <span className="font-medium text-slate-900">{statusConfig.text}</span>
            </div>
            {job && (
              <p className="text-xs text-slate-500 mt-2">Job {job.jobId.slice(0, 8)}</p>
            )}
          </div>

          {/* Completed Actions */}
          {isCompleted && job && (
            <div className="space-y-4">
              {/* Premium Unlock */}
              {!job.isPremiumQuality && (
                <div className={`bg-gradient-to-r ${serviceConfig.bgGradient} border border-black/5 p-6 rounded-2xl`}>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                      <Star className="text-amber-500" size={24} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-900 mb-1">Level Up Your Result</h4>
                      <p className="text-sm text-slate-600">Unlock full resolution + premium quality</p>
                    </div>
                    <button
                      onClick={handleUnlockPremium}
                      disabled={unlocking}
                      className={`flex items-center gap-2 bg-gradient-to-r ${serviceConfig.accentColor} text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-60 hover:scale-[1.02] active:scale-[0.98] ring-1 ring-white/20`}
                    >
                      {unlocking ? (
                        <Loader2 className="animate-spin" size={16} />
                      ) : (
                        <>
                          <Unlock size={16} />
                          <span>{job.tokenCost || 1} token{(job.tokenCost || 1) > 1 ? 's' : ''}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {/* Thumbnail Download Button - Always Available */}
                {job.thumbnailUrl && (
                  <button
                    onClick={() => downloadImage(job.thumbnailUrl!, 'PixelPerfect_Image')}
                    className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] ring-1 ring-blue-500/20"
                  >
                    <Download size={20} />
                    <span>Download Preview (Free)</span>
                  </button>
                )}
                
                {job.isPremiumQuality && job.processedImageUrl && (
                  <button
                    onClick={() => downloadImage(job.processedImageUrl!, 'full-quality-image.png')}
                    className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] ring-1 ring-green-500/20"
                  >
                    <Download size={20} />
                    <span>Download Full Quality</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Failed State */}
          {isFailed && job?.errorMessage && (
            <div className="bg-red-50 border border-red-200 p-6 rounded-2xl">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <XCircle className="text-red-600" size={24} />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-900 mb-2">Rebellion Failed</h4>
                  <p className="text-sm text-red-700 mb-2">{job.errorMessage}</p>
                  <p className="text-xs text-slate-500">Sometimes even rebels need to regroup. Try again?</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobStatus;