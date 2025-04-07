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
            <h2 className="text-2xl font-bold text-white">مستندهای برگزیده</h2>
            <a href="/category/documentary" className="text-primary hover:text-primary/90 transition duration-200 text-sm flex items-center">
              مشاهده همه
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1 rtl:rotate-180">
                <polyline points="9 18 3 12 9 6"></polyline>
              </svg>
            </a>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {isDocumentariesLoading ? (
              // Skeleton loading for documentaries
              Array(2).fill(0).map((_, index) => (
                <div key={index} className="bg-black/40 rounded-lg overflow-hidden shadow-lg animate-pulse">
                  <div className="aspect-[16/9] bg-gray-800"></div>
                  <div className="p-4">
                    <div className="h-5 bg-gray-700 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-700 rounded w-1/2 mb-3"></div>
                    <div className="h-3 bg-gray-700 rounded w-full mb-4"></div>
                    <div className="flex justify-between gap-2">
                      <div className="h-10 bg-gray-700 rounded w-full"></div>
                      <div className="h-10 w-10 bg-gray-700 rounded-full"></div>
                      <div className="h-10 w-10 bg-gray-700 rounded-full"></div>
                    </div>
                  </div>
                </div>
              ))
            ) : documentaries?.length ? (
              documentaries.slice(0, 2).map((doc, index) => (
                <div key={doc.id} className="group relative bg-black/20 rounded-lg shadow-lg overflow-hidden border border-gray-800/50">
                  <Link href={`/content/${doc.id}`}>
                    <div className="flex flex-col">
                      {/* Documentary Image */}
                      <div className="relative aspect-[16/9] overflow-hidden">
                        <img 
                          src={doc.poster} 
                          alt={doc.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-100"></div>
                        
                        {/* Type Badge */}
                        <div className="absolute top-2 left-2 bg-green-600 text-white px-2 py-1 text-xs rounded">
                          مستند
                        </div>
                        
                        {/* Year */}
                        <div className="absolute top-2 right-2 bg-black/70 text-gray-200 px-2 py-1 text-xs rounded">
                          {doc.year}
                        </div>
                        
                        {/* Duration */}
                        <div className="absolute bottom-2 left-2 flex items-center text-white">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                          </svg>
                          <span className="text-xs">{doc.duration} دقیقه</span>
                        </div>
                        
                        {/* Rating */}
                        <div className="absolute bottom-2 right-2 flex items-center text-white">
                          <svg className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                          </svg>
                          <span className="text-xs">{doc.imdbRating}</span>
                        </div>
                      </div>
                      
                      {/* Content Info */}
                      <div className="p-4">
                        <h3 className="font-bold text-white text-lg mb-1">{doc.title}</h3>
                        <p className="text-gray-400 text-sm mb-3">{doc.englishTitle}</p>
                        <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                          {doc.description}
                        </p>
                        
                        {/* Action Buttons */}
                        <div className="flex justify-between items-center">
                          <Button className="flex-grow bg-blue-600 hover:bg-blue-700 text-white">
                            <Play className="h-4 w-4 mr-2" />
                            پخش
                          </Button>
                          
                          <div className="flex gap-2 mr-2">
                            <Button variant="outline" size="icon" className="bg-black/40 border-gray-700 text-gray-300 hover:text-white hover:bg-black/60">
                              <Heart className="h-4 w-4" />
                            </Button>
                            
                            <Button variant="outline" size="icon" className="bg-black/40 border-gray-700 text-gray-300 hover:text-white hover:bg-black/60">
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-8 text-gray-400">
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
