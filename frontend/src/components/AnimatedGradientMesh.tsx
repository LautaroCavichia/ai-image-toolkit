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
  const worm1Ref = useRef<HTMLDivElement>(null);
  const worm2Ref = useRef<HTMLDivElement>(null);
  const worm3Ref = useRef<HTMLDivElement>(null);
  const pill1Ref = useRef<HTMLDivElement>(null);
  const pill2Ref = useRef<HTMLDivElement>(null);
  const blob1Ref = useRef<HTMLDivElement>(null);
  const blob2Ref = useRef<HTMLDivElement>(null);

  const getGradientConfig = () => {
    const configs = {
      default: {
        orb1: 'bg-gradient-to-br from-indigo-400/20 via-purple-400/15 to-pink-400/10',
        orb2: 'bg-gradient-to-br from-blue-400/15 via-cyan-400/10 to-indigo-400/20',
        orb3: 'bg-gradient-to-br from-purple-400/10 via-pink-400/15 to-violet-400/20',
        orb4: 'bg-gradient-to-br from-cyan-400/20 via-blue-400/10 to-purple-400/15',
        worm1: 'bg-gradient-to-r from-indigo-300/25 via-purple-300/20 to-pink-300/15',
        worm2: 'bg-gradient-to-l from-blue-300/20 via-cyan-300/15 to-indigo-300/25',
        worm3: 'bg-gradient-to-r from-purple-300/15 via-violet-300/20 to-indigo-300/25',
        pill1: 'bg-gradient-to-br from-pink-300/30 to-purple-300/20',
        pill2: 'bg-gradient-to-tl from-cyan-300/25 to-blue-300/20',
        blob1: 'bg-gradient-radial from-indigo-300/20 via-purple-300/15 to-transparent',
        blob2: 'bg-gradient-radial from-pink-300/20 via-violet-300/15 to-transparent',
        base: 'from-slate-50/95 via-white/98 to-slate-100/90'
      },
      'background-removal': {
        orb1: 'bg-gradient-to-br from-red-400/20 via-orange-400/15 to-yellow-400/10',
        orb2: 'bg-gradient-to-br from-orange-400/15 via-red-400/10 to-pink-400/20',
        orb3: 'bg-gradient-to-br from-yellow-400/10 via-orange-400/15 to-red-400/20',
        orb4: 'bg-gradient-to-br from-pink-400/20 via-red-400/10 to-orange-400/15',
        worm1: 'bg-gradient-to-r from-red-300/25 via-orange-300/20 to-yellow-300/15',
        worm2: 'bg-gradient-to-l from-orange-300/20 via-red-300/15 to-pink-300/25',
        worm3: 'bg-gradient-to-r from-yellow-300/15 via-orange-300/20 to-red-300/25',
        pill1: 'bg-gradient-to-br from-orange-300/30 to-red-300/20',
        pill2: 'bg-gradient-to-tl from-yellow-300/25 to-orange-300/20',
        blob1: 'bg-gradient-radial from-red-300/20 via-orange-300/15 to-transparent',
        blob2: 'bg-gradient-radial from-yellow-300/20 via-orange-300/15 to-transparent',
        base: 'from-red-50/85 via-orange-50/90 to-yellow-50/80'
      },
      enlarge: {
        orb1: 'bg-gradient-to-br from-blue-400/20 via-purple-400/15 to-indigo-400/10',
        orb2: 'bg-gradient-to-br from-purple-400/15 via-indigo-400/10 to-blue-400/20',
        orb3: 'bg-gradient-to-br from-indigo-400/10 via-blue-400/15 to-purple-400/20',
        orb4: 'bg-gradient-to-br from-violet-400/20 via-purple-400/10 to-blue-400/15',
        worm1: 'bg-gradient-to-r from-blue-300/25 via-purple-300/20 to-indigo-300/15',
        worm2: 'bg-gradient-to-l from-purple-300/20 via-indigo-300/15 to-blue-300/25',
        worm3: 'bg-gradient-to-r from-indigo-300/15 via-violet-300/20 to-purple-300/25',
        pill1: 'bg-gradient-to-br from-purple-300/30 to-blue-300/20',
        pill2: 'bg-gradient-to-tl from-indigo-300/25 to-violet-300/20',
        blob1: 'bg-gradient-radial from-blue-300/20 via-purple-300/15 to-transparent',
        blob2: 'bg-gradient-radial from-indigo-300/20 via-violet-300/15 to-transparent',
        base: 'from-blue-50/85 via-purple-50/90 to-indigo-50/80'
      },
      upscale: {
        orb1: 'bg-gradient-to-br from-emerald-400/20 via-teal-400/15 to-cyan-400/10',
        orb2: 'bg-gradient-to-br from-teal-400/15 via-cyan-400/10 to-emerald-400/20',
        orb3: 'bg-gradient-to-br from-cyan-400/10 via-emerald-400/15 to-teal-400/20',
        orb4: 'bg-gradient-to-br from-green-400/20 via-teal-400/10 to-cyan-400/15',
        worm1: 'bg-gradient-to-r from-emerald-300/25 via-teal-300/20 to-cyan-300/15',
        worm2: 'bg-gradient-to-l from-teal-300/20 via-cyan-300/15 to-emerald-300/25',
        worm3: 'bg-gradient-to-r from-cyan-300/15 via-emerald-300/20 to-teal-300/25',
        pill1: 'bg-gradient-to-br from-teal-300/30 to-emerald-300/20',
        pill2: 'bg-gradient-to-tl from-cyan-300/25 to-teal-300/20',
        blob1: 'bg-gradient-radial from-emerald-300/20 via-teal-300/15 to-transparent',
        blob2: 'bg-gradient-radial from-cyan-300/20 via-emerald-300/15 to-transparent',
        base: 'from-emerald-50/85 via-teal-50/90 to-cyan-50/80'
      },
      'object-removal': {
        orb1: 'bg-gradient-to-br from-violet-400/20 via-purple-400/15 to-fuchsia-400/10',
        orb2: 'bg-gradient-to-br from-purple-400/15 via-fuchsia-400/10 to-violet-400/20',
        orb3: 'bg-gradient-to-br from-fuchsia-400/10 via-violet-400/15 to-purple-400/20',
        orb4: 'bg-gradient-to-br from-pink-400/20 via-purple-400/10 to-violet-400/15',
        worm1: 'bg-gradient-to-r from-violet-300/25 via-purple-300/20 to-fuchsia-300/15',
        worm2: 'bg-gradient-to-l from-purple-300/20 via-fuchsia-300/15 to-violet-300/25',
        worm3: 'bg-gradient-to-r from-fuchsia-300/15 via-pink-300/20 to-purple-300/25',
        pill1: 'bg-gradient-to-br from-purple-300/30 to-violet-300/20',
        pill2: 'bg-gradient-to-tl from-fuchsia-300/25 to-pink-300/20',
        blob1: 'bg-gradient-radial from-violet-300/20 via-purple-300/15 to-transparent',
        blob2: 'bg-gradient-radial from-fuchsia-300/20 via-pink-300/15 to-transparent',
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
    if (!meshRef.current) return;

    const elements = [
      orb1Ref.current, orb2Ref.current, orb3Ref.current, orb4Ref.current,
      worm1Ref.current, worm2Ref.current, worm3Ref.current,
      pill1Ref.current, pill2Ref.current,
      blob1Ref.current, blob2Ref.current
    ].filter(Boolean);

    if (elements.length === 0) return;

    const tl = gsap.timeline({ repeat: -1 });

    // Main orbs floating animation
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

    // Worm morphing animations
    tl.to(worm1Ref.current, {
      scaleX: 1.3,
      scaleY: 0.8,
      x: 80,
      y: -40,
      rotation: 25,
      borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%",
      duration: 15,
      ease: "power2.inOut"
    }, 0)
    .to(worm2Ref.current, {
      scaleX: 0.9,
      scaleY: 1.4,
      x: -70,
      y: 50,
      rotation: -30,
      borderRadius: "30% 60% 70% 40% / 50% 60% 40% 50%",
      duration: 18,
      ease: "power2.inOut"
    }, 2)
    .to(worm3Ref.current, {
      scaleX: 1.2,
      scaleY: 1.1,
      x: 60,
      y: 30,
      rotation: 45,
      borderRadius: "40% 60% 60% 40% / 70% 40% 60% 30%",
      duration: 16,
      ease: "power2.inOut"
    }, 4);

    // Pill animations with 3D effect
    tl.to(pill1Ref.current, {
      x: 90,
      y: -50,
      rotationX: 15,
      rotationY: 20,
      scale: 1.2,
      duration: 20,
      ease: "power1.inOut"
    }, 0)
    .to(pill2Ref.current, {
      x: -80,
      y: 70,
      rotationX: -10,
      rotationY: -25,
      scale: 0.9,
      duration: 17,
      ease: "power1.inOut"
    }, 3);

    // Blob pulsing animations
    tl.to(blob1Ref.current, {
      scale: 1.3,
      opacity: 0.8,
      x: 40,
      y: -30,
      duration: 12,
      ease: "power2.inOut"
    }, 0)
    .to(blob2Ref.current, {
      scale: 0.7,
      opacity: 0.6,
      x: -50,
      y: 40,
      duration: 14,
      ease: "power2.inOut"
    }, 5);

    // Reverse animations
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
    .to(worm1Ref.current, {
      scaleX: 0.8,
      scaleY: 1.2,
      x: -60,
      y: 30,
      rotation: -20,
      borderRadius: "50% 50% 50% 50% / 50% 50% 50% 50%",
      duration: 16,
      ease: "power2.inOut"
    }, "-=15")
    .to(pill1Ref.current, {
      x: -70,
      y: 40,
      rotationX: -20,
      rotationY: -15,
      scale: 0.8,
      duration: 19,
      ease: "power1.inOut"
    }, "-=18")
    .to(blob1Ref.current, {
      scale: 0.9,
      opacity: 0.5,
      x: -30,
      y: 20,
      duration: 13,
      ease: "power2.inOut"
    }, "-=15");

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
      style={{ perspective: '1000px' }}
    >
      {/* Base gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${config.base}`} />
      
      {/* Main animated orbs */}
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

      {/* 3D Gradient Worms */}
      <div
        ref={worm1Ref}
        className={`absolute top-[20%] right-[15%] w-80 h-24 ${config.worm1} blur-2xl opacity-30`}
        style={{
          borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
          transform: 'rotate(-15deg)'
        }}
      />
      <div
        ref={worm2Ref}
        className={`absolute bottom-[30%] left-[10%] w-72 h-32 ${config.worm2} blur-2xl opacity-25`}
        style={{
          borderRadius: '40% 60% 60% 40% / 50% 50% 50% 50%',
          transform: 'rotate(20deg)'
        }}
      />
      <div
        ref={worm3Ref}
        className={`absolute top-[60%] right-[40%] w-64 h-28 ${config.worm3} blur-xl opacity-35`}
        style={{
          borderRadius: '60% 40% 30% 70% / 40% 60% 50% 50%',
          transform: 'rotate(45deg)'
        }}
      />

      {/* 3D Pills */}
      <div
        ref={pill1Ref}
        className={`absolute top-[35%] left-[60%] w-48 h-16 ${config.pill1} blur-xl opacity-40`}
        style={{
          borderRadius: '50px',
          transform: 'rotateX(15deg) rotateY(10deg) rotate(-30deg)'
        }}
      />
      <div
        ref={pill2Ref}
        className={`absolute bottom-[45%] right-[25%] w-56 h-20 ${config.pill2} blur-xl opacity-35`}
        style={{
          borderRadius: '50px',
          transform: 'rotateX(-10deg) rotateY(-15deg) rotate(25deg)'
        }}
      />

      {/* Morphing Blobs */}
      <div
        ref={blob1Ref}
        className={`absolute top-[15%] left-[45%] w-60 h-60 ${config.blob1} blur-3xl opacity-20`}
        style={{
          borderRadius: '63% 37% 54% 46% / 55% 48% 52% 45%'
        }}
      />
      <div
        ref={blob2Ref}
        className={`absolute bottom-[20%] right-[35%] w-52 h-52 ${config.blob2} blur-3xl opacity-25`}
        style={{
          borderRadius: '38% 62% 63% 37% / 70% 33% 67% 30%'
        }}
      />
    </div>
  );
};

export default AnimatedGradientMesh;