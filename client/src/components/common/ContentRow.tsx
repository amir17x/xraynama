import { useRef } from 'react';
import { Link } from 'wouter';
import { ContentType } from '@/types';
import { ContentCard } from './ContentCard';
import { ChevronLeft } from 'lucide-react';
import { CarouselButton } from './CarouselButton';

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
    <section className="content-section-glass mb-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-foreground">{title}</h2>
        {moreLink && (
          <Link href={moreLink} className="text-[#00BFFF] hover:text-white transition duration-300 flex items-center">
            مشاهده همه <ChevronLeft className="inline-block h-4 w-4 mr-1" />
          </Link>
        )}
      </div>
      
      <div className="relative group">
        <div ref={scrollContainerRef} className="overflow-x-auto scrollbar-hide">
          <div className="flex space-x-4 rtl:space-x-reverse pb-4">
            {isLoading ? renderSkeletons() : (
              content.map(item => (
                <ContentCard key={item.id} content={item} />
              ))
            )}
          </div>
        </div>
        
        {/* استفاده از کامپوننت استاندارد برای دکمه‌های پیمایش */}
        <CarouselButton 
          direction="right" 
          onClick={handleScrollRight} 
          className="opacity-0 group-hover:opacity-100 md:flex hidden"
        />
        
        <CarouselButton 
          direction="left" 
          onClick={handleScrollLeft} 
          className="opacity-0 group-hover:opacity-100 md:flex hidden"
        />
      </div>
    </section>
  );
}
