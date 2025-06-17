import React, { useState, useRef, useEffect } from 'react';
import './BeforeAfterSlider.css';

interface BeforeAfterSliderProps {
  beforeSrc: string;
  afterSrc: string;
  title?: string;
  subtitle?: string;
  autoPlaySpeed?: number;
}

const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({ 
  beforeSrc, 
  afterSrc, 
  title = "Unmatched Quality Results",
  subtitle = "Experience the difference with our professional transformation. Slide to reveal the stunning before and after comparison.",
  autoPlaySpeed = 8000
}) => {
  const [sliderPosition, setSliderPosition] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isUserInteracting, setIsUserInteracting] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const resumeFromPositionRef = useRef<number>(0);
  const resumeStartTimeRef = useRef<number>(0);

  // Auto-play animation
  useEffect(() => {
    if (isUserInteracting || isDragging) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = undefined;
      }
      return;
    }

    resumeFromPositionRef.current = sliderPosition;
    resumeStartTimeRef.current = Date.now();
    
    const animate = () => {
      if (isUserInteracting || isDragging) {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
          animationRef.current = undefined;
        }
        return;
      }
      
      const elapsed = Date.now() - resumeStartTimeRef.current;
      const cycleDuration = autoPlaySpeed;
      
      const progress = (elapsed % cycleDuration) / cycleDuration;
      const naturalPosition = ((Math.cos(progress * Math.PI * 2) + 1) / 2) * 100;
      
      const interpolationDuration = 1000;
      
      if (elapsed < interpolationDuration) {
        const interpolationProgress = elapsed / interpolationDuration;
        const easedProgress = 1 - Math.pow(1 - interpolationProgress, 3);
        
        const position = resumeFromPositionRef.current + 
          (naturalPosition - resumeFromPositionRef.current) * easedProgress;
        
        setSliderPosition(position);
      } else {
        setSliderPosition(naturalPosition);
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = undefined;
      }
    };
  }, [isUserInteracting, isDragging, autoPlaySpeed]);

  const handleMouseDown = () => {
    setIsDragging(true);
    setIsUserInteracting(true);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = undefined;
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - containerRect.left;
    const position = Math.min(Math.max((x / containerRect.width) * 100, 0), 100);
    
    setSliderPosition(position);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging || !containerRef.current || !e.touches[0]) return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const x = e.touches[0].clientX - containerRect.left;
    const position = Math.min(Math.max((x / containerRect.width) * 100, 0), 100);
    
    setSliderPosition(position);
  };

  useEffect(() => {
    if (!isUserInteracting) return;

    const timeout = setTimeout(() => {
      setIsUserInteracting(false);
    }, 3000);

    return () => clearTimeout(timeout);
  }, [isDragging]);

  useEffect(() => {
    const mouseMoveHandler = (e: MouseEvent) => handleMouseMove(e);
    const touchMoveHandler = (e: TouchEvent) => handleTouchMove(e);
    
    window.addEventListener('mousemove', mouseMoveHandler);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', touchMoveHandler);
    window.addEventListener('touchend', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', mouseMoveHandler);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', touchMoveHandler);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging]);

  const renderWatermarkPattern = () => {
    const watermarks = [];
    // Crear una grilla de watermarks para cubrir toda el área
    for (let row = 0; row < 6; row++) {
      for (let col = 0; col < 5; col++) {
        watermarks.push(
          <div
            key={`${row}-${col}`}
            style={{
              position: 'absolute',
              left: `${col * 20}%`,
              top: `${row * 16}%`,
              transform: 'rotate(12deg)',
              fontSize: '22px',
              fontWeight: '700',
              color: '#000',
            
              textTransform: 'uppercase',
              letterSpacing: '2px',
            opacity: 0.08,
              userSelect: 'none',
              pointerEvents: 'none',
              whiteSpace: 'nowrap',
              padding: '2px 8px',
              borderRadius: '4px',
              border: '1px solid rgba(44, 82, 130, 0.3)',
              textShadow: '1px 1px 2px rgba(0, 0, 0, 0.2), 0 0 4px rgba(44, 82, 130, 0.3)',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.5)'
            }}
          >
            PixelPerfectAI ®
          </div>
        );
      }
    }
    return watermarks;
  };

  return (
    <div className="slider-wrapper">
      <div className="simple-comparison-section">
        <div className="simple-content">
          <h2 className="simple-title">{title}</h2>
          <p className="simple-subtitle">{subtitle}</p>
          
          <div className="simple-slider-wrapper">
            <div 
              ref={containerRef}
              className="before-after-slider simple"
              onMouseDown={handleMouseDown}
              onTouchStart={handleMouseDown}
              style={{ cursor: isDragging ? 'grabbing' : 'ew-resize' }}
            >
              {/* Watermark de fondo - z-index más bajo */}
              <div 
                className="background-watermark"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  zIndex: 0,
                  overflow: 'hidden'
                }}
              >
                {renderWatermarkPattern()}
              </div>
              
              {/* Branding central */}
              <div 
                className="background-branding-center"
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  fontSize: '48px',
                  fontWeight: '700',
                  color: '#1A365D',
                  background: 'rgba(255, 255, 255, 0.9)',
                  textTransform: 'uppercase',
                  letterSpacing: '4px',
                  pointerEvents: 'none',
                  userSelect: 'none',
                  zIndex: 0,
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: '2px solid rgba(26, 54, 93, 0.3)',
                  opacity: 0.15,
                  textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3), 0 0 8px rgba(26, 54, 93, 0.4)',
                  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2), inset 0 2px 0 rgba(255, 255, 255, 0.8)'
                }}
              >
                PixelPerfectAI
              </div>
              
              {/* Container de imágenes */}
              <div className="image-container" style={{ position: 'relative', zIndex: 2 }}>
                <img 
                  className="after-image" 
                  src={afterSrc} 
                  alt="After transformation" 
                />
                
                <div 
                  className="before-image-container" 
                  style={{ width: `${sliderPosition}%` }}
                >
                  <img 
                    className="before-image" 
                    src={beforeSrc} 
                    alt="Before transformation" 
                  />
                </div>
              </div>
              
              {/* Línea del slider */}
              <div className="slider-line" style={{ left: `${sliderPosition}%` }}></div>
              <div 
                className="slider-handle" 
                style={{ left: `${sliderPosition}%` }}
                onMouseDown={handleMouseDown}
                onTouchStart={handleMouseDown}
              >
                <div className="slider-handle-inner">↔</div>
              </div>
              
              {/* Labels */}
              <div className="before-after-label before-label">Before</div>
              <div className="before-after-label after-label">After</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BeforeAfterSlider;