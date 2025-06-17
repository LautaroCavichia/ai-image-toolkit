// src/components/shared/Card/Card.tsx
import React from 'react';
import { motion } from 'framer-motion';
import './Card.css';

export type CardVariant = 'default' | 'elevated' | 'outline' | 'glass' | 'gradient';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg' | 'xl';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: CardPadding;
  hover?: boolean;
  glow?: boolean;
  animate?: boolean;
  borderGradient?: boolean;
}

const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  hover = true,
  glow = false,
  animate = true,
  borderGradient = false,
  className = '',
  ...props
}) => {
  const baseClasses = [
    'card',
    `card-${variant}`,
    `card-padding-${padding}`,
    hover && 'card-hover',
    glow && 'card-glow',
    borderGradient && 'card-border-gradient',
    className
  ].filter(Boolean).join(' ');

  const motionProps = animate ? {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-50px' },
    transition: { duration: 0.6, ease: 'easeOut' },
    whileHover: hover ? { y: -4, scale: 1.02 } : undefined,
  } : {};

  return (
    <motion.div
      className={baseClasses}
      {...motionProps as React.ComponentPropsWithoutRef<typeof motion.div>}
      {...props as React.ComponentPropsWithoutRef<typeof motion.div>}
    >
      {borderGradient && <div className="card-border-gradient-bg" />}
      <div className="card-content">
        {children}
      </div>
    </motion.div>
  );
};

// Sub-components for better organization
export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...props
}) => (
  <div className={`card-header ${className}`} {...props}>
    {children}
  </div>
);

export const CardBody: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...props
}) => (
  <div className={`card-body ${className}`} {...props}>
    {children}
  </div>
);

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...props
}) => (
  <div className={`card-footer ${className}`} {...props}>
    {children}
  </div>
);

export default Card;