import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Star, ChevronLeft, ChevronRight, Play, Search, Heart, Plus } from 'lucide-react';

import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ContentCard } from '@/components/common/ContentCard';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

// کامپوننت پس‌زمینه سه‌بعدی
const SplineBackground: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // اطمینان از اینکه کد در سمت مرورگر اجرا می‌شود
    if (typeof window === 'undefined') return;
    
    // بارگذاری اسکریپت Spline
    const loadSplineViewer = async () => {
      try {
        // بررسی اینکه آیا قبلاً اسکریپت بارگذاری شده است
        if (!document.getElementById('spline-script')) {
          // ایجاد اسکریپت
          const script = document.createElement('script');
          script.id = 'spline-script';
          script.type = 'module';
          script.src = 'https://unpkg.com/@splinetool/viewer@1.9.82/build/spline-viewer.js';
          document.head.appendChild(script);
          
          // انتظار برای بارگذاری اسکریپت
          await new Promise((resolve) => {
            script.onload = resolve;
          });
        }
        
        // اضافه کردن المان spline-viewer به صورت دستی
        if (containerRef.current) {
          setTimeout(() => {
            if (containerRef.current && !containerRef.current.querySelector('spline-viewer')) {
              const container = containerRef.current;
              container.innerHTML = '';
              
              const splineViewer = document.createElement('div');
              splineViewer.innerHTML = `
                <spline-viewer 
                  loading-anim-type="spinner-small-dark" 
                  url="https://prod.spline.design/heOPRtDTGel6wqDu/scene.splinecode" 
                  style="width: 100%; height: 100%; opacity: 0.5;"
                ></spline-viewer>
              `;
              
              container.appendChild(splineViewer.firstChild as Node);
            }
          }, 500);
        }
      } catch (error) {
        console.error('خطا در بارگذاری Spline viewer:', error);
      }
    };
    
    loadSplineViewer();
    
    // پاکسازی در هنگام unmount شدن کامپوننت
    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, []);
  
  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-0 pointer-events-none overflow-hidden"
    ></div>
  );
};

import { ContentType } from '@/types';

// Component to show a content section with title and horizontal scrolling
const ContentSection: React.FC<{
  title: string;
  linkTo: string;
  contents: ContentType[];
  isLoading: boolean;
  icon?: React.ReactNode;
}> = ({ title, linkTo, contents, isLoading, icon }) => {
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

  return (
    <section className="py-6 lg:py-8 relative">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
            {icon && <span className="text-primary">{icon}</span>}
            {title}
          </h2>
          <Link href={linkTo} className="flex items-center text-primary hover:underline text-sm">
            مشاهده همه
            <ChevronLeft className="h-4 w-4 mr-1" />
          </Link>
        </div>
        
        <div className="relative">
          {/* Scroll buttons */}
          <button 
            onClick={handleScrollRight}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-gray-900/80 text-white p-2 rounded-full shadow-lg hover:bg-gray-800 hidden md:flex"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          
          <button 
            onClick={handleScrollLeft}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-gray-900/80 text-white p-2 rounded-full shadow-lg hover:bg-gray-800 hidden md:flex"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          
          {isLoading ? (
            <div className="flex overflow-x-auto scrollbar-hide gap-4 pb-4" ref={scrollContainerRef}>
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex-shrink-0 w-60 bg-card/30 rounded-lg overflow-hidden animate-pulse">
                  <div className="aspect-[2/3] bg-muted"></div>
                  <div className="p-3">
                    <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div 
              className="flex overflow-x-auto scrollbar-hide gap-4 pb-4" 
              dir="rtl" 
              ref={scrollContainerRef}
            >
              {contents?.slice(0, 10).map((content) => (
                <div key={content.id} className="flex-shrink-0">
                  <ContentCard content={content} />
                </div>
              ))}
              {contents?.length === 0 && (
                <div className="flex-1 text-center py-12 text-gray-400">
                  محتوایی برای نمایش وجود ندارد
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

// Featured content component with bigger display and more details
const FeaturedContent: React.FC<{
  contents: ContentType[];
  isLoading: boolean;
}> = ({ contents, isLoading }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  
  // Auto rotate featured content every 8 seconds
  useEffect(() => {
    if (!contents || contents.length <= 1) return;
    
    const interval = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % contents.length);
    }, 8000);
    
    return () => clearInterval(interval);
  }, [contents]);
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4">
        <div className="relative bg-black/20 rounded-lg overflow-hidden">
          <Skeleton className="w-full aspect-[21/9]" />
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black to-transparent">
            <Skeleton className="h-7 w-1/3 mb-3" />
            <Skeleton className="h-5 w-2/3 mb-4" />
            <Skeleton className="h-4 w-full max-w-2xl mb-6" />
            <div className="flex gap-3">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-10" />
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!contents || contents.length === 0) {
    return (
      <div className="container mx-auto px-4">
        <div className="bg-black/30 rounded-lg p-12 text-center text-gray-400">
          محتوای ویژه‌ای برای نمایش وجود ندارد
        </div>
      </div>
    );
  }
  
  const content = contents[activeIndex];
  
  return (
    <div className="container mx-auto px-4">
      <div className="relative rounded-xl overflow-hidden shadow-2xl bg-black/40">
        <div 
          className="w-full aspect-[21/9] bg-cover bg-center transition-transform duration-700 hover:scale-105"
          style={{ backgroundImage: `url(${content.poster})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent"></div>
          
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 flex flex-col items-start">
            <div className="flex items-center gap-3 mb-3">
              <Badge variant="secondary" className="bg-primary text-white">
                {content.type === "movie" ? "فیلم" : 
                content.type === "series" ? "سریال" : 
                content.type === "animation" ? "انیمیشن" : "مستند"}
              </Badge>
              
              <Badge variant="outline" className="bg-yellow-600/20 text-yellow-500 border-yellow-500/30 flex items-center gap-1">
                <Star className="h-3 w-3 fill-current" />
                {content.imdbRating}
              </Badge>
              
              <Badge variant="outline" className="bg-black/50">
                {content.year}
              </Badge>
              
              {content.duration && (
                <Badge variant="outline" className="bg-black/50">
                  {content.duration} دقیقه
                </Badge>
              )}
            </div>
            
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-1">{content.title}</h1>
            <h2 className="text-lg text-gray-300 mb-3">{content.englishTitle}</h2>
            
            <p className="text-gray-300 max-w-2xl mb-6 line-clamp-2 md:line-clamp-3">{content.description}</p>
            
            <div className="flex items-center gap-3">
              <Link href={`/content/${content.englishTitle.replace(/[^a-zA-Z0-9]/g, '')}`}>
                <Button className="bg-primary hover:bg-primary/90">
                  <Play className="mr-2 h-4 w-4" />
                  پخش
                </Button>
              </Link>
              
              <Button variant="outline" className="bg-white/10 backdrop-blur-sm hover:bg-white/20">
                <Plus className="mr-2 h-4 w-4" />
                لیست تماشا
              </Button>
            </div>
          </div>
        </div>
        
        {/* Pagination indicators */}
        {contents.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-1.5">
            {contents.slice(0, 5).map((_, i) => (
              <button
                key={i}
                className={`w-2 h-2 rounded-full transition-all ${i === activeIndex ? 'bg-primary w-4' : 'bg-white/50 hover:bg-white/80'}`}
                onClick={() => setActiveIndex(i)}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const IndexPage: React.FC = () => {
  // Fetch movies (type: movie)
  const { data: movies, isLoading: moviesLoading } = useQuery<ContentType[]>({
    queryKey: ['/api/content/type/movie'],
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Fetch series (type: series)
  const { data: series, isLoading: seriesLoading } = useQuery<ContentType[]>({
    queryKey: ['/api/content/type/series'],
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Fetch animations (type: animation)
  const { data: animations, isLoading: animationsLoading } = useQuery<ContentType[]>({
    queryKey: ['/api/content/type/animation'],
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Fetch documentaries (type: documentary)
  const { data: documentaries, isLoading: documentariesLoading } = useQuery<ContentType[]>({
    queryKey: ['/api/content/type/documentary'],
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Fetch all content
  const { data: allContent, isLoading: allContentLoading } = useQuery<ContentType[]>({
    queryKey: ['/api/content'],
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Fetch top rated content
  const { data: topRated, isLoading: topRatedLoading } = useQuery<ContentType[]>({
    queryKey: ['/api/content/top-rated'],
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return (
    <>
      <Header />
      <SplineBackground />
      <main className="min-h-screen bg-gradient-to-b from-black/40 via-gray-900/30 to-gray-900/60 pb-12 relative z-1" dir="rtl">
        {/* Search bar for mobile - only visible on small screens */}
        <div className="md:hidden px-4 py-3 sticky top-16 z-10 bg-gray-900/95 backdrop-blur-md">
          <div className="relative">
            <Search className="h-4 w-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input 
              type="search" 
              placeholder="جستجو در Xraynama..." 
              className="pl-3 pr-9 bg-gray-800 border-gray-700 focus:border-primary text-white"
            />
          </div>
        </div>

        {/* Hero section with featured content */}
        <section className="py-6 lg:py-10">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
                <span className="bg-primary/20 text-primary px-2 py-1 rounded text-sm font-normal">پیشنهاد ویژه</span>
                محتوای برتر
              </h2>
            </div>
            
            <FeaturedContent 
              contents={topRated?.slice(0, 5) || []}
              isLoading={topRatedLoading}
            />
          </div>
        </section>

        {/* Movies Section */}
        <ContentSection
          title="فیلم‌ها"
          linkTo="/movies"
          contents={movies || []}
          isLoading={moviesLoading}
          icon={<Play className="h-5 w-5" />}
        />

        {/* Series Section */}
        <ContentSection
          title="سریال‌ها"
          linkTo="/series"
          contents={series || []}
          isLoading={seriesLoading}
        />

        {/* Animations Section */}
        <ContentSection
          title="انیمیشن‌ها"
          linkTo="/animations"
          contents={animations || []}
          isLoading={animationsLoading}
        />

        {/* Documentaries Section */}
        <ContentSection
          title="مستندها"
          linkTo="/documentaries"
          contents={documentaries || []}
          isLoading={documentariesLoading}
        />

        {/* All Content Section */}
        <ContentSection
          title="تمام محتواها"
          linkTo="/all-content"
          contents={allContent || []}
          isLoading={allContentLoading}
        />
      </main>
      <Footer />
    </>
  );
};

export default IndexPage;