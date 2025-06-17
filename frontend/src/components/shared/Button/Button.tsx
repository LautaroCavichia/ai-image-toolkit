// src/components/shared/Button/Button.tsx
import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import './Button.css';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'gradient';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  glow?: boolean;
  animate?: boolean;
  href?: string;
  target?: string;
  rel?: string;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  glow = false,
  animate = true,
  className = '',
  disabled,
  href,
  target,
  rel,
  onClick,
  ...props
}, ref) => {
  const baseClasses = [
    'btn',
    `btn-${variant}`,
    `btn-${size}`,
    fullWidth && 'btn-full-width',
    glow && 'btn-glow',
    isLoading && 'btn-loading',
    disabled && 'btn-disabled',
    className
  ].filter(Boolean).join(' ');

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || isLoading) {
      e.preventDefault();
      return;
    }
    onClick?.(e);
  };

  const buttonContent = (
    <>
      {isLoading && (
        <span className="btn-spinner">
          <div className="spinner" />
        </span>
      )}
      {leftIcon && !isLoading && (
        <span className="btn-icon btn-icon-left">
          {leftIcon}
        </span>
      )}
      <span className="btn-text">
        {children}
      </span>
      {rightIcon && !isLoading && (
        <span className="btn-icon btn-icon-right">
          {rightIcon}
        </span>
      )}
    </>
  );

  // If href is provided, render as link that looks like button
  if (href) {
    return (
      <motion.a
        href={href}
        target={target}
        rel={rel}
        className={baseClasses}
        whileHover={animate ? { scale: 1.02 } : undefined}
        whileTap={animate ? { scale: 0.98 } : undefined}
        transition={{ duration: 0.15 }}
      >
        {buttonContent}
      </motion.a>
    );
  }

  return (
    <motion.button
      ref={ref}
      className={baseClasses}
      disabled={disabled || isLoading}
      onClick={handleClick}
      whileHover={animate ? { scale: 1.02 } : undefined}
      whileTap={animate ? { scale: 0.98 } : undefined}
      transition={{ duration: 0.15 }}
      {...(props as React.ComponentPropsWithoutRef<typeof motion.button>)}
    >
      {buttonContent}
    </motion.button>
  );
});

Button.displayName = 'Button';

export default Button;