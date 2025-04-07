import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { FeaturedSlider } from '@/components/common/FeaturedSlider';
import { ContentRow } from '@/components/common/ContentRow';
import { ContentCard } from '@/components/common/ContentCard';
import { ContentType } from '@/types';
import { Button } from '@/components/ui/button';
import { ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

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
      
      <main className="container mx-auto px-4 py-8">
        {/* Featured content slider */}
        <FeaturedSlider 
          content={featuredContent || []} 
          isLoading={isFeaturedLoading} 
        />
        
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
        
        {/* Animations */}
        <ContentRow 
          title="انیمیشن‌های برتر" 
          moreLink="/category/animation" 
          content={animations || []} 
          isLoading={isAnimationsLoading} 
        />
        
        {/* Documentaries */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-foreground">مستندهای برگزیده</h2>
            <a href="/category/documentary" className="text-primary hover:text-primary/90 transition duration-200">
              مشاهده همه <i className="fas fa-chevron-left mr-1"></i>
            </a>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isDocumentariesLoading ? (
              // Skeleton loading for documentaries
              Array(3).fill(0).map((_, index) => (
                <div key={index} className="bg-card border border-border rounded-lg overflow-hidden shadow-lg animate-pulse">
                  <div className="aspect-video bg-muted"></div>
                  <div className="p-4">
                    <div className="h-5 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-muted rounded w-1/2 mb-3"></div>
                    <div className="h-3 bg-muted rounded w-full mb-1"></div>
                    <div className="h-3 bg-muted rounded w-full mb-4"></div>
                    <div className="flex space-x-2 rtl:space-x-reverse">
                      <div className="h-10 bg-muted rounded flex-grow"></div>
                      <div className="h-10 w-10 bg-muted rounded"></div>
                      <div className="h-10 w-10 bg-muted rounded"></div>
                    </div>
                  </div>
                </div>
              ))
            ) : documentaries?.length ? (
              documentaries.slice(0, 3).map(doc => (
                <ContentCard 
                  key={doc.id} 
                  content={doc} 
                  layout="landscape" 
                />
              ))
            ) : (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                محتوایی یافت نشد
              </div>
            )}
          </div>
        </section>
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
