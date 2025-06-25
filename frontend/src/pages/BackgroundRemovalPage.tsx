import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Scissors, Upload, CheckCircle, Sparkles, Info, Zap, Target } from 'lucide-react';
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
  const stepsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline();
    
    if (heroRef.current) {
      tl.fromTo(heroRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1, ease: "power3.out" }
      );
    }
    
    if (uploaderRef.current) {
      tl.fromTo(uploaderRef.current,
        { opacity: 0, x: -30 },
        { opacity: 1, x: 0, duration: 0.8, ease: "power3.out" },
        "-=0.6"
      );
    }
    
    if (stepsRef.current) {
      tl.fromTo(stepsRef.current,
        { opacity: 0, x: 30 },
        { opacity: 1, x: 0, duration: 0.8, ease: "power3.out" },
        "-=0.6"
      );
    }
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
        <div className="max-w-6xl mx-auto py-12 px-6">
          
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Upload Section */}
            <div ref={uploaderRef} className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-slate-200/50">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center">
                  <Upload className="text-slate-700" size={20} />
                </div>
                <div>
                  <h3 className="text-2xl font-medium text-slate-900">Drop Your Image</h3>
                  <p className="text-slate-600">Ready to make magic happen?</p>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl mb-6 text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-6">
                <DragDropUploader
                  onFileSelect={handleFileSelect}
                  preview={preview}
                  maxSize={10}
                />

                {selectedFile && (
                  <div className="text-center text-sm text-slate-600 bg-green-50 p-4 rounded-2xl border border-green-200">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <CheckCircle className="text-green-600" size={16} />
                      <strong>Locked and Loaded</strong>
                    </div>
                    <div>{selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)</div>
                  </div>
                )}

                <button
                  onClick={handleUpload}
                  disabled={!selectedFile || loading}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white py-4 px-6 rounded-2xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
                >
                  <div className="flex items-center justify-center gap-3">
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Cutting Through...
                      </>
                    ) : (
                      <>
                        <Sparkles size={20} />
                        Slice & Dice
                      </>
                    )}
                  </div>
                </button>
              </div>

              {/* Features */}
              <div className="mt-8 bg-slate-50 p-6 rounded-2xl">
                <div className="flex items-center gap-2 mb-4">
                  <Info className="text-slate-600" size={18} />
                  <h4 className="font-medium text-slate-900">What We Support</h4>
                </div>
                <ul className="text-sm text-slate-700 space-y-2">
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                    JPG, PNG, WEBP formats
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                    AI-powered precision cutting
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                    Clean transparent backgrounds
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                    Up to 10MB file size
                  </li>
                </ul>
              </div>
            </div>

            {/* Status or How it Works */}
            <div ref={stepsRef}>
              {currentJobId ? (
                <JobStatus 
                  jobId={currentJobId} 
                  onJobCompleted={handleJobCompleted}
                />
              ) : (
                <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-slate-200/50">
                  <h3 className="text-2xl font-medium text-slate-900 mb-8">How We Do It</h3>
                  <div className="space-y-8">
                    {[
                      {
                        step: '1',
                        title: 'Upload & Analyze',
                        description: 'Drop your image and let our AI scan every pixel',
                        icon: Upload,
                        color: 'bg-blue-500'
                      },
                      {
                        step: '2', 
                        title: 'Smart Detection',
                        description: 'AI identifies your subject and background boundaries',
                        icon: Target,
                        color: 'bg-purple-500'
                      },
                      {
                        step: '3',
                        title: 'Clean Cut', 
                        description: 'Precise removal with transparent background',
                        icon: Zap,
                        color: 'bg-green-500'
                      }
                    ].map((item, index) => (
                      <div key={item.step} className="flex items-start gap-4">
                        <div className={`flex items-center justify-center w-12 h-12 ${item.color} text-white rounded-2xl font-medium shadow-lg`}>
                          {item.step}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-slate-900 mb-2">{item.title}</h4>
                          <p className="text-slate-600 leading-relaxed">{item.description}</p>
                        </div>
                        <item.icon className="text-slate-400 mt-2" size={24} />
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-8 p-6 bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl border border-orange-200">
                    <h4 className="font-medium text-slate-900 mb-2">Pro Tip</h4>
                    <p className="text-slate-700 text-sm">
                      Best results with clear subject-background contrast. Think product shots, portraits, or objects with defined edges.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default BackgroundRemovalPage;