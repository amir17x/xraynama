import React, { useEffect, useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ContentCard } from '@/components/common/ContentCard';
import { ContentType } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronUp, 
  Play, 
  Heart, 
  Download, 
  Search, 
  Star, 
  TrendingUp,
  Award,
  Clock,
  Sparkles,
  Film,
  Tv,
  Video,
  ChevronRight,
  ChevronLeft,
  MonitorPlay,
  Flame,
  Clapperboard
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { useInView } from '@/hooks/use-in-view';

export default function HomePage() {
  // Get authentication status
  const { isAuthenticated, user } = useAuth();
  const heroRef = useRef<HTMLDivElement>(null);
  const [heroVisible] = useInView<HTMLDivElement>({ threshold: 0.1, triggerOnce: true });
  const [activeCategory, setActiveCategory] = useState<string>('all');

  // Get featured content (top-rated)
  const { data: featuredContent, isLoading: isFeaturedLoading } = useQuery<ContentType[]>({
    queryKey: ['/api/content/top-rated', 5],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Get AI recommended content only for authenticated users
  const { data: recommendedContent, isLoading: isRecommendedLoading } = useQuery<ContentType[]>({
    queryKey: ['/api/content/recommended', 5],
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: isAuthenticated, // Only fetch if user is authenticated
  });

  // Get latest movies
  const { data: latestMovies, isLoading: isMoviesLoading } = useQuery<ContentType[]>({
    queryKey: ['/api/content/types/movie'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Get popular series
  const { data: popularSeries, isLoading: isSeriesLoading } = useQuery<ContentType[]>({
    queryKey: ['/api/content/types/series'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Get animations
  const { data: animations, isLoading: isAnimationsLoading } = useQuery<ContentType[]>({
    queryKey: ['/api/content/types/animation'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Get documentaries
  const { data: documentaries, isLoading: isDocumentariesLoading } = useQuery<ContentType[]>({
    queryKey: ['/api/content/types/documentary'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Hero content - use the first item from featured content
  const heroContent = featuredContent && featuredContent.length > 0 
    ? featuredContent[0] 
    : null;

  // Back to top button functionality
  useEffect(() => {
    const handleScroll = () => {
      const backToTopButton = document.getElementById('backToTop');
      if (backToTopButton) {
        if (window.scrollY > 300) {
          backToTopButton.classList.remove('opacity-0', 'invisible');
          backToTopButton.classList.add('opacity-100', 'visible');
        } else {
          backToTopButton.classList.remove('opacity-100', 'visible');
          backToTopButton.classList.add('opacity-0', 'invisible');
        }
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Filter function based on active category
  const getFilteredContent = () => {
    if (activeCategory === 'all') {
      return featuredContent?.slice(0, 8) || [];
    } else if (activeCategory === 'movies') {
      return latestMovies?.slice(0, 8) || [];
    } else if (activeCategory === 'series') {
      return popularSeries?.slice(0, 8) || [];
    } else if (activeCategory === 'animations') {
      return animations?.slice(0, 8) || [];
    } else if (activeCategory === 'documentaries') {
      return documentaries?.slice(0, 8) || [];
    }
    return [];
  };

  // Loading states
  const isContentLoading = isFeaturedLoading || isMoviesLoading || isSeriesLoading || 
                           isAnimationsLoading || isDocumentariesLoading;
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#0a101f] to-[#0d1d41]">
      <Header />
      
      <main className="flex-grow">
        {/* Hero Section with Glassmorphism */}
        <section 
          ref={heroRef}
          className="relative overflow-hidden"
        >
          {/* Background with blur effect */}
          {heroContent && (
            <div className="absolute inset-0 z-0">
              <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black opacity-70" />
              <img 
                src={heroContent.backdrop || heroContent.poster} 
                alt="Background" 
                className="w-full h-full object-cover object-center opacity-40 scale-110 backdrop-blur"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a101f] via-transparent to-transparent" />
              <div className="absolute inset-0 backdrop-blur-sm" />
            </div>
          )}
          
          {/* Hero Content */}
          <div className="container mx-auto px-4 py-12 md:py-20 relative z-10">
            <div className="glassmorphism-hero p-6 md:p-10 rounded-2xl overflow-hidden">
              {/* Accent glow effects */}
              <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500 rounded-full opacity-10 blur-[100px] z-0" />
              <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500 rounded-full opacity-10 blur-[100px] z-0" />
              
              {/* Content */}
              <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                {/* Left Text Section */}
                <div className="space-y-6 animate-fadeIn" style={{ animationDelay: '0.2s' }}>
                  {isAuthenticated && user && (
                    <div className="flex items-center space-x-2 rtl:space-x-reverse mb-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center shadow-glow">
                        <Sparkles className="w-5 h-5 text-white" />
                      </div>
                      <p className="text-white/80 text-sm">
                        <span className="font-bold text-white">{user.username}</span> عزیز، خوش آمدید
                      </p>
                    </div>
                  )}
                  
                  {heroContent ? (
                    <>
                      <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight">
                        {heroContent.title}
                      </h1>
                      <div className="flex flex-wrap items-center gap-3">
                        <Badge variant="outline" className="bg-primary/20 text-white border-primary/30 px-3 py-1">
                          {heroContent.year}
                        </Badge>
                        <Badge variant="outline" className="bg-[#00BFFF]/20 text-white border-[#00BFFF]/30 px-3 py-1">
                          <Star className="w-3 h-3 mr-1 fill-yellow-400 text-yellow-400" /> 
                          {heroContent.imdbRating}
                        </Badge>
                        <div className="text-white/60 text-sm">
                          {heroContent.duration} دقیقه
                        </div>
                        {Array.isArray(heroContent.genres) && heroContent.genres.slice(0, 3).map((genre, idx) => (
                          <Badge key={`genre-${idx}`} variant="outline" className="bg-white/5 text-white/70 border-white/10 hover:text-white transition-colors py-1">
                            {genre}
                          </Badge>
                        ))}
                      </div>
                      <p className="text-white/70 text-lg line-clamp-3">
                        {heroContent.description}
                      </p>
                      
                      <div className="flex flex-wrap gap-3 pt-2">
                        <Button className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white shadow-glow group">
                          <Play className="mr-2 h-4 w-4 fill-white text-white" />
                          پخش فیلم
                        </Button>
                        
                        <Button variant="outline" className="border-white/20 bg-white/5 hover:bg-white/10 text-white hover:text-white transition-all">
                          <Heart className="mr-2 h-4 w-4" />
                          علاقه‌مندی‌ها
                        </Button>
                        
                        <Button variant="outline" className="border-white/20 bg-white/5 hover:bg-white/10 text-white hover:text-white transition-all">
                          <Download className="mr-2 h-4 w-4" />
                          دانلود
                        </Button>
                      </div>
                    </>
                  ) : isContentLoading ? (
                    // Loading state
                    <div className="space-y-4 animate-pulse">
                      <div className="h-8 bg-white/10 rounded-md w-3/4" />
                      <div className="flex gap-2">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="h-6 w-16 bg-white/10 rounded-full" />
                        ))}
                      </div>
                      <div className="h-20 bg-white/5 rounded-md w-full" />
                      <div className="flex gap-3">
                        <div className="h-10 w-28 rounded-md bg-white/10" />
                        <div className="h-10 w-28 rounded-md bg-white/5" />
                        <div className="h-10 w-28 rounded-md bg-white/5" />
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="text-white text-opacity-50">هیچ محتوایی یافت نشد</div>
                    </div>
                  )}
                </div>
                
                {/* Right Image/Poster Section */}
                <div className="flex justify-center md:justify-end animate-fadeIn" style={{ animationDelay: '0.4s' }}>
                  {heroContent ? (
                    <div className="relative rounded-xl overflow-hidden w-full max-w-xs transition-all duration-500 transform group hover:scale-105 shadow-glow">
                      {/* Reflected light effect */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-gradient-to-tr from-transparent via-white/10 to-transparent z-10"></div>
                      
                      <img 
                        src={heroContent.poster} 
                        alt={heroContent.title} 
                        className="w-full h-full object-cover rounded-xl shadow-lg shadow-black/20"
                      />
                      
                      {/* Play button overlay */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="w-16 h-16 rounded-full bg-[#00BFFF]/90 flex items-center justify-center backdrop-blur-sm">
                          <Play className="w-8 h-8 text-white fill-white" />
                        </div>
                      </div>
                      
                      {/* Bottom gradient */}
                      <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/80 to-transparent pointer-events-none"></div>
                    </div>
                  ) : isContentLoading ? (
                    <div className="w-full max-w-xs aspect-[2/3] bg-white/5 rounded-xl animate-pulse shadow-glow"></div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Filter Category Navigation */}
        <section className="py-6">
          <div className="container mx-auto px-4">
            <div className="glassmorphism-card p-4 rounded-xl overflow-x-auto">
              <div className="flex items-center space-x-1 rtl:space-x-reverse">
                <Button 
                  variant={activeCategory === 'all' ? 'default' : 'ghost'} 
                  className={cn(
                    "relative whitespace-nowrap rounded-lg", 
                    activeCategory === 'all' 
                      ? "text-white bg-gradient-to-r from-blue-600 to-blue-500 shadow-glow" 
                      : "text-white/70 hover:text-white"
                  )}
                  onClick={() => setActiveCategory('all')}
                >
                  <Award className="w-4 h-4 mr-2" />
                  همه محتوا
                </Button>
                
                <Button 
                  variant={activeCategory === 'movies' ? 'default' : 'ghost'} 
                  className={cn(
                    "relative whitespace-nowrap rounded-lg", 
                    activeCategory === 'movies' 
                      ? "text-white bg-gradient-to-r from-blue-600 to-blue-500 shadow-glow" 
                      : "text-white/70 hover:text-white"
                  )}
                  onClick={() => setActiveCategory('movies')}
                >
                  <Film className="w-4 h-4 mr-2" />
                  فیلم‌ها
                </Button>
                
                <Button 
                  variant={activeCategory === 'series' ? 'default' : 'ghost'} 
                  className={cn(
                    "relative whitespace-nowrap rounded-lg", 
                    activeCategory === 'series' 
                      ? "text-white bg-gradient-to-r from-blue-600 to-blue-500 shadow-glow" 
                      : "text-white/70 hover:text-white"
                  )}
                  onClick={() => setActiveCategory('series')}
                >
                  <Tv className="w-4 h-4 mr-2" />
                  سریال‌ها
                </Button>
                
                <Button 
                  variant={activeCategory === 'animations' ? 'default' : 'ghost'} 
                  className={cn(
                    "relative whitespace-nowrap rounded-lg", 
                    activeCategory === 'animations' 
                      ? "text-white bg-gradient-to-r from-blue-600 to-blue-500 shadow-glow" 
                      : "text-white/70 hover:text-white"
                  )}
                  onClick={() => setActiveCategory('animations')}
                >
                  <Video className="w-4 h-4 mr-2" />
                  انیمیشن‌ها
                </Button>
                
                <Button 
                  variant={activeCategory === 'documentaries' ? 'default' : 'ghost'} 
                  className={cn(
                    "relative whitespace-nowrap rounded-lg", 
                    activeCategory === 'documentaries' 
                      ? "text-white bg-gradient-to-r from-blue-600 to-blue-500 shadow-glow" 
                      : "text-white/70 hover:text-white"
                  )}
                  onClick={() => setActiveCategory('documentaries')}
                >
                  <MonitorPlay className="w-4 h-4 mr-2" />
                  مستندها
                </Button>
              </div>
            </div>
          </div>
        </section>
        
        {/* Filtered Content Grid */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="glassmorphism-card p-6 rounded-xl relative overflow-hidden">
              {/* Decorative accents */}
              <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full opacity-5 blur-[100px] z-0" />
              <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full opacity-5 blur-[100px] z-0" />
              
              <div className="relative z-10 mb-6 flex justify-between items-center">
                <div className="flex items-center">
                  {activeCategory === 'all' && <Award className="w-5 h-5 mr-2 text-[#00BFFF]" />}
                  {activeCategory === 'movies' && <Film className="w-5 h-5 mr-2 text-[#00BFFF]" />}
                  {activeCategory === 'series' && <Tv className="w-5 h-5 mr-2 text-[#00BFFF]" />}
                  {activeCategory === 'animations' && <Video className="w-5 h-5 mr-2 text-[#00BFFF]" />}
                  {activeCategory === 'documentaries' && <MonitorPlay className="w-5 h-5 mr-2 text-[#00BFFF]" />}
                  
                  <h2 className="text-xl font-medium text-white">
                    {activeCategory === 'all' && 'محتوای برگزیده'}
                    {activeCategory === 'movies' && 'فیلم‌های جدید'}
                    {activeCategory === 'series' && 'سریال‌های محبوب'}
                    {activeCategory === 'animations' && 'انیمیشن‌های برتر'}
                    {activeCategory === 'documentaries' && 'مستندهای ویژه'}
                  </h2>
                </div>
                
                <Link href={`/category/${activeCategory === 'all' ? 'featured' : activeCategory}`}>
                  <Button variant="link" className="text-[#00BFFF] hover:text-blue-400 flex items-center">
                    مشاهده همه
                    <ChevronLeft className="h-4 w-4 mr-1" />
                  </Button>
                </Link>
              </div>
              
              {/* Content Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {isContentLoading ? (
                  // Loading skeletons
                  Array(8).fill(null).map((_, index) => (
                    <div 
                      key={`filtered-skeleton-${index}`} 
                      className="glassmorphism-inner rounded-xl overflow-hidden animate-pulse"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="aspect-[2/3] bg-white/5"></div>
                      <div className="p-4 space-y-2">
                        <div className="h-4 bg-white/10 rounded w-3/4"></div>
                        <div className="h-3 bg-white/5 rounded w-1/2"></div>
                        <div className="pt-2 flex space-x-2 rtl:space-x-reverse">
                          <div className="h-8 bg-white/10 rounded w-20"></div>
                          <div className="h-8 bg-white/5 rounded w-8"></div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : getFilteredContent().length > 0 ? (
                  // Actual content
                  getFilteredContent().map((content, index) => (
                    <ContentCard 
                      key={content.id} 
                      content={content}
                      className="transform transition-all duration-500 hover:scale-105"
                    />
                  ))
                ) : (
                  // Empty state
                  <div className="col-span-full text-center py-12">
                    <div className="text-white/50">محتوایی برای نمایش وجود ندارد</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
        
        {/* Personal Recommendations */}
        {isAuthenticated && recommendedContent && recommendedContent.length > 0 && (
          <section className="py-8">
            <div className="container mx-auto px-4">
              <div className="glassmorphism-hero p-6 rounded-xl relative overflow-hidden bg-gradient-to-br from-blue-900/20 to-indigo-900/20">
                {/* Decorative elements */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5"></div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full opacity-10 blur-[80px] z-0"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500 rounded-full opacity-10 blur-[80px] z-0"></div>
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center shadow-glow mr-3">
                        <Sparkles className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl font-medium text-white">پیشنهادهای ویژه برای شما</h2>
                        <p className="text-sm text-white/60">بر اساس سلیقه و علاقه‌مندی‌های شما</p>
                      </div>
                    </div>
                    
                    <Link href="/recommended">
                      <Button variant="link" className="text-[#00BFFF] hover:text-blue-400 flex items-center">
                        مشاهده همه
                        <ChevronLeft className="h-4 w-4 mr-1" />
                      </Button>
                    </Link>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {isRecommendedLoading ? (
                      // Loading skeletons
                      Array(4).fill(null).map((_, index) => (
                        <div 
                          key={`recommended-skeleton-${index}`} 
                          className="glassmorphism-inner rounded-xl overflow-hidden animate-pulse"
                          style={{ animationDelay: `${index * 0.1}s` }}
                        >
                          <div className="aspect-[2/3] bg-white/5"></div>
                          <div className="p-4 space-y-2">
                            <div className="h-4 bg-white/10 rounded w-3/4"></div>
                            <div className="h-3 bg-white/5 rounded w-1/2"></div>
                          </div>
                        </div>
                      ))
                    ) : (
                      recommendedContent.slice(0, 4).map((content) => (
                        <ContentCard 
                          key={content.id} 
                          content={content}
                          className="transform transition-all duration-500 hover:scale-105 hover:shadow-glow"
                        />
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
        
        {/* Latest Movies Section */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="glassmorphism-card p-6 rounded-xl relative overflow-hidden">
              {/* Decorative accents */}
              <div className="absolute -top-40 -right-40 w-80 h-80 bg-rose-500 rounded-full opacity-5 blur-[100px] z-0" />
              <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-amber-500 rounded-full opacity-5 blur-[100px] z-0" />
              
              <div className="relative z-10 mb-6 flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-amber-500 to-red-500 flex items-center justify-center shadow-glow mr-3">
                    <Film className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-medium text-white">آخرین فیلم‌ها</h2>
                    <p className="text-sm text-white/60">جدیدترین فیلم‌های اضافه شده</p>
                  </div>
                </div>
                
                <Link href="/category/movie">
                  <Button variant="link" className="text-[#00BFFF] hover:text-blue-400 flex items-center">
                    مشاهده همه
                    <ChevronLeft className="h-4 w-4 mr-1" />
                  </Button>
                </Link>
              </div>
              
              {/* Scrollable row */}
              <div className="relative">
                <div className="flex overflow-x-auto pb-4 space-x-4 rtl:space-x-reverse scrollbar-thin">
                  {isMoviesLoading ? (
                    // Loading skeletons
                    Array(10).fill(null).map((_, index) => (
                      <div 
                        key={`movies-skeleton-${index}`} 
                        className="flex-shrink-0 w-60 glassmorphism-inner rounded-xl overflow-hidden animate-pulse"
                        style={{ animationDelay: `${index * 0.05}s` }}
                      >
                        <div className="aspect-[2/3] bg-white/5"></div>
                        <div className="p-4 space-y-2">
                          <div className="h-4 bg-white/10 rounded w-3/4"></div>
                          <div className="h-3 bg-white/5 rounded w-1/2"></div>
                        </div>
                      </div>
                    ))
                  ) : latestMovies && latestMovies.length > 0 ? (
                    latestMovies.map((movie) => (
                      <ContentCard 
                        key={movie.id} 
                        content={movie}
                        className="flex-shrink-0"
                      />
                    ))
                  ) : (
                    <div className="w-full py-10 text-center text-white/50">
                      فیلمی برای نمایش وجود ندارد
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Series Section */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="glassmorphism-card p-6 rounded-xl relative overflow-hidden">
              {/* Decorative accents */}
              <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full opacity-5 blur-[100px] z-0" />
              <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full opacity-5 blur-[100px] z-0" />
              
              <div className="relative z-10 mb-6 flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center shadow-glow mr-3">
                    <Tv className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-medium text-white">سریال‌های پرطرفدار</h2>
                    <p className="text-sm text-white/60">محبوب‌ترین سریال‌های وبسایت</p>
                  </div>
                </div>
                
                <Link href="/category/series">
                  <Button variant="link" className="text-[#00BFFF] hover:text-blue-400 flex items-center">
                    مشاهده همه
                    <ChevronLeft className="h-4 w-4 mr-1" />
                  </Button>
                </Link>
              </div>
              
              {/* Scrollable row */}
              <div className="relative">
                <div className="flex overflow-x-auto pb-4 space-x-4 rtl:space-x-reverse scrollbar-thin">
                  {isSeriesLoading ? (
                    // Loading skeletons
                    Array(10).fill(null).map((_, index) => (
                      <div 
                        key={`series-skeleton-${index}`} 
                        className="flex-shrink-0 w-60 glassmorphism-inner rounded-xl overflow-hidden animate-pulse"
                        style={{ animationDelay: `${index * 0.05}s` }}
                      >
                        <div className="aspect-[2/3] bg-white/5"></div>
                        <div className="p-4 space-y-2">
                          <div className="h-4 bg-white/10 rounded w-3/4"></div>
                          <div className="h-3 bg-white/5 rounded w-1/2"></div>
                        </div>
                      </div>
                    ))
                  ) : popularSeries && popularSeries.length > 0 ? (
                    popularSeries.map((series) => (
                      <ContentCard 
                        key={series.id} 
                        content={series}
                        className="flex-shrink-0"
                      />
                    ))
                  ) : (
                    <div className="w-full py-10 text-center text-white/50">
                      سریالی برای نمایش وجود ندارد
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Animations & Documentaries Sections - Side by Side */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Animations Section */}
              <div className="glassmorphism-card p-6 rounded-xl relative overflow-hidden h-full">
                {/* Decorative accents */}
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-500 rounded-full opacity-5 blur-[100px] z-0" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500 rounded-full opacity-5 blur-[100px] z-0" />
                
                <div className="relative z-10 mb-6 flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 flex items-center justify-center shadow-glow mr-3">
                      <Video className="w-4 h-4 text-white" />
                    </div>
                    <h2 className="text-xl font-medium text-white">انیمیشن‌های برتر</h2>
                  </div>
                  
                  <Link href="/category/animation">
                    <Button variant="link" className="text-[#00BFFF] hover:text-blue-400 flex items-center">
                      بیشتر
                      <ChevronLeft className="h-4 w-4 mr-1" />
                    </Button>
                  </Link>
                </div>
                
                {/* Animation content - vertical layout */}
                <div className="space-y-4">
                  {isAnimationsLoading ? (
                    // Loading skeletons
                    Array(3).fill(null).map((_, index) => (
                      <div 
                        key={`animation-skeleton-${index}`} 
                        className="glassmorphism-inner rounded-xl overflow-hidden animate-pulse flex"
                      >
                        <div className="w-24 h-24 bg-white/5"></div>
                        <div className="p-4 flex-grow space-y-2">
                          <div className="h-4 bg-white/10 rounded w-3/4"></div>
                          <div className="h-3 bg-white/5 rounded w-1/2"></div>
                        </div>
                      </div>
                    ))
                  ) : animations && animations.length > 0 ? (
                    animations.slice(0, 3).map((animation) => (
                      <Link key={animation.id} href={`/content/${animation.englishTitle.replace(/[^a-zA-Z0-9]/g, '')}`}>
                        <div className="glassmorphism-inner rounded-xl overflow-hidden flex transition-all duration-300 hover:bg-white/10">
                          <img 
                            src={animation.poster} 
                            alt={animation.title} 
                            className="w-24 h-24 object-cover"
                          />
                          <div className="p-4 flex-grow">
                            <h3 className="text-white font-medium">{animation.title}</h3>
                            <p className="text-white/60 text-sm">{animation.year}</p>
                          </div>
                          <div className="flex items-center pr-4">
                            <div className="bg-white/10 rounded-full p-2 group-hover:bg-primary/20 transition-colors">
                              <Play className="w-4 h-4 text-white" />
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="py-6 text-center text-white/50">
                      انیمیشنی برای نمایش وجود ندارد
                    </div>
                  )}
                </div>
              </div>
              
              {/* Documentaries Section */}
              <div className="glassmorphism-card p-6 rounded-xl relative overflow-hidden h-full">
                {/* Decorative accents */}
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-amber-500 rounded-full opacity-5 blur-[100px] z-0" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-500 rounded-full opacity-5 blur-[100px] z-0" />
                
                <div className="relative z-10 mb-6 flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center shadow-glow mr-3">
                      <MonitorPlay className="w-4 h-4 text-white" />
                    </div>
                    <h2 className="text-xl font-medium text-white">مستندهای برگزیده</h2>
                  </div>
                  
                  <Link href="/category/documentary">
                    <Button variant="link" className="text-[#00BFFF] hover:text-blue-400 flex items-center">
                      بیشتر
                      <ChevronLeft className="h-4 w-4 mr-1" />
                    </Button>
                  </Link>
                </div>
                
                {/* Documentaries content - vertical layout */}
                <div className="space-y-4">
                  {isDocumentariesLoading ? (
                    // Loading skeletons
                    Array(3).fill(null).map((_, index) => (
                      <div 
                        key={`documentary-skeleton-${index}`} 
                        className="glassmorphism-inner rounded-xl overflow-hidden animate-pulse flex"
                      >
                        <div className="w-24 h-24 bg-white/5"></div>
                        <div className="p-4 flex-grow space-y-2">
                          <div className="h-4 bg-white/10 rounded w-3/4"></div>
                          <div className="h-3 bg-white/5 rounded w-1/2"></div>
                        </div>
                      </div>
                    ))
                  ) : documentaries && documentaries.length > 0 ? (
                    documentaries.slice(0, 3).map((documentary) => (
                      <Link key={documentary.id} href={`/content/${documentary.englishTitle.replace(/[^a-zA-Z0-9]/g, '')}`}>
                        <div className="glassmorphism-inner rounded-xl overflow-hidden flex transition-all duration-300 hover:bg-white/10">
                          <img 
                            src={documentary.poster} 
                            alt={documentary.title} 
                            className="w-24 h-24 object-cover"
                          />
                          <div className="p-4 flex-grow">
                            <h3 className="text-white font-medium">{documentary.title}</h3>
                            <p className="text-white/60 text-sm">{documentary.year}</p>
                          </div>
                          <div className="flex items-center pr-4">
                            <div className="bg-white/10 rounded-full p-2 group-hover:bg-primary/20 transition-colors">
                              <Play className="w-4 h-4 text-white" />
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="py-6 text-center text-white/50">
                      مستندی برای نمایش وجود ندارد
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
      
      {/* Back to top button */}
      <Button
        id="backToTop"
        className="fixed bottom-8 left-8 bg-[#00BFFF] hover:bg-[#00BFFF]/90 text-white p-3 rounded-full shadow-glow transition-all duration-300 opacity-0 invisible z-50"
        size="icon"
        onClick={scrollToTop}
        aria-label="Back to top"
      >
        <ChevronUp className="h-5 w-5" />
      </Button>
    </div>
  );
}
