import React, { useState, useCallback } from 'react';
import { Upload, Image as ImageIcon, CheckCircle } from 'lucide-react';

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

  return (
    <div className={`${className}`}>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200
          ${isDragging 
            ? 'border-primary-500 bg-primary-50 scale-105' 
            : 'border-neutral-300 hover:border-primary-400 hover:bg-neutral-50'
          }
          ${preview ? 'border-secondary-400 bg-secondary-50' : ''}
        `}
      >
        {preview ? (
          <div className="space-y-4">
            <img 
              src={preview} 
              alt="Preview" 
              className="max-w-full h-auto max-h-64 rounded border mx-auto shadow-sm"
            />
            <div className="text-sm text-secondary-700 flex items-center justify-center gap-2">
              <CheckCircle size={16} />
              Image uploaded successfully. Click to change or drag a new image.
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className={`${isDragging ? 'animate-bounce' : ''}`}>
              {isDragging ? (
                <Upload className="mx-auto text-primary-500" size={48} />
              ) : (
                <ImageIcon className="mx-auto text-neutral-400" size={48} />
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                {isDragging ? 'Drop your image here!' : 'Upload Your Image'}
              </h3>
              <p className="text-neutral-600">
                Drag and drop an image file, or click to browse
              </p>
              <p className="text-sm text-neutral-500 mt-2">
                Supports: JPG, PNG, GIF, WEBP (max {maxSize}MB)
              </p>
            </div>
          </div>
        )}
        
        {isDragging && (
          <div className="absolute inset-0 bg-primary-100 bg-opacity-50 rounded-lg flex items-center justify-center">
            <div className="text-primary-600 font-semibold text-lg">
              Drop image here
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-3 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="mt-3 text-xs text-neutral-500 text-center">
        Your images are processed securely and not stored permanently
      </div>
    </div>
  );
};

export default DragDropUploader;