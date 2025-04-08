import { useState, useEffect, useRef } from 'react';
import { Link } from 'wouter';
import { ContentType } from '@/types';
import { Play, Download, Heart, Share2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface FeaturedSliderProps {
  content: ContentType[];
  isLoading?: boolean;
}

export function FeaturedSlider({ content, isLoading = false }: FeaturedSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isAddingToFavorites, setIsAddingToFavorites] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  // Auto-rotate slider items
  useEffect(() => {
    if (content.length <= 1) return;
    
    // Start auto-rotation
    intervalRef.current = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % content.length);
    }, 8000);
    
    // Clean up on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [content.length]);

  // Reset auto-rotation when manually changing slides
  const resetInterval = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    intervalRef.current = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % content.length);
    }, 8000);
  };

  const handlePrevious = () => {
    setCurrentIndex(prev => (prev - 1 + content.length) % content.length);
    resetInterval();
  };

  const handleNext = () => {
    setCurrentIndex(prev => (prev + 1) % content.length);
    resetInterval();
  };

  const handleGoToIndex = (index: number) => {
    setCurrentIndex(index);
    resetInterval();
  };

  const handleAddToFavorites = async () => {
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
      const currentContent = content[currentIndex];
      
      if (isFavorite) {
        await apiRequest("DELETE", `/api/content/${currentContent.id}/favorites`);
        setIsFavorite(false);
        toast({
          title: "حذف از علاقه‌مندی‌ها",
          description: `${currentContent.title} از لیست علاقه‌مندی‌های شما حذف شد`,
        });
      } else {
        await apiRequest("POST", `/api/content/${currentContent.id}/favorites`);
        setIsFavorite(true);
        toast({
          title: "افزودن به علاقه‌مندی‌ها",
          description: `${currentContent.title} به لیست علاقه‌مندی‌های شما اضافه شد`,
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

  const handleShareContent = () => {
    if (navigator.share) {
      navigator.share({
        title: content[currentIndex].title,
        text: content[currentIndex].description,
        url: window.location.origin + '/content/' + content[currentIndex].id,
      })
      .catch((error) => {
        console.log('Error sharing:', error);
      });
    } else {
      // Fallback for browsers that don't support the Web Share API
      toast({
        title: "اشتراک‌گذاری",
        description: "کپی شد: " + window.location.origin + '/content/' + content[currentIndex].id,
      });
      navigator.clipboard.writeText(window.location.origin + '/content/' + content[currentIndex].id);
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

  // Render loading skeleton
  if (isLoading) {
    return (
      <section className="mb-12">
        <div className="relative h-[500px] md:h-[550px] rounded-2xl overflow-hidden shadow-2xl bg-card animate-pulse">
          <div className="absolute bottom-0 left-0 right-0 p-8 z-10">
            <div className="flex flex-col md:flex-row items-start md:items-end">
              <div className="hidden md:block bg-muted rounded-lg overflow-hidden shadow-lg mb-6 md:mb-0" style={{ width: '200px', height: '300px', flexShrink: 0 }}></div>
              <div className="md:mr-8 flex-grow">
                <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
                <div className="h-12 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-6 bg-muted rounded w-1/2 mb-4"></div>
                <div className="h-4 bg-muted rounded w-full mb-1"></div>
                <div className="h-4 bg-muted rounded w-full mb-1"></div>
                <div className="h-4 bg-muted rounded w-3/4 mb-6"></div>
                <div className="flex flex-wrap">
                  <div className="h-10 bg-muted rounded w-32 mr-2"></div>
                  <div className="h-10 bg-muted rounded w-32 mr-2"></div>
                  <div className="h-10 bg-muted rounded w-10 mr-2"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // If no content is available
  if (!content || content.length === 0) {
    return null;
  }

  const currentContent = content[currentIndex];

  return (
    <section className="content-section-glass mb-12 overflow-hidden backdrop-blur-xl">
      <div className="relative h-[500px] md:h-[550px] rounded-xl overflow-hidden">
        {/* Featured background image */}
        <div className="absolute inset-0">
          <img 
            src={currentContent.backdrop || currentContent.poster} 
            className="w-full h-full object-cover" 
            alt={currentContent.title}
          />
          {/* Glassmorphism overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/60 to-background/20 backdrop-blur-sm"></div>
        </div>
        
        {/* Featured content info */}
        <div className="absolute bottom-0 left-0 right-0 p-8 z-10">
          <div className="flex flex-col md:flex-row items-start md:items-end">
            {/* Movie poster */}
            <div className="hidden md:block bg-card rounded-lg overflow-hidden shadow-lg transform transition-transform duration-300 hover:scale-105 mb-6 md:mb-0" style={{ width: '200px', flexShrink: 0 }}>
              <img 
                src={currentContent.poster} 
                className="w-full h-auto" 
                alt={currentContent.title}
              />
            </div>
            
            {/* Movie info */}
            <div className="md:mr-8 flex-grow">
              <div className="flex items-center mb-2">
                <span className={cn(
                  "px-2 py-0.5 text-white text-xs rounded-md mr-2",
                  currentContent.type === 'movie' ? 'bg-primary' : 
                  currentContent.type === 'series' ? 'bg-accent' :
                  currentContent.type === 'animation' ? 'bg-purple-500' : 'bg-green-600'
                )}>
                  {getTypeLabel(currentContent.type)}
                </span>
                <span className="text-muted-foreground text-sm">{currentContent.year}</span>
                <span className="mx-2 text-muted-foreground">•</span>
                <span className="text-muted-foreground text-sm">{currentContent.duration} دقیقه</span>
                <span className="mx-2 text-muted-foreground">•</span>
                <div className="flex items-center">
                  <svg className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                  </svg>
                  <span className="text-muted-foreground text-sm">{currentContent.imdbRating || "N/A"}</span>
                </div>
              </div>
              
              <h1 className="text-3xl md:text-5xl font-bold mb-2 text-white">{currentContent.title}</h1>
              <h2 className="text-xl text-muted-foreground mb-4">{currentContent.englishTitle}</h2>
              
              <p className="text-muted-foreground mb-6 max-w-3xl">
                {currentContent.description}
              </p>
              
              <div className="flex flex-wrap items-center">
                <Link href={`/content/${currentContent.id}`}>
                  <Button className="bg-primary hover:bg-primary/90 text-white font-medium py-3 px-6 rounded-md transition duration-300 flex items-center ml-4 mb-2 md:mb-0">
                    <Play className="mr-2 h-5 w-5" />
                    پخش آنلاین
                  </Button>
                </Link>
                
                <Link href={`/content/${currentContent.id}`}>
                  <Button variant="outline" className="text-foreground font-medium py-3 px-6 rounded-md transition duration-300 flex items-center ml-4 mb-2 md:mb-0">
                    <Download className="mr-2 h-5 w-5" />
                    دانلود
                  </Button>
                </Link>
                
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="py-3 px-4 ml-4 mb-2 md:mb-0"
                  onClick={handleAddToFavorites}
                  disabled={isAddingToFavorites}
                >
                  <Heart className={cn("h-5 w-5", isFavorite && "fill-primary text-primary")} />
                </Button>
                
                <Button 
                  variant="outline" 
                  size="icon"
                  className="py-3 px-4 ml-4 mb-2 md:mb-0" 
                  onClick={handleShareContent}
                >
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Navigation arrows */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-1/2 right-4 -translate-y-1/2 bg-card/50 hover:bg-card text-white p-2 rounded-full transition duration-300 z-10"
          onClick={handlePrevious}
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-1/2 left-4 -translate-y-1/2 bg-card/50 hover:bg-card text-white p-2 rounded-full transition duration-300 z-10"
          onClick={handleNext}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        
        {/* Indicators */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
          {content.map((_, i) => (
            <button 
              key={i}
              className={`w-2 h-2 rounded-full ${i === currentIndex ? 'bg-primary' : 'bg-muted-foreground hover:bg-primary/50'} transition duration-300`}
              onClick={() => handleGoToIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
