// src/services/tokenService.ts

import axios from 'axios';
import { updateTokenBalance } from './authService';
import { TokenBalance } from '../types';
import { getUserData } from './authService';  // o donde esté definida

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api/v1';

export const getTokenBalance = (): number => {
  const balanceStr = localStorage.getItem('tokenBalance');
  return balanceStr ? parseInt(balanceStr, 10) : 0;
};

const getJwtToken = () => localStorage.getItem("token");

export const fetchTokenBalance = async (): Promise<number> => {
  try {
    const userData = getUserData();
    const token = userData?.token;

    if (!token) {
      console.warn('No auth token found, cannot fetch token balance.');
      return getTokenBalance();
    }

    const response = await axios.get<TokenBalance>(`${API_BASE_URL}/tokens/balance`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const newBalance = response.data.balance;
    updateTokenBalance(newBalance);
    return newBalance;
  } catch (error) {
    console.error('Failed to fetch token balance', error);
    return getTokenBalance();
  }
};



export const purchaseTokens = async (amount: number): Promise<boolean> => {
  try {
    const token = getJwtToken(); // ← obtenemos el token

    const response = await axios.post<TokenBalance>(
      `${API_BASE_URL}/tokens/purchase`,
      { amount },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    updateTokenBalance(response.data.balance);
    return true;
  } catch (error) {
    console.error('Failed to purchase tokens', error);
    return false;
  }
};



export const earnTokenFromAd = async (): Promise<boolean> => {
  try {
 const token = getJwtToken();
    if (!token) {
      console.error("No JWT token found");
      return false;
    }

    const response = await axios.get(`${API_BASE_URL}/tokens/add-from-ad`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // La respuesta debe traer { balance: number }
    const newBalance = response.data.balance;

    updateTokenBalance(newBalance); // función local para actualizar el estado / UI

    return true;
  } catch (error) {
    console.error("Error earning token:", error);
    return false;
  }
};


export const unlockPremiumQuality = async (jobId: string): Promise<any> => {
  try {
    const token = getJwtToken(); // ← obtenemos el token

    const response = await axios.post(
      `${API_BASE_URL}/jobs/${jobId}/unlock-premium`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.data.tokenBalance !== undefined) {
      updateTokenBalance(response.data.tokenBalance);
    }

    return response.data;
  } catch (error) {
    console.error('Failed to unlock premium quality', error);
    throw error;
  }
};
