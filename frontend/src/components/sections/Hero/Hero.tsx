// src/components/sections/Hero/Hero.tsx
import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRocket, faWandMagicSparkles, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import Button from '../../shared/Button';
import AnimatedText from '../../shared/AnimatedText/AnimatedText';
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

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  return (
    <section className="hero" id="home">
      {/* Animated background canvas */}
      <canvas
        ref={canvasRef}
        className="hero-canvas"
        aria-hidden="true"
      />
      
      {/* Background gradient overlay */}
      <div className="hero-gradient" />
      
      <div className="hero-container">
        <motion.div
          className="hero-content"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Main headline */}
          <motion.div variants={itemVariants as any} className="hero-headline">
            <AnimatedText
              as="h1"
              className="hero-title"
              animation="fadeInUp"
              delay={0.1}
              autoplay={true}
            >
              TRANSFORM IMAGES WITH AI MAGIC
            </AnimatedText>
          </motion.div>

          {/* Subtitle */}
          <motion.div variants={itemVariants as any} className="hero-subtitle-container">
            <AnimatedText
              as="p"
              className="hero-subtitle"
              animation="fadeInUp"
              delay={0}
              autoplay={true}
            > 
              Remove backgrounds, upscale images, and enlarge photos in seconds.
            </AnimatedText>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div variants={itemVariants as any} className="hero-actions">
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
              rightIcon={<FontAwesomeIcon icon={faArrowRight} />}
              onClick={onWatchDemo}
              className="hero-cta-secondary"
            >
              Watch Demo
            </Button>
          </motion.div>

    

          {/* Floating elements */}
          <motion.div
            className="hero-float-1"
            animate={{
              y: [-10, 10, -10],
              rotate: [0, 5, 0],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <FontAwesomeIcon icon={faWandMagicSparkles} />
          </motion.div>

          <motion.div
            className="hero-float-2"
            animate={{
              y: [10, -10, 10],
              rotate: [0, -5, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <div className="float-orb" />
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="scroll-indicator"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
        >
          <div className="scroll-line" />
          <span className="scroll-text">Scroll to explore</span>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;