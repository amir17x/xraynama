import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({ 
  currentPage, 
  totalPages, 
  onPageChange,
  className 
}) => {
  // تعداد دکمه‌های صفحه که باید نمایش داده شود
  const maxPages = 5;
  
  // تولید آرایه‌ای از شماره صفحات برای نمایش
  const getPageNumbers = () => {
    if (totalPages <= maxPages) {
      // اگر تعداد کل صفحات کمتر از حداکثر است، همه را نمایش بده
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    } else {
      // در غیر این صورت نمایش هوشمند صفحات
      let startPage = Math.max(1, currentPage - Math.floor(maxPages / 2));
      let endPage = startPage + maxPages - 1;
      
      if (endPage > totalPages) {
        endPage = totalPages;
        startPage = Math.max(1, endPage - maxPages + 1);
      }
      
      return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
    }
  };
  
  const pageNumbers = getPageNumbers();
  
  return (
    <div className={cn("flex items-center justify-center gap-2", className)} dir="rtl">
      {/* دکمه صفحه قبل */}
      <Button
        variant="outline"
        size="icon"
        className={cn(
          "h-9 w-9 border-white/10 bg-white/5 backdrop-blur-sm text-white hover:bg-white/10", 
          currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""
        )}
        onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <ChevronRight className="h-4 w-4" />
        <span className="sr-only">صفحه قبل</span>
      </Button>
      
      {/* نمایش دکمه صفحه اول اگر از دید خارج شده */}
      {pageNumbers[0] > 1 && (
        <>
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 border-white/10 bg-white/5 backdrop-blur-sm text-white hover:bg-white/10"
            onClick={() => onPageChange(1)}
          >
            1
          </Button>
          {pageNumbers[0] > 2 && (
            <span className="text-gray-400">...</span>
          )}
        </>
      )}
      
      {/* دکمه‌های شماره صفحه */}
      {pageNumbers.map(pageNumber => (
        <Button
          key={pageNumber}
          variant={pageNumber === currentPage ? "default" : "outline"}
          size="icon"
          className={cn(
            "h-9 w-9",
            pageNumber === currentPage 
              ? "bg-primary text-white" 
              : "border-white/10 bg-white/5 backdrop-blur-sm text-white hover:bg-white/10"
          )}
          onClick={() => onPageChange(pageNumber)}
        >
          {pageNumber}
        </Button>
      ))}
      
      {/* نمایش دکمه صفحه آخر اگر از دید خارج شده */}
      {pageNumbers[pageNumbers.length - 1] < totalPages && (
        <>
          {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
            <span className="text-gray-400">...</span>
          )}
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 border-white/10 bg-white/5 backdrop-blur-sm text-white hover:bg-white/10"
            onClick={() => onPageChange(totalPages)}
          >
            {totalPages}
          </Button>
        </>
      )}
      
      {/* دکمه صفحه بعد */}
      <Button
        variant="outline"
        size="icon"
        className={cn(
          "h-9 w-9 border-white/10 bg-white/5 backdrop-blur-sm text-white hover:bg-white/10", 
          currentPage === totalPages ? "opacity-50 cursor-not-allowed" : ""
        )}
        onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="sr-only">صفحه بعد</span>
      </Button>
    </div>
  );
};