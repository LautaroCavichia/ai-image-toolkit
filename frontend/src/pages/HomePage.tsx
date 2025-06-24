import React from 'react';
import Layout from '../components/Layout';
import Navbar from '../components/Navbar';
import { isAuthenticated } from '../services/authService';

const HomePage: React.FC = () => {
  if (!isAuthenticated()) {
    return (
      <Layout>
        <Navbar />
        <div className="max-w-4xl mx-auto py-8 px-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Welcome to AI Image Toolkit</h2>
            <p className="text-gray-600 mb-8">
              Please log in or continue as a guest to start processing images.
            </p>
            <a 
              href="/login" 
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
            >
              Get Started
            </a>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Navbar />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 py-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Transform Images with <span className="text-blue-600">AI Magic</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Professional image processing powered by cutting-edge AI technology. 
            Remove backgrounds, enhance resolution, enlarge images, and more.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/background-removal" 
              className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 font-medium transition-colors"
            >
              Try Background Removal
            </a>
            <a 
              href="#services" 
              className="border border-blue-600 text-blue-600 px-8 py-4 rounded-lg hover:bg-blue-50 font-medium transition-colors"
            >
              Explore All Services
            </a>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div id="services" className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">AI-Powered Image Services</h2>
            <p className="text-lg text-gray-600">Choose the perfect tool for your image processing needs</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Background Removal */}
            <a 
              href="/background-removal" 
              className="group bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-100 hover:border-blue-200"
            >
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">🖼️</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Background Removal</h3>
              <p className="text-gray-600 text-sm mb-4">
                Remove backgrounds from images with AI precision. Perfect for product photos and portraits.
              </p>
              <div className="text-blue-600 font-medium group-hover:text-blue-700">
                Try it now →
              </div>
            </a>

            {/* Upscaling */}
            <a 
              href="/upscale" 
              className="group bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-100 hover:border-blue-200"
            >
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">🔍</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Image Upscaling</h3>
              <p className="text-gray-600 text-sm mb-4">
                Enhance image resolution up to 4x while preserving quality and details.
              </p>
              <div className="text-blue-600 font-medium group-hover:text-blue-700">
                Try it now →
              </div>
            </a>

            {/* Enlargement */}
            <a 
              href="/enlarge" 
              className="group bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-100 hover:border-blue-200"
            >
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">📈</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Image Enlargement</h3>
              <p className="text-gray-600 text-sm mb-4">
                Intelligently enlarge images with AI-generated content to fill new dimensions.
              </p>
              <div className="text-blue-600 font-medium group-hover:text-blue-700">
                Try it now →
              </div>
            </a>

            {/* Object Removal */}
            <a 
              href="/object-removal" 
              className="group bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-100 hover:border-blue-200"
            >
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">✨</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Object Removal</h3>
              <p className="text-gray-600 text-sm mb-4">
                Remove unwanted objects from images with AI-powered inpainting technology.
              </p>
              <div className="text-blue-600 font-medium group-hover:text-blue-700">
                Try it now →
              </div>
            </a>
          </div>

          {/* Coming Soon */}
          <div className="mt-8">
            <a 
              href="/style-transfer" 
              className="group bg-gradient-to-r from-purple-50 to-indigo-50 p-6 rounded-xl border border-purple-200 hover:border-purple-300 transition-colors block"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="text-4xl mr-4 group-hover:scale-110 transition-transform">🎨</div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">Style Transfer</h3>
                    <p className="text-gray-600 text-sm">Transform images with artistic styles - Coming Soon!</p>
                  </div>
                </div>
                <div className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
                  Coming Soon
                </div>
              </div>
            </a>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Our AI Tools?</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Lightning Fast</h3>
              <p className="text-gray-600">
                Advanced AI models optimized for speed without compromising quality.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Precise Results</h3>
              <p className="text-gray-600">
                Professional-grade results with pixel-perfect accuracy and attention to detail.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔧</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Easy to Use</h3>
              <p className="text-gray-600">
                Simple interface designed for both beginners and professionals.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default HomePage;