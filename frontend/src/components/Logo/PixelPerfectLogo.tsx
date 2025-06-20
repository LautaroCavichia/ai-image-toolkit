// PixelPerfectLogo.tsx
import React from 'react';
import './PixelPerfectLogo.css';

interface PixelPerfectLogoProps {
  size?: number;
  animated?: boolean; // ignored
  glowOnHover?: boolean; // ignored
  className?: string;
}

const PixelPerfectLogo: React.FC<PixelPerfectLogoProps> = ({
  size = 300,
  className = ''
}) => {
  return (
    <div className={`logo-container ${className}`}>
      <svg
        className="pixel-perfect-logo"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 500 500"
        width={size}
        height={size}
      >
        <path d="M 158.856 149.546 L 158.284 216.617 L 277.714 147.274 L 278.285 217.185 L 100 318.925 L 100.572 178.533 L 158.856 149.546 Z" />
        <path d="M 100.572 109.759 L 158.856 144.999 L 277.142 77.36 L 341.144 111.465 L 339.428 248.444 L 282.858 281.412 C 282.858 281.412 337.716 319.493 338.285 319.493 C 338.855 319.493 400 283.684 400 283.684 L 400 77.36 L 278.285 8.586 L 100.572 109.759 Z" />
        <path d="M 277.142 283.684 L 219.999 316.084 L 221.143 385.426 L 161.143 421.234 L 160 349.048 L 101.141 384.858 L 101.713 454.2 L 158.284 488.305 L 280.573 420.097 L 277.142 283.684 Z" />
      </svg>
    </div>
  );
};

export default PixelPerfectLogo;
