import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';

interface AnimatedNetMeshProps {
  className?: string;
  intensity?: 'subtle' | 'medium' | 'bold';
}

const AnimatedNetMesh: React.FC<AnimatedNetMeshProps> = ({
  className = '',
  intensity = 'subtle'
}) => {
  const meshRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [isLowPowerMode, setIsLowPowerMode] = useState(false);

  useEffect(() => {
    // Detect low-power devices and user preferences
    const detectLowPowerMode = () => {
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const hasReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const hasLowMemory = (navigator as any).deviceMemory && (navigator as any).deviceMemory < 4;
      const hasSlowConnection = (navigator as any).connection && ((navigator as any).connection.effectiveType === 'slow-2g' || (navigator as any).connection?.effectiveType === '2g');
      
      return isMobile || hasReducedMotion || hasLowMemory || hasSlowConnection;
    };

    setIsLowPowerMode(detectLowPowerMode());

    if (!meshRef.current || !svgRef.current) return;

    // Performance optimization: Larger grid size = fewer elements
    const gridSize = isLowPowerMode ? 120 : 60; // Double grid size for low-power devices
    // Reduce coverage slightly for better performance
    const minRows = Math.max(Math.ceil(window.innerHeight / gridSize), Math.ceil(window.innerWidth / gridSize)) + (isLowPowerMode ? 2 : 4);
    const minCols = Math.max(Math.ceil(window.innerWidth / gridSize), Math.ceil(window.innerHeight / gridSize)) + (isLowPowerMode ? 2 : 4);
    const rows = minRows;
    const cols = minCols;
    const svgWidth = cols * gridSize;
    const svgHeight = rows * gridSize;

    // Clear existing paths
    svgRef.current.innerHTML = '';

    // Create grid paths
    const paths: SVGPathElement[] = [];

    // Horizontal lines
    for (let i = 0; i <= rows; i++) {
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      const y = i * gridSize;
      path.setAttribute('d', `M 0 ${y} L ${svgWidth} ${y}`);
      path.setAttribute('stroke', 'currentColor');
      path.setAttribute('stroke-width', '0.8');
      path.setAttribute('fill', 'none');
      path.setAttribute('opacity', '0.23');
      path.setAttribute('class', `mesh-line mesh-horizontal mesh-row-${i}`);
      svgRef.current.appendChild(path);
      paths.push(path);
    }

    // Vertical lines
    for (let i = 0; i <= cols; i++) {
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      const x = i * gridSize;
      path.setAttribute('d', `M ${x} 0 L ${x} ${svgHeight}`);
      path.setAttribute('stroke', 'currentColor');
      path.setAttribute('stroke-width', '0.8');
      path.setAttribute('fill', 'none');
      path.setAttribute('opacity', '0.23');
      path.setAttribute('class', `mesh-line mesh-vertical mesh-col-${i}`);
      svgRef.current.appendChild(path);
      paths.push(path);
    }

    // Performance optimized wave animation
    const createWaveAnimation = () => {
      // Skip animations entirely for reduced motion or low-power devices
      if (isLowPowerMode) return;

      const horizontalLines = svgRef.current?.querySelectorAll('.mesh-horizontal');
      const verticalLines = svgRef.current?.querySelectorAll('.mesh-vertical');

      if (!horizontalLines || !verticalLines) return;

      // Only animate every 3rd line for better performance (or 6th for very low power)
      const animateEveryNth = isLowPowerMode ? 6 : 3;
      
      // Animate selected horizontal lines
      Array.from(horizontalLines).forEach((line, index) => {
        if (index % animateEveryNth !== 0) return; // Skip most lines
        
        const y = index * gridSize;
        const amplitude = intensity === 'subtle' ? 4 : intensity === 'medium' ? 6 : 8;
        const baseDelay = (index / animateEveryNth) * 0.3;

        gsap.to(line, {
          attr: {
            d: `M 0 ${y} Q ${svgWidth * 0.33} ${y + amplitude} ${svgWidth * 0.66} ${y - amplitude} T ${svgWidth} ${y}`
          },
          duration: isLowPowerMode ? 25 : 15, // Slower animations for low-power devices
          ease: "power1.inOut",
          repeat: -1,
          yoyo: true,
          delay: baseDelay
        });
      });

      // Animate selected vertical lines
      Array.from(verticalLines).forEach((line, index) => {
        if (index % animateEveryNth !== 0) return; // Skip most lines
        
        const x = index * gridSize;
        const amplitude = intensity === 'subtle' ? 3 : intensity === 'medium' ? 5 : 7;
        const baseDelay = (index / animateEveryNth) * 0.25;

        gsap.to(line, {
          attr: {
            d: `M ${x} 0 Q ${x + amplitude} ${svgHeight * 0.33} ${x - amplitude} ${svgHeight * 0.66} T ${x} ${svgHeight}`
          },
          duration: isLowPowerMode ? 30 : 18, // Slower animations for low-power devices
          ease: "power1.inOut",
          repeat: -1,
          yoyo: true,
          delay: baseDelay
        });
      });

      // Reduced opacity animation - only on some paths
      const selectedPaths = paths.filter((_, index) => index % (animateEveryNth * 2) === 0);
      gsap.to(selectedPaths, {
        opacity: 0.35,
        duration: isLowPowerMode ? 12 : 8,
        ease: "power2.inOut",
        stagger: isLowPowerMode ? 0.2 : 0.1,
        repeat: -1,
        yoyo: true
      });
    };

    createWaveAnimation();

    // Set initial viewBox
    svgRef.current.setAttribute('viewBox', `0 0 ${svgWidth} ${svgHeight}`);
    svgRef.current.setAttribute('width', '100%');
    svgRef.current.setAttribute('height', '100%');

    // Throttled resize handler for better performance
    let resizeTimeout: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        if (!svgRef.current) return;
        const newMinRows = Math.max(Math.ceil(window.innerHeight / gridSize), Math.ceil(window.innerWidth / gridSize)) + 4;
        const newMinCols = Math.max(Math.ceil(window.innerWidth / gridSize), Math.ceil(window.innerHeight / gridSize)) + 4;
        const newSvgWidth = newMinCols * gridSize;
        const newSvgHeight = newMinRows * gridSize;
        
        svgRef.current.setAttribute('viewBox', `0 0 ${newSvgWidth} ${newSvgHeight}`);
      }, 150); // Throttle resize events
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      // Clean up all GSAP animations
      if (svgRef.current) {
        const meshLines = svgRef.current.querySelectorAll('.mesh-line');
        gsap.killTweensOf(meshLines);
      }
      gsap.killTweensOf(paths);
      window.removeEventListener('resize', handleResize);
      if (resizeTimeout) {
        clearTimeout(resizeTimeout);
      }
    };
  }, [intensity, isLowPowerMode]);

  const getIntensityStyles = () => {
    const styles = {
      subtle: {
        color: 'rgb(99 102 241 / 0.4)', // indigo-500 with opacity
        filter: 'blur(0.3px)',
      },
      medium: {
        color: 'rgb(99 102 241 / 0.6)',
        filter: 'blur(0.2px)',
      },
      bold: {
        color: 'rgb(99 102 241 / 0.8)',
        filter: 'blur(0px)',
      }
    };
    return styles[intensity];
  };

  return (
    <div 
      ref={meshRef}
      className={`fixed inset-0 -z-5 overflow-hidden pointer-events-none ${className}`}
      style={{ 
        perspective: '1500px',
        transform: 'rotateX(35deg) rotateY(0deg) scale(1.2)',
        transformOrigin: 'center center',
        transformStyle: 'preserve-3d',
        width: '120vw',
        height: '120vh',
        left: '-10vw',
        top: '-10vh'
      }}
    >
      {/* Reverse Vignette - More opacity in corners */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse at center, transparent 30%, rgba(255,255,255,0.1) 70%, rgba(255,255,255,0.3) 100%),
            radial-gradient(ellipse 120% 80% at top left, rgba(99,102,241,0.08) 0%, transparent 50%),
            radial-gradient(ellipse 120% 80% at top right, rgba(139,92,246,0.08) 0%, transparent 50%),
            radial-gradient(ellipse 120% 80% at bottom left, rgba(236,72,153,0.08) 0%, transparent 50%),
            radial-gradient(ellipse 120% 80% at bottom right, rgba(59,130,246,0.08) 0%, transparent 50%)
          `
        }}
      />
      
      {/* 3D Net Mesh */}
      <svg
        ref={svgRef}
        className="absolute inset-0 w-full h-full"
        style={{
          ...getIntensityStyles(),
          transform: 'translateZ(0)',
          mixBlendMode: 'overlay',
          willChange: 'transform', // GPU acceleration hint
        }}
        preserveAspectRatio="none"
        shapeRendering="optimizeSpeed" // Prioritize speed over quality
        vectorEffect="non-scaling-stroke"
      />
      
      {/* Additional depth layers */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          background: `
            linear-gradient(45deg, transparent 48%, rgba(99,102,241,0.1) 50%, transparent 52%),
            linear-gradient(-45deg, transparent 48%, rgba(139,92,246,0.1) 50%, transparent 52%)
          `,
          backgroundSize: '80px 80px',
          transform: 'translateZ(-50px) rotateX(10deg)'
        }}
      />
      
    </div>
  );
};

export default AnimatedNetMesh;