import { useState, useRef, useEffect } from 'react';
import { Link } from 'wouter';
import { ContentType, GenreType } from '@/types';
import { Heart, Plus, Play, Download, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useInView } from '@/hooks/use-in-view';
import { 
  useAddToFavorites, 
  useRemoveFromFavorites, 
  useAddToWatchlist, 
  useRemoveFromWatchlist 
} from '@/hooks/use-api-mutation';

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
  const [imageLoaded, setImageLoaded] = useState(false);
  const [cardRef, isVisible] = useInView<HTMLDivElement>({ 
    threshold: 0.1, 
    triggerOnce: true,
    rootMargin: '200px 0px' // Preload images that are 200px away from viewport
  });

  // Handle image loading effect
  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  // Effect to reset image loaded state when the content changes
  useEffect(() => {
    setImageLoaded(false);
  }, [content.id]);

  // هوک‌های mutation برای مدیریت محتوای علاقه‌مندی‌ها
  const addToFavoritesMutation = useAddToFavorites();
  const removeFromFavoritesMutation = useRemoveFromFavorites();
  
  // هوک‌های mutation برای مدیریت محتوای لیست تماشا
  const addToWatchlistMutation = useAddToWatchlist();
  const removeFromWatchlistMutation = useRemoveFromWatchlist();

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
        // حذف از علاقه‌مندی‌ها با استفاده از هوک mutation
        await removeFromFavoritesMutation.mutateAsync(Number(content.id), {
          onSuccess: () => {
            setIsFavorite(false);
          },
          onSettled: () => {
            setIsAddingToFavorites(false);
          }
        });
      } else {
        // افزودن به علاقه‌مندی‌ها با استفاده از هوک mutation
        await addToFavoritesMutation.mutateAsync(Number(content.id), {
          onSuccess: () => {
            setIsFavorite(true);
          },
          onSettled: () => {
            setIsAddingToFavorites(false);
          }
        });
      }
    } catch (error) {
      // خطا در هوک mutation به صورت خودکار مدیریت می‌شود
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
        // حذف از لیست تماشا با استفاده از هوک mutation
        await removeFromWatchlistMutation.mutateAsync(Number(content.id), {
          onSuccess: () => {
            // بروزرسانی وضعیت محلی - مقدار isInWatchlist از prop می‌آید و فقط در رندر بعدی به‌روز می‌شود
          },
          onSettled: () => {
            setIsAddingToWatchlist(false);
          }
        });
      } else {
        // افزودن به لیست تماشا با استفاده از هوک mutation
        await addToWatchlistMutation.mutateAsync(Number(content.id), {
          onSuccess: () => {
            // بروزرسانی وضعیت محلی
          },
          onSettled: () => {
            setIsAddingToWatchlist(false);
          }
        });
      }
    } catch (error) {
      // خطا در هوک mutation به صورت خودکار مدیریت می‌شود
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
        <div 
          ref={cardRef} 
          className={cn(
            "fluent-card glass-effect rounded-lg overflow-hidden transition-all duration-300",
            isVisible ? "content-enter" : "opacity-0 translate-y-4",
            className
          )}
        >
          <div className="relative group">
            <div className="aspect-video overflow-hidden">
              {/* Placeholder for image loading */}
              <div 
                className={cn(
                  "absolute inset-0 bg-black/20 flex items-center justify-center transition-opacity duration-300",
                  imageLoaded ? "opacity-0" : "opacity-100"
                )}
              >
                <div className="shimmer-effect w-full h-full absolute"></div>
                <Image className="w-8 h-8 text-white/30" />
              </div>
              
              {isVisible && (
                <img 
                  src={content.poster}
                  alt={content.title}
                  onLoad={handleImageLoad}
                  className={cn(
                    "w-full h-full object-cover transform transition-all duration-500 ease-out group-hover:scale-105",
                    imageLoaded ? "opacity-100" : "opacity-0"
                  )}
                />
              )}
              
              {/* اضافه کردن یک لایه دائمی برای جلوگیری از چشمک زدن */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent opacity-30 transition-opacity duration-300 group-hover:opacity-100"></div>
              <div className="shimmer-effect opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
            </div>
            
            {/* Year Badge */}
            <div className="content-badge content-year-badge">
              {content.year}
            </div>
            
            {/* Type Badge */}
            <div className={cn(
              "content-badge content-type-badge",
              getTypeColor(content.type)
            )}>
              {getTypeLabel(content.type)}
            </div>
            
            {/* Media Feature Badges */}
            <div className="absolute bottom-16 left-4 flex gap-1.5">
              {content.hasPersianDubbing && (
                <div className="content-feature-badge bg-[#00a651]/90" title="دوبله فارسی">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                    <line x1="12" y1="19" x2="12" y2="22"></line>
                  </svg>
                </div>
              )}
              {content.hasPersianSubtitle && (
                <div className="content-feature-badge bg-[#4d6bd8]/90" title="زیرنویس فارسی">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="6" width="20" height="12" rx="2"></rect>
                    <path d="M8 13h8"></path>
                    <path d="M10 17v-4"></path>
                  </svg>
                </div>
              )}
            </div>
            
            {/* Play Button */}
            <div className="content-play-button-container">
              <div className="content-play-button">
                <Play className="h-6 w-6 text-white fill-white" />
              </div>
            </div>
            
            {/* Bottom Info Section */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent">
              <div className="flex justify-between items-center">
                <div className="content-info-badge">
                  <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                  </svg>
                  <span className="text-white text-sm ml-1">{content.imdbRating || "N/A"}</span>
                </div>
                <div className="content-info-badge">
                  <span>{content.duration} دقیقه</span>
                </div>
              </div>
            </div>
          </div>
          <div className="p-4">
            <h3 className="content-title">{content.title}</h3>
            <p className="content-subtitle">{content.englishTitle}</p>
            <p className="content-description">{content.description}</p>
            <div className="flex space-x-2 rtl:space-x-reverse">
              <Button className="content-primary-button">
                <Play className="mr-2 h-4 w-4" />
                پخش
              </Button>
              <Button 
                variant="outline" 
                size="icon"
                className="content-icon-button"
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="icon"
                onClick={handleAddToFavorites}
                disabled={isAddingToFavorites}
                className="content-icon-button"
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
      <div 
        ref={cardRef} 
        className={cn(
          "fluent-card glass-effect flex-shrink-0 w-60 rounded-lg overflow-hidden transition-all duration-300 ease-out hover:-translate-y-1",
          isVisible ? "content-enter" : "opacity-0 translate-y-4",
          className
        )}
      >
        <div className="relative group">
          <div className="aspect-[2/3] overflow-hidden">
            {/* Placeholder for image loading */}
            <div 
              className={cn(
                "absolute inset-0 bg-black/20 flex items-center justify-center transition-opacity duration-300",
                imageLoaded ? "opacity-0" : "opacity-100"
              )}
            >
              <div className="shimmer-effect w-full h-full absolute"></div>
              <Image className="w-8 h-8 text-white/30" />
            </div>
            
            {isVisible && (
              <img 
                src={content.poster}
                alt={content.title} 
                onLoad={handleImageLoad}
                className={cn(
                  "w-full h-full object-cover transform transition-all duration-500 ease-out group-hover:scale-105 filter group-hover:brightness-110",
                  imageLoaded ? "opacity-100" : "opacity-0"
                )}
              />
            )}
            
            {/* اضافه کردن یک لایه دائمی برای جلوگیری از چشمک زدن */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent opacity-30 transition-opacity duration-300 group-hover:opacity-100"></div>
            <div className="shimmer-effect opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
          </div>
          
          {/* Year Badge */}
          <div className="content-badge content-year-badge">
            {content.year}
          </div>
          
          {/* Type Badge */}
          <div className={cn(
            "content-badge content-type-badge",
            getTypeColor(content.type)
          )}>
            {getTypeLabel(content.type)}
          </div>
          
          {/* Media Feature Badges */}
          <div className="absolute top-10 left-2 flex flex-col gap-1.5">
            {content.hasPersianDubbing && (
              <div className="content-feature-badge bg-[#00a651]/90" title="دوبله فارسی">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                  <line x1="12" y1="19" x2="12" y2="22"></line>
                </svg>
              </div>
            )}
            {content.hasPersianSubtitle && (
              <div className="content-feature-badge bg-[#4d6bd8]/90" title="زیرنویس فارسی">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="6" width="20" height="12" rx="2"></rect>
                  <path d="M8 13h8"></path>
                  <path d="M10 17v-4"></path>
                </svg>
              </div>
            )}
          </div>
          
          {/* Play Button */}
          <div className="content-play-button-container">
            <div className="content-play-button">
              <Play className="h-6 w-6 text-white fill-white" />
            </div>
          </div>

          {/* Bottom Info Section */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent">
            <div className="flex justify-between items-center">
              <div className="content-info-badge">
                <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                </svg>
                <span className="text-white text-sm ml-1">{content.imdbRating || "N/A"}</span>
              </div>
              <div className="flex space-x-1 rtl:space-x-reverse">
                <button 
                  className="p-1.5 text-white bg-black/30 rounded-full backdrop-blur-sm hover:bg-primary/70 transition-all duration-300 transform hover:scale-110"
                  onClick={handleAddToFavorites}
                  disabled={isAddingToFavorites}
                >
                  <Heart className={cn("h-4 w-4", isFavorite && "fill-primary")} />
                </button>
                <button 
                  className="p-1.5 text-white bg-black/30 rounded-full backdrop-blur-sm hover:bg-primary/70 transition-all duration-300 transform hover:scale-110"
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
          <h3 className="content-title">{content.title}</h3>
          <p className="content-subtitle">{content.englishTitle}</p>
          {content.genres && (
            <div className="flex flex-wrap gap-1 mt-2">
              {typeof content.genres === 'string' ? (
                <span className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
                  {content.genres}
                </span>
              ) : Array.isArray(content.genres) && content.genres.slice(0, 2).map((genre: any, index: number) => (
                <span key={index} className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
                  {typeof genre === 'string' ? genre : genre.name || String(genre)}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
