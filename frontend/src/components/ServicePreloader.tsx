import React from 'react';
import { Scissors, Maximize, Move, Eraser, Palette } from 'lucide-react';

interface ServicePreloaderProps {
  serviceType: 'background-removal' | 'upscale' | 'enlarge' | 'object-removal' | 'style-transfer';
}

const ServicePreloader: React.FC<ServicePreloaderProps> = ({ serviceType }) => {
  const getServiceConfig = (type: string) => {
    const configs = {
      'background-removal': {
        icon: Scissors,
        title: 'Background Removal',
        subtitle: 'Cutting through the noise...',
        gradient: 'from-red-500 via-orange-500 to-yellow-500',
        bgGradient: 'from-red-50 via-orange-50 to-yellow-50'
      },
      'upscale': {
        icon: Maximize,
        title: 'Image Upscaling',
        subtitle: 'Enhancing resolution...',
        gradient: 'from-emerald-500 via-teal-500 to-cyan-500',
        bgGradient: 'from-emerald-50 via-teal-50 to-cyan-50'
      },
      'enlarge': {
        icon: Move,
        title: 'Image Enlargement',
        subtitle: 'Expanding dimensions...',
        gradient: 'from-violet-500 via-purple-500 to-indigo-500',
        bgGradient: 'from-violet-50 via-purple-50 to-indigo-50'
      },
      'object-removal': {
        icon: Eraser,
        title: 'Object Removal',
        subtitle: 'Eliminating distractions...',
        gradient: 'from-orange-500 via-red-500 to-pink-500',
        bgGradient: 'from-orange-50 via-red-50 to-pink-50'
      },
      'style-transfer': {
        icon: Palette,
        title: 'Style Transfer',
        subtitle: 'Applying artistic magic...',
        gradient: 'from-pink-500 via-rose-500 to-red-500',
        bgGradient: 'from-pink-50 via-rose-50 to-red-50'
      }
    };
    return configs[type as keyof typeof configs] || configs['background-removal'];
  };

  const config = getServiceConfig(serviceType);
  const IconComponent = config.icon;

  return (
    <div 
      className={`fixed inset-0 z-[9999] bg-gradient-to-br ${config.bgGradient} backdrop-blur-sm flex items-center justify-center`}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh'
      }}
    >
      <div className="text-center">
        {/* Animated Icon */}
        <div className="relative mb-8">
          <div className={`w-24 h-24 bg-gradient-to-r ${config.gradient} rounded-3xl flex items-center justify-center mx-auto shadow-2xl preloader-spinner`}>
            <IconComponent className="text-white" size={40} />
          </div>
          
          {/* Floating particles */}
          <div className="absolute -inset-8 pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className={`absolute w-2 h-2 bg-gradient-to-r ${config.gradient} rounded-full opacity-40 animate-pulse`}
                style={{
                  left: `${20 + Math.cos(i * 60 * Math.PI / 180) * 40}%`,
                  top: `${20 + Math.sin(i * 60 * Math.PI / 180) * 40}%`,
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: `${2 + i * 0.1}s`
                }}
              />
            ))}
          </div>
        </div>
        
        {/* Service Title */}
        <h2 className={`text-3xl font-light text-transparent bg-gradient-to-r ${config.gradient} bg-clip-text mb-3 tracking-tight`}>
          {config.title}
        </h2>
        
        {/* Loading Subtitle */}
        <p className="text-slate-600 text-lg mb-6 font-light">
          {config.subtitle}
        </p>
        
        {/* Progress Dots */}
        <div className="flex items-center justify-center gap-2">
          {[0, 1, 2, 3].map((index) => (
            <div
              key={index}
              className={`w-2 h-2 bg-gradient-to-r ${config.gradient} rounded-full animate-pulse`}
              style={{
                animationDelay: `${index * 0.3}s`,
                animationDuration: '1.5s'
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ServicePreloader;