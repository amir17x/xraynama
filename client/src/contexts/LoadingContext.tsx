import React, { createContext, useState, useContext, useCallback, ReactNode } from 'react';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface LoadingContextType {
  isLoading: boolean;
  startLoading: () => void;
  stopLoading: () => void;
  showLoadingFor: (milliseconds: number) => Promise<void>;
}

// ایجاد Context برای مدیریت وضعیت لودینگ
const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

interface LoadingProviderProps {
  children: ReactNode;
}

export function LoadingProvider({ children }: LoadingProviderProps) {
  const [isLoading, setIsLoading] = useState(false);

  // شروع لودینگ
  const startLoading = useCallback(() => {
    setIsLoading(true);
  }, []);

  // پایان لودینگ
  const stopLoading = useCallback(() => {
    setIsLoading(false);
  }, []);

  // نمایش لودینگ برای مدت زمان مشخص (به میلی‌ثانیه)
  const showLoadingFor = useCallback(async (milliseconds: number) => {
    startLoading();
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        stopLoading();
        resolve();
      }, milliseconds);
    });
  }, [startLoading, stopLoading]);

  return (
    <LoadingContext.Provider value={{ isLoading, startLoading, stopLoading, showLoadingFor }}>
      {children}
      {isLoading && <LoadingSpinner fullScreen size="lg" />}
    </LoadingContext.Provider>
  );
}

// هوک سفارشی برای استفاده از لودینگ در کامپوننت‌ها
export function useLoading() {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
}