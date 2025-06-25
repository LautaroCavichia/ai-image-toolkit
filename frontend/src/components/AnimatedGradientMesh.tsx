import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

interface AnimatedGradientMeshProps {
  variant?: 'default' | 'background-removal' | 'enlarge' | 'upscale' | 'object-removal';
  className?: string;
  intensity?: 'subtle' | 'medium' | 'bold';
}

const AnimatedGradientMesh: React.FC<AnimatedGradientMeshProps> = ({
  variant = 'default',
  className = '',
  intensity = 'subtle'
}) => {
  const meshRef = useRef<HTMLDivElement>(null);
  const orb1Ref = useRef<HTMLDivElement>(null);
  const orb2Ref = useRef<HTMLDivElement>(null);
  const orb3Ref = useRef<HTMLDivElement>(null);
  const orb4Ref = useRef<HTMLDivElement>(null);

  const getGradientConfig = () => {
    const configs = {
      default: {
        orb1: 'bg-gradient-to-br from-indigo-400/20 via-purple-400/15 to-pink-400/10',
        orb2: 'bg-gradient-to-br from-blue-400/15 via-cyan-400/10 to-indigo-400/20',
        orb3: 'bg-gradient-to-br from-purple-400/10 via-pink-400/15 to-violet-400/20',
        orb4: 'bg-gradient-to-br from-cyan-400/20 via-blue-400/10 to-purple-400/15',
        base: 'from-slate-50/95 via-white/98 to-slate-100/90'
      },
      'background-removal': {
        orb1: 'bg-gradient-to-br from-red-400/20 via-orange-400/15 to-yellow-400/10',
        orb2: 'bg-gradient-to-br from-orange-400/15 via-red-400/10 to-pink-400/20',
        orb3: 'bg-gradient-to-br from-yellow-400/10 via-orange-400/15 to-red-400/20',
        orb4: 'bg-gradient-to-br from-pink-400/20 via-red-400/10 to-orange-400/15',
        base: 'from-red-50/85 via-orange-50/90 to-yellow-50/80'
      },
      enlarge: {
        orb1: 'bg-gradient-to-br from-blue-400/20 via-purple-400/15 to-indigo-400/10',
        orb2: 'bg-gradient-to-br from-purple-400/15 via-indigo-400/10 to-blue-400/20',
        orb3: 'bg-gradient-to-br from-indigo-400/10 via-blue-400/15 to-purple-400/20',
        orb4: 'bg-gradient-to-br from-violet-400/20 via-purple-400/10 to-blue-400/15',
        base: 'from-blue-50/85 via-purple-50/90 to-indigo-50/80'
      },
      upscale: {
        orb1: 'bg-gradient-to-br from-emerald-400/20 via-teal-400/15 to-cyan-400/10',
        orb2: 'bg-gradient-to-br from-teal-400/15 via-cyan-400/10 to-emerald-400/20',
        orb3: 'bg-gradient-to-br from-cyan-400/10 via-emerald-400/15 to-teal-400/20',
        orb4: 'bg-gradient-to-br from-green-400/20 via-teal-400/10 to-cyan-400/15',
        base: 'from-emerald-50/85 via-teal-50/90 to-cyan-50/80'
      },
      'object-removal': {
        orb1: 'bg-gradient-to-br from-violet-400/20 via-purple-400/15 to-fuchsia-400/10',
        orb2: 'bg-gradient-to-br from-purple-400/15 via-fuchsia-400/10 to-violet-400/20',
        orb3: 'bg-gradient-to-br from-fuchsia-400/10 via-violet-400/15 to-purple-400/20',
        orb4: 'bg-gradient-to-br from-pink-400/20 via-purple-400/10 to-violet-400/15',
        base: 'from-violet-50/85 via-purple-50/90 to-fuchsia-50/80'
      }
    };
    return configs[variant];
  };

  const getSizeClass = () => {
    const sizes = {
      subtle: { orb: 'w-96 h-96', blur: 'blur-3xl' },
      medium: { orb: 'w-[500px] h-[500px]', blur: 'blur-2xl' },
      bold: { orb: 'w-[600px] h-[600px]', blur: 'blur-xl' }
    };
    return sizes[intensity];
  };

  useEffect(() => {
    if (!meshRef.current || !orb1Ref.current || !orb2Ref.current || !orb3Ref.current || !orb4Ref.current) return;

    const tl = gsap.timeline({ repeat: -1 });

    // Subtle floating animations for each orb
    tl.to(orb1Ref.current, {
      x: 50,
      y: -30,
      rotation: 15,
      duration: 20,
      ease: "power1.inOut"
    })
    .to(orb2Ref.current, {
      x: -40,
      y: 60,
      rotation: -20,
      duration: 25,
      ease: "power1.inOut"
    }, 0)
    .to(orb3Ref.current, {
      x: 30,
      y: 40,
      rotation: 10,
      duration: 18,
      ease: "power1.inOut"
    }, 0)
    .to(orb4Ref.current, {
      x: -60,
      y: -20,
      rotation: -15,
      duration: 22,
      ease: "power1.inOut"
    }, 0);

    // Reverse animation
    tl.to(orb1Ref.current, {
      x: -30,
      y: 40,
      rotation: -10,
      duration: 18,
      ease: "power1.inOut"
    })
    .to(orb2Ref.current, {
      x: 50,
      y: -30,
      rotation: 25,
      duration: 20,
      ease: "power1.inOut"
    }, "-=18")
    .to(orb3Ref.current, {
      x: -40,
      y: -50,
      rotation: -20,
      duration: 24,
      ease: "power1.inOut"
    }, "-=18")
    .to(orb4Ref.current, {
      x: 40,
      y: 30,
      rotation: 18,
      duration: 19,
      ease: "power1.inOut"
    }, "-=18");

    return () => {
      tl.kill();
    };
  }, []);

  const config = getGradientConfig();
  const sizeClass = getSizeClass();

  return (
    <div 
      ref={meshRef}
      className={`fixed inset-0 -z-10 overflow-hidden pointer-events-none ${className}`}
      style={{ zIndex: -10 }}
    >
      {/* Base gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${config.base}`} />
      
      {/* Animated orbs */}
      <div
        ref={orb1Ref}
        className={`absolute top-1/4 left-1/4 ${sizeClass.orb} ${config.orb1} rounded-full ${sizeClass.blur} opacity-70`}
      />
      <div
        ref={orb2Ref}
        className={`absolute top-3/4 right-1/4 ${sizeClass.orb} ${config.orb2} rounded-full ${sizeClass.blur} opacity-60`}
      />
      <div
        ref={orb3Ref}
        className={`absolute top-1/2 left-1/2 ${sizeClass.orb} ${config.orb3} rounded-full ${sizeClass.blur} opacity-50`}
      />
      <div
        ref={orb4Ref}
        className={`absolute bottom-1/4 left-1/3 ${sizeClass.orb} ${config.orb4} rounded-full ${sizeClass.blur} opacity-40`}
      />
    </div>
  );
};

export default AnimatedGradientMesh;