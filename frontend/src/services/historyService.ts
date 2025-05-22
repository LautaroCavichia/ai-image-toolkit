// src/services/historyService.ts
import axios from 'axios';
import { JobResponseDTO } from '../types';
import { getToken } from './authService';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api/v1';

export const getUserHistory = async (): Promise<JobResponseDTO[]> => {
  try {
    const token = getToken();
    
    const response = await axios.get<JobResponseDTO[]>(`${API_BASE_URL}/users/history`, {
      headers: {
        'Authorization': token ? `Bearer ${token}` : ''
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Failed to fetch user history', error);
    throw error;
  }
};

export const getJobHistory = async (jobId: string): Promise<JobResponseDTO> => {
  try {
    const token = getToken();
    
    const response = await axios.get<JobResponseDTO>(`${API_BASE_URL}/jobs/${jobId}/details`, {
      headers: {
        'Authorization': token ? `Bearer ${token}` : ''
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Failed to fetch job details', error);
    throw error;
  }
};