import React from 'react';
import { ExternalLink } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white/60 backdrop-blur-sm border-t border-slate-200/50">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-slate-900">
              Pixel Perfect AI
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Professional image processing powered by cutting-edge AI technology. 
              Transform your creative vision into reality.
            </p>
            <p className="text-xs text-slate-500 font-brand">
              by ZONDA
            </p>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-slate-900">
              Services
            </h3>
            <ul className="space-y-2">
              <li>
                <a href="/background-removal" className="text-slate-600 hover:text-slate-900 text-sm transition-colors">
                  Background Removal
                </a>
              </li>
              <li>
                <a href="/enlarge" className="text-slate-600 hover:text-slate-900 text-sm transition-colors">
                  Image Enlargement
                </a>
              </li>
              <li>
                <a href="/upscale" className="text-slate-600 hover:text-slate-900 text-sm transition-colors">
                  Image Upscaling
                </a>
              </li>
              <li>
                <a href="/object-removal" className="text-slate-600 hover:text-slate-900 text-sm transition-colors">
                  Object Removal
                </a>
              </li>
              <li>
                <span className="text-slate-400 text-sm">
                  Style Transfer (Coming Soon)
                </span>
              </li>
              <li>
                <span className="text-slate-400 text-sm">
                  File Conversion (Coming Soon)
                </span>
              </li>
            </ul>
          </div>

          {/* Company Link */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-slate-900">
              Company
            </h3>
            <a 
              href="https://zonda.one" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 text-sm transition-colors group"
            >
              <span>Visit ZONDA</span>
              <ExternalLink size={14} className="group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-slate-200/50 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-xs text-slate-500">
            © 2024 Pixel Perfect AI. All rights reserved.
          </p>
          <a 
            href="https://zonda.one" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs text-slate-500 hover:text-slate-700 transition-colors font-brand"
          >
            Powered by ZONDA
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;