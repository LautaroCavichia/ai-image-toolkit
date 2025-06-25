import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import logo from '../assets/logo.png';

interface LoadingScreenProps {
  onComplete: () => void;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete }) => {
  const logoRef = useRef<HTMLImageElement>(null);
  const dotsRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline();

    // Logo entrance animation
    tl.fromTo(logoRef.current, 
      { 
        opacity: 0, 
        scale: 0.5, 
        y: 30,
        filter: 'blur(8px)'
      },
      { 
        opacity: 1, 
        scale: 1, 
        y: 0, 
        filter: 'blur(0px)',
        duration: 1.2, 
        ease: "power3.out" 
      }
    );

    // Breathing animation for logo
    gsap.to(logoRef.current, {
      scale: 1.05,
      duration: 2,
      repeat: -1,
      yoyo: true,
      ease: "power2.inOut",
      delay: 1.2
    });

    // Loading dots animation
    const dots = dotsRef.current?.children;
    if (dots) {
      Array.from(dots).forEach((dot, index) => {
        gsap.to(dot, {
          y: -8,
          opacity: 0.4,
          duration: 0.6,
          repeat: -1,
          yoyo: true,
          ease: "power2.inOut",
          delay: 1.5 + (index * 0.2)
        });
      });
    }

    // Exit animation after 2 seconds
    const exitTl = gsap.timeline({ delay: 2 });
    exitTl.to(containerRef.current, {
      opacity: 0,
      scale: 0.9,
      filter: 'blur(10px)',
      duration: 0.6,
      ease: "power3.in",
      onComplete: onComplete
    });

    return () => {
      tl.kill();
      exitTl.kill();
    };
  }, [onComplete]);

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-50 bg-gradient-to-br from-white via-slate-50 to-slate-100 flex items-center justify-center"
    >
      <div className="text-center">
        <img 
          ref={logoRef}
          src={logo} 
          alt="Pixel Perfect AI" 
          className="w-20 h-20 mx-auto mb-8 drop-shadow-2xl"
        />
        
        <div className="text-2xl font-light text-slate-700 mb-6 tracking-tight">
          Pixel Perfect AI
        </div>
        
        <div 
          ref={dotsRef}
          className="flex items-center justify-center gap-2"
        >
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              className="w-2 h-2 bg-slate-400 rounded-full"
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;