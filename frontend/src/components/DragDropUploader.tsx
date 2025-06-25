import React, { useState, useCallback } from 'react';
import { Upload, Image as ImageIcon, CheckCircle, X } from 'lucide-react';

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

  const validateFile = useCallback((file: File): boolean => {
    setError('');

    // Check file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return false;
    }

    // Check file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSize) {
      setError(`File size must be less than ${maxSize}MB`);
      return false;
    }

    return true;
  }, [maxSize]);

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

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragCounter(prev => prev + 1);
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragCounter(prev => {
      const newCounter = prev - 1;
      if (newCounter === 0) {
        setIsDragging(false);
      }
      return newCounter;
    });
  }, []);

  const handleClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = accept;
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files && target.files.length > 0) {
        const file = target.files[0];
        if (validateFile(file)) {
          onFileSelect(file);
        }
      }
    };
    input.click();
  };

  const clearPreview = (e: React.MouseEvent) => {
    e.stopPropagation();
    setError('');
    // You might want to add an onClear callback here if needed
  };

  return (
    <div className={`${className}`}>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
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
              <button
                onClick={clearPreview}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors duration-200"
              >
                <X size={14} />
              </button>
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
                <ImageIcon className="mx-auto text-slate-400" size={48} />
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

      <div className="mt-4 text-xs text-slate-500 text-center">
        Your images are processed securely and automatically deleted after processing
      </div>
    </div>
  );
};

export default DragDropUploader;