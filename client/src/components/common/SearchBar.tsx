import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Search, X, SlidersHorizontal, BellRing } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ContentType, SearchFilters } from '@/types';
import { useMediaQuery } from '@/hooks/use-mobile';

export function SearchBar() {
  const [query, setQuery] = useState('');
  const [, navigate] = useLocation();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const searchRef = useRef<HTMLDivElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handleClearSearch = () => {
    setQuery('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      // Navigate to search page with the query
      navigate(`/all-content?q=${encodeURIComponent(query)}`);
    }
  };

  const handleAdvancedSearch = () => {
    // Navigate to advanced search page
    navigate('/advanced-search');
  };

  return (
    <div ref={searchRef} className="relative">
      <form onSubmit={handleSubmit} className="relative">
        <Input
          type="text"
          placeholder="جستجو..."
          className={`w-64 md:w-80 pl-10 bg-[#001a33]/60 border border-[#00BFFF]/30 
           rounded-full focus:outline-none focus:ring-2 focus:ring-[#00BFFF]/40 
           text-white placeholder-gray-400 h-10`}
          value={query}
          onChange={handleInputChange}
        />
        
        {query ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute left-3 top-2.5 text-gray-400 hover:text-[#00BFFF] h-5 w-5 p-0 transition-colors duration-300"
            onClick={handleClearSearch}
          >
            <X className="h-4 w-4" />
          </Button>
        ) : (
          <Search className="absolute left-3 top-2.5 text-gray-400 h-5 w-5" />
        )}
        
        {/* Advanced Search Button in the search bar - Hidden on Mobile */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={`${isMobile ? 'hidden' : 'block'} absolute -left-9 top-1.5 rounded-full 
          bg-[#001a33]/60 border border-[#00BFFF]/30 text-white hover:text-[#00BFFF] 
          hover:bg-[#00BFFF]/10 hover:border-[#00BFFF]/50 transition-all duration-300 h-7 w-7 p-0
          hover:shadow-[0_0_10px_rgba(0,191,255,0.3)]`}
          onClick={handleAdvancedSearch}
          title="جستجوی پیشرفته"
        >
          <SlidersHorizontal className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}

// کامپوننت دکمه جستجوی پیشرفته - با طراحی جدید آبی نئون
export function AdvancedSearchButton() {
  const [, navigate] = useLocation();
  
  const handleAdvancedSearch = () => {
    navigate('/advanced-search');
  };
  
  return (
    <Button
      variant="outline"
      className="neon-blue-button group"
      onClick={handleAdvancedSearch}
    >
      <span className="relative">
        <span className="mr-1">جستجوی پیشرفته</span>
        <SlidersHorizontal className="h-4 w-4 inline ml-1 group-hover:text-[#00BFFF] transition-colors duration-300" />
      </span>
    </Button>
  );
}

// کامپوننت نمایش اعلانات - با طراحی جدید آبی نئون
export function NotificationsButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'پخش آنلاین',
      text: 'جهت پخش مروگر Chrome را به آخرین نسخه آپدیت نمایید.',
      date: '2 ماه پیش',
    },
    {
      id: 2,
      title: 'پخش آنلاین',
      text: 'پخش آنلاین تنها با مرورگر Chrome امکان پذیر است.',
      date: '2 ماه پیش',
    },
    {
      id: 3,
      title: 'انتقاد و پیشنهاد',
      text: 'نظر، انتقاد و پیشنهادات خود را از طریق تیکت برای ما ارسال نمو...',
      date: '2 ماه پیش',
    },
  ]);
  const notificationsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div ref={notificationsRef} className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="neon-blue-icon relative group"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="اعلانات"
      >
        <BellRing className="h-5 w-5 group-hover:text-[#00BFFF] transition-colors duration-300" />
        {notifications.length > 0 && (
          <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full animate-pulse"></span>
        )}
      </Button>
      
      {isOpen && (
        <div 
          dir="rtl"
          className="absolute left-0 top-10 rtl:left-auto rtl:right-0 z-50 w-72 md:w-80 
          bg-gradient-to-b from-[#0a1935] to-[#0d2145] backdrop-blur-xl
          border border-[#00BFFF]/20 rounded-lg shadow-lg p-3 text-white 
          animate-in slide-in-from-top-5 fade-in-20 duration-200"
        >
          <div className="font-bold text-lg border-b border-[#00BFFF]/10 pb-2 mb-3 text-[#00BFFF]">اعلانات</div>
          
          <div className="max-h-96 overflow-y-auto space-y-3 scrollbar-thin">
            {notifications.map(notification => (
              <div key={notification.id} className="border-b border-[#00BFFF]/10 pb-3 hover:bg-[#00BFFF]/5 p-2 rounded-md transition-colors duration-300">
                <div className="font-bold text-white">{notification.title}</div>
                <p className="text-sm text-gray-300">{notification.text}</p>
                <div className="text-xs text-gray-400 mt-1">{notification.date}</div>
              </div>
            ))}
          </div>
          
          {notifications.length === 0 && (
            <div className="py-6 text-center text-gray-400">
              هیچ اعلانی وجود ندارد
            </div>
          )}
          
          <div className="mt-3 text-center">
            <Button 
              variant="link" 
              size="sm" 
              className="text-[#00BFFF] text-xs hover:text-[#00BFFF]/80 hover:underline"
            >
              مشاهده همه اعلانات
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
