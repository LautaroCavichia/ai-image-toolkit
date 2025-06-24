import React, { useState } from 'react';
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
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4 title-font">Background Removal</h1>
          <p className="text-lg text-gray-600">
            Remove backgrounds from images with AI precision. Perfect for product photos, portraits, and more.
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

            <div className="space-y-4">
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
                  'Remove Background'
                )}
              </button>
            </div>

            <div className="mt-6 bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2 text-blue-900">Service Features:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Supports JPG, PNG, WEBP formats</li>
                <li>• AI-powered edge detection</li>
                <li>• High-quality background removal</li>
                <li>• Free quality: 1024px max resolution</li>
                <li>• Premium quality: Full resolution</li>
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
                <h3 className="text-lg font-semibold mb-4">How it Works</h3>
                <div className="space-y-4 text-gray-600">
                  <div className="flex items-start">
                    <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">1</div>
                    <div>
                      <h4 className="font-medium text-gray-900">Upload Image</h4>
                      <p className="text-sm">Select any image with a subject you want to isolate</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">2</div>
                    <div>
                      <h4 className="font-medium text-gray-900">AI Processing</h4>
                      <p className="text-sm">Our AI analyzes and removes the background automatically</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">3</div>
                    <div>
                      <h4 className="font-medium text-gray-900">Download Result</h4>
                      <p className="text-sm">Get your image with transparent background</p>
                    </div>
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

export default BackgroundRemovalPage;