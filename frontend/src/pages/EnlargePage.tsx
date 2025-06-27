import React, { useState } from 'react';
import { Expand, Upload, CheckCircle, Sparkles, Maximize2, Square, Ratio, Star, Zap, Target, Shield } from 'lucide-react';
import Layout from '../components/Layout';
import Navbar from '../components/Navbar';
import JobStatus from '../components/JobStatus';
import DragDropUploader from '../components/DragDropUploader';
import BeforeAfterSlider from '../components/BeforeAfterSlider';
import AnimatedGradientMesh from '../components/AnimatedGradientMesh';
import ServicePreloader from '../components/ServicePreloader';
import { JobTypeEnum } from '../types';
import { uploadImageAndCreateJob } from '../services/apiService';
import { useServiceAnimation } from '../hooks/useServiceAnimation';
import { useFirstVisit } from '../hooks/useFirstVisit';

interface EnlargeConfig {
  aspectRatio: 'portrait' | 'landscape' | 'square';
  quality: 'FREE' | 'PREMIUM';
}

const EnlargePage: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const [config, setConfig] = useState<EnlargeConfig>({
    aspectRatio: 'square',
    quality: 'FREE'
  });

  // Enhanced animation system
  const { isFirstVisit, isLoading: isCheckingVisit } = useFirstVisit({ serviceType: 'enlarge' });
  const { heroRef, uploaderRef, configRef, workflowRef, featuresRef, preloaderRef } = useServiceAnimation({
    serviceType: 'enlarge',
    enablePreloader: isFirstVisit,
    intensity: 'medium'
  });

  // Show loading state while checking first visit
  if (isCheckingVisit) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setError('');

    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setError('');

    try {
      const response = await uploadImageAndCreateJob(selectedFile, JobTypeEnum.ENLARGE, config);
      setCurrentJobId(response.jobId);

      // Reset form
      setSelectedFile(null);
      setPreview(null);
    } catch (err: any) {
      setError(err.message || 'Upload failed');
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
      before: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
      after: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=600&fit=crop',
      title: 'Square Expansion',
      description: 'Transform your landscape into perfect square format'
    },
    {
      before: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=600&fit=crop',
      after: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&h=400&fit=crop',
      title: 'Landscape Extension',
      description: 'Expand portraits to stunning landscape compositions'
    },
    {
      before: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600&h=400&fit=crop',
      after: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=600&fit=crop',
      title: 'Portrait Conversion',
      description: 'Convert landscapes to elegant portrait orientations'
    }
  ];

  const aspectRatios = [
    {
      type: 'square' as const,
      label: 'Square',
      description: 'Perfect balance with 1:1 natural environment',
      ratio: '1:1',
      icon: Square
    },
    {
      type: 'portrait' as const,
      label: 'Portrait',
      description: 'Vertical expansion with 3:4 scene extension',
      ratio: '3:4',
      icon: Ratio
    },
    {
      type: 'landscape' as const,
      label: 'Landscape',
      description: 'Horizontal stretch with 4:3 outdoor scenery',
      ratio: '4:3',
      icon: Maximize2
    }
  ];

  return (
    <Layout>
      {isFirstVisit && (
        <div ref={preloaderRef}>
          <ServicePreloader serviceType="enlarge" />
        </div>
      )}
      <AnimatedGradientMesh variant="enlarge" intensity="subtle" />
      <Navbar />
      <div className="min-h-screen pt-20">
        <div className="max-w-4xl mx-auto py-12 px-6">

          {/* Hero Section */}
          <div ref={heroRef} className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-full font-medium text-sm mb-8">
              <Expand size={16} />
              Image Enlargement
            </div>
            <h1 className="text-5xl md:text-6xl font-light text-slate-900 mb-6 leading-tight tracking-tight">
              Expand Your
              <br />
              <span className="font-medium italic bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Creative Canvas
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed font-light">
              Break free from constraints. Extend your vision beyond borders.
              <br />
              <em className="text-slate-500">AI-powered expansion that feels natural.</em>
            </p>
          </div>

          {/* Upload Section */}
          <div ref={uploaderRef} className="bg-white/60 backdrop-blur-xl p-8 md:p-12 rounded-3xl shadow-xl border border-slate-200/50 mb-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Upload className="text-slate-700" size={24} />
              </div>
              <h3 className="text-3xl font-light text-slate-900 mb-3 tracking-tight">Upload Your Image</h3>
              <p className="text-slate-600 text-lg">Ready to expand your creative boundaries?</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl mb-8 text-center">
                {error}
              </div>
            )}

            <div className="space-y-8">
              <DragDropUploader
                onFileSelect={handleFileSelect}
                preview={preview}
                maxSize={10}
              />

              {selectedFile && (
                <div className="text-center bg-green-50 p-6 rounded-2xl border border-green-200">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <CheckCircle className="text-green-600" size={20} />
                    <strong className="text-green-800">Image Ready</strong>
                  </div>
                  <div className="text-slate-600">{selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)</div>
                </div>
              )}
            </div>
          </div>


          {/* Configuration Section */}
          {selectedFile && (
            <div ref={configRef} className="bg-white/60 backdrop-blur-xl p-8 md:p-12 rounded-3xl shadow-xl border border-slate-200/50 mb-8">
              <div className="text-center mb-12">
                <h3 className="text-3xl font-light text-slate-900 mb-3 tracking-tight">
                  <em className="italic text-slate-600">Choose</em> Your Canvas
                </h3>
                <p className="text-slate-600 text-lg">Select how you want to expand your image</p>
              </div>

              {/* Aspect Ratio Selection */}
              <div className="mb-12">
                <h4 className="text-xl font-medium text-slate-900 mb-6 text-center">Target Aspect Ratio</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {aspectRatios.map((aspect) => (
                    <button
                      key={aspect.type}
                      onClick={() => setConfig(prev => ({ ...prev, aspectRatio: aspect.type }))}
                      className={`group p-8 rounded-2xl border-2 text-center transition-all duration-300 ${config.aspectRatio === aspect.type
                        ? 'border-slate-900 bg-slate-50 shadow-lg'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-md'
                        }`}
                    >
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-colors duration-300 ${config.aspectRatio === aspect.type
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'
                        }`}>
                        <aspect.icon size={24} />
                      </div>
                      <h5 className="font-medium text-slate-900 mb-2">{aspect.label}</h5>
                      <p className="text-sm text-slate-600 mb-3">{aspect.description}</p>
                      <div className="inline-block bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-medium">
                        {aspect.ratio}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quality Selection */}
              <div className="mb-8">
                <h4 className="text-xl font-medium text-slate-900 mb-6 text-center">Quality Level</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <button
                    onClick={() => setConfig(prev => ({ ...prev, quality: 'FREE' }))}
                    className={`group p-8 rounded-2xl border-2 text-left transition-all duration-300 ${config.quality === 'FREE'
                      ? 'border-green-500 bg-green-50 shadow-lg'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-md'
                      }`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors duration-300 ${config.quality === 'FREE'
                          ? 'bg-green-500 text-white'
                          : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'
                          }`}>
                          <Sparkles size={24} />
                        </div>
                        <div>
                          <h5 className="font-medium text-slate-900">Standard Quality</h5>
                          <div className="text-sm text-slate-600">Basic expansion</div>
                        </div>
                      </div>
                      <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                        FREE
                      </div>
                    </div>
                    <p className="text-sm text-slate-600">Basic content-aware expansion with natural blending</p>
                  </button>

                  <button
                    onClick={() => setConfig(prev => ({ ...prev, quality: 'PREMIUM' }))}
                    className={`group p-8 rounded-2xl border-2 text-left transition-all duration-300 ${config.quality === 'PREMIUM'
                      ? 'border-orange-500 bg-orange-50 shadow-lg'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-md'
                      }`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors duration-300 ${config.quality === 'PREMIUM'
                          ? 'bg-orange-500 text-white'
                          : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'
                          }`}>
                          <Star size={24} />
                        </div>
                        <div>
                          <h5 className="font-medium text-slate-900">Premium Quality</h5>
                          <div className="text-sm text-slate-600">AI enhancement</div>
                        </div>
                      </div>
                      <div className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                        1 TOKEN
                      </div>
                    </div>
                    <p className="text-sm text-slate-600">AI-powered generative fill with Stable Diffusion technology</p>
                  </button>
                </div>
              </div>

              <button
                onClick={handleUpload}
                disabled={!selectedFile || loading}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white py-6 px-8 rounded-2xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] text-lg"
              >
                <div className="flex items-center justify-center gap-3">
                  {loading ? (
                    <>
                      <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Expanding Canvas...
                    </>
                  ) : (
                    <>
                      <Sparkles size={24} />
                      Expand to {config.aspectRatio}
                    </>
                  )}
                </div>
              </button>
            </div>
          )}

          {/* Before/After Examples */}
          <div className="mb-8">
            <BeforeAfterSlider images={mockImages} />
          </div>


          {/* Job Status Section */}
          {currentJobId && (
            <div className="mb-8">
              <JobStatus
                initialImageUrl={preview || ''}
                jobId={currentJobId}
                serviceType="enlarge"
                onJobCompleted={handleJobCompleted}
              />
            </div>
          )}

          {/* How it Works Section */}
          <div ref={workflowRef} className="bg-white/60 backdrop-blur-xl p-8 md:p-12 rounded-3xl shadow-xl border border-slate-200/50 mb-8">
            <div className="text-center mb-16">
              <h3 className="text-4xl md:text-5xl font-light text-slate-900 mb-6 tracking-tight">
                <em className="italic font-medium bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">Smart</em> Expansion
              </h3>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto font-light">
                Watch AI create natural extensions of your images
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

              {/* Step 1 */}
              <div className="workflow-card text-center group opacity-0">
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-slate-900 transition-colors duration-300 shadow-lg group-hover:shadow-xl">
                  <Upload className="text-slate-600 group-hover:text-white transition-colors duration-300" size={28} />
                </div>
                <h4 className="text-xl font-medium text-slate-900 mb-4">Image Centering</h4>
                <p className="text-slate-600 leading-relaxed">
                  Your image is placed at the center of a larger canvas with your chosen dimensions
                </p>
              </div>

              {/* Step 2 */}
              <div className="workflow-card text-center group opacity-0">
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-slate-900 transition-colors duration-300 shadow-lg group-hover:shadow-xl">
                  <Target className="text-slate-600 group-hover:text-white transition-colors duration-300" size={28} />
                </div>
                <h4 className="text-xl font-medium text-slate-900 mb-4">Context Analysis</h4>
                <p className="text-slate-600 leading-relaxed">
                  AI analyzes the image context and surrounding elements to understand the scene
                </p>
              </div>

              {/* Step 3 */}
              <div className="workflow-card text-center group opacity-0">
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-slate-900 transition-colors duration-300 shadow-lg group-hover:shadow-xl">
                  <Zap className="text-slate-600 group-hover:text-white transition-colors duration-300" size={28} />
                </div>
                <h4 className="text-xl font-medium text-slate-900 mb-4">Natural Generation</h4>
                <p className="text-slate-600 leading-relaxed">
                  Creates seamless environment extensions that blend naturally with your original image
                </p>
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div ref={featuresRef} className="bg-white/60 backdrop-blur-xl p-8 md:p-12 rounded-3xl shadow-xl border border-slate-200/50">
            <div className="text-center mb-16">
              <h3 className="text-4xl md:text-5xl font-light text-slate-900 mb-6 tracking-tight">
                Why Choose <em className="italic text-slate-600">Image Enlargement</em>
              </h3>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto font-light">
                Professional canvas expansion with intelligent content generation
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {[
                {
                  icon: Zap,
                  title: "Lightning Fast",
                  description: "Process and expand images in seconds with our optimized AI infrastructure."
                },
                {
                  icon: Target,
                  title: "Context Aware",
                  description: "Smart environment generation that understands and extends your image naturally."
                },
                {
                  icon: Shield,
                  title: "Privacy First",
                  description: "Your images are processed securely and never stored permanently."
                }
              ].map((feature) => (
                <div
                  key={feature.title}
                  className="text-center group"
                >
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                    <feature.icon className="text-slate-700" size={28} />
                  </div>
                  <h3 className="text-xl font-medium text-slate-900 mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default EnlargePage;