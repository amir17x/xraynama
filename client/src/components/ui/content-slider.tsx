import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Content } from '@shared/schema';
import { ContentCard } from '@/components/ui/content-card';

interface ContentSliderProps {
  title: string;
  contents: Content[];
  showMoreLink?: string;
  className?: string;
}

export function ContentSlider({ title, contents, showMoreLink, className }: ContentSliderProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  
  // Function to scroll the container
  const scroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (!container) return;
    
    const scrollAmount = container.clientWidth * 0.8;
    
    if (direction === 'left') {
      container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    } else {
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };
  
  // Update arrow visibility based on scroll position
  const updateArrows = () => {
    const container = scrollContainerRef.current;
    if (!container) return;
    
    const isAtStart = container.scrollLeft <= 10;
    const isAtEnd = container.scrollLeft + container.clientWidth >= container.scrollWidth - 10;
    
    setShowLeftArrow(!isAtStart);
    setShowRightArrow(!isAtEnd);
  };
  
  // Listen for scroll events to update arrows
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    
    container.addEventListener('scroll', updateArrows);
    window.addEventListener('resize', updateArrows);
    
    // Initial check
    updateArrows();
    
    return () => {
      container.removeEventListener('scroll', updateArrows);
      window.removeEventListener('resize', updateArrows);
    };
  }, [contents]);

  return (
    <div className={cn("mb-12", className)}>
      {/* Header with title and arrows */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">{title}</h2>
        
        <div className="flex items-center space-x-2 space-x-reverse">
          {showMoreLink && (
            <a href={showMoreLink} className="text-primary flex items-center mr-4">
              <span>مشاهده همه</span>
              <ChevronLeft className="h-4 w-4 mr-1" />
            </a>
          )}
          
          <Button
            onClick={() => scroll('right')}
            variant="outline"
            size="icon"
            className={`rounded-full transition-opacity duration-300 ${showRightArrow ? 'opacity-100' : 'opacity-0'}`}
            disabled={!showRightArrow}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          
          <Button
            onClick={() => scroll('left')}
            variant="outline"
            size="icon"
            className={`rounded-full transition-opacity duration-300 ${showLeftArrow ? 'opacity-100' : 'opacity-0'}`}
            disabled={!showLeftArrow}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Scrollable content */}
      <div 
        ref={scrollContainerRef}
        className="flex overflow-x-auto scrollbar-hide gap-4 pb-4 -mr-4 pr-4"
      >
        {contents.map((content) => (
          <ContentCard
            key={content.id}
            content={content}
            className="min-w-[180px] md:min-w-[220px]"
          />
        ))}
        
        {contents.length === 0 && (
          <div className="flex items-center justify-center w-full py-12 text-muted-foreground">
            محتوایی برای نمایش وجود ندارد.
          </div>
        )}
      </div>
    </div>
  );
}
