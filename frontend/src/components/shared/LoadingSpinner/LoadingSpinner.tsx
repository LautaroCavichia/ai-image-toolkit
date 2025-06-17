import React from 'react';
import './LoadingSpinner.css';

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color,
  className = '',
}) => {
  const baseClasses = [
    'loading-spinner',
    `spinner-${size}`,
    className
  ].filter(Boolean).join(' ');

  return (
    <div 
      className={baseClasses}
      style={{ color }}
      role="status"
      aria-label="Loading"
    >
      <div className="spinner-circle" />
    </div>
  );
};

export default LoadingSpinner;