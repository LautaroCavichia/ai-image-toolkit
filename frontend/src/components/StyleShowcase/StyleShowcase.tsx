// src/components/StyleShowcase/StyleShowcase.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPalette, 
  faMagicWandSparkles, 
  faCoins,
  faCrown,
  faArrowRight
} from '@fortawesome/free-solid-svg-icons';
import './StyleShowcase.css';

const StyleShowcase: React.FC = () => {
  const showcaseStyles = [
    {
      id: 'ghibli',
      name: 'Studio Ghibli',
      description: 'Transform your photos into magical anime scenes',
      beforeImage: '/assets/demo/original1.jpg',
      afterImage: '/assets/demo/ghibli_result.jpg',
      category: 'Anime',
      popular: true
    },
    {
      id: 'van_gogh',
      name: 'Van Gogh',
      description: 'Apply the master\'s swirling brushstrokes',
      beforeImage: '/assets/demo/original2.jpg',
      afterImage: '/assets/demo/van_gogh_result.jpg',
      category: 'Fine Art',
      popular: true
    },
    {
      id: 'pixel',
      name: 'Pixel Art',
      description: 'Give your images a retro 8-bit makeover',
      beforeImage: '/assets/demo/original3.jpg',
      afterImage: '/assets/demo/pixel_result.jpg',
      category: 'Digital',
      popular: true
    },
    {
      id: '3d_chibi',
      name: '3D Chibi',
      description: 'Cute 3D character style transformation',
      beforeImage: '/assets/demo/original4.jpg',
      afterImage: '/assets/demo/chibi_result.jpg',
      category: 'Character',
      popular: false
    }
  ];

  const features = [
    {
      icon: faPalette,
      title: '22 Unique Styles',
      description: 'From classic fine art to modern digital styles'
    },
    {
      icon: faMagicWandSparkles,
      title: 'AI-Powered',
      description: 'Advanced neural networks for stunning results'
    },
    {
      icon: faCrown,
      title: 'Premium Quality',
      description: 'High-resolution outputs up to 1024x1024'
    }
  ];

  return (
    <section className="style-showcase-section" id="style-transfer">
      <div className="showcase-container">
        <motion.div 
          className="showcase-header"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="showcase-title">
            <FontAwesomeIcon icon={faPalette} />
            AI Style Transfer
          </h2>
          <p className="showcase-subtitle">
            Transform your images into stunning artwork with our AI-powered style transfer technology. 
            Choose from 22 unique artistic styles and watch your photos become masterpieces.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div 
          className="features-grid"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {features.map((feature, index) => (
            <div key={index} className="feature-item">
              <div className="feature-icon">
                <FontAwesomeIcon icon={feature.icon} />
              </div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </div>
          ))}
        </motion.div>

        {/* Style Examples */}
        <motion.div 
          className="style-examples"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h3 className="examples-title">See the Magic in Action</h3>
          <div className="examples-grid">
            {showcaseStyles.map((style, index) => (
              <motion.div
                key={style.id}
                className="style-example"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
              >
                <div className="example-header">
                  <h4 className="style-name">{style.name}</h4>
                  <span className="style-category">{style.category}</span>
                  {style.popular && (
                    <span className="popular-badge">
                      <FontAwesomeIcon icon={faMagicWandSparkles} />
                      Popular
                    </span>
                  )}
                </div>
                
                <div className="before-after-container">
                  <div className="image-comparison">
                    <div className="before-image">
                      <img src={style.beforeImage} alt="Original" />
                      <span className="image-label">Before</span>
                    </div>
                    <div className="arrow-separator">
                      <FontAwesomeIcon icon={faArrowRight} />
                    </div>
                    <div className="after-image">
                      <img src={style.afterImage} alt={`${style.name} style`} />
                      <span className="image-label">After</span>
                    </div>
                  </div>
                </div>
                
                <p className="style-description">{style.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Pricing Info */}
        <motion.div 
          className="pricing-info"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <h3 className="pricing-title">Simple, Transparent Pricing</h3>
          <div className="pricing-options">
            <div className="pricing-option">
              <h4>Standard Quality</h4>
              <div className="price">Free</div>
              <ul className="features-list">
                <li>512x512 resolution</li>
                <li>All 22 art styles</li>
                <li>Fast processing</li>
              </ul>
            </div>
            <div className="pricing-option premium">
              <h4>Premium Quality</h4>
              <div className="price">
                <FontAwesomeIcon icon={faCoins} />
                2 Tokens
              </div>
              <ul className="features-list">
                <li>1024x1024 resolution</li>
                <li>Enhanced detail processing</li>
                <li>Higher quality results</li>
                <li>Advanced AI model</li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div 
          className="showcase-cta"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <h3>Ready to Transform Your Images?</h3>
          <p>Upload your photo and choose from 22 stunning artistic styles</p>
          <motion.button 
            className="cta-button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              document.getElementById('home')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            <FontAwesomeIcon icon={faPalette} />
            Try Style Transfer Now
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default StyleShowcase;