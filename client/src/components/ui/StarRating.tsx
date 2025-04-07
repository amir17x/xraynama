import { useState, useEffect } from 'react';
import { Star, StarHalf } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  onChange?: (value: number) => void;
  readOnly?: boolean;
  className?: string;
}

export function StarRating({ 
  value = 0, 
  max = 5, 
  size = 'md', 
  color = 'text-yellow-400', 
  onChange,
  readOnly = false, 
  className 
}: StarRatingProps) {
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);

  useEffect(() => {
    // Normalize to match our max stars (e.g., convert 8.5/10 to 4.25/5)
    setRating(value * (max / 10));
  }, [value, max]);

  const handleClick = (index: number) => {
    if (readOnly) return;
    
    const newRating = index + 1;
    setRating(newRating);
    if (onChange) {
      // Convert back to /10 scale for API consistency
      onChange(newRating * (10 / max));
    }
  };

  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-5 h-5',
    lg: 'w-7 h-7',
  };

  const getStarIcon = (index: number) => {
    const activeRating = hoverRating || rating;
    const isActive = index < Math.floor(activeRating);
    const isHalf = index === Math.floor(activeRating) && activeRating % 1 >= 0.3 && activeRating % 1 < 0.7;
    const isEmpty = index >= Math.ceil(activeRating);
    
    if (isActive) {
      return <Star className={cn("fill-current", color)} />;
    } else if (isHalf) {
      return <StarHalf className={cn("fill-current", color)} />;
    } else {
      return <Star className="text-gray-400" />;
    }
  };

  return (
    <div 
      className={cn("flex", className)} 
      onMouseLeave={() => !readOnly && setHoverRating(0)}
    >
      {[...Array(max)].map((_, index) => (
        <span
          key={index}
          className={cn(
            sizeClasses[size],
            !readOnly && 'cursor-pointer transition-transform hover:scale-110',
          )}
          onClick={() => handleClick(index)}
          onMouseEnter={() => !readOnly && setHoverRating(index + 1)}
        >
          {getStarIcon(index)}
        </span>
      ))}
    </div>
  );
}
