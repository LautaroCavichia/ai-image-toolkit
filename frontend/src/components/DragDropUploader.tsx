import React, { useState, useCallback, useRef } from 'react';
import { Upload, Image, CheckCircle } from 'lucide-react';

interface DragDropUploaderProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSize?: number; // in MB
  preview?: string | null;
  className?: string;
}

const DragDropUploader: React.FC<DragDropUploaderProps> = ({ 
  onFileSelect, 
  accept = "image/*", 
  maxSize = 10,
  preview,
  className = ""
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [, setDragCounter] = useState(0);
  const [error, setError] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Sample images - using placeholder images
  const sampleImages = [
    {
      url: 'https://images.unsplash.com/photo-1519052537078-e6302a4968d4?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      name: 'Cat'
    },
    {
      url: 'https://i.imgur.com/yPoBGCN.jpeg',
      name: 'House Room'
    },
    {
      url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&h=200&fit=crop',
      name: 'Landscape'
    },
    {
      url: 'https://i.imgur.com/aOfDSiN.jpeg',
      name: 'Wild Life'
    }
  ];

  const validateFile = useCallback((file: File): boolean => {
    setError('');
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return false;
    }
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSize) {
      setError(`File size must be less than ${maxSize}MB`);
      return false;
    }
    return true;
  }, [maxSize]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && validateFile(file)) {
      onFileSelect(file);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    setDragCounter(0);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const file = files[0];
      if (validateFile(file)) {
        onFileSelect(file);
      }
    }
  }, [onFileSelect, validateFile]);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleSampleImageClick = async (imageUrl: string, imageName: string) => {
    try {
      // Fetch the image and convert to File
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const file = new File([blob], `${imageName.toLowerCase().replace(/\s+/g, '_')}.jpg`, { type: 'image/jpeg' });
      
      if (validateFile(file)) {
        onFileSelect(file);
      }
    } catch (err) {
      setError('Failed to load sample image. Please try uploading your own image.');
    }
  };

  return (
    <div className={`${className}`}>
      {/* 👇 Input real, oculto visualmente pero funcional */}
      <input
        type="file"
        accept={accept}
        ref={inputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      <div
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onDragEnter={(e) => { e.preventDefault(); setIsDragging(true); setDragCounter((c) => c + 1); }}
        onDragLeave={(e) => { e.preventDefault(); setDragCounter((c) => { const n = c - 1; if (n === 0) setIsDragging(false); return n; }); }}
        className={`
          relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300
          ${isDragging 
            ? 'border-blue-400 bg-blue-50 scale-105' 
            : preview 
              ? 'border-green-300 bg-green-50'
              : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50'
          }
        `}
      >
        {preview ? (
          <div className="space-y-4">
            <div className="relative inline-block">
              <img 
                src={preview} 
                alt="Preview" 
                className="max-w-full h-auto max-h-48 rounded-xl border mx-auto shadow-lg"
              />
            </div>
            <div className="text-sm text-green-700 flex items-center justify-center gap-2">
              <CheckCircle size={16} />
              Perfect! Click to change or drag a new image.
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className={`${isDragging ? 'animate-bounce' : ''}`}>
              {isDragging ? (
                <Upload className="mx-auto text-blue-500" size={48} />
              ) : (
                <Image className="mx-auto text-slate-400" size={48} />
              )}
            </div>
            <div>
              <h3 className="text-xl font-medium text-slate-900 mb-2">
                {isDragging ? 'Drop it like it\'s hot!' : 'Upload Your Image'}
              </h3>
              <p className="text-slate-600 mb-2">
                Drag and drop an image file, or click to browse
              </p>
              <p className="text-sm text-slate-500">
                Supports: JPG, PNG, GIF, WEBP (max {maxSize}MB)
              </p>
            </div>
          </div>
        )}

        {isDragging && (
          <div className="absolute inset-0 bg-blue-100/50 rounded-2xl flex items-center justify-center">
            <div className="text-blue-600 font-medium text-lg">
              Release to upload
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Sample Images Section */}
      <div className="mt-6">
        <div className="text-center mb-4">
          <p className="text-sm text-slate-600 mb-3">Don't have an image? Try these:</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {sampleImages.map((sample, index) => (
              <div
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSampleImageClick(sample.url, sample.name);
                }}
                className="cursor-pointer group relative rounded-lg overflow-hidden border-2 border-slate-200 hover:border-blue-400 transition-all duration-200 hover:scale-105"
              >
                <img
                  src={sample.url}
                  alt={sample.name}
                  className="w-full h-20 object-cover group-hover:opacity-80 transition-opacity"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-medium">
                    {sample.name}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 text-xs text-slate-500 text-center">
        Your images are processed securely and automatically deleted after processing
      </div>
    </div>
  );
};

export default DragDropUploader;