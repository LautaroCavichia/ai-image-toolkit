import React, { useState } from 'react';
import { Wand2, Sparkles, CheckCircle, Info, Zap, Target, Shield } from 'lucide-react';
import Layout from '../components/Layout';
import Navbar from '../components/Navbar';
import JobStatus from '../components/JobStatus';
import BeforeAfterSlider from '../components/BeforeAfterSlider';
import AnimatedGradientMesh from '../components/AnimatedGradientMesh';
import { JobTypeEnum } from '../types';
import { uploadImageAndCreateJob } from '../services/apiService';
import { isAuthenticated } from '../services/authService';
import { useServiceAnimation } from '../hooks/useServiceAnimation';

const ImageGenerationPage: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('square');
  const [quality, setQuality] = useState('FREE');
  const [steps, setSteps] = useState(20);
  const [guidanceScale, setGuidanceScale] = useState(7.5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);

  // Enhanced animation system
  const { heroRef, uploaderRef, workflowRef, featuresRef } = useServiceAnimation({
    serviceType: 'image-generation',
    intensity: 'medium'
  });

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt to generate an image');
      return;
    }

    console.log('🎨 === HANDLE GENERATE START ===');
    console.log('🎨 Prompt:', prompt);
    console.log('🎨 Token in localStorage before generation:', localStorage.getItem('token') ? 'EXISTS' : 'MISSING');
    console.log('🎨 User authenticated before generation:', isAuthenticated());

    setLoading(true);
    setError('');

    try {
      console.log('🎨 Calling image generation...');
      
      // Create a minimal file object for the API since it expects a file upload
      // For image generation, we don't need an actual image file
      const mockFile = new File(['prompt'], 'generation-request.txt', { type: 'text/plain' });
      
      const config = {
        prompt: prompt.trim(),
        negativePrompt: negativePrompt.trim() || undefined,
        aspectRatio,
        quality,
        steps,
        guidanceScale
      };

      const response = await uploadImageAndCreateJob(mockFile, JobTypeEnum.IMAGE_GENERATION, config);
      console.log('🎨 Generation response received:', response);
      setCurrentJobId(response.jobId);
      
      // Reset form
      setPrompt('');
      setNegativePrompt('');
      
    } catch (err: any) {
      console.error('🎨 Generation error caught:', err);
      setError(err.message || 'Generation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleJobCompleted = () => {
    // Job completed
  };

  // Mock images for the slider
  const mockImages = [
    {
      before: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&h=600&fit=crop',
      after: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=600&h=600&fit=crop',
      title: 'Fantasy Landscape',
      description: 'Generated from prompt: "mystical forest with glowing mushrooms, fantasy art"'
    },
    {
      before: 'https://images.unsplash.com/photo-1564131149321-3da5832c4ff8?w=600&h=600&fit=crop',
      after: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=600&fit=crop',
      title: 'Futuristic City',
      description: 'Generated from prompt: "cyberpunk city skyline at night, neon lights"'
    }
  ];

  return (
    <Layout>
      <AnimatedGradientMesh variant="image-generation" intensity="subtle" />
      <Navbar />
      <div className="min-h-screen pt-20">
        <div className="max-w-4xl mx-auto py-12 px-6">
          
          {/* Hero Section */}
          <div ref={heroRef} className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-full font-medium text-sm mb-8">
              <Wand2 size={16} />
              AI Image Generation
            </div>
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-slate-900 via-purple-700 to-blue-600 bg-clip-text text-transparent mb-6">
              Create Images from Text
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Transform your imagination into stunning visuals with our advanced AI image generation technology. Just describe what you want to see.
            </p>
          </div>

          {/* Generation Section */}
          <div ref={uploaderRef} className="bg-white rounded-3xl shadow-xl border border-slate-200/50 p-8 mb-16">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Generate Your Image</h2>
              <p className="text-slate-600">Describe what you want to create and let AI bring it to life</p>
            </div>

            {currentJobId ? (
              <JobStatus 
                jobId={currentJobId} 
                onJobCompleted={handleJobCompleted}
                variant="image-generation"
              />
            ) : (
              <div className="space-y-6">
                {/* Prompt Input */}
                <div>
                  <label htmlFor="prompt" className="block text-sm font-medium text-slate-700 mb-2">
                    Prompt <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="prompt"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="A beautiful sunset over mountains, digital art, highly detailed..."
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none h-24"
                    disabled={loading}
                  />
                </div>

                {/* Configuration Options */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Aspect Ratio */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Aspect Ratio</label>
                    <select
                      value={aspectRatio}
                      onChange={(e) => setAspectRatio(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      disabled={loading}
                    >
                      <option value="square">Square (1:1)</option>
                      <option value="portrait">Portrait (2:3)</option>
                      <option value="landscape">Landscape (3:2)</option>
                    </select>
                  </div>

                  {/* Quality */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Quality</label>
                    <select
                      value={quality}
                      onChange={(e) => setQuality(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      disabled={loading}
                    >
                      <option value="FREE">Standard Quality (Free)</option>
                      <option value="PREMIUM">High Quality (Premium)</option>
                    </select>
                  </div>
                </div>

                {/* Advanced Options (Collapsible) */}
                <details className="group">
                  <summary className="cursor-pointer font-medium text-slate-700 hover:text-slate-900 flex items-center gap-2">
                    <span>Advanced Options</span>
                    <Sparkles size={16} className="group-open:rotate-12 transition-transform" />
                  </summary>
                  <div className="mt-4 space-y-4 border-t border-slate-200 pt-4">
                    {/* Negative Prompt */}
                    <div>
                      <label htmlFor="negative-prompt" className="block text-sm font-medium text-slate-700 mb-2">
                        Negative Prompt (Optional)
                      </label>
                      <textarea
                        id="negative-prompt"
                        value={negativePrompt}
                        onChange={(e) => setNegativePrompt(e.target.value)}
                        placeholder="low quality, blurry, distorted..."
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none h-20"
                        disabled={loading}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Steps */}
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Inference Steps: {steps}
                        </label>
                        <input
                          type="range"
                          min="10"
                          max="50"
                          value={steps}
                          onChange={(e) => setSteps(Number(e.target.value))}
                          className="w-full"
                          disabled={loading}
                        />
                      </div>

                      {/* Guidance Scale */}
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Guidance Scale: {guidanceScale}
                        </label>
                        <input
                          type="range"
                          min="1"
                          max="20"
                          step="0.5"
                          value={guidanceScale}
                          onChange={(e) => setGuidanceScale(Number(e.target.value))}
                          className="w-full"
                          disabled={loading}
                        />
                      </div>
                    </div>
                  </div>
                </details>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}

                <button
                  onClick={handleGenerate}
                  disabled={loading || !prompt.trim()}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <Wand2 size={20} />
                      Generate Image
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Before/After Examples */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-8">AI Generated Examples</h2>
            <BeforeAfterSlider images={mockImages} />
          </div>

          {/* How It Works */}
          <div ref={workflowRef} className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-12">How AI Image Generation Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: Wand2,
                  title: 'Describe Your Vision',
                  description: 'Write a detailed prompt describing the image you want to create'
                },
                {
                  icon: Sparkles,
                  title: 'AI Creates Magic',
                  description: 'Our advanced AI models interpret your prompt and generate unique artwork'
                },
                {
                  icon: CheckCircle,
                  title: 'Download & Enjoy',
                  description: 'Get your high-quality generated image ready for any project'
                }
              ].map((step, index) => (
                <div key={index} className="text-center group">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <step.icon className="text-purple-600" size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{step.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{step.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Features Grid */}
          <div ref={featuresRef} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                icon: Target,
                title: 'Precise Control',
                description: 'Fine-tune your generation with aspect ratios, quality settings, and advanced parameters'
              },
              {
                icon: Zap,
                title: 'Lightning Fast',
                description: 'Generate stunning images in seconds with our optimized AI pipeline'
              },
              {
                icon: Shield,
                title: 'Commercial Use',
                description: 'All generated images are yours to use in personal and commercial projects'
              },
              {
                icon: Sparkles,
                title: 'Unlimited Creativity',
                description: 'From photorealistic to artistic styles, create any image you can imagine'
              }
            ].map((feature, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 border border-slate-200/50 hover:shadow-lg transition-shadow duration-300">
                <feature.icon className="text-purple-600 mb-4" size={24} />
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ImageGenerationPage;