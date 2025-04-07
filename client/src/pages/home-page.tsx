import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { FeaturedSlider } from '@/components/common/FeaturedSlider';
import { ContentRow } from '@/components/common/ContentRow';
import { ContentCard } from '@/components/common/ContentCard';
import { ContentType } from '@/types';
import { Button } from '@/components/ui/button';
import { ChevronUp, Play, Heart, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import FeaturedContentSection from '@/components/content/FeaturedContentSection';

export default function HomePage() {
  // Get featured content (top-rated)
  const { data: featuredContent, isLoading: isFeaturedLoading } = useQuery<ContentType[]>({
    queryKey: ['/api/content/top-rated', 5],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Get latest movies
  const { data: latestMovies, isLoading: isMoviesLoading } = useQuery<ContentType[]>({
    queryKey: ['/api/content/type/movie'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Get popular series
  const { data: popularSeries, isLoading: isSeriesLoading } = useQuery<ContentType[]>({
    queryKey: ['/api/content/type/series'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Get animations
  const { data: animations, isLoading: isAnimationsLoading } = useQuery<ContentType[]>({
    queryKey: ['/api/content/type/animation'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Get documentaries
  const { data: documentaries, isLoading: isDocumentariesLoading } = useQuery<ContentType[]>({
    queryKey: ['/api/content/type/documentary'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

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
  
  return (
    <>
      <Header />
      
      <main>
        <div className="container mx-auto px-4 py-8">
          {/* Featured content slider */}
          <FeaturedSlider 
            content={featuredContent || []} 
            isLoading={isFeaturedLoading} 
          />
        </div>
        
        {/* Top Rated Content with new icon-rich component */}
        <FeaturedContentSection
          title="محتوای برتر"
          subtitle="برترین‌های وبسایت با امتیاز بالا"
          content={featuredContent || []}
          isLoading={isFeaturedLoading}
          icon="award"
        />
        
        <div className="container mx-auto px-4 py-8">
          {/* Latest Movies */}
          <ContentRow 
            title="آخرین فیلم‌ها" 
            moreLink="/category/movie" 
            content={latestMovies || []} 
            isLoading={isMoviesLoading} 
          />
          
          {/* Popular Series */}
          <ContentRow 
            title="سریال‌های پرطرفدار" 
            moreLink="/category/series" 
            content={popularSeries || []} 
            isLoading={isSeriesLoading} 
          />
        </div>
        
        {/* Animation with new icon-rich component */}
        <FeaturedContentSection
          title="انیمیشن‌های برتر"
          subtitle="بهترین انیمیشن‌های موجود در سایت"
          content={animations || []}
          isLoading={isAnimationsLoading}
          icon="star"
        />
        
        <div className="container mx-auto px-4 py-8">
          {/* Documentaries */}
          <ContentRow 
            title="مستندهای برگزیده" 
            moreLink="/category/documentary" 
            content={documentaries || []} 
            isLoading={isDocumentariesLoading} 
          />
        </div>
      </main>
      
      <Footer />
      
      {/* Back to top button */}
      <Button
        id="backToTop"
        className="fixed bottom-8 left-8 bg-primary hover:bg-primary/90 text-white p-3 rounded-full shadow-lg transition-all duration-300 opacity-0 invisible z-50"
        size="icon"
        onClick={scrollToTop}
        aria-label="Back to top"
      >
        <ChevronUp className="h-5 w-5" />
      </Button>
    </>
  );
}
