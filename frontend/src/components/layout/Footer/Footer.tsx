// src/components/layout/Footer/Footer.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTwitter, 
  faGithub, 
  faLinkedin,
  faDiscord
} from '@fortawesome/free-brands-svg-icons';
import { 
  faEnvelope,
  faArrowUp
} from '@fortawesome/free-solid-svg-icons';
import Button from '../../shared/Button';
import './Footer.css';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  const footerLinks = {
    product: [
      { label: 'Features', href: '#features' },
      { label: 'API', href: '#api' },
      { label: 'Pricing', href: '#pricing' },
      { label: 'Documentation', href: '#docs' },
    ],
    company: [
      { label: 'About', href: '#about' },
      { label: 'Blog', href: '#blog' },
      { label: 'Careers', href: '#careers' },
      { label: 'Contact', href: '#contact' },
    ],
    resources: [
      { label: 'Help Center', href: '#help' },
      { label: 'Community', href: '#community' },
      { label: 'Status', href: '#status' },
      { label: 'Changelog', href: '#changelog' },
    ],
    legal: [
      { label: 'Privacy Policy', href: '#privacy' },
      { label: 'Terms of Service', href: '#terms' },
      { label: 'Cookie Policy', href: '#cookies' },
      { label: 'GDPR', href: '#gdpr' },
    ],
  };

  const socialLinks = [
    { icon: faTwitter, href: '#', label: 'Twitter' },
    { icon: faGithub, href: '#', label: 'GitHub' },
    { icon: faLinkedin, href: '#', label: 'LinkedIn' },
    { icon: faDiscord, href: '#', label: 'Discord' },
  ];

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLinkClick = (href: string) => {
    if (href.startsWith('#')) {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Main footer content */}
        <div className="footer-main">
          {/* Brand section */}
          <div className="footer-brand">
            <motion.div 
              className="footer-logo"
              whileHover={{ scale: 1.05 }}
            >
              <div className="logo-icon">
                <div className="logo-gradient" />
              </div>
              <span className="logo-text">PIXELPERFECT</span>
            </motion.div>
            
            <p className="footer-description">
              Transform your images with cutting-edge AI technology. 
              Professional-grade image processing made simple and accessible.
            </p>
            
            <div className="footer-social">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  className="social-link"
                  aria-label={social.label}
                  whileHover={{ y: -2, scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FontAwesomeIcon icon={social.icon} />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Links grid */}
          <div className="footer-links">
            <div className="link-column">
              <h3 className="link-column-title">Product</h3>
              <ul className="link-list">
                {footerLinks.product.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="footer-link"
                      onClick={(e) => {
                        e.preventDefault();
                        handleLinkClick(link.href);
                      }}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="link-column">
              <h3 className="link-column-title">Company</h3>
              <ul className="link-list">
                {footerLinks.company.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="footer-link"
                      onClick={(e) => {
                        e.preventDefault();
                        handleLinkClick(link.href);
                      }}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="link-column">
              <h3 className="link-column-title">Resources</h3>
              <ul className="link-list">
                {footerLinks.resources.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="footer-link"
                      onClick={(e) => {
                        e.preventDefault();
                        handleLinkClick(link.href);
                      }}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="link-column">
              <h3 className="link-column-title">Legal</h3>
              <ul className="link-list">
                {footerLinks.legal.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="footer-link"
                      onClick={(e) => {
                        e.preventDefault();
                        handleLinkClick(link.href);
                      }}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Newsletter signup */}
          <div className="footer-newsletter">
            <h3 className="newsletter-title">Stay Updated</h3>
            <p className="newsletter-description">
              Get the latest updates and features delivered to your inbox.
            </p>
            <div className="newsletter-form">
              <input
                type="email"
                placeholder="Enter your email"
                className="newsletter-input"
                aria-label="Email address"
              />
              <Button
                variant="primary"
                size="md"
                rightIcon={<FontAwesomeIcon icon={faEnvelope} />}
              >
                Subscribe
              </Button>
            </div>
          </div>
        </div>

        {/* Footer bottom */}
        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <p className="copyright">
              © {currentYear} PixelPerfect AI. All rights reserved.
            </p>
            
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<FontAwesomeIcon icon={faArrowUp} />}
              onClick={scrollToTop}
              className="back-to-top"
            >
              Back to top
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;