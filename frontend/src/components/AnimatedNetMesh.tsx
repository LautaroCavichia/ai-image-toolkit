import React, { useEffect, useRef, useState } from 'react';

interface AnimatedNetMeshProps {
  className?: string;
  intensity?: 'subtle' | 'medium' | 'bold';
}

const AnimatedNetMesh: React.FC<AnimatedNetMeshProps> = ({
  className = '',
  intensity = 'subtle'
}) => {
  const meshRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  const [isLowPowerMode, setIsLowPowerMode] = useState(false);

  useEffect(() => {
    // Detect low-power devices
    const detectLowPowerMode = () => {
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const hasReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const hasLowMemory = (navigator as any).deviceMemory && (navigator as any).deviceMemory < 4;
      
      return isMobile || hasReducedMotion || hasLowMemory;
    };

    setIsLowPowerMode(detectLowPowerMode());

    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const updateCanvasSize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2); // Limit DPR for better performance
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      ctx.scale(dpr, dpr);
    };

    updateCanvasSize();

    // Grid configuration - adjust for low power mode
    const gridSize = isLowPowerMode ? 200 : 50; // Larger grid for low power
    const cols = Math.ceil(window.innerWidth / gridSize) + 2;
    const rows = Math.ceil(window.innerHeight / gridSize) + 2;

    // Animation parameters for wave-like motion
    const intensityConfig = {
      subtle: { 
        amplitude: isLowPowerMode ? 15 : 8, 
        speed: isLowPowerMode ? 0.04 : 0.03, 
        opacity: isLowPowerMode ? 0.25 : 0.2,
        waveLength: isLowPowerMode ? 3 : 2
      },
      medium: { 
        amplitude: isLowPowerMode ? 25 : 12, 
        speed: isLowPowerMode ? 0.05 : 0.04, 
        opacity: isLowPowerMode ? 0.35 : 0.3,
        waveLength: isLowPowerMode ? 2.5 : 1.8
      },
      bold: { 
        amplitude: isLowPowerMode ? 35 : 18, 
        speed: isLowPowerMode ? 0.06 : 0.05, 
        opacity: isLowPowerMode ? 0.45 : 0.4,
        waveLength: isLowPowerMode ? 2 : 1.5
      }
    };

    const config = intensityConfig[intensity];
    let time = 0;
    let cooldownTimer = 0;
    let isWaveActive = false;
    let waveIntensity = 0;
    
    // Cooldown configuration
    const cooldownConfig = {
      activeTime: isLowPowerMode ? 3000 : 4000,    // Duration of wave effect (ms)
      restTime: isLowPowerMode ? 2000 : 1500,      // Cooldown duration (ms)
      fadeInTime: isLowPowerMode ? 800 : 600,      // Fade in duration (ms)
      fadeOutTime: isLowPowerMode ? 1000 : 800     // Fade out duration (ms)
    };

    // Animation function
    const animate = () => {
      if (!ctx) return;

      // Always increment time for continuous movement
      time += config.speed;
      cooldownTimer += 16; // Approximate ms per frame (assuming ~60fps base)

      // Cooldown logic
      const totalCycleTime = cooldownConfig.activeTime + cooldownConfig.restTime;
      const currentCycleTime = cooldownTimer % totalCycleTime;
      
      if (currentCycleTime < cooldownConfig.activeTime) {
        // Wave is active or transitioning
        isWaveActive = true;
        
        // Calculate fade in/out
        if (currentCycleTime < cooldownConfig.fadeInTime) {
          // Fade in
          waveIntensity = currentCycleTime / cooldownConfig.fadeInTime;
        } else if (currentCycleTime > (cooldownConfig.activeTime - cooldownConfig.fadeOutTime)) {
          // Fade out
          const fadeOutProgress = (cooldownConfig.activeTime - currentCycleTime) / cooldownConfig.fadeOutTime;
          waveIntensity = Math.max(0, fadeOutProgress);
        } else {
          // Full intensity
          waveIntensity = 1;
        }
      } else {
        // Wave is in cooldown
        isWaveActive = false;
        waveIntensity = 0;
      }

      // Clear canvas
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      // Calculate current amplitude based on wave intensity
      const currentAmplitude = config.amplitude * waveIntensity;
      const baseAmplitude = config.amplitude * 0.1; // Subtle movement during cooldown

      // Set line style with dynamic opacity
      const currentOpacity = config.opacity * (0.3 + (waveIntensity * 0.7));
      ctx.strokeStyle = `rgba(99, 102, 241, ${currentOpacity})`;
      ctx.lineWidth = isLowPowerMode ? 0.6 : 0.8;

      if (isLowPowerMode) {
        // Wave-like animation for low power mode with cooldown
        const waveTime = time * (isWaveActive ? 2 : 0.5); // Slower during cooldown
        const effectiveAmplitude = isWaveActive ? currentAmplitude : baseAmplitude;
        
        // Create flowing wave effect across horizontal lines
        for (let i = 0; i <= rows; i++) {
          const y = i * gridSize;
          // Multiple wave layers for more fluid motion
          const primaryWave = Math.sin(waveTime + i * 0.3) * effectiveAmplitude;
          const secondaryWave = isWaveActive ? 
            Math.sin(waveTime * 0.7 + i * 0.5) * (effectiveAmplitude * 0.6) : 0;
          const waveOffset = primaryWave + secondaryWave;
          
          ctx.beginPath();
          ctx.moveTo(0, y + waveOffset);
          
          if (isWaveActive) {
            // Add intermediate points for smoother wave motion during active phase
            for (let x = 0; x <= window.innerWidth; x += gridSize / 2) {
              const localTime = waveTime + (x * 0.005);
              const localWave = Math.sin(localTime + i * 0.2) * (effectiveAmplitude * 0.4);
              ctx.lineTo(x, y + waveOffset + localWave);
            }
          } else {
            // Simple line during cooldown
            ctx.lineTo(window.innerWidth, y + waveOffset);
          }
          
          ctx.stroke();
        }

        // Create flowing wave effect across vertical lines
        for (let i = 0; i <= cols; i++) {
          const x = i * gridSize;
          // Perpendicular wave motion
          const primaryWave = Math.cos(waveTime * 0.8 + i * 0.4) * effectiveAmplitude;
          const secondaryWave = isWaveActive ?
            Math.cos(waveTime * 1.2 + i * 0.3) * (effectiveAmplitude * 0.5) : 0;
          const waveOffset = primaryWave + secondaryWave;
          
          ctx.beginPath();
          ctx.moveTo(x + waveOffset, 0);
          
          if (isWaveActive) {
            // Add intermediate points for smoother wave motion during active phase
            for (let y = 0; y <= window.innerHeight; y += gridSize / 2) {
              const localTime = waveTime * 0.9 + (y * 0.004);
              const localWave = Math.cos(localTime + i * 0.25) * (effectiveAmplitude * 0.3);
              ctx.lineTo(x + waveOffset + localWave, y);
            }
          } else {
            // Simple line during cooldown
            ctx.lineTo(x + waveOffset, window.innerHeight);
          }
          
          ctx.stroke();
        }
      } else {
        // Enhanced wave animation for normal devices with cooldown
        const waveTime = time * (isWaveActive ? 1.5 : 0.3);
        const effectiveAmplitude = isWaveActive ? currentAmplitude : baseAmplitude;
        
        // Draw horizontal lines with complex wave patterns
        for (let i = 0; i <= rows; i++) {
          const y = i * gridSize;
          const primaryWave = Math.sin(waveTime + i * 0.4) * effectiveAmplitude;
          const secondaryWave = isWaveActive ?
            Math.sin(waveTime * 0.6 + i * 0.7) * (effectiveAmplitude * 0.7) : 0;
          
          ctx.beginPath();
          ctx.moveTo(0, y + primaryWave + secondaryWave);
          
          if (isWaveActive) {
            for (let x = 0; x <= window.innerWidth; x += gridSize / 4) {
              const localTime = waveTime + (x * 0.008);
              const localPrimary = Math.sin(localTime + i * 0.3) * (effectiveAmplitude * 0.6);
              const localSecondary = Math.sin(localTime * 1.3 + i * 0.5) * (effectiveAmplitude * 0.4);
              const tertiaryWave = Math.sin(localTime * 2 + i * 0.2) * (effectiveAmplitude * 0.2);
              
              ctx.lineTo(x, y + primaryWave + secondaryWave + localPrimary + localSecondary + tertiaryWave);
            }
          } else {
            // Simple wave during cooldown
            for (let x = 0; x <= window.innerWidth; x += gridSize / 2) {
              const localWave = Math.sin(waveTime + (x * 0.003) + i * 0.3) * (effectiveAmplitude * 0.5);
              ctx.lineTo(x, y + primaryWave + localWave);
            }
          }
          
          ctx.stroke();
        }

        // Draw vertical lines with complex wave patterns
        for (let i = 0; i <= cols; i++) {
          const x = i * gridSize;
          const primaryWave = Math.cos(waveTime * 0.9 + i * 0.5) * effectiveAmplitude;
          const secondaryWave = isWaveActive ?
            Math.cos(waveTime * 1.1 + i * 0.3) * (effectiveAmplitude * 0.6) : 0;
          
          ctx.beginPath();
          ctx.moveTo(x + primaryWave + secondaryWave, 0);
          
          if (isWaveActive) {
            for (let y = 0; y <= window.innerHeight; y += gridSize / 4) {
              const localTime = waveTime * 0.8 + (y * 0.006);
              const localPrimary = Math.cos(localTime + i * 0.4) * (effectiveAmplitude * 0.5);
              const localSecondary = Math.cos(localTime * 1.4 + i * 0.6) * (effectiveAmplitude * 0.3);
              const tertiaryWave = Math.cos(localTime * 1.8 + i * 0.25) * (effectiveAmplitude * 0.15);
              
              ctx.lineTo(x + primaryWave + secondaryWave + localPrimary + localSecondary + tertiaryWave, y);
            }
          } else {
            // Simple wave during cooldown
            for (let y = 0; y <= window.innerHeight; y += gridSize / 2) {
              const localWave = Math.cos(waveTime * 0.7 + (y * 0.004) + i * 0.4) * (effectiveAmplitude * 0.4);
              ctx.lineTo(x + primaryWave + localWave, y);
            }
          }
          
          ctx.stroke();
        }
      }

      // Continue animation with appropriate frame rate
      const targetFPS = isLowPowerMode ? 25 : 35; // Slightly higher FPS for smoother waves
      setTimeout(() => {
        animationRef.current = requestAnimationFrame(animate);
      }, 1000 / targetFPS);
    };

    // Start animation
    animate();

    // Throttled resize handler
    let resizeTimeout: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(updateCanvasSize, 150);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('resize', handleResize);
      if (resizeTimeout) {
        clearTimeout(resizeTimeout);
      }
    };
  }, [intensity, isLowPowerMode]);

  const getIntensityStyles = () => {
    const styles = {
      subtle: {
        filter: isLowPowerMode ? 'none' : 'blur(0.5px)',
        opacity: isLowPowerMode ? 0.5 : 0.6
      },
      medium: {
        filter: isLowPowerMode ? 'none' : 'blur(0.3px)',
        opacity: isLowPowerMode ? 0.7 : 0.8
      },
      bold: {
        filter: isLowPowerMode ? 'none' : 'blur(0px)',
        opacity: isLowPowerMode ? 0.9 : 1
      }
    };
    return styles[intensity];
  };

  return (
    <div 
      ref={meshRef}
      className={`fixed inset-0 -z-10 overflow-hidden pointer-events-none ${className}`}
      style={{ 
        perspective: '1500px',
        transform: isLowPowerMode ? 'rotateX(15deg) scale(1.05)' : 'rotateX(25deg) scale(1.1)',
        transformOrigin: 'center center',
        transformStyle: 'preserve-3d',
      }}
    >
      {/* Simplified gradient overlay */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: isLowPowerMode 
            ? `radial-gradient(ellipse at center, transparent 50%, rgba(255,255,255,0.05) 100%)`
            : `
                radial-gradient(ellipse at center, transparent 40%, rgba(255,255,255,0.1) 100%),
                radial-gradient(ellipse 100% 60% at top, rgba(99,102,241,0.05) 0%, transparent 50%)
              `
        }}
      />
      
      {/* Canvas for optimized mesh */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{
          ...getIntensityStyles(),
          mixBlendMode: isLowPowerMode ? 'normal' : 'overlay',
          willChange: 'auto',
        }}
      />
      
      
    </div>
  );
};

export default AnimatedNetMesh;