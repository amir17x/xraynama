import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  fullScreen?: boolean;
}

export function LoadingSpinner({
  size = 'md',
  text = 'در حال بارگذاری...',
  fullScreen = false
}: LoadingSpinnerProps) {
  // تعیین اندازه اسپینر بر اساس پارامتر size
  const spinnerSizeClasses = {
    sm: 'w-8 h-8 border-2',
    md: 'w-12 h-12 border-3',
    lg: 'w-16 h-16 border-4'
  };
  
  // تعیین اندازه فونت متن بر اساس پارامتر size
  const textSizeClasses = {
    sm: 'text-xs mt-2',
    md: 'text-sm mt-3',
    lg: 'text-base mt-4'
  };
  
  // اگر fullScreen باشد، نمایش در کل صفحه
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-black/80 flex flex-col items-center justify-center z-50">
        <div
          className={`${spinnerSizeClasses[size]} border-gray-200 border-t-primary rounded-full animate-spin`}
        ></div>
        {text && <p className={`${textSizeClasses[size]} text-white font-medium`}>{text}</p>}
      </div>
    );
  }
  
  // نمایش اینلاین (در محل استفاده)
  return (
    <div className="flex flex-col items-center justify-center py-4">
      <div
        className={`${spinnerSizeClasses[size]} border-gray-200 border-t-primary rounded-full animate-spin shadow-lg shadow-primary/30`}
      ></div>
      {text && <p className={`${textSizeClasses[size]} text-foreground font-medium`}>{text}</p>}
    </div>
  );
}

export default LoadingSpinner;