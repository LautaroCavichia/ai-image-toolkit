// src/components/sections/Hero/Hero.tsx
import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRocket, faWandMagicSparkles, faArrowRight, faPlay, faTimes } from '@fortawesome/free-solid-svg-icons';
import Button from '../../shared/Button';
import './Hero.css';

interface HeroProps {
  onGetStarted?: () => void;
  onWatchDemo?: () => void;
}

const Hero: React.FC<HeroProps> = ({
  onGetStarted,
  onWatchDemo,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);
  const aiWordRef = useRef<HTMLSpanElement>(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Particle animation effect (io.net inspired)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Particle system
    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      opacity: number;
      color: string;

      constructor() {
        this.x = Math.random() * canvas!.width;
        this.y = Math.random() * canvas!.height;
        this.size = Math.random() * 2 + 1;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.speedY = (Math.random() - 0.5) * 0.5;
        this.opacity = Math.random() * 0.5 + 0.2;
        
        const colors = ['#8b5cf6', '#7c3aed', '#a78bfa', '#c4b5fd'];
        this.color = colors[Math.floor(Math.random() * colors.length)];
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        // Wrap around edges
        if (this.x > canvas!.width) this.x = 0;
        if (this.x < 0) this.x = canvas!.width;
        if (this.y > canvas!.height) this.y = 0;
        if (this.y < 0) this.y = canvas!.height;
      }

      draw() {
        ctx!.save();
        ctx!.globalAlpha = this.opacity;
        ctx!.fillStyle = this.color;
        ctx!.beginPath();
        ctx!.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx!.fill();
        ctx!.restore();
      }
    }

    // Create particles
    const particles: Particle[] = [];
    const particleCount = 50;

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach((particle) => {
        particle.update();
        particle.draw();
      });

      // Draw connections between nearby particles
      particles.forEach((particle, index) => {
        particles.slice(index + 1).forEach((otherParticle) => {
          const dx = particle.x - otherParticle.x;
          const dy = particle.y - otherParticle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 150) {
            ctx.save();
            ctx.globalAlpha = (150 - distance) / 150 * 0.1;
            ctx.strokeStyle = '#8b5cf6';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(otherParticle.x, otherParticle.y);
            ctx.stroke();
            ctx.restore();
          }
        });
      });

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  // GSAP animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Set initial states
      gsap.set([titleRef.current, subtitleRef.current, buttonsRef.current], {
        opacity: 0,
        y: 30,
      });

      // Entrance animation timeline
      const tl = gsap.timeline({ delay: 0.5 });
      
      tl.to(titleRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power2.out",
      })
      .to(subtitleRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: "power2.out",
      }, "-=0.4")
      .to(buttonsRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: "power2.out",
      }, "-=0.3");

      // Floating animations
      gsap.to(".hero-float-1", {
        y: 10,
        rotation: 5,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: "power1.inOut",
      });

      gsap.to(".hero-float-2", {
        y: -10,
        rotation: -5,
        duration: 4,
        repeat: -1,
        yoyo: true,
        ease: "power1.inOut",
      });

      // Scroll indicator
      gsap.to(".scroll-indicator", {
        opacity: 1,
        duration: 0.5,
        delay: 2,
        ease: "power2.out",
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  // Mouse tracking for AI gradient
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!aiWordRef.current) return;
      
      const rect = aiWordRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      
      setMousePosition({ x, y });
    };

    const aiWord = aiWordRef.current;
    if (aiWord) {
      aiWord.addEventListener('mousemove', handleMouseMove);
      return () => aiWord.removeEventListener('mousemove', handleMouseMove);
    }
  }, []);

  // Handle demo video
  const handleWatchDemo = () => {
    setShowVideoModal(true);
    if (onWatchDemo) onWatchDemo();
  };

  const closeVideoModal = () => {
    setShowVideoModal(false);
  };

  return (
    <section className="hero" id="home" ref={heroRef}>
      {/* Animated background canvas */}
      <canvas
        ref={canvasRef}
        className="hero-canvas"
        aria-hidden="true"
      />
      
      {/* Background gradient overlay */}
      <div className="hero-gradient" />
      
      <div className="hero-container">
        <div className="hero-content">
          {/* Main headline */}
          <div className="hero-headline">
            <h1 ref={titleRef} className="hero-title">
              TRANSFORM IMAGES WITH{' '}
              <span 
                ref={aiWordRef}
                className="ai-word"
                style={{
                  background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, 
                    #8b5cf6 0%, 
                    #3b82f6 25%, 
                    #10b981 50%, 
                    #f59e0b 75%, 
                    #ef4444 100%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                AI
              </span>{' '}
              MAGIC
            </h1>
          </div>

          {/* Subtitle */}
          <div className="hero-subtitle-container">
            <p ref={subtitleRef} className="hero-subtitle">
              Remove backgrounds, upscale images, and enlarge photos in seconds.
            </p>
          </div>

          {/* CTA Buttons */}
          <div ref={buttonsRef} className="hero-actions">
            <Button
              variant="gradient"
              size="xl"
              leftIcon={<FontAwesomeIcon icon={faRocket} />}
              onClick={onGetStarted}
              glow
              className="hero-cta-primary"
            >
              Get Started Free
            </Button>
            
            <Button
              variant="outline"
              size="xl"
              leftIcon={<FontAwesomeIcon icon={faPlay} />}
              onClick={handleWatchDemo}
              className="hero-cta-secondary"
            >
              Watch Demo
            </Button>
          </div>

          {/* Floating elements */}
          <div className="hero-float-1">
            <FontAwesomeIcon icon={faWandMagicSparkles} />
          </div>

          <div className="hero-float-2">
            <div className="float-orb" />
          </div>
        </div>

        {/* Scroll indicator */}
        <div 
          className="scroll-indicator" 
          style={{ opacity: 0 }}
          onClick={() => {
            const servicesSection = document.querySelector('#services');
            if (servicesSection) {
              servicesSection.scrollIntoView({ behavior: 'smooth' });
            }
          }}
        >
          <div className="scroll-line" />
          <span className="scroll-text">Scroll to explore</span>
        </div>
      </div>

      {/* Video Modal */}
      {showVideoModal && (
        <div className="video-modal-backdrop" onClick={closeVideoModal}>
          <div className="video-modal" onClick={(e) => e.stopPropagation()}>
            <button className="video-close-btn" onClick={closeVideoModal}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
            <div className="video-container">
              <video
                controls
                autoPlay
                className="demo-video"
                poster="/assets/video-thumbnail.jpg"
              >
                <source src="/assets/demo-video.mp4" type="video/mp4" />
                <source src="/assets/demo-video.webm" type="video/webm" />
                Your browser does not support the video tag.
              </video>
              <div className="video-placeholder">
                <div className="placeholder-content">
                  <FontAwesomeIcon icon={faPlay} className="placeholder-icon" />
                  <h3>Demo Video Coming Soon</h3>
                  <p>We're preparing an amazing demo video to showcase our AI-powered image processing capabilities.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Hero;