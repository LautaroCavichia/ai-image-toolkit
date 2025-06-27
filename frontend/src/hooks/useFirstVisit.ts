import { useState, useEffect } from 'react';

interface FirstVisitOptions {
  serviceType: string;
  storageKey?: string;
}

export const useFirstVisit = ({ serviceType, storageKey }: FirstVisitOptions) => {
  const [isFirstVisit, setIsFirstVisit] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const key = storageKey || `visited_${serviceType}`;

  useEffect(() => {
    const checkFirstVisit = () => {
      try {
        const hasVisited = localStorage.getItem(key);
        const firstVisit = !hasVisited;
        
        setIsFirstVisit(firstVisit);
        
        // Mark as visited if it's the first time
        if (firstVisit) {
          localStorage.setItem(key, 'true');
        }
      } catch (error) {
        console.warn('Failed to check first visit status:', error);
        setIsFirstVisit(false);
      } finally {
        setIsLoading(false);
      }
    };

    // Small delay to ensure smooth experience
    const timer = setTimeout(checkFirstVisit, 100);
    
    return () => clearTimeout(timer);
  }, [key]);

  const resetFirstVisit = () => {
    try {
      localStorage.removeItem(key);
      setIsFirstVisit(true);
    } catch (error) {
      console.warn('Failed to reset first visit status:', error);
    }
  };

  return {
    isFirstVisit,
    isLoading,
    resetFirstVisit
  };
};