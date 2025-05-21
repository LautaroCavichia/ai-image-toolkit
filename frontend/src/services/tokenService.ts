// src/services/tokenService.ts

import axios from 'axios';
import { updateTokenBalance } from './authService';
import { TokenBalance } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api/v1';

export const getTokenBalance = (): number => {
  const balanceStr = localStorage.getItem('tokenBalance');
  return balanceStr ? parseInt(balanceStr, 10) : 0;
};

export const fetchTokenBalance = async (): Promise<number> => {
  try {
    const response = await axios.get<TokenBalance>(`${API_BASE_URL}/tokens/balance`);
    const newBalance = response.data.balance;
    
    // Update localStorage
    updateTokenBalance(newBalance);
    
    return newBalance;
  } catch (error) {
    console.error('Failed to fetch token balance', error);
    return getTokenBalance(); // Return local balance if fetch fails
  }
};

export const purchaseTokens = async (amount: number): Promise<boolean> => {
  try {
    const response = await axios.post<TokenBalance>(`${API_BASE_URL}/tokens/purchase`, { amount });
    

    updateTokenBalance(response.data.balance);
    
    return true;
  } catch (error) {
    console.error('Failed to purchase tokens', error);
    return false;
  }
};


export const earnTokenFromAd = async (): Promise<boolean> => {
  try {
    const response = await axios.get<TokenBalance>(`${API_BASE_URL}/tokens/add-from-ad`);
    
    
    updateTokenBalance(response.data.balance);
    
    return true;
  } catch (error) {
    console.error('Failed to earn token from ad', error);
    return false;
  }
};

export const unlockPremiumQuality = async (jobId: string): Promise<any> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/jobs/${jobId}/unlock-premium`);
    
    if (response.data.tokenBalance !== undefined) {
      updateTokenBalance(response.data.tokenBalance);
    }
    
    return response.data;
  } catch (error) {
    console.error('Failed to unlock premium quality', error);
    throw error;
  }
};