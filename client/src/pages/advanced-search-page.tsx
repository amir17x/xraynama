import React from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import AdvancedSearchPanel from '@/components/search/AdvancedSearchPanel';
import { useQuery } from '@tanstack/react-query';
import { ContentType } from '@/types';
import { ContentCard } from '@/components/common/ContentCard';
import { useState } from 'react';
import { Pagination } from '@/components/ui/pagination';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLocation } from 'wouter';
import BlueSphereBackground from '@/components/common/BlueSphereBackground';

/**
 * صفحه جستجوی پیشرفته با طراحی گلس‌مورفیسم
 * پنل جستجو با قابلیت‌های متعدد فیلترینگ و امکان جستجو در محتوا
 */
const AdvancedSearchPage: React.FC = () => {
  // استفاده از React Query برای دریافت اطلاعات فیلم‌ها و سریال‌ها
  const { data: allContents, isLoading } = useQuery<ContentType[]>({
    queryKey: ['/api/content'],
    retry: false,
  });
  
  // وضعیت برای نمایش نتایج جستجو
  const [searchResults, setSearchResults] = useState<ContentType[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  
  // وضعیت حالت نمایش (فیلم یا سریال)
  const [activeTab, setActiveTab] = useState<string>('all');
  
  // صفحه‌بندی
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 12;
  
  // گرفتن پارامترهای URL
  const [location] = useLocation();
  const params = new URLSearchParams(location.split('?')[1] || '');
  
  // محاسبه‌ی تعداد صفحات برای صفحه‌بندی
  const filteredResults = searchResults.filter(content => 
    activeTab === 'all' || content.type === activeTab
  );
  
  const totalPages = Math.ceil(filteredResults.length / itemsPerPage);
  const currentResults = filteredResults.slice(
    (currentPage - 1) * itemsPerPage, 
    currentPage * itemsPerPage
  );
  
  // تغییر صفحه فعلی
  const changePage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // انجام جستجو و تنظیم نتایج
  const handleSearch = (searchParams: any) => {
    if (!allContents) return;
    
    setIsSearching(true);
    setHasSearched(true);
    
    // شبیه‌سازی جستجو با تاخیر برای نمایش انیمیشن اسکن
    setTimeout(() => {
      const results = allContents.filter(content => {
        // فیلتر نوع محتوا (فیلم یا سریال)
        if (searchParams.mode === 'movie' && content.type !== 'movie') {
          return false;
        }
        if (searchParams.mode === 'series' && content.type !== 'series') {
          return false;
        }
        
        // فیلتر محدوده سال
        if (content.year < searchParams.yearRange[0] || content.year > searchParams.yearRange[1]) {
          return false;
        }
        
        // فیلتر محدوده امتیاز
        if (content.imdbRating) {
          const rating = parseFloat(content.imdbRating);
          if (rating < searchParams.ratingRange[0] || rating > searchParams.ratingRange[1]) {
            return false;
          }
        }
        
        // فیلتر ژانر
        if (searchParams.selectedGenres.length > 0) {
          const contentGenres = Array.isArray(content.genres) 
            ? content.genres 
            : content.genres ? [content.genres] : [];
            
          const hasMatchingGenre = searchParams.selectedGenres.some((genre: string) => 
            contentGenres.some((g: any) => 
              (typeof g === 'string' && g === genre) || 
              (typeof g === 'object' && g.id === genre)
            )
          );
          
          if (!hasMatchingGenre) {
            return false;
          }
        }
        
        // فیلتر کشور
        if (searchParams.selectedCountry && content.country !== searchParams.selectedCountry) {
          return false;
        }
        
        // فیلتر کیفیت (توجه: این فیلد در ContentType وجود ندارد و باید در API اضافه شود)
        if (searchParams.selectedQuality) {
          // اینجا میتوانیم از توضیحات یا عنوان برای جستجوی کیفیت استفاده کنیم
          const hasQuality = content.description?.includes(searchParams.selectedQuality) || 
                             content.title?.includes(searchParams.selectedQuality);
          if (!hasQuality) return false;
        }
        
        // فیلتر رده سنی (توجه: این فیلد در ContentType وجود ندارد و باید در API اضافه شود)
        if (searchParams.selectedAgeRating) {
          // میتوانیم از توضیحات یا تگ‌ها برای جستجوی رده سنی استفاده کنیم
          const hasAgeRating = content.description?.includes(searchParams.selectedAgeRating);
          if (!hasAgeRating) return false;
        }
        
        // فیلتر نام بازیگر
        if (searchParams.actorName && content.description) {
          // فرض میکنیم نام بازیگران در توضیحات آمده است
          const hasActor = content.description.toLowerCase().includes(searchParams.actorName.toLowerCase());
          if (!hasActor) return false;
        }
        
        // فیلتر نام کارگردان
        if (searchParams.directorName && content.description) {
          // فرض میکنیم نام کارگردان در توضیحات آمده است
          const hasDirector = content.description.toLowerCase().includes(searchParams.directorName.toLowerCase());
          if (!hasDirector) return false;
        }
        
        // فیلتر گزینه‌های پخش
        if (searchParams.options.isDubbed && !content.hasPersianDubbing) {
          return false;
        }
        
        if (searchParams.options.hasSubtitle && !content.hasPersianSubtitle) {
          return false;
        }
        
        // فیلم‌های سانسور شده (این ویژگی باید در API اضافه شود)
        if (searchParams.options.isCensored) {
          // فرض می‌کنیم محتوای سانسور شده در توضیحات ذکر شده است
          const isCensored = content.description?.includes('سانسور شده');
          if (!isCensored) return false;
        }
        
        // محتوا با امکان پخش آنلاین (این ویژگی باید در API اضافه شود)
        if (searchParams.options.hasOnlineStream) {
          // فرض می‌کنیم همه محتوا دارای پخش آنلاین هستند مگر اینکه خلاف آن ذکر شده باشد
          const hasStream = !content.description?.includes('بدون پخش آنلاین');
          if (!hasStream) return false;
        }
        
        return true;
      });
      
      // مرتب‌سازی نتایج بر اساس انتخاب کاربر
      let sortedResults = [...results];
      switch(searchParams.sortBy) {
        case 'newest':
          sortedResults.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          break;
        case 'oldest':
          sortedResults.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
          break;
        case 'rating':
          sortedResults.sort((a, b) => {
            const ratingA = a.imdbRating ? parseFloat(a.imdbRating) : 0;
            const ratingB = b.imdbRating ? parseFloat(b.imdbRating) : 0;
            return ratingB - ratingA;
          });
          break;
        case 'popularity':
          // برای محبوبیت از فیلد‌های موجود استفاده می‌کنیم
          // می‌توانیم از امتیاز IMDB یا تعداد فصل‌ها در سریال‌ها استفاده کنیم
          sortedResults.sort((a, b) => {
            const ratingA = a.imdbRating ? parseFloat(a.imdbRating) : 0;
            const ratingB = b.imdbRating ? parseFloat(b.imdbRating) : 0;
            return ratingB - ratingA;
          });
          break;
        default:
          break;
      }
      
      setSearchResults(sortedResults);
      setCurrentPage(1);
      setIsSearching(false);
    }, 1500); // تاخیر 1.5 ثانیه برای نمایش انیمیشن اسکن
  };
  
  return (
    <>
      <Header />
      <BlueSphereBackground />
      <main className="min-h-screen pt-24 pb-12 relative z-10">
        <div className="container mx-auto px-4">
          <div className="mb-6">
            <h1 className="heading-2 text-white text-center mb-2">جستجوی پیشرفته</h1>
            <p className="subtitle text-center text-gray-300 mb-8">
              با استفاده از ابزار پیشرفته جستجو، محتوای دلخواه خود را با دقت بالا پیدا کنید
            </p>
            
            {/* پنل جستجوی پیشرفته */}
            <AdvancedSearchPanel 
              className="max-w-5xl mx-auto mb-10" 
              onSearch={handleSearch}
            />
            
            {/* نمایش نتایج جستجو */}
            {hasSearched && (
              <div className="mt-12">
                <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-white mb-4 md:mb-0">
                    {isSearching 
                      ? 'در حال جستجو...' 
                      : searchResults.length > 0 
                        ? `${searchResults.length} نتیجه یافت شد` 
                        : 'نتیجه‌ای یافت نشد'
                    }
                  </h2>
                  
                  {searchResults.length > 0 && (
                    <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
                      <TabsList className="bg-black/30 backdrop-blur">
                        <TabsTrigger value="all">همه</TabsTrigger>
                        <TabsTrigger value="movie">فیلم‌ها</TabsTrigger>
                        <TabsTrigger value="series">سریال‌ها</TabsTrigger>
                        <TabsTrigger value="animation">انیمیشن‌ها</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  )}
                </div>
                
                {/* شبکه نمایش نتایج */}
                {isSearching ? (
                  // اسکلتون لودینگ
                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                    {[...Array(12)].map((_, index) => (
                      <div key={index} className="rounded-lg overflow-hidden">
                        <Skeleton className="aspect-[2/3] w-full bg-gray-800/50" />
                        <Skeleton className="h-4 w-3/4 mt-3 bg-gray-800/50" />
                        <Skeleton className="h-3 w-1/2 mt-2 bg-gray-800/50" />
                      </div>
                    ))}
                  </div>
                ) : searchResults.length === 0 ? (
                  // پیام خالی بودن نتایج
                  <div className="empty-container">
                    <div className="text-7xl mb-4">🔍</div>
                    <h3 className="heading-3 text-white">نتیجه‌ای یافت نشد</h3>
                    <p className="body-text-sm text-gray-400 max-w-md mx-auto text-center">
                      با تغییر معیارهای جستجو یا استفاده از فیلترهای کمتر، نتایج بیشتری دریافت کنید.
                    </p>
                  </div>
                ) : (
                  // نمایش نتایج
                  <>
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                      {currentResults.map((content) => {
                        // اینجا می‌توانیم content را به عنوان ContentTypeExtended تطبیق دهیم
                        const contentExtended = {
                          ...content,
                          // اگر genres یک رشته است، آن را به آرایه تبدیل کنیم
                          genres: typeof content.genres === 'string' 
                            ? [content.genres] 
                            : content.genres || []
                        };
                        
                        return (
                          <ContentCard 
                            key={content.id} 
                            content={contentExtended as any} 
                            className="content-enter"
                            style={{ 
                              animationDelay: `${(currentResults.indexOf(content) % 12) * 100}ms`
                            }}
                          />
                        );
                      })}
                    </div>
                    
                    {/* صفحه‌بندی */}
                    {totalPages > 1 && (
                      <div className="mt-12 flex justify-center">
                        <Pagination
                          currentPage={currentPage}
                          totalPages={totalPages}
                          onPageChange={changePage}
                        />
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default AdvancedSearchPage;