import React, { useState } from 'react';
import Layout from '../components/Layout';
import Navbar from '../components/Navbar';
import JobStatus from '../components/JobStatus';
import DragDropUploader from '../components/DragDropUploader';
import { JobTypeEnum } from '../types';
import { uploadImageAndCreateJob } from '../services/apiService';

const UpscalePage: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const [quality, setQuality] = useState<'FREE' | 'PREMIUM'>('FREE');

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
      const jobConfig = {
        quality,
        scale: quality === 'PREMIUM' ? 4 : 2
      };
      
      const response = await uploadImageAndCreateJob(selectedFile, JobTypeEnum.UPSCALE, jobConfig);
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
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4 title-font">Image Upscaling</h1>
          <p className="text-lg text-gray-600">
            Enhance image resolution while preserving quality and details using advanced AI technology.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Upload Your Image</h3>

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
                  Upscaling Quality
                </label>
                <div className="grid grid-cols-1 gap-3">
                  <button
                    onClick={() => setQuality('FREE')}
                    className={`p-4 rounded-md border text-left transition-all ${
                      quality === 'FREE'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium">Standard Quality (2x)</div>
                    <div className="text-sm text-gray-600">Fast 2x upscaling with good quality</div>
                    <div className="text-xs text-green-600 mt-1">FREE</div>
                  </button>
                  <button
                    onClick={() => setQuality('PREMIUM')}
                    className={`p-4 rounded-md border text-left transition-all ${
                      quality === 'PREMIUM'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium">Premium Quality (4x)</div>
                    <div className="text-sm text-gray-600">High-quality 4x upscaling with AI enhancement</div>
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
                  `Upscale Image (${quality === 'PREMIUM' ? '4x' : '2x'})`
                )}
              </button>
            </div>

            <div className="mt-6 bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2 text-blue-900">Service Features:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Enhances resolution up to 4x</li>
                <li>• Preserves image quality and details</li>
                <li>• Best for photos and artwork</li>
                <li>• AI-powered enhancement algorithms</li>
                <li>• Multiple quality options available</li>
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
                <h3 className="text-lg font-semibold mb-4">Upscaling Process</h3>
                <div className="space-y-4 text-gray-600">
                  <div className="flex items-start">
                    <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">1</div>
                    <div>
                      <h4 className="font-medium text-gray-900">Image Analysis</h4>
                      <p className="text-sm">AI analyzes pixel patterns and textures</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">2</div>
                    <div>
                      <h4 className="font-medium text-gray-900">Smart Enhancement</h4>
                      <p className="text-sm">Intelligent interpolation and detail enhancement</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">3</div>
                    <div>
                      <h4 className="font-medium text-gray-900">Quality Optimization</h4>
                      <p className="text-sm">Final quality optimization and artifact removal</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="font-medium text-yellow-800 mb-2">Quality Comparison</h4>
                  <div className="text-sm text-yellow-700 space-y-1">
                    <div><strong>Standard (2x):</strong> Fast processing, good for web use</div>
                    <div><strong>Premium (4x):</strong> Best quality, ideal for print and professional use</div>
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

export default UpscalePage;