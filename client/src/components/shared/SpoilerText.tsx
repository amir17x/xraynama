import React, { useState } from 'react';
import { AlertTriangle, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SpoilerTextProps {
  children: React.ReactNode;
  blurLevel?: 'light' | 'medium' | 'strong';
}

export default function SpoilerText({ children, blurLevel = 'medium' }: SpoilerTextProps) {
  const [isRevealed, setIsRevealed] = useState(false);
  
  // تعیین شدت تار شدن متن
  const blurAmount = {
    light: 'blur-sm',
    medium: 'blur-md',
    strong: 'blur-lg'
  };
  
  return (
    <div className="relative">
      {/* هشدار اسپویلر */}
      {!isRevealed && (
        <div className="bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 rounded-md p-1.5 mb-3 flex items-center gap-2 text-xs">
          <AlertTriangle className="h-3.5 w-3.5" />
          <span>این متن حاوی اسپویلر است - ممکن است جزئیات داستان را فاش کند.</span>
        </div>
      )}
      
      {/* متن اسپویلر */}
      <div 
        className={`transition-all duration-300 ${!isRevealed ? blurAmount[blurLevel] : ''}`}
      >
        {children}
      </div>
      
      {/* دکمه نمایش */}
      {!isRevealed && (
        <div className="mt-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsRevealed(true)}
            className="flex items-center gap-1 border-yellow-200 bg-yellow-100/20 text-yellow-700 hover:bg-yellow-200/30"
          >
            <Eye className="h-3.5 w-3.5" />
            <span>نمایش متن</span>
          </Button>
        </div>
      )}
    </div>
  );
}