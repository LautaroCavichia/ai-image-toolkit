// src/components/ApiSection/ApiSection.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCode, 
  faServer, 
  faShield, 
  faRocket,
  faCheck
} from '@fortawesome/free-solid-svg-icons';
import './ApiSection.css';

const ApiSection: React.FC = () => {
  return (
    <section className="api-section section">
      <div className="section-container">
        <motion.h2 
          className="section-title"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          PixelPerfect API
        </motion.h2>
        
        <motion.p 
          className="section-subtitle"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Integrate our powerful image processing capabilities directly into your applications with our easy-to-use API
        </motion.p>
        
        <motion.div 
          className="api-features"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="api-feature-card">
            <div className="api-feature-icon">
              <FontAwesomeIcon icon={faCode} />
            </div>
            <h3 className="api-feature-title">Simple Integration</h3>
            <p className="api-feature-description">
              Our RESTful API is designed to be easy to integrate with any platform or programming language.
              Get started with just a few lines of code.
            </p>
          </div>
          
          <div className="api-feature-card">
            <div className="api-feature-icon">
              <FontAwesomeIcon icon={faServer} />
            </div>
            <h3 className="api-feature-title">Scalable Infrastructure</h3>
            <p className="api-feature-description">
              Built on a modern cloud infrastructure, our API can handle millions of requests per day with
              high availability and low latency.
            </p>
          </div>
          
          <div className="api-feature-card">
            <div className="api-feature-icon">
              <FontAwesomeIcon icon={faShield} />
            </div>
            <h3 className="api-feature-title">Secure & Compliant</h3>
            <p className="api-feature-description">
              Your data is secure with enterprise-grade encryption, GDPR compliance, and optional
              data retention policies to meet your requirements.
            </p>
          </div>
          
          <div className="api-feature-card">
            <div className="api-feature-icon">
              <FontAwesomeIcon icon={faRocket} />
            </div>
            <h3 className="api-feature-title">Boost Your Workflow</h3>
            <p className="api-feature-description">
              Automate image processing and enhance your user experience with our AI-powered tools.
              Focus on your core business while we handle the complexity.
            </p>
          </div>
        </motion.div>
        
        <motion.div 
          className="api-code-example"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="api-code-box">
            <div className="api-code-title">Example: Background Removal API Request</div>
            <pre className="api-code-content">
{`// Making a request with fetch API
fetch('https://api.pixelperfect.ai/v1/remove-bg', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    image_url: 'https://example.com/image.jpg',
    size: 'auto',
    format: 'png',
    quality: 'hd'
  })
})
.then(response => response.json())
.then(data => console.log(data.result_url))
.catch(error => console.error('Error:', error));`}
            </pre>
          </div>
        </motion.div>
        
        <motion.h3 
          className="section-title"
          style={{ fontSize: '2rem', marginTop: '4rem' }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          API Pricing Plans
        </motion.h3>
        
        <motion.div 
          className="api-pricing"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <div className="pricing-card">
            <h3 className="pricing-title">Developer</h3>
            <div className="pricing-price">$29</div>
            <div className="pricing-period">per month</div>
            <ul className="pricing-features">
              <li className="pricing-feature">
                <FontAwesomeIcon icon={faCheck} className="pricing-feature-icon" />
                <span>500 API requests/month</span>
              </li>
              <li className="pricing-feature">
                <FontAwesomeIcon icon={faCheck} className="pricing-feature-icon" />
                <span>Standard resolution</span>
              </li>
              <li className="pricing-feature">
                <FontAwesomeIcon icon={faCheck} className="pricing-feature-icon" />
                <span>Email support</span>
              </li>
              <li className="pricing-feature">
                <FontAwesomeIcon icon={faCheck} className="pricing-feature-icon" />
                <span>API documentation</span>
              </li>
            </ul>
            <a href="#contact" className="pricing-cta">Get Started</a>
          </div>
          
          <div className="pricing-card featured">
            <h3 className="pricing-title">Business</h3>
            <div className="pricing-price">$99</div>
            <div className="pricing-period">per month</div>
            <ul className="pricing-features">
              <li className="pricing-feature">
                <FontAwesomeIcon icon={faCheck} className="pricing-feature-icon" />
                <span>3,000 API requests/month</span>
              </li>
              <li className="pricing-feature">
                <FontAwesomeIcon icon={faCheck} className="pricing-feature-icon" />
                <span>HD resolution</span>
              </li>
              <li className="pricing-feature">
                <FontAwesomeIcon icon={faCheck} className="pricing-feature-icon" />
                <span>Priority support</span>
              </li>
              <li className="pricing-feature">
                <FontAwesomeIcon icon={faCheck} className="pricing-feature-icon" />
                <span>Advanced analytics</span>
              </li>
              <li className="pricing-feature">
                <FontAwesomeIcon icon={faCheck} className="pricing-feature-icon" />
                <span>Custom webhook integration</span>
              </li>
            </ul>
            <a href="#contact" className="pricing-cta">Get Started</a>
          </div>
          
          <div className="pricing-card">
            <h3 className="pricing-title">Enterprise</h3>
            <div className="pricing-price">Custom</div>
            <div className="pricing-period">tailored for you</div>
            <ul className="pricing-features">
              <li className="pricing-feature">
                <FontAwesomeIcon icon={faCheck} className="pricing-feature-icon" />
                <span>Unlimited API requests</span>
              </li>
              <li className="pricing-feature">
                <FontAwesomeIcon icon={faCheck} className="pricing-feature-icon" />
                <span>Ultra HD resolution</span>
              </li>
              <li className="pricing-feature">
                <FontAwesomeIcon icon={faCheck} className="pricing-feature-icon" />
                <span>Dedicated account manager</span>
              </li>
              <li className="pricing-feature">
                <FontAwesomeIcon icon={faCheck} className="pricing-feature-icon" />
                <span>SLA guarantee</span>
              </li>
              <li className="pricing-feature">
                <FontAwesomeIcon icon={faCheck} className="pricing-feature-icon" />
                <span>Custom AI model training</span>
              </li>
            </ul>
            <a href="#contact" className="pricing-cta">Contact Sales</a>
          </div>
        </motion.div>
        
        <motion.div 
          className="api-docs-link"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.6 }}
          style={{ 
            textAlign: 'center', 
            marginTop: '3rem',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            padding: '2rem',
            borderRadius: '12px',
            maxWidth: '800px',
            margin: '3rem auto 0'
          }}
        >
          <h3 style={{ marginBottom: '1rem', color: 'var(--text-dark)' }}>Ready to get started?</h3>
          <p style={{ marginBottom: '1.5rem', color: 'var(--text-muted)' }}>
            Check out our comprehensive API documentation to learn more about our endpoints, 
            parameters, and response formats.
          </p>
          <a 
            href="#" 
            style={{
              display: 'inline-block',
              background: 'white',
              color: 'var(--primary)',
              padding: '0.8rem 1.5rem',
              borderRadius: '8px',
              fontWeight: 600,
              boxShadow: '0 4px 10px rgba(0, 0, 0, 0.05)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              textDecoration: 'none',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = '0 8px 15px rgba(0, 0, 0, 0.1)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.05)';
            }}
          >
            View Documentation <span style={{ marginLeft: '0.5rem' }}>→</span>
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default ApiSection;