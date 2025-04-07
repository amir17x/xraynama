import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { BookmarkPlus, Info, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Content } from '@shared/schema';
import { useAuth } from '@/hooks/use-auth';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface ContentCardProps {
  content: Content;
  className?: string;
  showActions?: boolean;
  isFavorite?: boolean;
}

export function ContentCard({ content, className, showActions = true, isFavorite = false }: ContentCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [location, navigate] = useLocation();
  const [isHovered, setIsHovered] = useState(false);
  const [favoriteStatus, setFavoriteStatus] = useState(isFavorite);
  
  // Format duration to hours and minutes
  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} دقیقه`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours} ساعت و ${remainingMinutes} دقیقه` : `${hours} ساعت`;
  };
  
  // Get content type in Persian
  const getContentTypePersian = (type: string) => {
    switch (type) {
      case 'movie': return 'فیلم';
      case 'series': return 'سریال';
      case 'animation': return 'انیمیشن';
      case 'documentary': return 'مستند';
      default: return type;
    }
  };
  
  // Handle add to favorites
  const handleAddToFavorites = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      toast({
        title: "ابتدا وارد شوید",
        description: "برای افزودن به علاقه‌مندی‌ها ابتدا باید وارد حساب کاربری خود شوید.",
        variant: "destructive"
      });
      navigate('/auth');
      return;
    }
    
    try {
      if (favoriteStatus) {
        // Remove from favorites
        await apiRequest('DELETE', `/api/favorites/${content.id}`);
        setFavoriteStatus(false);
        toast({
          title: "از علاقه‌مندی‌ها حذف شد",
          description: `${content.titleFa} از لیست علاقه‌مندی‌های شما حذف شد.`
        });
      } else {
        // Add to favorites
        await apiRequest('POST', '/api/favorites', {
          userId: user.id,
          contentId: content.id
        });
        setFavoriteStatus(true);
        toast({
          title: "به علاقه‌مندی‌ها اضافه شد",
          description: `${content.titleFa} به لیست علاقه‌مندی‌های شما اضافه شد.`
        });
      }
      
      // Invalidate favorites cache to update the UI elsewhere
      queryClient.invalidateQueries({ queryKey: ['/api/favorites'] });
    } catch (error) {
      toast({
        title: "خطا",
        description: "عملیات با خطا مواجه شد. لطفاً دوباره تلاش کنید.",
        variant: "destructive"
      });
    }
  };
  
  // Handle view details
  const handleViewDetails = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/content/${content.id}`);
  };

  return (
    <Link href={`/content/${content.id}`}>
      <a 
        className={cn(
          "fluent-card rounded-xl overflow-hidden block", 
          className
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative">
          {/* Poster/Thumbnail */}
          <img 
            src={content.poster} 
            alt={content.titleFa} 
            className="w-full aspect-[2/3] object-cover"
          />
          
          {/* Content type badge */}
          <div className="absolute top-2 right-2 bg-background bg-opacity-70 rounded-lg px-2 py-0.5 text-xs">
            {getContentTypePersian(content.type)}
          </div>
          
          {/* Action buttons */}
          {showActions && (
            <div className={`absolute top-2 left-2 flex flex-col gap-2 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
              <Button
                onClick={handleAddToFavorites}
                variant="ghost"
                className={`bg-background bg-opacity-70 rounded-full p-1.5 text-white hover:bg-primary/50 ${favoriteStatus ? 'text-primary' : ''}`}
                size="icon"
              >
                <BookmarkPlus className="h-4 w-4" />
              </Button>
              <Button
                onClick={handleViewDetails}
                variant="ghost"
                className="bg-background bg-opacity-70 rounded-full p-1.5 text-white hover:bg-primary/50"
                size="icon"
              >
                <Info className="h-4 w-4" />
              </Button>
            </div>
          )}
          
          {/* Gradient overlay */}
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-background to-transparent h-1/4"></div>
        </div>
        
        {/* Content info */}
        <div className="p-3">
          {/* Title and rating */}
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-medium line-clamp-1">{content.titleFa}</h3>
            <div className="flex items-center">
              <Star className="h-4 w-4 text-primary mr-0.5 fill-primary" />
              <span className="text-xs">{content.imdbRating?.toFixed(1) || "N/A"}</span>
            </div>
          </div>
          
          {/* Year and duration */}
          <div className="flex items-center text-muted-foreground text-xs">
            <span>{content.year}</span>
            <span className="mx-1">•</span>
            <span>{formatDuration(content.duration)}</span>
          </div>
        </div>
      </a>
    </Link>
  );
}
