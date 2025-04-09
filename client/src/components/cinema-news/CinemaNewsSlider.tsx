import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';

// تایپ داده فیلم‌های TMDB
interface TMDBMovie {
  id: number;
  title: string;
  poster_path: string;
  overview: string;
  release_date: string;
}

interface TMDBResponse {
  page: number;
  results: TMDBMovie[];
  total_pages: number;
  total_results: number;
}

// تایپ برای آیتم‌های اخبار اسلایدر
interface NewsItem {
  id: number;
  title: string;
  image: string;
  date: string;
}

// تبدیل تاریخ میلادی به شمسی (ساده‌سازی شده)
const convertToJalaliDate = (dateStr: string): string => {
  try {
    const date = new Date(dateStr);
    // این یک تبدیل ساده است. در یک پروژه واقعی از کتابخانه‌های تبدیل تاریخ استفاده کنید
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = 1402; // سال ثابت برای نمونه
    
    // ماه‌های فارسی (ساده)
    const persianMonths = [
      'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
      'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
    ];
    
    return `${day} ${persianMonths[month-1]} ${year}`;
  } catch (e) {
    return 'تاریخ نامشخص';
  }
};

const CinemaNewsSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const slideRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<number | null>(null);
  
  // دریافت داده‌های فیلم‌های محبوب از TMDB
  // از آنجا که API محبوب‌ترین فیلم‌ها حذف شده، از جستجوی چند منظوره استفاده می‌کنیم
  const { data: moviesData, isLoading, error } = useQuery<TMDBResponse>({
    queryKey: ['/api/tmdb/search/multi', { query: 'a', page: 1 }], // جستجوی ساده برای دریافت چند فیلم
    staleTime: 1000 * 60 * 5, // 5 دقیقه
  });
  
  // تبدیل داده‌های API به فرمت مورد نیاز اسلایدر
  const newsItems: NewsItem[] = moviesData?.results?.slice(0, 5).map(movie => ({
    id: movie.id,
    title: `${movie.title} - ${movie.release_date?.split('-')[0] || ''}`,
    image: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
    date: convertToJalaliDate(movie.release_date)
  })) || [];
  
  // تابع برای رفتن به اسلاید بعدی
  const nextSlide = () => {
    if (isAnimating || newsItems.length === 0) return;
    
    setIsAnimating(true);
    setCurrentSlide((prev) => (prev === newsItems.length - 1 ? 0 : prev + 1));
    
    // بعد از اتمام انیمیشن، وضعیت انیمیشن را به حالت عادی برگردان
    setTimeout(() => setIsAnimating(false), 500);
  };

  // تابع برای رفتن به اسلاید قبلی
  const prevSlide = () => {
    if (isAnimating || newsItems.length === 0) return;
    
    setIsAnimating(true);
    setCurrentSlide((prev) => (prev === 0 ? newsItems.length - 1 : prev - 1));
    
    // بعد از اتمام انیمیشن، وضعیت انیمیشن را به حالت عادی برگردان
    setTimeout(() => setIsAnimating(false), 500);
  };

  // تنظیم تایمر برای اسلاید خودکار
  useEffect(() => {
    // اگر داده‌ها در حال بارگیری هستند یا خطایی رخ داده، تایمر را فعال نکن
    if (isLoading || error || newsItems.length === 0) return;
    
    // اگر اسلایدر متوقف نشده باشد، هر ۴ ثانیه اسلاید را تغییر می‌دهیم
    if (!isPaused) {
      timerRef.current = window.setInterval(() => {
        nextSlide();
      }, 4000);
    }

    // پاکسازی تایمر هنگام از بین رفتن کامپوننت
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [currentSlide, isPaused, isAnimating, isLoading, error, newsItems.length]);

  // رست کردن شماره اسلاید فعلی هنگام تغییر تعداد آیتم‌ها
  useEffect(() => {
    if (newsItems.length > 0 && currentSlide >= newsItems.length) {
      setCurrentSlide(0);
    }
  }, [newsItems.length, currentSlide]);

  // توقف اسلاید خودکار هنگام هاور روی اسلایدر
  const handleMouseEnter = () => {
    setIsPaused(true);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // ادامه اسلاید خودکار هنگام خروج ماوس از روی اسلایدر
  const handleMouseLeave = () => {
    setIsPaused(false);
  };

  return (
    <div 
      className="flex flex-col relative overflow-hidden bg-gradient-to-br from-red-900 to-red-950 rounded-md shadow-xl h-80"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      ref={slideRef}
    >
      <h3 className="text-white font-bold text-lg p-3 border-b border-red-800 bg-gradient-to-l from-red-950 to-red-900">
        آخرین اخبار سینما
      </h3>

      {/* وضعیت بارگذاری */}
      {isLoading && (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center">
            <Skeleton className="h-40 w-full max-w-sm rounded-md" />
            <Skeleton className="h-4 w-48 mt-3" />
            <Skeleton className="h-4 w-32 mt-2" />
          </div>
        </div>
      )}

      {/* وضعیت خطا */}
      {error && (
        <div className="flex-1 flex items-center justify-center text-white text-center p-6">
          <div>
            <p className="mb-2">خطا در دریافت اطلاعات فیلم‌ها</p>
            <p className="text-xs text-gray-300">لطفاً بعداً مجدداً تلاش کنید</p>
          </div>
        </div>
      )}

      {/* اسلایدر اخبار */}
      {!isLoading && !error && newsItems.length > 0 && (
        <div className="relative flex-1 overflow-hidden">
          <div 
            className="flex transition-transform duration-500 h-full"
            style={{ transform: `translateX(${currentSlide * 100}%)` }}
          >
            {newsItems.map((news: NewsItem, index: number) => (
              <div 
                key={news.id} 
                className="min-w-full h-full flex-shrink-0 relative"
              >
                <img 
                  src={news.image} 
                  alt={news.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-80"></div>
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                  <p className="text-xs text-red-300 mb-1">{news.date}</p>
                  <h4 className="text-lg font-bold leading-tight mb-2">{news.title}</h4>
                </div>
              </div>
            ))}
          </div>

          {/* دکمه‌های کنترل */}
          <button 
            onClick={prevSlide}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 rounded-full p-1 text-white hover:bg-opacity-70 transition-all z-10"
            aria-label="اسلاید قبلی"
            disabled={isLoading || error || newsItems.length <= 1}
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          
          <button 
            onClick={nextSlide}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 rounded-full p-1 text-white hover:bg-opacity-70 transition-all z-10"
            aria-label="اسلاید بعدی"
            disabled={isLoading || error || newsItems.length <= 1}
          >
            <ChevronRight className="h-6 w-6" />
          </button>
          
          {/* نشانگرهای اسلاید */}
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1 rtl:space-x-reverse z-10">
            {newsItems.map((_: NewsItem, index: number) => (
              <span 
                key={index} 
                className={`block h-1.5 rounded-full transition-all duration-300 ${
                  currentSlide === index 
                    ? 'w-6 bg-red-500' 
                    : 'w-2 bg-gray-400 bg-opacity-50'
                }`}
              ></span>
            ))}
          </div>
        </div>
      )}

      {/* در صورت نبود اطلاعات */}
      {!isLoading && !error && newsItems.length === 0 && (
        <div className="flex-1 flex items-center justify-center text-white text-center p-6">
          <p>در حال حاضر اخباری موجود نیست</p>
        </div>
      )}
    </div>
  );
};

export default CinemaNewsSlider;