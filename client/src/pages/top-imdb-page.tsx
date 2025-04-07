import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { ContentType } from '@/types';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ContentCard } from '@/components/common/ContentCard';
import { Button } from '@/components/ui/button';
import { Loader2, Star } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

export default function TopIMDBPage() {
  const [, navigate] = useLocation();
  const [page, setPage] = useState(1);
  
  const LIMIT = 20;
  
  // Fetch top rated content
  const { data, isLoading, isFetching, isError } = useQuery<ContentType[]>({
    queryKey: ['/api/content/top-rated', page],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('limit', LIMIT.toString());
      params.append('offset', ((page - 1) * LIMIT).toString());
      
      try {
        const res = await apiRequest('GET', `/api/content/top-rated?${params.toString()}`);
        return await res.json();
      } catch (error) {
        console.error('Error fetching top rated content:', error);
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  // Check if there's more content to load
  const hasMore = data && data.length === LIMIT;
  
  // Load more content
  const loadMore = () => {
    setPage(prev => prev + 1);
  };
  
  return (
    <>
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">برترین‌های IMDB</h1>
            <p className="text-muted-foreground">
              محتواهای برتر با بالاترین امتیاز در IMDB
            </p>
          </div>
          
          <div className="flex items-center mt-4 md:mt-0">
            <Star className="h-5 w-5 text-yellow-500 mr-1" fill="currentColor" />
            <span className="text-yellow-500 font-bold">8.5+</span>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        ) : isError ? (
          <div className="text-center py-12">
            <h2 className="text-xl text-foreground mb-4">خطا در بارگذاری محتوا</h2>
            <Button onClick={() => navigate('/')}>بازگشت به صفحه اصلی</Button>
          </div>
        ) : data && data.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {data.map(item => (
                <ContentCard key={item.id} content={item} className="w-full" />
              ))}
            </div>
            
            {hasMore && (
              <div className="flex justify-center mt-8">
                <Button 
                  onClick={loadMore} 
                  disabled={isFetching}
                  className="px-8"
                >
                  {isFetching ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      در حال بارگذاری...
                    </>
                  ) : 'بارگذاری بیشتر'}
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <h2 className="text-xl text-foreground mb-4">محتوایی یافت نشد</h2>
            <p className="text-muted-foreground mb-6">متأسفانه در حال حاضر محتوایی برای نمایش وجود ندارد.</p>
            <Button onClick={() => navigate('/')}>بازگشت به صفحه اصلی</Button>
          </div>
        )}
      </main>
      
      <Footer />
    </>
  );
}