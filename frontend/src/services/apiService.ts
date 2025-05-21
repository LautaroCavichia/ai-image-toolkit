// src/services/apiService.ts
import axios from 'axios';
import { JobResponseDTO, JobTypeEnum } from '../types';
import { getToken } from './authService';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api/v1'; 

export const uploadImageAndCreateJob = async (
  file: File,
  jobType: JobTypeEnum
): Promise<JobResponseDTO> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('jobType', jobType);

  const token = getToken();
  
  const response = await axios.post<JobResponseDTO>(`${API_BASE_URL}/images/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      'Authorization': token ? `Bearer ${token}` : ''
    },
  });
  return response.data;
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