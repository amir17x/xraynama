import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// داده‌های اخبار موقت - در آینده می‌تواند از API یا پایگاه داده فراخوانی شود
const dummyNewsData = [
  {
    id: 1,
    title: 'اولین تریلر فیلم پرستاری The Phoenician Scheme منتشر شد',
    image: 'https://www.themoviedb.org/t/p/w500/yu0w4q7NSRUsX1oXCTY5zTmQ7Mr.jpg',
    date: '۲۲ مرداد ۱۴۰۲'
  },
  {
    id: 2,
    title: 'فیلم Minecraft در صدر باکس آفیس هفته قرار گرفت',
    image: 'https://www.themoviedb.org/t/p/w500/2xfQuF6tTXzqIS3FLORAJUzIWNK.jpg',
    date: '۱۸ مرداد ۱۴۰۲'
  },
  {
    id: 3,
    title: 'فیلم جدید کاپیتان آمریکا: دنیای شگفت انگیز نو به زودی اکران می‌شود',
    image: 'https://www.themoviedb.org/t/p/w500/q2GrT4ZmZyI7jjuXRpWCKZX1GNi.jpg',
    date: '۱۵ مرداد ۱۴۰۲'
  },
  {
    id: 4,
    title: 'فیلم پاک کننده - اکشن هیجان انگیز با بازی گلن پاول به زودی',
    image: 'https://www.themoviedb.org/t/p/w500/749A81iyWwRV4RYsHa4MaA6zUYj.jpg',
    date: '۱۰ مرداد ۱۴۰۲'
  },
  {
    id: 5,
    title: 'در سرزمین‌های گمشده - فیلم جدید فانتزی ماجراجویی',
    image: 'https://www.themoviedb.org/t/p/w500/tYzhkVPWXsORLOCPXIBixboKIjS.jpg',
    date: '۵ مرداد ۱۴۰۲'
  }
];

const CinemaNewsSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const slideRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<number | null>(null);

  // تابع برای رفتن به اسلاید بعدی
  const nextSlide = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setCurrentSlide((prev) => (prev === dummyNewsData.length - 1 ? 0 : prev + 1));
    
    // بعد از اتمام انیمیشن، وضعیت انیمیشن را به حالت عادی برگردان
    setTimeout(() => setIsAnimating(false), 500);
  };

  // تابع برای رفتن به اسلاید قبلی
  const prevSlide = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setCurrentSlide((prev) => (prev === 0 ? dummyNewsData.length - 1 : prev - 1));
    
    // بعد از اتمام انیمیشن، وضعیت انیمیشن را به حالت عادی برگردان
    setTimeout(() => setIsAnimating(false), 500);
  };

  // تنظیم تایمر برای اسلاید خودکار
  useEffect(() => {
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
  }, [currentSlide, isPaused, isAnimating]);

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
      className="flex flex-col relative overflow-hidden bg-gradient-to-br from-red-900 to-red-950 rounded-md shadow-xl"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      ref={slideRef}
    >
      <h3 className="text-white font-bold text-lg p-3 border-b border-red-800 bg-gradient-to-l from-red-950 to-red-900">
        آخرین اخبار سینما
      </h3>

      {/* اسلایدر اخبار */}
      <div className="relative h-80 overflow-hidden">
        <div 
          className="flex transition-transform duration-500 h-full"
          style={{ transform: `translateX(${currentSlide * 100}%)` }}
        >
          {dummyNewsData.map((news, index) => (
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
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        
        <button 
          onClick={nextSlide}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 rounded-full p-1 text-white hover:bg-opacity-70 transition-all z-10"
          aria-label="اسلاید بعدی"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
        
        {/* نشانگرهای اسلاید */}
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1 rtl:space-x-reverse z-10">
          {dummyNewsData.map((_, index) => (
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
    </div>
  );
};

export default CinemaNewsSlider;