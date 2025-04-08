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
    // Navigate to all-content page with advanced search UI
    navigate('/all-content?advanced=true');
  };

  return (
    <div ref={searchRef} className="relative ml-4">
      <form onSubmit={handleSubmit} className="relative">
        <Input
          type="text"
          placeholder="جستجو..."
          className={`w-64 md:w-80 pl-10 bg-[#00142c]/50 border border-[#00BFFF]/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00BFFF]/30 text-white placeholder-gray-400`}
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
      </form>
    </div>
  );
}

// کامپوننت دکمه جستجوی پیشرفته - برای استفاده در بخش قرمز رنگ هدر
export function AdvancedSearchButton() {
  const [, navigate] = useLocation();
  
  const handleAdvancedSearch = () => {
    navigate('/all-content?advanced=true');
  };
  
  return (
    <Button
      variant="ghost"
      size="icon"
      className="glassmorphic-icon relative w-9 h-9 flex items-center justify-center"
      onClick={handleAdvancedSearch}
      title="جستجوی پیشرفته"
    >
      <SlidersHorizontal className="h-5 w-5 text-[#00BFFF]" />
    </Button>
  );
}

// کامپوننت نمایش اعلانات - برای استفاده در بخش بنفش رنگ هدر
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
        className="glassmorphic-icon relative w-9 h-9 flex items-center justify-center"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="اعلانات"
      >
        <BellRing className="h-5 w-5 text-[#00BFFF]" />
        {notifications.length > 0 && (
          <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full shadow-sm shadow-red-500/50"></span>
        )}
      </Button>
      
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm" onClick={() => setIsOpen(false)}>
          <div 
            onClick={(e) => e.stopPropagation()}
            className="absolute left-1 md:left-2 top-10 rtl:left-auto rtl:right-2 z-50 w-72 md:w-80 bg-[#00142c]/95 border border-[#00BFFF]/20 rounded-lg shadow-lg backdrop-blur-md p-3 text-white"
            style={{
              animation: 'dropdown-fade-in 0.25s ease-out',
              maxHeight: 'calc(100vh - 80px)',
              overflowY: 'auto'
            }}
          >
            <div className="font-bold text-lg border-b border-[#00BFFF]/10 pb-2 mb-2 flex items-center sticky top-0 bg-[#00142c]/95 backdrop-blur-md">
              <BellRing className="h-5 w-5 ml-2 text-[#00BFFF]" />
              <span>اعلانات</span>
            </div>
            
            <div className="space-y-3">
              {notifications.map(notification => (
                <div key={notification.id} className="border-b border-[#00BFFF]/10 pb-3 hover:bg-[#00BFFF]/5 p-2 rounded-md transition-colors duration-200">
                  <div className="font-bold text-sm">{notification.title}</div>
                  <p className="text-xs text-gray-300 mt-1">{notification.text}</p>
                  <div className="text-[10px] text-gray-400 mt-1">{notification.date}</div>
                </div>
              ))}
            </div>
            
            {notifications.length === 0 && (
              <div className="py-4 text-center text-gray-400">
                هیچ اعلانی وجود ندارد
              </div>
            )}
            
            <div className="mt-2 text-center border-t border-[#00BFFF]/10 pt-2 sticky bottom-0 bg-[#00142c]/95 backdrop-blur-md">
              <Button variant="link" size="sm" className="text-[#00BFFF] text-xs hover:text-[#00BFFF]/80">
                مشاهده همه اعلانات
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
