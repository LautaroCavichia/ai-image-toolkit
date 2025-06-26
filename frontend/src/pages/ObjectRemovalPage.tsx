import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Sparkles, Upload, CheckCircle, Star, MousePointer, Wand2, Zap, Target, Shield } from 'lucide-react';
import Layout from '../components/Layout';
import Navbar from '../components/Navbar';
import JobStatus from '../components/JobStatus';
import DragDropUploader from '../components/DragDropUploader';
import BeforeAfterSlider from '../components/BeforeAfterSlider';
import AnimatedGradientMesh from '../components/AnimatedGradientMesh';
import { uploadImageAndCreateJob } from '../services/apiService';

interface ObjectRemovalConfig {
  method: 'AUTO' | 'MANUAL';
  quality: 'STANDARD' | 'PREMIUM';
}

const ObjectRemovalPage: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const [config, setConfig] = useState<ObjectRemovalConfig>({
    method: 'AUTO',
    quality: 'STANDARD'
  });

  const heroRef = useRef<HTMLDivElement>(null);
  const uploaderRef = useRef<HTMLDivElement>(null);
  const configRef = useRef<HTMLDivElement>(null);
  const workflowRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline();

    // Set initial states for vertical layout
    gsap.set([heroRef.current, uploaderRef.current, configRef.current, workflowRef.current, featuresRef.current], {
      opacity: 0,
      y: 40,
      scale: 0.95
    });

    // Entrance animations in sequence
    tl.to(heroRef.current, {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 1.2,
      ease: "power3.out"
    })
      .to(uploaderRef.current, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 1,
        ease: "power3.out"
      }, "-=0.8")
      .to(configRef.current, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.8,
        ease: "power3.out"
      }, "-=0.6")
      .to(workflowRef.current, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.8,
        ease: "power3.out"
      }, "-=0.4")
      .to(featuresRef.current, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.8,
        ease: "power3.out"
      }, "-=0.4");

    // Workflow animation
    setTimeout(() => {
      const workflowCards = workflowRef.current?.querySelectorAll('.workflow-card');

      if (workflowCards) {
        gsap.fromTo(workflowCards,
          {
            opacity: 0,
            y: 30,
            scale: 0.95
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.8,
            stagger: 0.2,
            ease: "power3.out"
          }
        );
      }
    }, 1500);
  }, []);

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
      const response = await uploadImageAndCreateJob(selectedFile, 'OBJECT_REMOVAL' as any, config);
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
      before: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=600&fit=crop',
      after: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=600&fit=crop&blend=FFFFFF&blend-mode=normal',
      title: 'Tourist Removal',
      description: 'Remove unwanted people from your perfect landscape shots'
    },
    {
      before: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&h=600&fit=crop',
      after: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&h=600&fit=crop&blend=transparent',
      title: 'Object Cleanup',
      description: 'Clean removal of distracting objects with natural background fill'
    },
    {
      before: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600&h=600&fit=crop',
      after: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600&h=600&fit=crop&blend=nature',
      title: 'Seamless Restoration',
      description: 'Professional-grade object removal with intelligent background reconstruction'
    }
  ];

  const removalMethods = [
    {
      type: 'AUTO' as const,
      title: 'Smart Detection',
      description: 'AI automatically identifies and removes unwanted objects',
      icon: Wand2,
      features: ['Automatic object detection', 'One-click removal', 'Fast processing'],
    },
    {
      type: 'MANUAL' as const,
      title: 'Precise Selection',
      description: 'Manual selection for exact control over what gets removed',
      icon: MousePointer,
      features: ['Precise brush tool', 'Custom selection', 'Professional control'],
      badge: 'Coming Soon'
    }
  ];

  const qualityOptions = [
    {
      type: 'STANDARD' as const,
      title: 'Standard Quality',
      description: 'Good quality object removal with natural background fill',
      cost: '3 TOKENS',
      color: 'blue'
    },
    {
      type: 'PREMIUM' as const,
      title: 'Premium Quality',
      description: 'Professional-grade removal with advanced content-aware fill',
      cost: '5 TOKENS',
      color: 'purple'
    }
  ];

  return (
    <Layout>
      <AnimatedGradientMesh variant="object-removal" intensity="subtle" />
      <Navbar />
      <div className="min-h-screen pt-20">
        <div className="max-w-4xl mx-auto py-12 px-6">

          {/* Hero Section */}
          <div ref={heroRef} className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-full font-medium text-sm mb-8">
              <Sparkles size={16} />
              Object Removal
            </div>
            <h1 className="text-5xl md:text-6xl font-light text-slate-900 mb-6 leading-tight tracking-tight">
              Erase the
              <br />
              <span className="font-medium italic bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
                Unwanted
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed font-light">
              Make distractions disappear. Perfect your composition.
              <br />
              <em className="text-slate-500">AI-powered object removal that leaves no trace.</em>
            </p>
          </div>

          {/* Upload Section */}
          <div ref={uploaderRef} className="bg-white/60 backdrop-blur-xl p-8 md:p-12 rounded-3xl shadow-xl border border-slate-200/50 mb-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Upload className="text-slate-700" size={24} />
              </div>
              <h3 className="text-3xl font-light text-slate-900 mb-3 tracking-tight">Upload Your Image</h3>
              <p className="text-slate-600 text-lg">Ready to perfect your composition?</p>
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
                  <em className="italic text-slate-600">Choose</em> Your Method
                </h3>
                <p className="text-slate-600 text-lg">Select how you want to remove unwanted objects</p>
              </div>

              {/* Removal Method Selection */}
              <div className="mb-12">
                <h4 className="text-xl font-medium text-slate-900 mb-6 text-center">Removal Method</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {removalMethods.map((method) => (
                    <button
                      key={method.type}
                      onClick={() => setConfig(prev => ({ ...prev, method: method.type }))}
                      disabled={method.badge === 'Coming Soon'}
                      className={`group p-8 rounded-2xl border-2 text-center transition-all duration-300 relative ${config.method === method.type && method.badge !== 'Coming Soon'
                        ? 'border-slate-900 bg-slate-50 shadow-lg'
                        : method.badge === 'Coming Soon'
                          ? 'border-slate-200 bg-slate-50 opacity-60 cursor-not-allowed'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-md'
                        }`}
                    >
                      {method.badge && (
                        <div className="absolute top-4 right-4 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                          {method.badge}
                        </div>
                      )}
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-colors duration-300 ${config.method === method.type && method.badge !== 'Coming Soon'
                        ? 'bg-slate-900 text-white'
                        : method.badge === 'Coming Soon'
                          ? 'bg-slate-200 text-slate-400'
                          : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'
                        }`}>
                        <method.icon size={24} />
                      </div>
                      <h5 className="font-medium text-slate-900 mb-2">{method.title}</h5>
                      <p className="text-sm text-slate-600 mb-4">{method.description}</p>
                      <div className="space-y-1">
                        {method.features.map((feature, index) => (
                          <div key={index} className="flex items-center justify-center gap-2 text-xs text-slate-500">
                            <div className="w-1 h-1 bg-slate-400 rounded-full" />
                            {feature}
                          </div>
                        ))}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quality Selection */}
              <div className="mb-8">
                <h4 className="text-xl font-medium text-slate-900 mb-6 text-center">Quality Level</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {qualityOptions.map((option) => (
                    <button
                      key={option.type}
                      onClick={() => setConfig(prev => ({ ...prev, quality: option.type }))}
                      className={`group p-8 rounded-2xl border-2 text-left transition-all duration-300 ${config.quality === option.type
                        ? `border-${option.color}-500 bg-${option.color}-50 shadow-lg`
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-md'
                        }`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors duration-300 ${config.quality === option.type
                            ? option.color === 'blue' ? 'bg-blue-500 text-white' : 'bg-purple-500 text-white'
                            : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'
                            }`}>
                            {option.color === 'blue' ? <Sparkles size={24} /> : <Star size={24} />}
                          </div>
                          <div>
                            <h5 className="font-medium text-slate-900">{option.title}</h5>
                            <div className="text-sm text-slate-600">Advanced AI processing</div>
                          </div>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-bold ${option.color === 'blue'
                          ? 'bg-blue-500 text-white'
                          : 'bg-purple-500 text-white'
                          }`}>
                          {option.cost}
                        </div>
                      </div>
                      <p className="text-sm text-slate-600">{option.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleUpload}
                disabled={!selectedFile || loading || config.method === 'MANUAL'}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white py-6 px-8 rounded-2xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] text-lg"
              >
                <div className="flex items-center justify-center gap-3">
                  {loading ? (
                    <>
                      <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Removing Objects...
                    </>
                  ) : config.method === 'MANUAL' ? (
                    <>
                      <Star size={24} />
                      Coming Soon
                    </>
                  ) : (
                    <>
                      <Sparkles size={24} />
                      Remove Objects
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
                serviceType="object-removal"
                onJobCompleted={handleJobCompleted}
              />
            </div>
          )}

          {/* How it Works Section */}
          <div ref={workflowRef} className="bg-white/60 backdrop-blur-xl p-8 md:p-12 rounded-3xl shadow-xl border border-slate-200/50 mb-8">
            <div className="text-center mb-16">
              <h3 className="text-4xl md:text-5xl font-light text-slate-900 mb-6 tracking-tight">
                <em className="italic font-medium bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent">Smart</em> Removal
              </h3>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto font-light">
                Watch AI seamlessly erase objects and restore backgrounds
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

              {/* Step 1 */}
              <div className="workflow-card text-center group opacity-0">
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-slate-900 transition-colors duration-300 shadow-lg group-hover:shadow-xl">
                  <Upload className="text-slate-600 group-hover:text-white transition-colors duration-300" size={28} />
                </div>
                <h4 className="text-xl font-medium text-slate-900 mb-4">Object Detection</h4>
                <p className="text-slate-600 leading-relaxed">
                  AI scans your image to identify unwanted objects and their boundaries
                </p>
              </div>

              {/* Step 2 */}
              <div className="workflow-card text-center group opacity-0">
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-slate-900 transition-colors duration-300 shadow-lg group-hover:shadow-xl">
                  <Target className="text-slate-600 group-hover:text-white transition-colors duration-300" size={28} />
                </div>
                <h4 className="text-xl font-medium text-slate-900 mb-4">Content Analysis</h4>
                <p className="text-slate-600 leading-relaxed">
                  Advanced algorithms analyze surrounding areas to understand background patterns
                </p>
              </div>

              {/* Step 3 */}
              <div className="workflow-card text-center group opacity-0">
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-slate-900 transition-colors duration-300 shadow-lg group-hover:shadow-xl">
                  <Zap className="text-slate-600 group-hover:text-white transition-colors duration-300" size={28} />
                </div>
                <h4 className="text-xl font-medium text-slate-900 mb-4">Seamless Fill</h4>
                <p className="text-slate-600 leading-relaxed">
                  Objects are removed and replaced with natural background content that matches perfectly
                </p>
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div ref={featuresRef} className="bg-white/60 backdrop-blur-xl p-8 md:p-12 rounded-3xl shadow-xl border border-slate-200/50">
            <div className="text-center mb-16">
              <h3 className="text-4xl md:text-5xl font-light text-slate-900 mb-6 tracking-tight">
                Why Choose <em className="italic text-slate-600">Object Removal</em>
              </h3>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto font-light">
                Professional object removal with intelligent background restoration
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {[
                {
                  icon: Zap,
                  title: "Lightning Fast",
                  description: "Remove unwanted objects in seconds with our optimized AI infrastructure."
                },
                {
                  icon: Target,
                  title: "Pixel Perfect",
                  description: "Seamless object removal that leaves no traces or artifacts behind."
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

export default ObjectRemovalPage;