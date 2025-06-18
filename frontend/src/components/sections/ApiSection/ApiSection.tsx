// src/components/sections/ApiSection/ApiSection.tsx
import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCode, 
  faServer, 
  faShield, 
  faRocket,
  faCheck
} from '@fortawesome/free-solid-svg-icons';
import Card from '../../shared/Card';
import './ApiSection.css';

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

const ApiSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const codeRef = useRef<HTMLDivElement>(null);
  const pricingRef = useRef<HTMLDivElement>(null);
  const docsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Header animation
      if (headerRef.current?.children) {
        gsap.fromTo(headerRef.current.children, {
          opacity: 0,
          y: 30,
        }, {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.2,
          ease: "power2.out",
          scrollTrigger: {
            trigger: headerRef.current,
            start: "top 80%",
            end: "bottom 20%",
            toggleActions: "play none none reverse",
          }
        });
      }

      // Feature cards animation
      gsap.fromTo(".api-feature-card", {
        opacity: 0,
        y: 50,
        scale: 0.9,
      }, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.6,
        stagger: 0.15,
        ease: "power2.out",
        scrollTrigger: {
          trigger: featuresRef.current,
          start: "top 80%",
          end: "bottom 20%",
          toggleActions: "play none none reverse",
        }
      });

      // Code example animation
      gsap.fromTo(codeRef.current, {
        opacity: 0,
        y: 40,
      }, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: {
          trigger: codeRef.current,
          start: "top 80%",
          end: "bottom 20%",
          toggleActions: "play none none reverse",
        }
      });

      // Pricing cards animation
      gsap.fromTo(".pricing-card", {
        opacity: 0,
        y: 40,
        scale: 0.95,
      }, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.6,
        stagger: 0.2,
        ease: "power2.out",
        scrollTrigger: {
          trigger: pricingRef.current,
          start: "top 80%",
          end: "bottom 20%",
          toggleActions: "play none none reverse",
        }
      });

      // Docs section animation
      gsap.fromTo(docsRef.current, {
        opacity: 0,
        y: 30,
      }, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: {
          trigger: docsRef.current,
          start: "top 80%",
          end: "bottom 20%",
          toggleActions: "play none none reverse",
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="api-section" id="api">
      <div className="api-container">
        {/* Header */}
        <div ref={headerRef} className="api-header">
          <h2 className="api-title">PixelPerfect API</h2>
          <p className="api-subtitle">
            Integrate our powerful image processing capabilities directly into your applications with our easy-to-use API
          </p>
        </div>
        
        {/* Features */}
        <div ref={featuresRef} className="api-features">
          <Card variant="glass" padding="xl" hover glow className="api-feature-card">
            <div className="feature-icon simple-integration">
              <FontAwesomeIcon icon={faCode} />
            </div>
            <h3 className="feature-title">Simple Integration</h3>
            <p className="feature-description">
              Our RESTful API is designed to be easy to integrate with any platform or programming language.
              Get started with just a few lines of code.
            </p>
          </Card>
          
          <Card variant="glass" padding="xl" hover glow className="api-feature-card">
            <div className="feature-icon scalable-infrastructure">
              <FontAwesomeIcon icon={faServer} />
            </div>
            <h3 className="feature-title">Scalable Infrastructure</h3>
            <p className="feature-description">
              Built on a modern cloud infrastructure, our API can handle millions of requests per day with
              high availability and low latency.
            </p>
          </Card>
          
          <Card variant="glass" padding="xl" hover glow className="api-feature-card">
            <div className="feature-icon secure-compliant">
              <FontAwesomeIcon icon={faShield} />
            </div>
            <h3 className="feature-title">Secure & Compliant</h3>
            <p className="feature-description">
              Your data is secure with enterprise-grade encryption, GDPR compliance, and optional
              data retention policies to meet your requirements.
            </p>
          </Card>
  
        </div>
        
        {/* Code Example */}
        <div ref={codeRef} className="api-code-example">
          <Card variant="glass" padding="xl" className="code-card">
            <div className="code-header">
              <h3 className="code-title">Example: Background Removal API Request</h3>
            </div>
            <div className="code-container">
              <pre className="code-content">
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
          </Card>
        </div>
        
        {/* Pricing */}
        <div className="pricing-section">
          <h3 className="pricing-section-title">API Pricing Plans</h3>
          
          <div ref={pricingRef} className="pricing-grid">
            <Card variant="glass" padding="xl" hover className="pricing-card">
              <div className="pricing-header">
                <h3 className="pricing-title">Developer</h3>
                <div className="pricing-price">$29</div>
                <div className="pricing-period">per month</div>
              </div>
              <ul className="pricing-features">
                <li className="pricing-feature">
                  <FontAwesomeIcon icon={faCheck} className="feature-check" />
                  <span>500 API requests/month</span>
                </li>
                <li className="pricing-feature">
                  <FontAwesomeIcon icon={faCheck} className="feature-check" />
                  <span>Standard resolution</span>
                </li>
                <li className="pricing-feature">
                  <FontAwesomeIcon icon={faCheck} className="feature-check" />
                  <span>Email support</span>
                </li>
                <li className="pricing-feature">
                  <FontAwesomeIcon icon={faCheck} className="feature-check" />
                  <span>API documentation</span>
                </li>
              </ul>
              <button className="pricing-cta">Get Started</button>
            </Card>
            
            <Card variant="glass" padding="xl" hover className="pricing-card featured">
              <div className="popular-badge">
                Most Popular
              </div>
              <div className="pricing-header">
                <h3 className="pricing-title">Business</h3>
                <div className="pricing-price">$99</div>
                <div className="pricing-period">per month</div>
              </div>
              <ul className="pricing-features">
                <li className="pricing-feature">
                  <FontAwesomeIcon icon={faCheck} className="feature-check" />
                  <span>3,000 API requests/month</span>
                </li>
                <li className="pricing-feature">
                  <FontAwesomeIcon icon={faCheck} className="feature-check" />
                  <span>HD resolution</span>
                </li>
                <li className="pricing-feature">
                  <FontAwesomeIcon icon={faCheck} className="feature-check" />
                  <span>Priority support</span>
                </li>
                <li className="pricing-feature">
                  <FontAwesomeIcon icon={faCheck} className="feature-check" />
                  <span>Advanced analytics</span>
                </li>
                <li className="pricing-feature">
                  <FontAwesomeIcon icon={faCheck} className="feature-check" />
                  <span>Custom webhook integration</span>
                </li>
              </ul>
              <button className="pricing-cta">Get Started</button>
            </Card>
            
            <Card variant="glass" padding="xl" hover className="pricing-card">
              <div className="pricing-header">
                <h3 className="pricing-title">Enterprise</h3>
                <div className="pricing-price">Custom</div>
                <div className="pricing-period">tailored for you</div>
              </div>
              <ul className="pricing-features">
                <li className="pricing-feature">
                  <FontAwesomeIcon icon={faCheck} className="feature-check" />
                  <span>Unlimited API requests</span>
                </li>
                <li className="pricing-feature">
                  <FontAwesomeIcon icon={faCheck} className="feature-check" />
                  <span>Ultra HD resolution</span>
                </li>
                <li className="pricing-feature">
                  <FontAwesomeIcon icon={faCheck} className="feature-check" />
                  <span>Dedicated account manager</span>
                </li>
                <li className="pricing-feature">
                  <FontAwesomeIcon icon={faCheck} className="feature-check" />
                  <span>SLA guarantee</span>
                </li>
                <li className="pricing-feature">
                  <FontAwesomeIcon icon={faCheck} className="feature-check" />
                  <span>Custom AI model training</span>
                </li>
              </ul>
              <button className="pricing-cta">Contact Sales</button>
            </Card>
          </div>
        </div>
        
        {/* Documentation Link */}
        <div ref={docsRef} className="api-docs-section">
          <Card variant="glass" padding="xl" className="docs-card">
            <h3 className="docs-title">Ready to get started?</h3>
            <p className="docs-description">
              Check out our comprehensive API documentation to learn more about our endpoints, 
              parameters, and response formats.
            </p>
            <button className="docs-cta">
              View Documentation <span className="arrow">→</span>
            </button>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default ApiSection;