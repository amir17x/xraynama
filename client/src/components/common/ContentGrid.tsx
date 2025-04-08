import { useState } from 'react';
import { ContentCard } from '@/components/common/ContentCard';
import { ContentType } from '@/types';
import { Filter, SlidersHorizontal, ArrowDownUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PortalOverride } from '@/components/common/PortalOverride';
import { useRef } from 'react';
import { cn } from '@/lib/utils';

interface ContentGridProps {
  content: ContentType[];
  isLoading?: boolean;
  title?: string;
  subtitle?: string;
  filterOptions?: boolean;
  className?: string;
}

export function ContentGrid({
  content,
  isLoading = false,
  title,
  subtitle,
  filterOptions = false,
  className
}: ContentGridProps) {
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const sortTriggerRef = useRef<HTMLButtonElement>(null);
  const filterTriggerRef = useRef<HTMLButtonElement>(null);

  // Loading state
  if (isLoading) {
    return (
      <div className={cn("w-full", className)}>
        {title && (
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">{title}</h2>
            {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
          </div>
        )}
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
          {Array.from({ length: 12 }).map((_, index) => (
            <div 
              key={index} 
              className="shimmer-card aspect-[2/3] rounded-lg"
            >
              <div className="shimmer-effect w-full h-full rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Empty state
  if (!content || content.length === 0) {
    return (
      <div className={cn("w-full text-center py-20", className)}>
        <div className="glassmorphic-card p-8 rounded-xl max-w-md mx-auto">
          <h3 className="text-xl font-medium mb-2">موردی یافت نشد</h3>
          <p className="text-muted-foreground">محتوایی برای نمایش وجود ندارد.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      {/* Header with title, filters and sorting */}
      {(title || filterOptions) && (
        <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
          {title && (
            <div>
              <h2 className="text-2xl font-bold mb-1">{title}</h2>
              {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
            </div>
          )}
          
          {filterOptions && (
            <div className="flex items-center gap-2">
              {/* Sort button with dropdown */}
              <div>
                <Button
                  ref={sortTriggerRef}
                  variant="outline" 
                  size="sm"
                  className="glass-effect border-[#00BFFF]/20 hover:border-[#00BFFF]/40"
                  onClick={() => {
                    setSortMenuOpen(!sortMenuOpen);
                    setFilterMenuOpen(false);
                  }}
                >
                  <ArrowDownUp className="h-4 w-4 ml-2" />
                  <span>مرتب‌سازی</span>
                </Button>
                
                <PortalOverride
                  triggerRef={sortTriggerRef}
                  isOpen={sortMenuOpen}
                  onClose={() => setSortMenuOpen(false)}
                  alignRight={true}
                  minWidth={200}
                  maxHeight={300}
                >
                  <div className="dropdown-glass p-2">
                    <button className="w-full text-right py-2 px-3 rounded-md hover:bg-[#00BFFF]/10 transition-colors duration-200">
                      جدیدترین
                    </button>
                    <button className="w-full text-right py-2 px-3 rounded-md hover:bg-[#00BFFF]/10 transition-colors duration-200">
                      محبوب‌ترین
                    </button>
                    <button className="w-full text-right py-2 px-3 rounded-md hover:bg-[#00BFFF]/10 transition-colors duration-200">
                      بیشترین امتیاز
                    </button>
                    <button className="w-full text-right py-2 px-3 rounded-md hover:bg-[#00BFFF]/10 transition-colors duration-200">
                      قدیمی‌ترین
                    </button>
                  </div>
                </PortalOverride>
              </div>
              
              {/* Filter button with dropdown */}
              <div>
                <Button
                  ref={filterTriggerRef}
                  variant="outline" 
                  size="sm"
                  className="glass-effect border-[#00BFFF]/20 hover:border-[#00BFFF]/40"
                  onClick={() => {
                    setFilterMenuOpen(!filterMenuOpen);
                    setSortMenuOpen(false);
                  }}
                >
                  <Filter className="h-4 w-4 ml-2" />
                  <span>فیلتر</span>
                </Button>
                
                <PortalOverride
                  triggerRef={filterTriggerRef}
                  isOpen={filterMenuOpen}
                  onClose={() => setFilterMenuOpen(false)}
                  alignRight={true}
                  minWidth={250}
                  maxHeight={400}
                  stickyHeader={
                    <div className="p-3 border-b border-[#00BFFF]/20">
                      <h3 className="text-base font-medium flex items-center">
                        <SlidersHorizontal className="h-4 w-4 ml-2 text-[#00BFFF]" />
                        فیلتر محتوا
                      </h3>
                    </div>
                  }
                >
                  <div className="dropdown-glass p-3">
                    <div className="mb-4">
                      <h4 className="text-sm font-medium mb-2">ژانر</h4>
                      <div className="space-y-1">
                        <div className="flex items-center">
                          <input type="checkbox" id="genre-action" className="ml-2" />
                          <label htmlFor="genre-action" className="text-sm">اکشن</label>
                        </div>
                        <div className="flex items-center">
                          <input type="checkbox" id="genre-drama" className="ml-2" />
                          <label htmlFor="genre-drama" className="text-sm">درام</label>
                        </div>
                        <div className="flex items-center">
                          <input type="checkbox" id="genre-comedy" className="ml-2" />
                          <label htmlFor="genre-comedy" className="text-sm">کمدی</label>
                        </div>
                        <div className="flex items-center">
                          <input type="checkbox" id="genre-sci-fi" className="ml-2" />
                          <label htmlFor="genre-sci-fi" className="text-sm">علمی تخیلی</label>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <h4 className="text-sm font-medium mb-2">سال انتشار</h4>
                      <div className="space-y-1">
                        <div className="flex items-center">
                          <input type="checkbox" id="year-2023" className="ml-2" />
                          <label htmlFor="year-2023" className="text-sm">2023</label>
                        </div>
                        <div className="flex items-center">
                          <input type="checkbox" id="year-2022" className="ml-2" />
                          <label htmlFor="year-2022" className="text-sm">2022</label>
                        </div>
                        <div className="flex items-center">
                          <input type="checkbox" id="year-2021" className="ml-2" />
                          <label htmlFor="year-2021" className="text-sm">2021</label>
                        </div>
                        <div className="flex items-center">
                          <input type="checkbox" id="year-older" className="ml-2" />
                          <label htmlFor="year-older" className="text-sm">قدیمی‌تر</label>
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-2 border-t border-[#00BFFF]/20 flex justify-between">
                      <Button variant="ghost" size="sm" onClick={() => setFilterMenuOpen(false)}>
                        بستن
                      </Button>
                      <Button size="sm">
                        اعمال فیلتر
                      </Button>
                    </div>
                  </div>
                </PortalOverride>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Content grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
        {content.map((item) => (
          <div key={item.id} className="content-enter">
            <ContentCard 
              content={item} 
            />
          </div>
        ))}
      </div>
    </div>
  );
}