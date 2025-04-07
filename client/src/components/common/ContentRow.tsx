import { useRef } from 'react';
import { Link } from 'wouter';
import { ContentType } from '@/types';
import { ContentCard } from './ContentCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ContentRowProps {
  title: string;
  moreLink?: string;
  content: ContentType[];
  isLoading?: boolean;
}

export function ContentRow({ title, moreLink, content, isLoading = false }: ContentRowProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleScrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: -300,
        behavior: 'smooth'
      });
    }
  };
  
  const handleScrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: 300,
        behavior: 'smooth'
      });
    }
  };

  // Skeleton loader for loading state
  const renderSkeletons = () => {
    return Array(5).fill(0).map((_, index) => (
      <div key={index} className="flex-shrink-0 w-60 rounded-lg overflow-hidden bg-card border border-border shadow-lg animate-pulse">
        <div className="aspect-[2/3] bg-muted"></div>
        <div className="p-4">
          <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-muted rounded w-1/2"></div>
        </div>
      </div>
    ));
  };

  return (
    <section className="mb-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-foreground">{title}</h2>
        {moreLink && (
          <Link href={moreLink} className="text-primary hover:text-primary/90 transition duration-200">
            مشاهده همه <ChevronLeft className="inline-block h-4 w-4" />
          </Link>
        )}
      </div>
      
      <div className="relative">
        <div ref={scrollContainerRef} className="overflow-x-auto scrollbar-hide">
          <div className="flex space-x-4 rtl:space-x-reverse pb-4">
            {isLoading ? renderSkeletons() : (
              content.map(item => (
                <ContentCard key={item.id} content={item} />
              ))
            )}
          </div>
        </div>
        
        {/* Scroll buttons */}
        <Button
          variant="secondary"
          size="icon"
          className="hidden md:flex absolute top-1/2 -translate-y-1/2 right-0 -mr-6 bg-card hover:bg-muted text-foreground p-3 rounded-full shadow-lg transform transition-transform duration-300 hover:scale-110 z-10"
          onClick={handleScrollRight}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          className="hidden md:flex absolute top-1/2 -translate-y-1/2 left-0 -ml-6 bg-card hover:bg-muted text-foreground p-3 rounded-full shadow-lg transform transition-transform duration-300 hover:scale-110 z-10"
          onClick={handleScrollLeft}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>
    </section>
  );
}
