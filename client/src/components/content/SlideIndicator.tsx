import React from 'react';
import { cn } from '@/lib/utils';

interface SlideIndicatorProps {
  totalSlides: number;
  currentSlide: number;
  onSlideChange?: (index: number) => void;
  className?: string;
}

const SlideIndicator: React.FC<SlideIndicatorProps> = ({
  totalSlides,
  currentSlide,
  onSlideChange,
  className
}) => {
  return (
    <div className={cn("flex items-center justify-center gap-2 py-2", className)}>
      {Array.from({ length: totalSlides }).map((_, index) => (
        <button
          key={index}
          onClick={() => onSlideChange?.(index)}
          className={cn(
            "transition-all duration-300 ease-in-out focus:outline-none",
            index === currentSlide
              ? "w-8 h-2 bg-blue-500 rounded-md" 
              : "w-2 h-2 bg-gray-400 hover:bg-gray-300 rounded-full"
          )}
          aria-label={`رفتن به اسلاید ${index + 1}`}
        />
      ))}
    </div>
  );
};

export default SlideIndicator;