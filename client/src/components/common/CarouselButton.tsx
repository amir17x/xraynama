import React from 'react';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export type CarouselButtonDirection = 'left' | 'right';

interface CarouselButtonProps {
  direction: CarouselButtonDirection;
  onClick: () => void;
  variant?: 'default' | 'ghost' | 'primary';
  className?: string;
}

/**
 * یک کامپوننت استاندارد برای دکمه‌های پیمایش کاروسل‌ها در سرتاسر برنامه
 */
export function CarouselButton({
  direction,
  onClick,
  variant = 'default',
  className
}: CarouselButtonProps) {
  // تعیین آیکون مناسب بر اساس جهت دکمه
  const Icon = direction === 'left' ? ChevronLeft : ChevronRight;
  
  // استایل‌های پایه برای همه انواع دکمه‌ها
  const baseStyles = "absolute top-1/2 -translate-y-1/2 rounded-full z-20 transform transition-all duration-300 shadow-lg";
  
  // استایل‌های ویژه دکمه بر اساس جهت
  const directionStyles = direction === 'left' 
    ? "left-2 md:left-4" 
    : "right-2 md:right-4";
  
  // استایل‌های متفاوت بر اساس نوع دکمه
  const variantStyles = {
    default: "bg-[#00142c]/80 hover:bg-[#00142c]/95 text-white backdrop-blur-sm border border-[#00BFFF]/20 hover:border-[#00BFFF]/40 hover:shadow-[0_0_12px_rgba(0,191,255,0.25)]",
    ghost: "bg-[#00142c]/50 hover:bg-[#00142c]/80 text-white backdrop-blur-sm hover:shadow-[0_0_12px_rgba(0,0,0,0.3)]",
    primary: "bg-[#00BFFF]/80 hover:bg-[#00BFFF]/90 text-white backdrop-blur-sm hover:shadow-[0_0_12px_rgba(0,191,255,0.4)]"
  };
  
  // افکت نرمی برای همه دکمه‌ها در هنگام هاور
  const hoverEffect = "hover:scale-110";
  
  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn(
        baseStyles,
        directionStyles,
        variantStyles[variant],
        hoverEffect,
        className
      )}
      onClick={onClick}
      aria-label={direction === 'left' ? 'اسلاید قبلی' : 'اسلاید بعدی'}
    >
      <Icon className="h-5 w-5" />
    </Button>
  );
}