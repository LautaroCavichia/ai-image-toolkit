import React from 'react';

const Logo: React.FC = () => {
  return (
    <svg 
      width="32" 
      height="32" 
      viewBox="0 0 64 64" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className="logo-svg"
    >
      <path 
        d="M32 58C45.2548 58 56 47.2548 56 34C56 20.7452 45.2548 10 32 10C18.7452 10 8 20.7452 8 34C8 42.9463 13.0571 50.6416 20 54.5" 
        stroke="currentColor" 
        strokeWidth="8" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <path 
        d="M32 46C38.6274 46 44 40.6274 44 34C44 27.3726 38.6274 22 32 22C25.3726 22 20 27.3726 20 34C20 38.2503 22.4063 41.9211 26 44" 
        stroke="currentColor" 
        strokeWidth="8" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default Logo;