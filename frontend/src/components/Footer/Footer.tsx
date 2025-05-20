// src/components/Footer/Footer.tsx
import React from 'react';
import './Footer.css';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="footer">
      <div className="footer-content">
        <p className="footer-text">
          © {currentYear} PixelPerfect AI. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;