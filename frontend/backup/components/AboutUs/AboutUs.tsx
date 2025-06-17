// src/components/AboutUs/AboutUs.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faTwitter,
    faLinkedinIn,
    faGithub
} from '@fortawesome/free-brands-svg-icons';
import './AboutUs.css';

const AboutUs: React.FC = () => {
    return (
        <section className="about-us-section section">
            <div className="section-container">
                <motion.h2
                    className="section-title"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    About PixelPerfect AI
                </motion.h2>

                <motion.p
                    className="section-subtitle"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    Transforming the way professionals and businesses work with images through cutting-edge AI technology
                </motion.p>

                <div className="about-us-content">
                    <motion.div
                        className="about-us-image"
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{
                            duration: 0.8,
                            type: "spring",
                            stiffness: 100,
                            damping: 15
                        }}
                    >
                        <img
                            src="https://images.unsplash.com/photo-1636215096587-21982fbf5843?q=80&w=1935&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                            alt="PixelPerfect AI Team Working"
                        />
                    </motion.div>

                    <motion.div
                        className="about-us-text"
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{
                            duration: 0.8,
                            type: "spring",
                            stiffness: 100,
                            damping: 15
                        }}
                    >
                        <h3 className="about-us-subtitle">Our Story</h3>
                        <h2 className="about-us-title">Pioneering AI-Powered Image Processing</h2>
                        <p className="about-us-description">
                            PixelPerfect AI was founded in 2025 by two brothers, born in Argentina and later moved to Europe,
                            where we pursued studies in computer engineering and related fields. Fueled by a shared passion
                            for technology and creativity, we decided to take a leap and start a project together.
                        </p>
                        <p className="about-us-description">
                            What began as a personal challenge to improve background removal algorithms has grown into
                            a powerful suite of AI-driven image processing tools, designed to make advanced image editing
                            simple and accessible for everyone.
                        </p>
                        <p className="about-us-description">
                            Someday, our technology will process millions of images every month, empowering creators, marketers,
                            and developers around the world to produce stunning visuals in seconds—without the need for
                            costly software or expert skills.
                        </p>

                        <div className="about-us-stats">
                            <div className="stat-item">
                                <span className="stat-number">3M+</span>
                                <span className="stat-label">Images Processed Monthly</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-number">15K+</span>
                                <span className="stat-label">Active Users</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-number">99.7%</span>
                                <span className="stat-label">Accuracy Rate</span>
                            </div>
                        </div>
                    </motion.div>
                </div>

                <div className="team-section">
                    <motion.h3
                        className="team-title"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        Meet Our Team
                    </motion.h3>

                    <motion.div
                        className="team-grid"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >

                        <motion.div
                            className="team-member"
                            whileHover={{ y: -10 }}
                        >
                            <img
                                src="/assets/lautaro.jpg"
                                className="team-member-image"
                            />
                            <div className="team-member-info">
                                <h4 className="team-member-name">Lautaro Cavichia</h4>
                                <p className="team-member-role">Co-Founder</p>
                                <p className="team-member-bio">
                                    Computer Engineer, with a passion for technology.
                                </p>
                                <div className="team-social">
                                    <a href="#" className="social-link">
                                        <FontAwesomeIcon icon={faTwitter} />
                                    </a>
                                    <a href="https://www.linkedin.com/in/lautaro-cavichia/" className="social-link">
                                        <FontAwesomeIcon icon={faLinkedinIn} />
                                    </a>
                                    <a href="#" className="social-link">
                                        <FontAwesomeIcon icon={faGithub} />
                                    </a>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            className="team-member"
                            whileHover={{ y: -10 }}
                        >
                            <img
                                src="/assets/bruno.jpg"
                                alt="Bruno Cavichia"
                                className="team-member-image"
                            />
                            <div className="team-member-info">
                                <h4 className="team-member-name">Bruno Cavichia</h4>
                                <p className="team-member-role">Co-Founder</p>
                                <p className="team-member-bio">
                                    Java Developer, with a passion for technology.
                                </p>
                                <div className="team-social">
                                    <a href="#" className="social-link">
                                        <FontAwesomeIcon icon={faTwitter} />
                                    </a>
                                    <a href="https://www.linkedin.com/in/bruno-cavichia-291553299/" className="social-link">
                                        <FontAwesomeIcon icon={faLinkedinIn} />
                                    </a>
                                    <a href="#" className="social-link">
                                        <FontAwesomeIcon icon={faGithub} />
                                    </a>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>

                <motion.div
                    className="values-section"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                >
                    <h3 className="values-title">Our Core Values</h3>

                    <div className="values-grid">
                        <div className="value-card">
                            <div className="value-icon">🚀</div>
                            <h4 className="value-title">Innovation</h4>
                            <p className="value-description">
                                We continuously push the boundaries of what's possible with AI and image processing technology.
                            </p>
                        </div>

                        <div className="value-card">
                            <div className="value-icon">🎯</div>
                            <h4 className="value-title">Precision</h4>
                            <p className="value-description">
                                We're obsessed with accuracy and quality in every pixel we process.
                            </p>
                        </div>

                        <div className="value-card">
                            <div className="value-icon">🔍</div>
                            <h4 className="value-title">Transparency</h4>
                            <p className="value-description">
                                We believe in open communication about our technology capabilities and limitations.
                            </p>
                        </div>

                        <div className="value-card">
                            <div className="value-icon">🤝</div>
                            <h4 className="value-title">Accessibility</h4>
                            <p className="value-description">
                                We're committed to making professional image editing accessible to everyone, regardless of skill level.
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default AboutUs;