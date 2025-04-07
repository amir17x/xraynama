import React, { useRef } from "react";
import { ContentType } from "@/types";
import { ContentCard } from "@/components/common/ContentCard";
import { 
  AwardIcon, 
  StarIcon, 
  CalendarIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon 
} from "@/components/icons/RoundedIcons";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

interface FeaturedContentSectionProps {
  title: string;
  subtitle?: string;
  content: ContentType[];
  isLoading?: boolean;
  icon?: "award" | "star" | "calendar" | null;
  moreLink?: string;
}

const FeaturedContentSection: React.FC<FeaturedContentSectionProps> = ({
  title,
  subtitle,
  content,
  isLoading = false,
  icon = null,
  moreLink,
}) => {
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

  // Render skeletons for loading state
  if (isLoading) {
    return (
      <div className="py-6 bg-dark-lighter/30">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2 animate-pulse">
              <div className="h-4 w-4 bg-dark-card rounded-full"></div>
              <div className="h-6 bg-dark-card w-24 rounded-md"></div>
            </div>
            
            {moreLink && (
              <div className="flex items-center gap-1 animate-pulse">
                <div className="h-4 w-4 bg-dark-card rounded-full"></div>
                <div className="h-4 bg-dark-card w-16 rounded-md"></div>
              </div>
            )}
          </div>
          
          {subtitle && <div className="h-3 bg-dark-card w-1/3 rounded-md mb-4 animate-pulse"></div>}
          
          <div className="relative">
            <div className="flex gap-4 overflow-hidden">
              {Array(5).fill(0).map((_, index) => (
                <div key={index} className="flex-shrink-0 w-60 rounded-lg overflow-hidden bg-card border border-border shadow-lg animate-pulse">
                  <div className="aspect-[2/3] bg-muted"></div>
                  <div className="p-4">
                    <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If no content, don't render the section
  if (!content || content.length === 0) {
    return null;
  }

  const renderIcon = () => {
    switch (icon) {
      case "award":
        return <AwardIcon className="h-4 w-4" />;
      case "star":
        return <StarIcon className="h-4 w-4" />;
      case "calendar":
        return <CalendarIcon className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="py-6 bg-dark-lighter/30">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            {renderIcon()}
            <h2 className="text-xl font-medium text-white">{title}</h2>
          </div>
          
          {moreLink && (
            <div className="flex items-center gap-1">
              <ChevronLeftIcon className="h-4 w-4 text-muted-foreground" />
              <Button asChild variant="link" size="sm" className="p-0 h-auto text-sm text-muted-foreground hover:text-white">
                <Link href={moreLink}>مشاهده همه</Link>
              </Button>
            </div>
          )}
        </div>
        
        {subtitle && <p className="text-sm text-muted-foreground mb-4">{subtitle}</p>}
        
        <div className="relative">
          <Button 
            variant="outline" 
            size="icon" 
            className="absolute left-[-20px] top-1/2 transform -translate-y-1/2 rounded-full h-10 w-10 z-10 bg-card/80 backdrop-blur-sm border-gray-700"
            onClick={handleScrollRight}
          >
            <ChevronRightIcon className="h-5 w-5" />
          </Button>
          
          <div 
            ref={scrollContainerRef}
            className="flex gap-4 overflow-x-auto pb-4 scrollbar-none"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {content.map((item) => (
              <ContentCard
                key={item.id}
                content={item}
              />
            ))}
          </div>
          
          <Button 
            variant="outline" 
            size="icon" 
            className="absolute right-[-20px] top-1/2 transform -translate-y-1/2 rounded-full h-10 w-10 z-10 bg-card/80 backdrop-blur-sm border-gray-700"
            onClick={handleScrollLeft}
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FeaturedContentSection;