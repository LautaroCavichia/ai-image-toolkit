
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
    errorMessage?: string;
  }

  export interface ImageUploadRequestDTO {
    userId: string;
    jobType: JobTypeEnum;
    file: File; 
  }