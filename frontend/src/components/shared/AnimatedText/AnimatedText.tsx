// src/components/shared/AnimatedText/AnimatedText.tsx
import React, { JSX, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import './AnimatedText.css';

export type AnimationType = 'fadeInUp' | 'typewriter' | 'gradient' | 'reveal' | 'wave';

export interface AnimatedTextProps {
  children: string;
  animation?: AnimationType;
  delay?: number;
  duration?: number;
  className?: string;
  as?: keyof JSX.IntrinsicElements | React.ComponentType<any>;
  stagger?: number;
  repeat?: boolean;
  gradient?: boolean;
  autoplay?: boolean;
}

const AnimatedText: React.FC<AnimatedTextProps> = ({
  children,
  animation = 'fadeInUp',
  delay = 0,
  duration = 0.8,
  className = '',
  as = 'div',
  stagger = 0.05,
  repeat = false,
  gradient = false,
  autoplay = false,
}) => {
  const Component = as as any;
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  // Typewriter effect
  useEffect(() => {
    if (animation === 'typewriter') {
      const timer = setTimeout(() => {
        if (currentIndex < children.length) {
          setDisplayText(children.slice(0, currentIndex + 1));
          setCurrentIndex(currentIndex + 1);
        }
      }, delay + (currentIndex * 100));

      return () => clearTimeout(timer);
    }
  }, [currentIndex, children, animation, delay]);

  const getWords = () => children.split(' ');
  const getChars = () => children.split('');

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: stagger,
        delayChildren: delay,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: duration,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  const revealVariants = {
    hidden: { opacity: 0, rotateX: 90 },
    visible: {
      opacity: 1,
      rotateX: 0,
      transition: {
        duration: duration,
        ease: 'easeOut',
      },
    },
  };

  const waveVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: delay + (i * stagger),
        duration: duration,
        ease: 'easeOut',
        repeat: repeat ? Infinity : 0,
        repeatType: 'reverse' as const,
        repeatDelay: 2,
      },
    }),
  };

  const baseClasses = [
    'animated-text',
    `animated-text-${animation}`,
    gradient && 'text-gradient',
    className
  ].filter(Boolean).join(' ');

  if (animation === 'typewriter') {
    return (
      <Component className={baseClasses}>
        {displayText}
        <span className="typewriter-cursor">|</span>
      </Component>
    );
  }

  if (animation === 'gradient') {
    return (
      <Component className={`${baseClasses} animate-gradient-text`}>
        {children}
      </Component>
    );
  }

  if (animation === 'reveal') {
    return (
      <Component className={baseClasses}>
        <motion.div
          className="text-reveal"
          initial="hidden"
          animate={autoplay ? "visible" : undefined}
          whileInView={autoplay ? undefined : "visible"}
          viewport={autoplay ? undefined : { once: !repeat }}
        >
          <motion.div
            className="text-reveal-inner"
            variants={revealVariants as any}
          >
            {children}
          </motion.div>
        </motion.div>
      </Component>
    );
  }

  if (animation === 'wave') {
    return (
      <Component className={baseClasses}>
        <motion.div
          className="text-wave"
          initial="hidden"
          animate={autoplay ? "visible" : undefined}
          whileInView={autoplay ? undefined : "visible"}
          viewport={autoplay ? undefined : { once: !repeat }}
        >
          {getChars().map((char, i) => (
            <motion.span
              key={i}
              custom={i}
              variants={waveVariants as any}
              style={{ display: 'inline-block' }}
            >
              {char === ' ' ? '\u00A0' : char}
            </motion.span>
          ))}
        </motion.div>
      </Component>
    );
  }

  // Default fadeInUp animation
  return (
    <Component className={baseClasses}>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate={autoplay ? "visible" : undefined}
        whileInView={autoplay ? undefined : "visible"}
        viewport={autoplay ? undefined : { once: !repeat }}
      >
        {getWords().map((word, i) => (
          <motion.span
            key={i}
            variants={itemVariants as any}
            style={{ display: 'inline-block', marginRight: '0.25em' }}
          >
            {word}
          </motion.span>
        ))}
      </motion.div>
    </Component>
  );
};

export default AnimatedText;