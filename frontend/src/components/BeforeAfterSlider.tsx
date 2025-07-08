import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';

interface BeforeAfterImage {
  before: string;
  after: string;
  title: string;
  description: string;
}

interface BeforeAfterSliderProps {
  images: BeforeAfterImage[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
  objectFit?: 'contain' | 'cover' | 'fill' | 'scale-down';
}

const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({
  images,
  autoPlay = true,
  autoPlayInterval = 8000,
  objectFit = 'contain' // Changed default to 'contain' to prevent zoom
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);

  const animationRef = useRef<number | undefined>(undefined);
  const animationStartTimeRef = useRef<number>(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Optimized position update function
  const updateSliderPosition = useCallback((clientX: number) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  }, []);

  // Auto-advance to next image
  useEffect(() => {
    if (!isPlaying || isDragging || images.length <= 1) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, autoPlayInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isPlaying, isDragging, images.length, autoPlayInterval]);

  // Smooth slider animation - only when not dragging
  useEffect(() => {
    if (!isPlaying || isDragging) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = undefined;
      }
      return;
    }

    animationStartTimeRef.current = Date.now();

    const animate = () => {
      if (!isPlaying || isDragging) {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
          animationRef.current = undefined;
        }
        return;
      }

      const elapsed = Date.now() - animationStartTimeRef.current;
      const cycleDuration = 6000;

      const progress = (elapsed % cycleDuration) / cycleDuration;
      const position = ((Math.cos(progress * Math.PI * 2) + 1) / 2) * 100;

      setSliderPosition(position);
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = undefined;
      }
    };
  }, [isPlaying, isDragging]);

  // Optimized mouse/touch event handlers
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
    updateSliderPosition(e.clientX);
  }, [updateSliderPosition]);

  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
    if (e.touches[0]) {
      updateSliderPosition(e.touches[0].clientX);
    }
  }, [updateSliderPosition]);

  const handlePrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const togglePlayPause = useCallback(() => {
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  // Global event listeners for dragging - optimized with throttling
  useEffect(() => {
    if (!isDragging) return;

    let animationFrame: number | null = null;
    let lastClientX: number | null = null;

    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      
      lastClientX = e.clientX;
      
      if (animationFrame) return;
      
      animationFrame = requestAnimationFrame(() => {
        if (lastClientX !== null) {
          updateSliderPosition(lastClientX);
        }
        animationFrame = null;
      });
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      e.stopPropagation();
      
      if (e.touches[0]) {
        lastClientX = e.touches[0].clientX;
        
        if (animationFrame) return;
        
        animationFrame = requestAnimationFrame(() => {
          if (lastClientX !== null) {
            updateSliderPosition(lastClientX);
          }
          animationFrame = null;
        });
      }
    };

    const handleEnd = () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
        animationFrame = null;
      }
      setIsDragging(false);
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove, { passive: false });
      container.addEventListener('touchmove', handleTouchMove, { passive: false });
    }
    
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchend', handleEnd);
    window.addEventListener('mouseleave', handleEnd);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
      
      if (container) {
        container.removeEventListener('mousemove', handleMouseMove);
        container.removeEventListener('touchmove', handleTouchMove);
      }
      
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchend', handleEnd);
      window.removeEventListener('mouseleave', handleEnd);
    };
  }, [isDragging, updateSliderPosition]);

  const currentImage = images[currentIndex];

  if (!currentImage) return null;

  // Get the appropriate object-fit class
  const getObjectFitClass = () => {
    switch (objectFit) {
      case 'contain': return 'object-contain';
      case 'cover': return 'object-cover';
      case 'fill': return 'object-fill';
      case 'scale-down': return 'object-scale-down';
      default: return 'object-contain';
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-xl p-8 md:p-12 rounded-3xl shadow-xl border border-slate-200/50">
      <div className="text-center mb-8">
        <h3 className="text-3xl font-light text-slate-900 mb-3 tracking-tight">
          See the <em className="italic text-slate-600">Magic</em>
        </h3>
        <p className="text-slate-600 text-lg">Experience the transformation power of our AI</p>
      </div>

      {/* Object Fit Controls */}
      <div className="flex justify-center gap-2 mb-6">
        <span className="text-sm text-slate-600 mr-2">Image fit:</span>
        {['contain', 'cover', 'fill', 'scale-down'].map((fit) => (
          <button
            key={fit}
            onClick={() => {}}
            className={`px-3 py-1 text-xs rounded-full transition-colors ${
              objectFit === fit 
                ? 'bg-slate-900 text-white' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {fit}
          </button>
        ))}
      </div>

      {/* Before/After Container */}
      <div
        ref={containerRef}
        className="relative w-full h-96 md:h-[500px] rounded-2xl overflow-hidden shadow-2xl mb-8 select-none bg-slate-50"
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        {/* Before Image */}
        <div className="absolute inset-0 flex items-center justify-center">
          <img
            src={currentImage.before}
            alt="Before"
            className={`w-full h-full ${getObjectFitClass()}`}
            draggable={false}
          />
          <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
            Before
          </div>
        </div>

        {/* After Image with Clip */}
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ 
            clipPath: `polygon(${sliderPosition}% 0%, 100% 0%, 100% 100%, ${sliderPosition}% 100%)`,
            willChange: isDragging ? 'clip-path' : 'auto'
          }}
        >
          {/* Container with background pattern for transparency */}
          <div className="w-full h-full relative bg-slate-50">
            {/* Transparency grid pattern */}
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 0, 0, 0.04) 1px, transparent 1px)`,
                backgroundSize: '20px 20px',
              }}
            />
            {/* After image */}
            <img
              src={currentImage.after}
              alt="After"
              className={`w-full h-full ${getObjectFitClass()} relative`}
              draggable={false}
            />
          </div>

          <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
            After
          </div>
        </div>

        {/* Slider Line */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg"
          style={{ 
            left: `${sliderPosition}%`,
            willChange: isDragging ? 'left' : 'auto'
          }}
        >
          {/* Slider Handle */}
          <div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-xl flex items-center justify-center hover:scale-110"
            style={{ 
              cursor: isDragging ? 'grabbing' : 'grab',
              transform: `translate(-50%, -50%) ${!isDragging && 'scale(1.05)'}`,
              transition: isDragging ? 'none' : 'transform 0.2s ease'
            }}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
          >
            <div className="w-6 h-6 bg-slate-900 rounded-full flex items-center justify-center">
              <div className="flex gap-0.5">
                <div className="w-0.5 h-4 bg-white rounded-full"></div>
                <div className="w-0.5 h-4 bg-white rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Info */}
      <div className="text-center mb-8">
        <h4 className="text-xl font-medium text-slate-900 mb-2">{currentImage.title}</h4>
        <p className="text-slate-600">{currentImage.description}</p>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={handlePrevious}
          disabled={images.length <= 1}
          className="w-12 h-12 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl flex items-center justify-center transition-colors duration-200"
        >
          <ChevronLeft size={20} className="text-slate-700" />
        </button>

        <button
          onClick={togglePlayPause}
          disabled={images.length <= 1}
          className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-xl font-medium transition-colors duration-200"
        >
          {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          <span className="text-sm">{isPlaying ? 'Pause' : 'Play'}</span>
        </button>

        <button
          onClick={handleNext}
          disabled={images.length <= 1}
          className="w-12 h-12 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl flex items-center justify-center transition-colors duration-200"
        >
          <ChevronRight size={20} className="text-slate-700" />
        </button>
      </div>

      {/* Dots Indicator */}
      {images.length > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                index === currentIndex ? 'bg-slate-900 w-6' : 'bg-slate-300 hover:bg-slate-400'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};



export default BeforeAfterSlider;