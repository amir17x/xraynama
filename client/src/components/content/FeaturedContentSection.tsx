import React, { useRef } from "react";
import { ContentType } from "@/types";
import { ContentCard } from "@/components/common/ContentCard";
import { Award, Star, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
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
          <div className="mb-4 animate-pulse">
            <div className="h-6 bg-dark-card w-1/4 rounded-md"></div>
            <div className="h-3 bg-dark-card w-1/3 rounded-md mt-2"></div>
          </div>
          
          <div className="flex space-x-4 overflow-hidden">
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
    );
  }

  // If no content, don't render the section
  if (!content || content.length === 0) {
    return null;
  }

  const renderIcon = () => {
    switch (icon) {
      case "award":
        return <Award className="h-4 w-4 text-yellow-500" />;
      case "star":
        return <Star className="h-4 w-4 text-yellow-500" />;
      case "calendar":
        return <Calendar className="h-4 w-4 text-blue-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="py-6 bg-dark-lighter/30">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-4">
          <div>
            <div className="flex items-center gap-2">
              {renderIcon()}
              <h2 className="text-xl font-medium text-white">{title}</h2>
            </div>
            {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="icon" 
              className="rounded-full h-8 w-8"
              onClick={handleScrollRight}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            
            <Button 
              variant="outline" 
              size="icon" 
              className="rounded-full h-8 w-8"
              onClick={handleScrollLeft}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            {moreLink && (
              <Button asChild variant="ghost" size="sm">
                <Link href={moreLink}>مشاهده همه</Link>
              </Button>
            )}
          </div>
        </div>
        
        <div 
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent"
          style={{ scrollbarWidth: 'thin' }}
        >
          {content.map((item) => (
            <ContentCard
              key={item.id}
              content={item}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeaturedContentSection;