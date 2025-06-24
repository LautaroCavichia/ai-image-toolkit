# Frontend Logic Backup

## Core Services (PRESERVE THESE)

### API Service (`src/services/apiService.ts`)
- `uploadImageAndCreateJob(file, jobType, jobConfig)` - Main API for image processing
- `getJobStatus(jobId)` - Poll job status
- Base URL: `process.env.REACT_APP_API_BASE_URL` or `http://localhost:8080/api/v1`

### Auth Service (`src/services/authService.ts`)
- `login(credentials)` - User login
- `register(credentials)` - User registration
- `createGuestUser()` - Create guest session
- `convertGuestToRegistered()` - Convert guest to registered user
- `logout()` - Clear local storage
- `isAuthenticated()` - Check if user logged in
- `isGuestUser()` - Check if user is guest
- `getToken()` - Get JWT token
- `storeUserData(userData)` - Store user data in localStorage
- `getUserData()` - Get user data from localStorage
- `setupAxiosInterceptors()` - Handle token refresh/401 errors

### Token Service (`src/services/tokenService.ts`)
- `getTokenBalance()` - Get balance from localStorage
- `fetchTokenBalance()` - Fetch balance from API
- `purchaseTokens(amount)` - Purchase tokens
- `earnTokenFromAd()` - Earn tokens from ads
- `unlockPremiumQuality(jobId)` - Unlock premium quality

### Types (`src/types/index.ts`)
- `JobTypeEnum`: BG_REMOVAL, UPSCALE, ENLARGE, STYLE_TRANSFER
- `JobStatusEnum`: PENDING, QUEUED, PROCESSING, COMPLETED, FAILED, CANCELLED, RETRYING
- `JobResponseDTO` - Main job response structure
- `StyleTransferConfig` - Style transfer configuration
- `StyleOption` - Available styles
- `AVAILABLE_STYLES` - Array of available styles

## Key Features to Rebuild
1. **Login/Register/Guest flow**
2. **Image upload with job type selection**
3. **Job status polling and display**
4. **Token balance management**
5. **Style transfer with style selection**
6. **Premium quality unlock**
7. **User profile management**

## Environment Variables
- `REACT_APP_API_BASE_URL` - Backend API URL

## Core Logic Flow
1. User authenticates (login/register/guest)
2. User uploads image with selected job type
3. System creates job and returns jobId
4. Frontend polls job status until completion
5. Display results with premium unlock option
6. Token balance is updated after operations