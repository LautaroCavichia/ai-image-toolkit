import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
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
}

const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({ 
  images, 
  autoPlay = true, 
  autoPlayInterval = 4000 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isUserInteracting, setIsUserInteracting] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const sliderAnimationRef = useRef<gsap.core.Tween | null>(null);
  const userInteractionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const directionRef = useRef(1); // 1 for forward (0->100), -1 for backward (100->0)
  const sliderRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (sliderRef.current) {
      gsap.fromTo(sliderRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
      );
    }
  }, []);

  // Remove the old slideshow interval - now controlled by slider animation

  // Slider animation effect
  useEffect(() => {
    if (!isPlaying || isUserInteracting) {
      if (sliderAnimationRef.current) {
        sliderAnimationRef.current.kill();
      }
      return;
    }

    const animateToTarget = () => {
      if (sliderAnimationRef.current) {
        sliderAnimationRef.current.kill();
      }

      const targetPos = directionRef.current > 0 ? 100 : 0;
      
      // Use a ref to track current position for consistent animation
      let currentPos = sliderPosition;
      const distance = Math.abs(targetPos - currentPos);
      const duration = (distance / 100) * 5; // 5 seconds for full range

      sliderAnimationRef.current = gsap.to({ pos: currentPos }, {
        pos: targetPos,
        duration: Math.max(duration, 0.3),
        ease: "sine.inOut", // Smooth sinusoidal easing for consistent smoothness
        onUpdate: function() {
          const newPos = this.targets()[0].pos;
          setSliderPosition(newPos);
        },
        onComplete: () => {
          // Only proceed if still playing and not interacting
          if (isPlaying && !isUserInteracting) {
            // Change to next image
            setCurrentIndex((prev) => (prev + 1) % images.length);
            
            // Reverse direction for next animation
            directionRef.current *= -1;
            
            // Small delay then continue
            setTimeout(() => {
              if (isPlaying && !isUserInteracting) {
                animateToTarget();
              }
            }, 200);
          }
        }
      });
    };

    // Start the animation
    animateToTarget();

    return () => {
      if (sliderAnimationRef.current) {
        sliderAnimationRef.current.kill();
      }
    };
  }, [isPlaying, isUserInteracting]);

  // Handle user interaction timeout
  useEffect(() => {
    if (isUserInteracting) {
      if (userInteractionTimeoutRef.current) {
        clearTimeout(userInteractionTimeoutRef.current);
      }
      
      userInteractionTimeoutRef.current = setTimeout(() => {
        setIsUserInteracting(false);
      }, 1500); // Resume animation after 1.5 seconds of no interaction
    }

    return () => {
      if (userInteractionTimeoutRef.current) {
        clearTimeout(userInteractionTimeoutRef.current);
      }
    };
  }, [isUserInteracting]);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    setIsUserInteracting(true);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
    setIsUserInteracting(true);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSliderMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
    setIsUserInteracting(true);
  };

  const handleMouseEnter = () => {
    setIsUserInteracting(true);
  };

  const handleMouseLeave = () => {
    // Don't immediately stop interaction, let the timeout handle it
  };

  const currentImage = images[currentIndex];

  if (!currentImage) return null;

  return (
    <div ref={sliderRef} className="bg-white/80 backdrop-blur-xl p-8 md:p-12 rounded-3xl shadow-xl border border-slate-200/50">
      <div className="text-center mb-8">
        <h3 className="text-3xl font-light text-slate-900 mb-3 tracking-tight">
          See the <em className="italic text-slate-600">Magic</em>
        </h3>
        <p className="text-slate-600 text-lg">Experience the transformation power of our AI</p>
      </div>

      {/* Before/After Container */}
      <div 
        ref={containerRef}
        className="relative w-full h-96 md:h-[500px] rounded-2xl overflow-hidden cursor-ew-resize shadow-2xl mb-8"
        onMouseMove={handleSliderMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Before Image */}
        <div className="absolute inset-0">
          <img 
            src={currentImage.before} 
            alt="Before" 
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
            Before
          </div>
        </div>

        {/* After Image with Clip */}
        <div 
          className="absolute inset-0 transition-all duration-75 ease-out"
          style={{ clipPath: `polygon(${sliderPosition}% 0%, 100% 0%, 100% 100%, ${sliderPosition}% 100%)` }}
        >
          <img 
            src={currentImage.after} 
            alt="After" 
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
            After
          </div>
        </div>

        {/* Slider Line */}
        <div 
          className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg transition-all duration-75 ease-out"
          style={{ left: `${sliderPosition}%` }}
        >
          {/* Slider Handle */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-xl flex items-center justify-center cursor-ew-resize">
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
        {/* Previous Button */}
        <button
          onClick={handlePrevious}
          disabled={images.length <= 1}
          className="w-12 h-12 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl flex items-center justify-center transition-colors duration-200"
        >
          <ChevronLeft size={20} className="text-slate-700" />
        </button>

        {/* Play/Pause Button */}
        <button
          onClick={togglePlayPause}
          disabled={images.length <= 1}
          className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-xl font-medium transition-colors duration-200"
        >
          {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          <span className="text-sm">{isPlaying ? 'Pause' : 'Play'}</span>
        </button>

        {/* Next Button */}
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
              onClick={() => {
                setCurrentIndex(index);
                setIsUserInteracting(true);
              }}
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