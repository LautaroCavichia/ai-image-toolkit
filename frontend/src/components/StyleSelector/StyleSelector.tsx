// src/components/StyleSelector/StyleSelector.tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faPalette,
    faCoins,
    faCheck,
    faInfoCircle,
    faMagicWandSparkles,
    faCrown
} from '@fortawesome/free-solid-svg-icons';
import './StyleSelector.css';

export interface StyleConfig {
    style: string;
    prompt?: string;
    strength: number;
    quality: 'FREE' | 'PREMIUM';
}

interface StyleSelectorProps {
    config: StyleConfig;
    onChange: (config: StyleConfig) => void;
}

interface StyleOption {
    id: string;
    name: string;
    description: string;
    category: string;
    previewImage: string;
    prompt: string;
    popular?: boolean;
}

const styleOptions: StyleOption[] = [
    {
        id: '3D_Chibi',
        name: '3D Chibi',
        description: 'Cute 3D character style with rounded features',
        category: 'Character',
        previewImage: '/assets/styles/3d_chibi.jpg',
        prompt: '3D Chibi style, cute character design, rounded features',
        popular: true
    },
    {
        id: 'Ghibli',
        name: 'Studio Ghibli',
        description: 'Anime style with detailed backgrounds and warm colors',
        category: 'Anime',
        previewImage: '/assets/styles/ghibli.jpg',
        prompt: 'Studio Ghibli style, anime, detailed backgrounds, warm colors',
        popular: true
    },
    {
        id: 'Van_Gogh',
        name: 'Van Gogh',
        description: 'Post-impressionist style with swirling brushstrokes',
        category: 'Fine Art',
        previewImage: '/assets/styles/van_gogh.jpg',
        prompt: 'Van Gogh style, swirling brushstrokes, post-impressionist',
        popular: true
    },
    {
        id: 'Picasso',
        name: 'Picasso Cubist',
        description: 'Abstract geometric forms in cubist style',
        category: 'Fine Art',
        previewImage: '/assets/styles/picasso.jpg',
        prompt: 'Picasso cubist style, abstract geometric forms'
    },
    {
        id: 'Oil_Painting',
        name: 'Oil Painting',
        description: 'Classical oil painting with thick brushstrokes',
        category: 'Fine Art',
        previewImage: '/assets/styles/oil_painting.jpg',
        prompt: 'Oil painting style, thick brushstrokes, classical art'
    },
    {
        id: 'American_Cartoon',
        name: 'American Cartoon',
        description: 'Vibrant cartoon style with clean lines',
        category: 'Cartoon',
        previewImage: '/assets/styles/american_cartoon.jpg',
        prompt: 'American cartoon style, vibrant colors, clean lines'
    },
    {
        id: 'Rick_Morty',
        name: 'Rick & Morty',
        description: 'Sci-fi cartoon animation style',
        category: 'Cartoon',
        previewImage: '/assets/styles/rick_morty.jpg',
        prompt: 'Rick & Morty style, sci-fi cartoon animation'
    },
    {
        id: 'Pixel',
        name: 'Pixel Art',
        description: '8-bit retro gaming graphics style',
        category: 'Digital',
        previewImage: '/assets/styles/pixel.jpg',
        prompt: 'Pixel art style, 8-bit graphics, retro gaming'
    },
    {
        id: 'Vector',
        name: 'Vector Art',
        description: 'Clean geometric shapes with flat design',
        category: 'Digital',
        previewImage: '/assets/styles/vector.jpg',
        prompt: 'Vector art style, clean geometric shapes, flat design'
    },
    {
        id: 'Chinese_Ink',
        name: 'Chinese Ink',
        description: 'Traditional ink painting with brushwork',
        category: 'Traditional',
        previewImage: '/assets/styles/chinese_ink.jpg',
        prompt: 'Chinese ink painting style, traditional brushwork, monochrome'
    },
    {
        id: 'Origami',
        name: 'Origami',
        description: 'Paper folding art with geometric shapes',
        category: 'Traditional',
        previewImage: '/assets/styles/origami.jpg',
        prompt: 'Origami paper folding style, geometric shapes'
    },
    {
        id: 'Clay_Toy',
        name: 'Clay Toy',
        description: 'Handmade clay appearance with soft textures',
        category: 'Toy',
        previewImage: '/assets/styles/clay_toy.jpg',
        prompt: 'Clay toy style, handmade appearance, soft textures'
    },
    {
        id: 'LEGO',
        name: 'LEGO',
        description: 'Blocky construction with plastic appearance',
        category: 'Toy',
        previewImage: '/assets/styles/lego.jpg',
        prompt: 'LEGO brick style, blocky construction, plastic appearance'
    },
    {
        id: 'Pop_Art',
        name: 'Pop Art',
        description: 'Bright colors with bold graphics',
        category: 'Modern',
        previewImage: '/assets/styles/pop_art.jpg',
        prompt: 'Pop art style, bright colors, bold graphics'
    },
    {
        id: 'Poly',
        name: 'Low Poly',
        description: 'Geometric faceted design style',
        category: 'Digital',
        previewImage: '/assets/styles/poly.jpg',
        prompt: 'Low poly style, geometric faceted design'
    },
    {
        id: 'Line',
        name: 'Line Art',
        description: 'Black and white with minimal shading',
        category: 'Minimalist',
        previewImage: '/assets/styles/line.jpg',
        prompt: 'Line art style, black and white, minimal shading'
    },
    {
        id: 'Fabric',
        name: 'Fabric Texture',
        description: 'Textile appearance with soft materials',
        category: 'Texture',
        previewImage: '/assets/styles/fabric.jpg',
        prompt: 'Fabric texture style, textile appearance, soft materials'
    },
    {
        id: 'Paper_Cutting',
        name: 'Paper Cutting',
        description: 'Layered paper art design',
        category: 'Traditional',
        previewImage: '/assets/styles/paper_cutting.jpg',
        prompt: 'Paper cutting art style, layered design'
    },
    {
        id: 'Macaron',
        name: 'Macaron',
        description: 'Pastel colors with sweet aesthetic',
        category: 'Sweet',
        previewImage: '/assets/styles/macaron.jpg',
        prompt: 'Macaron style, pastel colors, sweet aesthetic'
    },
    {
        id: 'Jojo',
        name: 'JoJo\'s Bizarre',
        description: 'Dramatic poses with bold lines',
        category: 'Anime',
        previewImage: '/assets/styles/jojo.jpg',
        prompt: 'JoJo\'s Bizarre Adventure style, dramatic poses, bold lines'
    },
    {
        id: 'Irasutoya',
        name: 'Irasutoya',
        description: 'Simple clean illustration design',
        category: 'Illustration',
        previewImage: '/assets/styles/irasutoya.jpg',
        prompt: 'Irasutoya illustration style, simple clean design'
    },
    {
        id: 'Snoopy',
        name: 'Snoopy Peanuts',
        description: 'Simple line drawings cartoon style',
        category: 'Cartoon',
        previewImage: '/assets/styles/snoopy.jpg',
        prompt: 'Snoopy Peanuts style, simple line drawings'
    }
];

const categories = Array.from(new Set(styleOptions.map(style => style.category)));

const StyleSelector: React.FC<StyleSelectorProps> = ({ config, onChange }) => {
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [showAdvanced, setShowAdvanced] = useState<boolean>(false);

    const filteredStyles = selectedCategory === 'all'
        ? styleOptions
        : styleOptions.filter(style => style.category === selectedCategory);

    const popularStyles = styleOptions.filter(style => style.popular);

    const handleStyleSelect = (styleId: string) => {
        const selectedStyle = styleOptions.find(style => style.id === styleId);
        if (selectedStyle) {
            onChange({
                ...config,
                style: styleId,
                prompt: selectedStyle.prompt
            });
        }
    };

    const handleStrengthChange = (strength: number) => {
        onChange({
            ...config,
            strength
        });
    };

    const handleQualityChange = (quality: 'FREE' | 'PREMIUM') => {
        onChange({
            ...config,
            quality
        });
    };

    const handleCustomPromptChange = (customPrompt: string) => {
        const selectedStyle = styleOptions.find(style => style.id === config.style);
        const basePrompt = selectedStyle?.prompt || '';
        const fullPrompt = customPrompt ? `${basePrompt}, ${customPrompt}` : basePrompt;

        onChange({
            ...config,
            prompt: fullPrompt
        });
    };

    return (
        <motion.div
            className="style-selector"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
        >
            <div className="style-selector-header">
                <h4 className="selector-title">
                    <FontAwesomeIcon icon={faPalette} />
                    Choose Art Style
                </h4>
                <p className="selector-subtitle">
                    Transform your image with AI-powered artistic styles
                </p>
            </div>

            {/* Popular Styles */}
            {selectedCategory === 'all' && (
                <div className="popular-styles-section">
                    <h5 className="section-title">
                        <FontAwesomeIcon icon={faMagicWandSparkles} />
                        Popular Styles
                    </h5>
                    <div className="popular-styles-grid">
                        {popularStyles.map((style) => (
                            <motion.div
                                key={style.id}
                                className={`style-card popular ${config.style === style.id ? 'selected' : ''}`}
                                onClick={() => handleStyleSelect(style.id)}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <div className="style-preview">
                                    <img src={style.previewImage} alt={style.name} />
                                    <div className="popular-badge">
                                        <FontAwesomeIcon icon={faMagicWandSparkles} />
                                    </div>
                                </div>
                                <div className="style-info">
                                    <h6 className="style-name">{style.name}</h6>
                                    <p className="style-description">{style.description}</p>
                                </div>
                                {config.style === style.id && (
                                    <div className="selected-indicator">
                                        <FontAwesomeIcon icon={faCheck} />
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            {/* Category Filter */}
            <div className="category-filter">
                <div className="category-buttons">
                    <button
                        className={`category-btn ${selectedCategory === 'all' ? 'active' : ''}`}
                        onClick={() => setSelectedCategory('all')}
                    >
                        All Styles
                    </button>
                    {categories.map((category) => (
                        <button
                            key={category}
                            className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
                            onClick={() => setSelectedCategory(category)}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            </div>

            {/* Style Grid */}
            <div className="styles-grid">
                {filteredStyles.map((style) => (
                    <motion.div
                        key={style.id}
                        className={`style-card ${config.style === style.id ? 'selected' : ''}`}
                        onClick={() => handleStyleSelect(style.id)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        layout
                    >
                        <div className="style-preview">
                            <img src={style.previewImage} alt={style.name} />
                            <div className="style-category">{style.category}</div>
                        </div>
                        <div className="style-info">
                            <h6 className="style-name">{style.name}</h6>
                            <p className="style-description">{style.description}</p>
                        </div>
                        {config.style === style.id && (
                            <div className="selected-indicator">
                                <FontAwesomeIcon icon={faCheck} />
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>

            {/* Quality Selection */}
            <div className="quality-selection">
                <h5 className="section-title">Processing Quality</h5>
                <div className="quality-options">
                    <div
                        className={`quality-option ${config.quality === 'FREE' ? 'active' : ''}`}
                        onClick={() => handleQualityChange('FREE')}
                    >
                        <div className="quality-header">
                            <div className="quality-icon">
                                <FontAwesomeIcon icon={faPalette} />
                            </div>
                            <div className="quality-info">
                                <h6>Standard Quality</h6>
                                <p>512x512 resolution, faster processing</p>
                            </div>
                            <div className="quality-cost free">Free</div>
                        </div>
                    </div>

                    <div
                        className={`quality-option ${config.quality === 'PREMIUM' ? 'active' : ''}`}
                        onClick={() => handleQualityChange('PREMIUM')}
                    >
                        <div className="quality-header">
                            <div className="quality-icon premium">
                                <FontAwesomeIcon icon={faCrown} />
                            </div>
                            <div className="quality-info">
                                <h6>Premium Quality</h6>
                                <p>1024x1024 resolution, enhanced details</p>
                            </div>
                            <div className="quality-cost premium">
                                <FontAwesomeIcon icon={faCoins} />
                                <span>2 Tokens</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Advanced Options */}
            <div className="advanced-options">
                <button
                    className="advanced-toggle"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                >
                    <FontAwesomeIcon icon={faInfoCircle} />
                    <span>Advanced Options</span>
                    <span className={`toggle-icon ${showAdvanced ? 'open' : ''}`}>▼</span>
                </button>

                <AnimatePresence>
                    {showAdvanced && (
                        <motion.div
                            className="advanced-content"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="strength-control">
                                <label className="control-label">
                                    Style Strength: {config.strength.toFixed(1)}
                                </label>
                                <input
                                    type="range"
                                    min="0.1"
                                    max="2.0"
                                    step="0.1"
                                    value={config.strength}
                                    onChange={(e) => handleStrengthChange(parseFloat(e.target.value))}
                                    className="strength-slider"
                                />
                                <div className="strength-labels">
                                    <span>Subtle</span>
                                    <span>Strong</span>
                                </div>
                            </div>

                            <div className="custom-prompt">
                                <label className="control-label">
                                    Custom Prompt (Optional)
                                </label>
                                <textarea
                                    placeholder="Add additional description to guide the style transfer..."
                                    className="custom-prompt-input"
                                    onChange={(e) => handleCustomPromptChange(e.target.value)}
                                />
                                <p className="prompt-hint">
                                    This will be combined with the base style prompt
                                </p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

export default StyleSelector;