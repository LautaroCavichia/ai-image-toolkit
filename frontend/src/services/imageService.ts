// src/services/imageService.ts
import axios from 'axios';
import { getToken } from './authService';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api/v1';

export interface Job {
  id: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  jobType: string;
  progress: number;
  originalImageUrl?: string;
  resultImageUrl?: string;
  errorMessage?: string;
  tokenUsed?: boolean;
  createdAt: string;
  completedAt?: string;
}

export const uploadImageAndCreateJob = async (
  file: File,
  jobType: string,
  jobConfig?: any
): Promise<Job> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('jobType', jobType);
  
  if (jobConfig) {
    formData.append('jobConfig', JSON.stringify(jobConfig));
  }

  const token = getToken();
  
  const response = await axios.post<Job>(`${API_BASE_URL}/images/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      'Authorization': token ? `Bearer ${token}` : ''
    },
  });
  
  return response.data;
};

export const getJobStatus = async (jobId: string): Promise<Job> => {
  const token = getToken();
  
  const response = await axios.get<Job>(`${API_BASE_URL}/jobs/${jobId}/status`, {
    headers: {
      'Authorization': token ? `Bearer ${token}` : ''
    }
  });
  
  return response.data;
};

export const unlockPremiumQuality = async (jobId: string): Promise<Job> => {
  const token = getToken();
  
  const response = await axios.post<Job>(`${API_BASE_URL}/jobs/${jobId}/unlock-premium`, {}, {
    headers: {
      'Authorization': token ? `Bearer ${token}` : ''
    }
  });
  
  return response.data;
};

export const downloadImage = async (imageUrl: string, filename: string): Promise<void> => {
  const token = getToken();
  
  const response = await axios.get(imageUrl, {
    responseType: 'blob',
    headers: {
      'Authorization': token ? `Bearer ${token}` : ''
    }
  });
  
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};