import { useEffect } from 'react';
import { useRoute, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { ContentType } from '@/types';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ContentCard } from '@/components/common/ContentCard';
import { Button } from '@/components/ui/button';
import { Loader2, Filter } from 'lucide-react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useDebounce } from '@/hooks/use-debounce';
import { useState } from 'react';

export default function CategoryPage() {
  const [match, params] = useRoute<{ type: string }>('/category/:type');
  const [, navigate] = useLocation();
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);
  const debouncedSort = useDebounce(sortBy, 500);
  
  // Redirect if no match
  if (!match) {
    navigate('/not-found');
    return null;
  }

  const LIMIT = 20;
  const contentType = params.type;
  
  // Validate content type
  useEffect(() => {
    const validTypes = ['movie', 'series', 'animation', 'documentary'];
    if (!validTypes.includes(contentType)) {
      navigate('/not-found');
    }
  }, [contentType, navigate]);

  // Get localized content type name
  const getContentTypeName = () => {
    switch(contentType) {
      case 'movie': return 'فیلم‌ها';
      case 'series': return 'سریال‌ها';
      case 'animation': return 'انیمیشن‌ها';
      case 'documentary': return 'مستندها';
      default: return '';
    }
  };

  // Fetch content by type with pagination
  const { data, isLoading, isFetching, isError } = useQuery<ContentType[]>({
    queryKey: [`/api/content/type/${contentType}`, page, debouncedSort],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('limit', LIMIT.toString());
      params.append('offset', ((page - 1) * LIMIT).toString());
      
      if (debouncedSort === 'newest') {
        params.append('sort', 'newest');
      } else if (debouncedSort === 'oldest') {
        params.append('sort', 'oldest');
      } else if (debouncedSort === 'top_rated') {
        params.append('sort', 'rating');
      }
      
      const res = await fetch(`/api/content/type/${contentType}?${params.toString()}`);
      if (!res.ok) {
        throw new Error('خطا در دریافت اطلاعات');
      }
      return res.json();
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
          <h1 className="text-3xl font-bold text-foreground mb-4 md:mb-0">{getContentTypeName()}</h1>
          
          <div className="flex items-center">
            <Filter className="h-5 w-5 mr-2 text-muted-foreground" />
            <Select
              value={sortBy}
              onValueChange={setSortBy}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="مرتب‌سازی" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">جدیدترین</SelectItem>
                <SelectItem value="oldest">قدیمی‌ترین</SelectItem>
                <SelectItem value="top_rated">بیشترین امتیاز</SelectItem>
              </SelectContent>
            </Select>
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
