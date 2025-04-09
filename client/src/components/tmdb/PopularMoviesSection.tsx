import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Film, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TMDBMovie {
  id: number;
  title: string;
  original_title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  release_date: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  genre_ids: number[];
}

interface TMDBResponse {
  page: number;
  total_pages: number;
  total_results: number;
  results: TMDBMovie[];
}

export default function PopularMoviesSection() {
  const [page, setPage] = useState(1);
  
  // Get popular movies from TMDB
  const { data, isLoading, isError, error } = useQuery<TMDBResponse>({
    queryKey: ['/api/tmdb/movies/popular', page],
    staleTime: 1000 * 60 * 15, // 15 minutes
  });

  // Handle pagination
  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const handleNextPage = () => {
    if (data && page < data.total_pages && page < 5) { // محدود کردن به 5 صفحه
      setPage(page + 1);
    }
  };

  // Format release date
  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'نامشخص';
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  // Calculate star rating
  const getRatingStars = (rating: number) => {
    const fullStars = Math.floor(rating / 2);
    const hasHalfStar = rating % 2 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    return (
      <div className="flex items-center">
        {Array(fullStars).fill(0).map((_, i) => (
          <Star key={`full-${i}`} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
        ))}
        {hasHalfStar && (
          <div className="relative">
            <Star className="h-4 w-4 text-yellow-400" />
            <Star className="absolute top-0 left-0 h-4 w-4 fill-yellow-400 text-yellow-400 overflow-hidden" style={{ clipPath: 'inset(0 50% 0 0)' }} />
          </div>
        )}
        {Array(emptyStars).fill(0).map((_, i) => (
          <Star key={`empty-${i}`} className="h-4 w-4 text-yellow-400/30" />
        ))}
        <span className="text-xs text-muted-foreground mr-1">{rating.toFixed(1)}</span>
      </div>
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <section className="py-12 bg-gradient-to-b from-blue-950/50 to-blue-900/30 backdrop-blur-md">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center">
                <Film className="mr-2 h-6 w-6 text-primary" />
                محبوب‌ترین فیلم‌ها در جهان
              </h2>
              <p className="text-muted-foreground mt-1">برترین فیلم‌های TMDB بر اساس محبوبیت</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {Array(10).fill(0).map((_, i) => (
              <Card key={i} className="bg-card/50 backdrop-blur-sm border-primary/10 overflow-hidden h-[380px]">
                <div className="relative w-full h-[220px] bg-muted/30 shimmer-effect" />
                <CardContent className="p-4">
                  <div className="h-5 bg-muted/30 shimmer-effect w-3/4 mb-2 mt-2"></div>
                  <div className="h-4 bg-muted/30 shimmer-effect w-1/2 mb-3"></div>
                  <div className="h-16 bg-muted/30 shimmer-effect w-full"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (isError) {
    return (
      <section className="py-12 bg-gradient-to-b from-blue-950/50 to-blue-900/30 backdrop-blur-md">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">خطا در دریافت محبوب‌ترین فیلم‌ها</h2>
          <p className="text-muted-foreground mb-6">متأسفانه در دریافت اطلاعات از TMDB خطایی رخ داده است.</p>
          <Button onClick={() => window.location.reload()} className="bg-primary hover:bg-primary/90">تلاش مجدد</Button>
        </div>
      </section>
    );
  }

  // No data state
  if (!data || !data.results || data.results.length === 0) {
    return (
      <section className="py-12 bg-gradient-to-b from-blue-950/50 to-blue-900/30 backdrop-blur-md">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">فیلمی یافت نشد</h2>
          <p className="text-muted-foreground">متأسفانه فیلمی در این بخش وجود ندارد.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 bg-gradient-to-b from-blue-950/50 to-blue-900/30 backdrop-blur-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center">
              <Film className="mr-2 h-6 w-6 text-primary" />
              محبوب‌ترین فیلم‌ها در جهان
            </h2>
            <p className="text-muted-foreground mt-1">برترین فیلم‌های TMDB بر اساس محبوبیت</p>
          </div>
          
          <div className="flex items-center">
            <Button 
              variant="outline" 
              size="icon" 
              className="mr-2"
              onClick={handlePreviousPage}
              disabled={page <= 1}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            
            <span className="text-muted-foreground mx-2">صفحه {page} از {Math.min(data.total_pages, 5)}</span>
            
            <Button 
              variant="outline" 
              size="icon"
              onClick={handleNextPage}
              disabled={page >= Math.min(data.total_pages, 5)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {data.results.map((movie) => (
            <Card 
              key={movie.id}
              className="bg-card/50 backdrop-blur-sm border-primary/10 overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1 h-[380px] flex flex-col"
            >
              <div className="relative w-full h-[220px] overflow-hidden">
                {movie.poster_path ? (
                  <img
                    src={movie.poster_path}
                    alt={movie.title}
                    loading="lazy"
                    onError={(e) => {
                      // در صورت خطا در بارگذاری تصویر، نمایش آیکون فیلم
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.parentElement!.classList.add('bg-card/80', 'flex', 'items-center', 'justify-center');
                      const icon = document.createElement('div');
                      icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-muted-foreground"><path d="M2 2v20"/><path d="M22 2v20"/><path d="M7 2v20"/><path d="M17 2v20"/><path d="M2 12h20"/><path d="M2 7h5"/><path d="M2 17h5"/><path d="M17 17h5"/><path d="M17 7h5"/></svg>';
                      target.parentElement!.appendChild(icon);
                    }}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full bg-card/80 flex items-center justify-center">
                    <Film className="w-16 h-16 text-muted-foreground" />
                  </div>
                )}
              </div>
              
              <CardContent className="p-4 flex-grow flex flex-col">
                <h3 className="font-bold text-base mb-1 line-clamp-1" title={movie.title}>
                  {movie.title}
                </h3>
                <p className="text-xs text-muted-foreground mb-2">
                  {movie.original_title !== movie.title && (
                    <span className="block mb-1">{movie.original_title}</span>
                  )}
                  <span>{formatDate(movie.release_date)}</span>
                </p>
                <p className="text-xs text-muted-foreground line-clamp-3 mb-2 flex-grow">
                  {movie.overview || "توضیحاتی برای این فیلم ثبت نشده است."}
                </p>
                <div className="flex items-center justify-between pt-2 border-t border-primary/10">
                  {getRatingStars(movie.vote_average)}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}