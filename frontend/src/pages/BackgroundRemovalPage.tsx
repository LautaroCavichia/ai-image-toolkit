import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Scissors, Upload, CheckCircle, Sparkles, Info, Zap, Target, Shield, ChevronRight } from 'lucide-react';
import Layout from '../components/Layout';
import Navbar from '../components/Navbar';
import JobStatus from '../components/JobStatus';
import DragDropUploader from '../components/DragDropUploader';
import { JobTypeEnum } from '../types';
import { uploadImageAndCreateJob } from '../services/apiService';

const BackgroundRemovalPage: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);

  const heroRef = useRef<HTMLDivElement>(null);
  const uploaderRef = useRef<HTMLDivElement>(null);
  const workflowRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline();
    
    // Set initial states for vertical layout
    gsap.set([heroRef.current, uploaderRef.current, workflowRef.current, featuresRef.current], {
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
    .to(workflowRef.current, {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.8,
      ease: "power3.out"
    }, "-=0.6")
    .to(featuresRef.current, {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.8,
      ease: "power3.out"
    }, "-=0.4");

    // Simple workflow animation
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
      const response = await uploadImageAndCreateJob(selectedFile, JobTypeEnum.BG_REMOVAL);
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

  return (
    <Layout>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-slate-100 pt-20">
        <div className="max-w-4xl mx-auto py-12 px-6">
          
          {/* Hero Section */}
          <div ref={heroRef} className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-full font-medium text-sm mb-8">
              <Scissors size={16} />
              Background Removal
            </div>
            <h1 className="text-5xl md:text-6xl font-light text-slate-900 mb-6 leading-tight tracking-tight">
              Cut Through the
              <br />
              <span className="font-medium italic bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 bg-clip-text text-transparent">
                Background Noise
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed font-light">
              Slash away distractions. Isolate what matters.
              <br />
              <em className="text-slate-500">Because your subject deserves the spotlight.</em>
            </p>
          </div>

          {/* Upload Section - Full Width Vertical Layout */}
          <div ref={uploaderRef} className="bg-white/80 backdrop-blur-xl p-8 md:p-12 rounded-3xl shadow-xl border border-slate-200/50 mb-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Upload className="text-slate-700" size={24} />
              </div>
              <h3 className="text-3xl font-light text-slate-900 mb-3 tracking-tight">Drop Your Image</h3>
              <p className="text-slate-600 text-lg">Ready to make magic happen?</p>
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
                    <strong className="text-green-800">Locked and Loaded</strong>
                  </div>
                  <div className="text-slate-600">{selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)</div>
                </div>
              )}

              <button
                onClick={handleUpload}
                disabled={!selectedFile || loading}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white py-6 px-8 rounded-2xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] text-lg"
              >
                <div className="flex items-center justify-center gap-3">
                  {loading ? (
                    <>
                      <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Cutting Through...
                    </>
                  ) : (
                    <>
                      <Sparkles size={24} />
                      Slice & Dice
                    </>
                  )}
                </div>
              </button>
            </div>
          </div>

          {/* Job Status Section */}
          {currentJobId && (
            <div className="mb-8">
              <JobStatus 
                jobId={currentJobId} 
                onJobCompleted={handleJobCompleted}
              />
            </div>
          )}

          {/* How it Works Section */}
          <div ref={workflowRef} className="bg-white/80 backdrop-blur-xl p-8 md:p-12 rounded-3xl shadow-xl border border-slate-200/50 mb-8">
            <div className="text-center mb-16">
              <h3 className="text-4xl md:text-5xl font-light text-slate-900 mb-6 tracking-tight">
                <em className="italic font-medium bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 bg-clip-text text-transparent">Intelligent</em> Workflow
              </h3>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto font-light">
                Watch AI precision in action as we transform your images
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* Step 1 */}
              <div className="workflow-card text-center group opacity-0">
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-slate-900 transition-colors duration-300 shadow-lg group-hover:shadow-xl">
                  <Upload className="text-slate-600 group-hover:text-white transition-colors duration-300" size={28} />
                </div>
                <h4 className="text-xl font-medium text-slate-900 mb-4">Upload & Analyze</h4>
                <p className="text-slate-600 leading-relaxed">
                  Drop your image and let our AI scan every pixel with surgical precision
                </p>
              </div>

              {/* Step 2 */}
              <div className="workflow-card text-center group opacity-0">
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-slate-900 transition-colors duration-300 shadow-lg group-hover:shadow-xl">
                  <Target className="text-slate-600 group-hover:text-white transition-colors duration-300" size={28} />
                </div>
                <h4 className="text-xl font-medium text-slate-900 mb-4">Smart Detection</h4>
                <p className="text-slate-600 leading-relaxed">
                  AI identifies your subject and background boundaries using advanced algorithms
                </p>
              </div>

              {/* Step 3 */}
              <div className="workflow-card text-center group opacity-0">
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-slate-900 transition-colors duration-300 shadow-lg group-hover:shadow-xl">
                  <Zap className="text-slate-600 group-hover:text-white transition-colors duration-300" size={28} />
                </div>
                <h4 className="text-xl font-medium text-slate-900 mb-4">Clean Cut</h4>
                <p className="text-slate-600 leading-relaxed">
                  Precise removal with crystal-clear transparent background, ready to use
                </p>
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div ref={featuresRef} className="bg-white/80 backdrop-blur-xl p-8 md:p-12 rounded-3xl shadow-xl border border-slate-200/50">
            <div className="text-center mb-16">
              <h3 className="text-4xl md:text-5xl font-light text-slate-900 mb-6 tracking-tight">
                Why Choose <em className="italic text-slate-600">Background Removal</em>
              </h3>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto font-light">
                Professional-grade results with unmatched precision and quality
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {[
                {
                  icon: Zap,
                  title: "Lightning Fast",
                  description: "Process images in seconds with our optimized AI infrastructure."
                },
                {
                  icon: Target,
                  title: "Pixel Perfect",
                  description: "Professional-grade results with unmatched precision and quality."
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
            
            <div className="mt-12 p-6 bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl border border-orange-200/50 text-center">
              <h4 className="font-medium text-slate-900 mb-2 flex items-center justify-center gap-2">
                <Info size={20} />
                Pro Tip
              </h4>
              <p className="text-slate-700">
                Best results with clear subject-background contrast. Think product shots, portraits, or objects with defined edges.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default BackgroundRemovalPage;