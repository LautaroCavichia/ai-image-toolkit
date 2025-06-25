// src/services/apiService.ts
import axios from 'axios';
import { JobResponseDTO, JobTypeEnum } from '../types';
import { getToken } from './authService';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api/v1'; 

export const uploadImageAndCreateJob = async (
  file: File,
  jobType: JobTypeEnum,
  jobConfig?: any
): Promise<JobResponseDTO> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('jobType', jobType);
  
  // Add job config if provided
  if (jobConfig) {
    formData.append('jobConfig', JSON.stringify(jobConfig));
  }

  const token = getToken();
  console.log('🔍 === IMAGE UPLOAD DEBUG START ===');
  console.log('🔍 Token from getToken():', token ? `${token.substring(0, 30)}...` : 'NO TOKEN');
  console.log('🔍 LocalStorage direct check:', localStorage.getItem('token') ? `${localStorage.getItem('token')?.substring(0, 30)}...` : 'MISSING');
  console.log('🔍 All localStorage keys:', Object.keys(localStorage));
  console.log('🔍 LocalStorage userId:', localStorage.getItem('userId'));
  console.log('🔍 LocalStorage isGuest:', localStorage.getItem('isGuest'));
  console.log('🔍 API URL:', `${API_BASE_URL}/images/upload`);
  
  try {
    console.log('🚀 Starting axios POST request...');
    const response = await axios.post<JobResponseDTO>(`${API_BASE_URL}/images/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        // Remove manual Authorization header since interceptor handles it
      },
    });
    console.log('✅ Upload successful:', response.status);
    console.log('✅ Response data:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ === UPLOAD ERROR DEBUG ===');
    console.error('❌ Error status:', error.response?.status);
    console.error('❌ Error data:', error.response?.data);
    console.error('❌ Error headers:', error.response?.headers);
    console.error('❌ Request URL:', error.config?.url);
    console.error('❌ Request headers:', error.config?.headers);
    console.error('❌ Full error:', error);
    throw error;
  }
};

export const getJobStatus = async (jobId: string): Promise<JobResponseDTO> => {
  const token = getToken();
  
  const response = await axios.get<JobResponseDTO>(`${API_BASE_URL}/jobs/${jobId}/status`, {
    headers: {
      'Authorization': token ? `Bearer ${token}` : ''
    }
  });
  return response.data;
};