import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'wouter';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// تعریف مدل داده‌ای برای اخبار سینما
interface CinemaNews {
  id: number;
  title: string;
  summary: string;
  date: string;
  link: string;
}

// داده‌های نمونه برای اخبار سینما
const sampleCinemaNews: CinemaNews[] = [
  {
    id: 1,
    title: "فیلم «جنگجویان آینده» به تعویق افتاد",
    summary: "استودیو مارول اعلام کرد به دلیل مشکلات فنی، اکران فیلم جنگجویان آینده به سال بعد موکول شد.",
    date: "۸ فروردین ۱۴۰۴",
    link: "/news/1"
  },
  {
    id: 2,
    title: "بازیگر جدید نقش جیمز باند معرفی شد",
    summary: "پس از ماه‌ها گمانه‌زنی، بالاخره بازیگر جدید نقش مشهور جیمز باند در سری فیلم‌های جدید معرفی شد.",
    date: "۵ فروردین ۱۴۰۴",
    link: "/news/2"
  },
  {
    id: 3,
    title: "اسکار ۲۰۲۶: نامزدهای اولیه اعلام شدند",
    summary: "آکادمی اسکار فهرست اولیه نامزدهای جوایز اسکار ۲۰۲۶ را منتشر کرد.",
    date: "۲ فروردین ۱۴۰۴",
    link: "/news/3"
  },
  {
    id: 4,
    title: "کریستوفر نولان فیلم جدیدش را اعلام کرد",
    summary: "کریستوفر نولان، کارگردان سرشناس، جزئیات پروژه جدید خود را که یک فیلم علمی-تخیلی است اعلام کرد.",
    date: "۲۸ اسفند ۱۴۰۳",
    link: "/news/4"
  },
  {
    id: 5,
    title: "شکسته شدن رکورد فروش گیشه توسط فیلم آواتار ۳",
    summary: "فیلم آواتار ۳ توانست رکورد فروش افتتاحیه در تاریخ سینما را بشکند.",
    date: "۲۵ اسفند ۱۴۰۳",
    link: "/news/5"
  }
];

const CinemaNewsSlider: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  // تابع برای حرکت به خبر بعدی
  const nextNews = () => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    setActiveIndex((prevIndex) => (prevIndex + 1) % sampleCinemaNews.length);
    
    // بعد از مدت زمان انیمیشن، وضعیت انتقال را بازنشانی کن
    setTimeout(() => {
      setIsTransitioning(false);
    }, 500);
  };

  // تابع برای حرکت به خبر قبلی
  const prevNews = () => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    setActiveIndex((prevIndex) => 
      prevIndex === 0 ? sampleCinemaNews.length - 1 : prevIndex - 1
    );
    
    // بعد از مدت زمان انیمیشن، وضعیت انتقال را بازنشانی کن
    setTimeout(() => {
      setIsTransitioning(false);
    }, 500);
  };

  // راه‌اندازی زمان‌سنج برای حرکت خودکار اسلایدر
  useEffect(() => {
    if (!isPaused) {
      intervalRef.current = setInterval(() => {
        nextNews();
      }, 6000); // هر 6 ثانیه
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPaused, isTransitioning]);

  // توقف اسلایدر با هاور موس
  const handleMouseEnter = () => setIsPaused(true);
  const handleMouseLeave = () => setIsPaused(false);

  return (
    <div 
      className="w-full border border-red-500/20 bg-black/40 backdrop-blur-sm rounded-lg overflow-hidden relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      ref={sliderRef}
    >
      <div className="flex items-center">
        <div className="bg-red-600 py-2 px-4 flex-shrink-0">
          <h3 className="text-white font-semibold text-sm">اخبار سینما</h3>
        </div>
        
        <div className="relative overflow-hidden flex-grow h-12">
          {sampleCinemaNews.map((news, index) => (
            <div 
              key={news.id}
              className={cn(
                "w-full px-4 flex items-center justify-between absolute inset-0 transition-all duration-500",
                activeIndex === index ? "translate-x-0 opacity-100" : 
                index < activeIndex ? "translate-x-[110%] opacity-0" : "translate-x-[-110%] opacity-0"
              )}
            >
              <div className="flex-1 truncate">
                <span className="text-red-400 text-xs ml-2">{news.date}</span>
                <span className="text-white text-sm">{news.title}</span>
              </div>
              <Link href={news.link} className="text-primary hover:text-primary/80 text-xs flex items-center">
                <span>ادامه خبر</span>
                <ChevronLeft className="h-3 w-3" />
              </Link>
            </div>
          ))}
        </div>
        
        <div className="flex-shrink-0 flex items-stretch h-12">
          <Button
            variant="ghost"
            size="icon"
            className="h-full w-8 text-white hover:text-red-500 hover:bg-white/10 rounded-none"
            onClick={prevNews}
            disabled={isTransitioning}
            aria-label="خبر قبلی"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-full w-8 text-white hover:text-red-500 hover:bg-white/10 rounded-none"
            onClick={nextNews}
            disabled={isTransitioning}
            aria-label="خبر بعدی"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* نشانگر‌های دایره‌ای برای نمایش تعداد و موقعیت فعلی */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-center items-center py-1 opacity-70">
        <div className="flex gap-1">
          {sampleCinemaNews.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                if (!isTransitioning) {
                  setIsTransitioning(true);
                  setActiveIndex(i);
                  setTimeout(() => setIsTransitioning(false), 500);
                }
              }}
              className={cn(
                "w-1.5 h-1.5 rounded-full transition-all",
                activeIndex === i ? "bg-red-500 scale-110" : "bg-white/30 hover:bg-white/50"
              )}
              aria-label={`رفتن به خبر ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CinemaNewsSlider;