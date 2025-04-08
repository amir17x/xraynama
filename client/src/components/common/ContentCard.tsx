import { useState } from 'react';
import { Link } from 'wouter';
import { ContentType } from '@/types';
import { Heart, Plus, Play, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface ContentCardProps {
  content: ContentType;
  isInWatchlist?: boolean;
  isInFavorites?: boolean;
  className?: string;
  layout?: 'portrait' | 'landscape';
}

export function ContentCard({ 
  content, 
  isInWatchlist = false, 
  isInFavorites = false,
  className, 
  layout = 'portrait' 
}: ContentCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isFavorite, setIsFavorite] = useState(isInFavorites);
  const [isAddingToWatchlist, setIsAddingToWatchlist] = useState(false);
  const [isAddingToFavorites, setIsAddingToFavorites] = useState(false);

  const handleAddToFavorites = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      toast({
        title: "لطفا وارد شوید",
        description: "برای افزودن به علاقه‌مندی‌ها ابتدا باید وارد حساب کاربری خود شوید",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsAddingToFavorites(true);
      
      if (isFavorite) {
        await apiRequest("DELETE", `/api/content/${content.id}/favorites`);
        setIsFavorite(false);
        toast({
          title: "حذف از علاقه‌مندی‌ها",
          description: `${content.title} از لیست علاقه‌مندی‌های شما حذف شد`,
        });
      } else {
        await apiRequest("POST", `/api/content/${content.id}/favorites`);
        setIsFavorite(true);
        toast({
          title: "افزودن به علاقه‌مندی‌ها",
          description: `${content.title} به لیست علاقه‌مندی‌های شما اضافه شد`,
        });
      }
      
      // Invalidate favorites query
      queryClient.invalidateQueries({ queryKey: ["/api/user/favorites"] });
      
    } catch (error) {
      toast({
        title: "خطا",
        description: "عملیات با خطا مواجه شد، لطفا دوباره تلاش کنید",
        variant: "destructive",
      });
    } finally {
      setIsAddingToFavorites(false);
    }
  };

  const handleAddToWatchlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      toast({
        title: "لطفا وارد شوید",
        description: "برای افزودن به لیست تماشا ابتدا باید وارد حساب کاربری خود شوید",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsAddingToWatchlist(true);
      
      if (isInWatchlist) {
        await apiRequest("DELETE", `/api/content/${content.id}/watchlist`);
        toast({
          title: "حذف از لیست تماشا",
          description: `${content.title} از لیست تماشای شما حذف شد`,
        });
      } else {
        await apiRequest("POST", `/api/content/${content.id}/watchlist`);
        toast({
          title: "افزودن به لیست تماشا",
          description: `${content.title} به لیست تماشای شما اضافه شد`,
        });
      }
      
      // Invalidate watchlist query
      queryClient.invalidateQueries({ queryKey: ["/api/user/watchlist"] });
      
    } catch (error) {
      toast({
        title: "خطا",
        description: "عملیات با خطا مواجه شد، لطفا دوباره تلاش کنید",
        variant: "destructive",
      });
    } finally {
      setIsAddingToWatchlist(false);
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'movie': return 'فیلم';
      case 'series': return 'سریال';
      case 'animation': return 'انیمیشن';
      case 'documentary': return 'مستند';
      default: return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'movie': return 'bg-primary';
      case 'series': return 'bg-accent';
      case 'animation': return 'bg-purple-500';
      case 'documentary': return 'bg-green-600';
      default: return 'bg-gray-500';
    }
  };

  if (layout === 'landscape') {
    return (
      <Link href={`/content/${content.englishTitle.replace(/[^a-zA-Z0-9]/g, '')}`}>
        <div className={cn(
          "fluent-card bg-card border border-border rounded-lg overflow-hidden shadow-lg",
          className
        )}>
          <div className="relative">
            <div className="aspect-video overflow-hidden">
              <img 
                src={content.poster}
                alt={content.title} 
                className="w-full h-full object-cover transform transition-transform duration-500 hover:scale-110" 
              />
            </div>
            <div className="absolute top-2 right-2 bg-card/80 text-muted-foreground backdrop-blur-sm px-2 py-0.5 text-xs rounded-md">
              {content.year}
            </div>
            <div className={cn(
              "absolute top-2 left-2 text-white px-2 py-0.5 text-xs rounded-md",
              getTypeColor(content.type)
            )}>
              {getTypeLabel(content.type)}
            </div>
            
            {/* Media Feature Badges */}
            <div className="absolute bottom-16 left-4 flex gap-1.5">
              {content.hasPersianDubbing && (
                <div className="bg-[#00a651]/90 text-white backdrop-blur-sm w-7 h-7 flex items-center justify-center rounded-full shadow-md" title="دوبله فارسی">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                    <line x1="12" y1="19" x2="12" y2="22"></line>
                  </svg>
                </div>
              )}
              {content.hasPersianSubtitle && (
                <div className="bg-[#4d6bd8]/90 text-white backdrop-blur-sm w-7 h-7 flex items-center justify-center rounded-full shadow-md" title="زیرنویس فارسی">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="6" width="20" height="12" rx="2"></rect>
                    <path d="M8 13h8"></path>
                    <path d="M10 17v-4"></path>
                  </svg>
                </div>
              )}
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                  </svg>
                  <span className="text-white text-sm ml-1">{content.imdbRating || "N/A"}</span>
                </div>
                <div className="flex items-center text-muted-foreground">
                  <span>{content.duration} دقیقه</span>
                </div>
              </div>
            </div>
          </div>
          <div className="p-4">
            <h3 className="font-bold text-foreground mb-1">{content.title}</h3>
            <p className="text-muted-foreground text-sm mb-3">{content.englishTitle}</p>
            <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{content.description}</p>
            <div className="flex space-x-2 rtl:space-x-reverse">
              <Button className="bg-primary hover:bg-primary/90 text-white font-medium py-2 px-4 rounded-md transition duration-300 flex items-center flex-1 justify-center">
                <Play className="mr-2 h-4 w-4" />
                پخش
              </Button>
              <Button variant="outline" size="icon">
                <Download className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="icon"
                onClick={handleAddToFavorites}
                disabled={isAddingToFavorites}
              >
                <Heart className={cn("h-4 w-4", isFavorite && "fill-primary text-primary")} />
              </Button>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/content/${content.englishTitle.replace(/[^a-zA-Z0-9]/g, '')}`}>
      <div className={cn(
        "fluent-card flex-shrink-0 w-60 rounded-lg overflow-hidden bg-card border border-border shadow-lg",
        className
      )}>
        <div className="relative">
          <div className="aspect-[2/3] overflow-hidden">
            <img 
              src={content.poster}
              alt={content.title} 
              className="w-full h-full object-cover transform transition-transform duration-500 hover:scale-110" 
            />
          </div>
          <div className="absolute top-2 right-2 bg-card/80 text-muted-foreground backdrop-blur-sm px-2 py-0.5 text-xs rounded-md">
            {content.year}
          </div>
          <div className={cn(
            "absolute top-2 left-2 text-white px-2 py-0.5 text-xs rounded-md",
            getTypeColor(content.type)
          )}>
            {getTypeLabel(content.type)}
          </div>
          
          {/* Media Feature Badges */}
          <div className="absolute top-10 left-2 flex flex-col gap-1.5">
            {content.hasPersianDubbing && (
              <div className="bg-[#00a651]/90 text-white backdrop-blur-sm w-7 h-7 flex items-center justify-center rounded-full shadow-md" title="دوبله فارسی">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                  <line x1="12" y1="19" x2="12" y2="22"></line>
                </svg>
              </div>
            )}
            {content.hasPersianSubtitle && (
              <div className="bg-[#4d6bd8]/90 text-white backdrop-blur-sm w-7 h-7 flex items-center justify-center rounded-full shadow-md" title="زیرنویس فارسی">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="6" width="20" height="12" rx="2"></rect>
                  <path d="M8 13h8"></path>
                  <path d="M10 17v-4"></path>
                </svg>
              </div>
            )}
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                </svg>
                <span className="text-white text-sm ml-1">{content.imdbRating || "N/A"}</span>
              </div>
              <div className="flex space-x-1 rtl:space-x-reverse">
                <button 
                  className="p-1 text-white hover:text-primary transition duration-200"
                  onClick={handleAddToFavorites}
                  disabled={isAddingToFavorites}
                >
                  <Heart className={cn("h-4 w-4", isFavorite && "fill-primary")} />
                </button>
                <button 
                  className="p-1 text-white hover:text-primary transition duration-200"
                  onClick={handleAddToWatchlist}
                  disabled={isAddingToWatchlist}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-bold text-foreground mb-1 line-clamp-1">{content.title}</h3>
          <p className="text-muted-foreground text-sm line-clamp-1">{content.englishTitle}</p>
          {/* Genre tags would go here if we had them in the content type */}
        </div>
      </div>
    </Link>
  );
}
