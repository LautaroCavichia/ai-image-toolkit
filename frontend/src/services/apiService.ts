import axios from 'axios';
import { JobResponseDTO, JobTypeEnum } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api/v1'; 

export const uploadImageAndCreateJob = async (
  file: File,
  userId: string, // TODO: Get from auth context later
  jobType: JobTypeEnum
): Promise<JobResponseDTO> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('userId', userId);
  formData.append('jobType', jobType);

  const response = await axios.post<JobResponseDTO>(`${API_BASE_URL}/images/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      // TODO:Add Authorization header here (JWT auth)
    },
  });
  return response.data;
};

export const getJobStatus = async (jobId: string): Promise<JobResponseDTO> => {
  const response = await axios.get<JobResponseDTO>(`${API_BASE_URL}/jobs/${jobId}/status`);
  return response.data;
};