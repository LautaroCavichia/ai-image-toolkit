import React, { useState } from 'react';
import Layout from '../components/Layout';
import Navbar from '../components/Navbar';
import JobStatus from '../components/JobStatus';
import { uploadImageAndCreateJob } from '../services/apiService';

// Define the ObjectRemoval job type
const OBJECT_REMOVAL = 'OBJECT_REMOVAL' as any;

interface ObjectRemovalConfig {
  method: 'BOUNDING_BOX' | 'PRECISE_MASK';
  coordinates?: { x: number; y: number; width: number; height: number };
  quality: 'FREE' | 'PREMIUM';
}

const ObjectRemovalPage: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const [config, setConfig] = useState<ObjectRemovalConfig>({
    method: 'BOUNDING_BOX',
    quality: 'FREE'
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError('');
      
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setError('');

    try {
      const response = await uploadImageAndCreateJob(selectedFile, OBJECT_REMOVAL, config);
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
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Object Removal</h1>
          <p className="text-lg text-gray-600">
            Remove unwanted objects from images with AI-powered inpainting technology.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Upload & Configure</h3>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Choose Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {preview && (
                <div className="border rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Preview:</h4>
                  <img 
                    src={preview} 
                    alt="Preview" 
                    className="max-w-full h-auto max-h-64 rounded border mx-auto"
                  />
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    {selectedFile?.name} ({Math.round((selectedFile?.size || 0) / 1024)} KB)
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Removal Method
                </label>
                <div className="space-y-3">
                  <button
                    onClick={() => setConfig(prev => ({ ...prev, method: 'BOUNDING_BOX' }))}
                    className={`w-full p-4 rounded-md border text-left transition-all ${
                      config.method === 'BOUNDING_BOX'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium">Smart Detection</div>
                    <div className="text-sm text-gray-600">AI automatically detects objects within your selection</div>
                    <div className="text-xs text-blue-600 mt-1">RECOMMENDED</div>
                  </button>
                  <button
                    onClick={() => setConfig(prev => ({ ...prev, method: 'PRECISE_MASK' }))}
                    className={`w-full p-4 rounded-md border text-left transition-all ${
                      config.method === 'PRECISE_MASK'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium">Precise Selection</div>
                    <div className="text-sm text-gray-600">Manual selection for complex objects</div>
                    <div className="text-xs text-gray-500 mt-1">ADVANCED</div>
                  </button>
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
                    <div className="text-sm text-gray-600">Good quality inpainting</div>
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
                    <div className="text-sm text-gray-600">High-quality AI inpainting with better context awareness</div>
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
                  'Remove Objects'
                )}
              </button>
            </div>

            <div className="mt-6 bg-orange-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2 text-orange-900">Coming Soon - Enhanced Interface</h4>
              <ul className="text-sm text-orange-800 space-y-1">
                <li>• Interactive object selection tool</li>
                <li>• Real-time object detection preview</li>
                <li>• Advanced masking controls</li>
                <li>• Multiple object removal in one session</li>
              </ul>
              <p className="text-xs text-orange-700 mt-2">
                Currently using basic configuration. Full interface coming in next update.
              </p>
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
                <h3 className="text-lg font-semibold mb-4">Object Removal Process</h3>
                <div className="space-y-4 text-gray-600">
                  <div className="flex items-start">
                    <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">1</div>
                    <div>
                      <h4 className="font-medium text-gray-900">Object Detection</h4>
                      <p className="text-sm">AI identifies objects to be removed from the image</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">2</div>
                    <div>
                      <h4 className="font-medium text-gray-900">Context Analysis</h4>
                      <p className="text-sm">Understanding surrounding areas for natural filling</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">3</div>
                    <div>
                      <h4 className="font-medium text-gray-900">AI Inpainting</h4>
                      <p className="text-sm">Generates natural content to replace removed objects</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <h4 className="font-medium text-purple-800 mb-2">Current Configuration</h4>
                  <div className="text-sm text-purple-700 space-y-1">
                    <div><strong>Method:</strong> {config.method === 'BOUNDING_BOX' ? 'Smart Detection' : 'Precise Selection'}</div>
                    <div><strong>Quality:</strong> {config.quality}</div>
                    <div><strong>Processing:</strong> {config.quality === 'PREMIUM' ? 'Advanced AI Inpainting' : 'Standard Inpainting'}</div>
                  </div>
                </div>

                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2">Tips for Best Results</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Choose images with clear object boundaries</li>
                    <li>• Premium quality works best for complex backgrounds</li>
                    <li>• Objects with consistent backgrounds remove more cleanly</li>
                    <li>• Avoid very small or highly detailed objects for now</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ObjectRemovalPage;