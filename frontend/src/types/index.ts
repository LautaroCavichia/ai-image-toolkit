// src/types/index.ts

export enum JobTypeEnum {
  BG_REMOVAL = 'BG_REMOVAL',
  UPSCALE = 'UPSCALE',
  ENLARGE = 'ENLARGE',
}

export enum JobStatusEnum {
  PENDING = 'PENDING',
  QUEUED = 'QUEUED',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

export interface JobResponseDTO {
  jobId: string; 
  originalImageId: string;
  jobType: JobTypeEnum;
  status: JobStatusEnum;
  createdAt: string; 
  completedAt?: string;
  processedImageUrl?: string;
  thumbnailUrl?: string; 
  isPremiumQuality?: boolean; 
  tokenCost?: number; 
  tokenBalance?: number; 
  errorMessage?: string;
}

export interface ImageUploadRequestDTO {
  userId: string;
  jobType: JobTypeEnum;
  file: File; 
}

export interface GuestUserDTO {
  token: string;
  userId: string;
  displayName: string;
  isGuest: boolean;
  tokenBalance: number;
}

export interface TokenBalance {
  balance: number;
}

export interface TokenPurchase {
  amount: number;
}