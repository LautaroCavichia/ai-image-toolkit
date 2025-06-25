import React, { useEffect, useRef } from 'react';
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

  useEffect(() => {
    if (!meshRef.current || !svgRef.current) return;

    const gridSize = 40;
    // Ensure we have enough coverage for any viewport, especially portrait
    const minRows = Math.max(Math.ceil(window.innerHeight / gridSize), Math.ceil(window.innerWidth / gridSize)) + 8;
    const minCols = Math.max(Math.ceil(window.innerWidth / gridSize), Math.ceil(window.innerHeight / gridSize)) + 8;
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

    // Create wave animation timeline
    const tl = gsap.timeline({ repeat: -1 });

    // Wave animation function
    const createWaveAnimation = () => {
      const horizontalLines = svgRef.current?.querySelectorAll('.mesh-horizontal');
      const verticalLines = svgRef.current?.querySelectorAll('.mesh-vertical');

      if (!horizontalLines || !verticalLines) return;

      // Animate horizontal lines with wave effect
      horizontalLines.forEach((line, index) => {
        const y = index * gridSize;
        const amplitude = intensity === 'subtle' ? 4 : intensity === 'medium' ? 6 : 8;
        const baseDelay = index * 0.2;

        tl.to(line, {
          attr: {
            d: `M 0 ${y} Q ${svgWidth * 0.33} ${y + amplitude} ${svgWidth * 0.66} ${y - amplitude} T ${svgWidth} ${y}`
          },
          duration: 12,
          ease: "power1.inOut",
          repeat: -1,
          yoyo: true,
          delay: baseDelay
        }, 0);
      });

      // Animate vertical lines with wave effect
      verticalLines.forEach((line, index) => {
        const x = index * gridSize;
        const amplitude = intensity === 'subtle' ? 3 : intensity === 'medium' ? 5 : 7;
        const baseDelay = index * 0.15;

        tl.to(line, {
          attr: {
            d: `M ${x} 0 Q ${x + amplitude} ${svgHeight * 0.33} ${x - amplitude} ${svgHeight * 0.66} T ${x} ${svgHeight}`
          },
          duration: 15,
          ease: "power1.inOut",
          repeat: -1,
          yoyo: true,
          delay: baseDelay
        }, 0);
      });

      // Subtle opacity pulsing for depth
      tl.to(paths, {
        opacity: 0.35,
        duration: 6,
        ease: "power2.inOut",
        stagger: {
          amount: 2,
          from: "random"
        },
        repeat: -1,
        yoyo: true
      }, 0);
    };

    createWaveAnimation();

    // Set initial viewBox
    svgRef.current.setAttribute('viewBox', `0 0 ${svgWidth} ${svgHeight}`);
    svgRef.current.setAttribute('width', '100%');
    svgRef.current.setAttribute('height', '100%');

    // Handle resize
    const handleResize = () => {
      if (!svgRef.current) return;
      const newMinRows = Math.max(Math.ceil(window.innerHeight / gridSize), Math.ceil(window.innerWidth / gridSize)) + 8;
      const newMinCols = Math.max(Math.ceil(window.innerWidth / gridSize), Math.ceil(window.innerHeight / gridSize)) + 8;
      const newSvgWidth = newMinCols * gridSize;
      const newSvgHeight = newMinRows * gridSize;
      
      svgRef.current.setAttribute('viewBox', `0 0 ${newSvgWidth} ${newSvgHeight}`);
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      tl.kill();
      window.removeEventListener('resize', handleResize);
    };
  }, [intensity]);

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
          mixBlendMode: 'overlay'
        }}
        preserveAspectRatio="none"
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