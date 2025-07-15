import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { JobResponseDTO, JobStatusEnum } from '../types';
import { getJobStatus } from '../services/apiService';
import { unlockPremiumQuality } from '../services/tokenService';
import { Clock, CheckCircle, XCircle, Loader2, Download, Unlock, Star, Sparkles, Scissors, Maximize, Expand } from 'lucide-react';

interface JobStatusProps {
  jobId: string;
  initialImageUrl?: string;
  variant?: string;
  serviceType?: 'background-removal' | 'upscale' | 'enlarge' | 'object-removal';
  onJobCompleted?: (job: JobResponseDTO) => void;
}

// Lazy load GSAP only when needed
const loadGSAP = () => import('gsap').then(module => module.gsap);

// Optimized global protection - only run once
let globalProtectionSetup = false;
const setupGlobalProtection = () => {
  if (globalProtectionSetup) return;
  globalProtectionSetup = true;

  // Use requestAnimationFrame for better performance
  let rafId: number;
  const detectDevTools = () => {
    if (window.outerHeight - window.innerHeight > 160 || window.outerWidth - window.innerWidth > 160) {
      document.body.innerHTML = `
        <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: #000; color: #fff; display: flex; align-items: center; justify-content: center; z-index: 999999; font-family: Arial;">
          <div style="text-align: center;">
            <h1>🚫 Access Denied</h1>
            <p>Developer tools are not allowed on this page.</p>
            <p>Please close DevTools and refresh the page.</p>
          </div>
        </div>
      `;
      return;
    }
    rafId = requestAnimationFrame(detectDevTools);
  };
  detectDevTools();

  // Optimized event listeners with passive option
  const keydownHandler = (e: KeyboardEvent) => {
    if (e.key === 'F12' || 
        (e.ctrlKey && e.shiftKey && e.key === 'I') ||
        (e.ctrlKey && e.shiftKey && e.key === 'J') ||
        (e.ctrlKey && e.shiftKey && e.key === 'C') ||
        (e.ctrlKey && e.key === 'U') ||
        (e.ctrlKey && e.key === 'S') ||
        (e.ctrlKey && e.key === 'P')) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  document.addEventListener('keydown', keydownHandler, { passive: false });
  document.addEventListener('selectstart', (e) => e.preventDefault(), { passive: false });
  document.addEventListener('dragstart', (e) => e.preventDefault(), { passive: false });
  document.addEventListener('contextmenu', (e) => e.preventDefault(), { passive: false });

  // Reduce console clear frequency
  setInterval(() => {
    console.clear();
    console.log('%cStop!', 'color: red; font-size: 50px; font-weight: bold;');
    console.log('%cThis is a browser feature intended for developers. Content is protected.', 'color: red; font-size: 16px;');
  }, 5000); // Reduced from 1000ms to 5000ms
};

const JobStatus: React.FC<JobStatusProps> = ({ 
  jobId, 
  initialImageUrl, 
  serviceType = 'background-removal', 
  onJobCompleted 
}) => {
  const [job, setJob] = useState<JobResponseDTO | null>(null);
  const [error, setError] = useState('');
  const [unlocking, setUnlocking] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const processedCanvasRef = useRef<HTMLCanvasElement>(null);
  const originalCanvasRef = useRef<HTMLCanvasElement>(null);
  const [progress, setProgress] = useState(0);
  const [isDevToolsOpen, setIsDevToolsOpen] = useState(false);
  const [gsapLoaded, setGsapLoaded] = useState(false);

  // Optimized devtools detection with debounce
  useEffect(() => {
    setupGlobalProtection();
    
    let timeoutId: NodeJS.Timeout;
    const detectDevTools = () => {
      const threshold = 160;
      const isOpen = window.outerHeight - window.innerHeight > threshold || 
                     window.outerWidth - window.innerWidth > threshold;
      
      if (isOpen !== isDevToolsOpen) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => setIsDevToolsOpen(isOpen), 100);
      }
    };

    const interval = setInterval(detectDevTools, 500); // Reduced frequency
    return () => {
      clearInterval(interval);
      clearTimeout(timeoutId);
    };
  }, [isDevToolsOpen]);

  // Optimized canvas rendering with memoization
  const renderImageToCanvas = useCallback((canvas: HTMLCanvasElement, src: string) => {
    if (!canvas || !src) return;
    
    const ctx = canvas.getContext('2d', { alpha: false }); // Disable alpha for performance
    if (!ctx) return;
    
    const img = new Image();
    img.onload = () => {
      // Use requestAnimationFrame for smoother rendering
      requestAnimationFrame(() => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        // Optimized watermark
        ctx.globalAlpha = 0.01;
        ctx.fillStyle = 'white';
        ctx.font = '20px Arial';
        ctx.fillText('Protected Content', 10, 30);
        ctx.globalAlpha = 1;
      });
    };
    
    img.crossOrigin = 'anonymous';
    img.src = src;
  }, []);

  // Lazy load images
  useEffect(() => {
    if (originalCanvasRef.current && initialImageUrl) {
      // Defer non-critical image loading
      const timeoutId = setTimeout(() => {
        renderImageToCanvas(originalCanvasRef.current!, initialImageUrl);
      }, 0);
      return () => clearTimeout(timeoutId);
    }
  }, [initialImageUrl, renderImageToCanvas]);

  useEffect(() => {
    if (processedCanvasRef.current && job?.thumbnailUrl) {
      renderImageToCanvas(processedCanvasRef.current, job.thumbnailUrl);
    }
  }, [job?.thumbnailUrl, renderImageToCanvas]);

  // Memoized event handlers
  const preventRightClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const preventDragStart = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const preventSelection = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
  }, []);

  const preventInspect = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'F12' || 
        (e.ctrlKey && e.shiftKey && e.key === 'I') ||
        (e.ctrlKey && e.shiftKey && e.key === 'C') ||
        (e.ctrlKey && e.key === 'U') ||
        (e.ctrlKey && e.key === 'S')) {
      e.preventDefault();
    }
  }, []);

  // Optimized download function
  const downloadImage = useCallback(async (imageUrl: string, fileName: string = 'image.png'): Promise<void> => {
  
  
  try {
    if (!imageUrl || imageUrl.trim() === '') {
      throw new Error('URL empty');
    }

 
    const response = await fetch(imageUrl, {
      method: 'GET',
      headers: {
        'Accept': 'image/*',
        'Cache-Control': 'no-cache',
      },
      mode: 'cors', 
      credentials: 'omit' // 
    });

    console.log('📡 Server Response:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status} - ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type');
    
    if (!contentType || !contentType.startsWith('image/')) {
      throw new Error(`Invalid content: ${contentType}`);
    }


    const blob = await response.blob();

    if (blob.size === 0) {
    }
    const fileExtension = contentType.split('/')[1] || 'png';
    const finalFileName = fileName.includes('.') ? fileName : `${fileName}.${fileExtension}`;
    

    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = finalFileName;
    link.style.display = 'none';

    document.body.appendChild(link);
    
  
    setTimeout(() => {
      link.click();
      
      setTimeout(() => {
        if (document.body.contains(link)) {
          document.body.removeChild(link);
        }
        URL.revokeObjectURL(blobUrl);
        
      }, 100);
    }, 10);
    
  } catch (error) {
  
   
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      setError('We could not connect to the server');
    } else if (error instanceof Error) {
      setError(`Download error: ${error.message}`);
    } else {
      setError('Unknown Error');
    }
  }
}, []);

  // Memoized service configuration
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

  // Optimized job polling with exponential backoff
  useEffect(() => {
    let interval: NodeJS.Timeout;
    let pollCount = 0;
    
    const pollJobStatus = async () => {
      try {
        const response = await getJobStatus(jobId);
        setJob(response);

        if (response.status === JobStatusEnum.COMPLETED || response.status === JobStatusEnum.FAILED) {
          if (response.status === JobStatusEnum.COMPLETED && onJobCompleted) {
            onJobCompleted(response);
          }
          clearInterval(interval);
          return;
        }

        // Exponential backoff for polling
        pollCount++;
        const nextInterval = Math.min(1000 + (pollCount * 500), 5000);
        clearInterval(interval);
        interval = setTimeout(pollJobStatus, nextInterval);
        
      } catch (err: any) {
        setError(err.message || 'Failed to get job status');
        clearInterval(interval);
      }
    };

    // Start with immediate poll, then use intervals
    pollJobStatus();

    return () => clearInterval(interval);
  }, [jobId, onJobCompleted]);

  // Lazy load GSAP and entrance animation
  useEffect(() => {
    if (containerRef.current && !gsapLoaded) {
      loadGSAP().then(gsap => {
        setGsapLoaded(true);
        gsap.fromTo(containerRef.current, 
          { opacity: 0, y: 40, scale: 0.95 },
          { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: "power3.out" }
        );
        
        containerRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }).catch(() => {
        // Fallback without animation
        setGsapLoaded(true);
        if (containerRef.current) {
          containerRef.current.style.opacity = '1';
          containerRef.current.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
        }
      });
    }
  }, [gsapLoaded]);

  const handleUnlockPremium = useCallback(async () => {
    if (!job || unlocking) return;

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
  }, [job, unlocking]);

  // Memoized status checks
  const isProcessing = useMemo(() => {
    return job?.status === JobStatusEnum.PENDING || 
           job?.status === JobStatusEnum.QUEUED || 
           job?.status === JobStatusEnum.PROCESSING;
  }, [job?.status]);

  const isCompleted = useMemo(() => job?.status === JobStatusEnum.COMPLETED, [job?.status]);
  const isFailed = useMemo(() => job?.status === JobStatusEnum.FAILED, [job?.status]);

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
  }, [job?.status, serviceConfig, getRandomPhrase]);

  const StatusIcon = statusConfig.icon;

  // Optimized processing animation
  useEffect(() => {
    if (!isProcessing || !gsapLoaded) {
      setProgress(0);
      return;
    }

    let timeElapsed = 0;
    const interval = setInterval(() => {
      timeElapsed += 300;
      
      setProgress((prev) => {
        if (prev >= 70) return Math.min(prev + Math.random() * 0.5, 85);
        if (prev >= 50) return prev + Math.random() * 1;
        return prev + Math.random() * 3;
      });
    }, 300);

    return () => clearInterval(interval);
  }, [isProcessing, gsapLoaded]);

  // Early return for dev tools
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

  // Early return for errors
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
        msUserSelect: 'none',
        opacity: gsapLoaded ? 1 : 0
      }}
    >
      <div className="bg-white/95 backdrop-blur-3xl rounded-3xl p-8 shadow-2xl border border-white/30 ring-1 ring-slate-900/5 transition-all duration-300 hover:shadow-3xl relative z-50">
        
        {/* Image Container */}
        <div ref={imageRef} className="relative mb-8">
          <div className="aspect-[4/3] bg-slate-50 rounded-2xl overflow-hidden relative ring-1 ring-slate-900/5 shadow-inner">
          
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
                {/* Thumbnail Download Button */}
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
                  
                    onClick={() => downloadImage(job.processedImageUrl!, 'full-quality-image_pixel_perfect')}
                    
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