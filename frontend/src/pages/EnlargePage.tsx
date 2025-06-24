import React, { useState } from 'react';
import Layout from '../components/Layout';
import Navbar from '../components/Navbar';
import JobStatus from '../components/JobStatus';
import DragDropUploader from '../components/DragDropUploader';
import { JobTypeEnum } from '../types';
import { uploadImageAndCreateJob } from '../services/apiService';

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

  const aspectRatios = [
    {
      type: 'square' as const,
      label: 'Square',
      description: 'Expands image to 1:1 ratio with balanced natural environment',
      ratio: '1:1'
    },
    {
      type: 'portrait' as const,
      label: 'Portrait',
      description: 'Expands to 3:4 ratio with vertical scene extension',
      ratio: '3:4'
    },
    {
      type: 'landscape' as const,
      label: 'Landscape',
      description: 'Expands to 4:3 ratio with natural outdoor environment',
      ratio: '4:3'
    }
  ];

  return (
    <Layout>
      <Navbar />
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4 title-font">Image Enlargement</h1>
          <p className="text-lg text-gray-600">
            Intelligently enlarge images with AI-generated content to fill new dimensions.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Configure Enlargement</h3>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
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
                <div className="text-center text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                  <strong>File:</strong> {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Target Aspect Ratio
                </label>
                <div className="space-y-3">
                  {aspectRatios.map((aspect) => (
                    <button
                      key={aspect.type}
                      onClick={() => setConfig(prev => ({ ...prev, aspectRatio: aspect.type }))}
                      className={`w-full p-4 rounded-md border text-left transition-all ${
                        config.aspectRatio === aspect.type
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">{aspect.label}</div>
                          <div className="text-sm text-gray-600 mt-1">{aspect.description}</div>
                        </div>
                        <div className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {aspect.ratio}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Quality Level
                </label>
                <div className="grid grid-cols-1 gap-3">
                  <button
                    onClick={() => setConfig(prev => ({ ...prev, quality: 'FREE' }))}
                    className={`p-4 rounded-md border text-left transition-all ${
                      config.quality === 'FREE'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium">Standard Quality</div>
                    <div className="text-sm text-gray-600">Basic content-aware expansion</div>
                    <div className="text-xs text-green-600 mt-1">FREE</div>
                  </button>
                  <button
                    onClick={() => setConfig(prev => ({ ...prev, quality: 'PREMIUM' }))}
                    className={`p-4 rounded-md border text-left transition-all ${
                      config.quality === 'PREMIUM'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium">Premium Quality</div>
                    <div className="text-sm text-gray-600">AI-powered generative fill with Stable Diffusion</div>
                    <div className="text-xs text-orange-600 mt-1">1 TOKEN</div>
                  </button>
                </div>
              </div>

              <button
                onClick={handleUpload}
                disabled={!selectedFile || loading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    Processing...
                  </span>
                ) : (
                  `Enlarge to ${config.aspectRatio}`
                )}
              </button>
            </div>

            <div className="mt-6 bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2 text-blue-900">How It Works:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Your original image is centered in the new canvas</li>
                <li>• AI generates natural content for surrounding areas</li>
                <li>• Context-aware environment generation</li>
                <li>• Seamless blending with original image</li>
              </ul>
            </div>
          </div>

          <div>
            {currentJobId ? (
              <JobStatus 
                jobId={currentJobId} 
                onJobCompleted={handleJobCompleted}
              />
            ) : (
              <div className="bg-gray-100 p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-4">Enlargement Preview</h3>
                <div className="space-y-4 text-gray-600">
                  <div className="flex items-start">
                    <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">1</div>
                    <div>
                      <h4 className="font-medium text-gray-900">Image Centering</h4>
                      <p className="text-sm">Your image is placed at the center of a larger canvas</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">2</div>
                    <div>
                      <h4 className="font-medium text-gray-900">Context Analysis</h4>
                      <p className="text-sm">AI analyzes the image context and surroundings</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">3</div>
                    <div>
                      <h4 className="font-medium text-gray-900">Content Generation</h4>
                      <p className="text-sm">Natural environment is generated to fill empty areas</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-medium text-green-800 mb-2">Current Configuration</h4>
                  <div className="text-sm text-green-700 space-y-1">
                    <div><strong>Aspect Ratio:</strong> {config.aspectRatio}</div>
                    <div><strong>Quality:</strong> {config.quality}</div>
                    <div><strong>Method:</strong> {config.quality === 'PREMIUM' ? 'Stable Diffusion Inpainting' : 'Basic Content Fill'}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default EnlargePage;