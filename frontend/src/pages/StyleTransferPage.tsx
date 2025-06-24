import React from 'react';
import Layout from '../components/Layout';
import Navbar from '../components/Navbar';

const StyleTransferPage: React.FC = () => {
  return (
    <Layout>
      <Navbar />
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4 title-font">Style Transfer</h1>
          <p className="text-lg text-gray-600">
            Transform your images with artistic styles and custom prompts.
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="bg-gradient-to-br from-purple-50 to-indigo-100 border border-purple-200 p-8 rounded-lg text-center">
            <div className="text-6xl mb-4">🎨</div>
            <h2 className="text-2xl font-bold text-purple-900 mb-4">Coming Soon!</h2>
            <p className="text-purple-700 mb-6">
              We're working on an amazing style transfer feature that will allow you to transform your images 
              with various artistic styles including Van Gogh, Picasso, Anime, and many more.
            </p>
            
            <div className="bg-white p-6 rounded-lg border border-purple-200 mb-6">
              <h3 className="text-lg font-semibold text-purple-900 mb-4">Planned Features:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-purple-800">
                <div className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>20+ Artistic Styles</span>
                </div>
                <div className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Custom Prompts</span>
                </div>
                <div className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Style Strength Control</span>
                </div>
                <div className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>High-Quality Output</span>
                </div>
                <div className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Popular Styles (Ghibli, Anime)</span>
                </div>
                <div className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Classic Art Styles</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                <p className="text-yellow-800 text-sm">
                  <strong>Development Status:</strong> Currently implementing the style transfer pipeline with Stable Diffusion models.
                </p>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <p className="text-blue-800 text-sm">
                  <strong>Expected Launch:</strong> This feature will be available in the next major update.
                </p>
              </div>
            </div>

            <div className="mt-8">
              <a 
                href="/" 
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 transition-colors"
              >
                ← Back to Home
              </a>
            </div>
          </div>

          <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Available Services</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <a 
                href="/background-removal" 
                className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
              >
                <div className="text-2xl mb-2">🖼️</div>
                <div className="font-medium text-gray-900">Background Removal</div>
                <div className="text-sm text-gray-600">Remove backgrounds with AI</div>
              </a>
              <a 
                href="/upscale" 
                className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
              >
                <div className="text-2xl mb-2">🔍</div>
                <div className="font-medium text-gray-900">Image Upscaling</div>
                <div className="text-sm text-gray-600">Enhance resolution</div>
              </a>
              <a 
                href="/enlarge" 
                className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
              >
                <div className="text-2xl mb-2">📈</div>
                <div className="font-medium text-gray-900">Image Enlargement</div>
                <div className="text-sm text-gray-600">Intelligent expansion</div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default StyleTransferPage;