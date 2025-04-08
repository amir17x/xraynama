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
          className={`w-64 md:w-80 pl-10 bg-muted border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground`}
          value={query}
          onChange={handleInputChange}
        />
        
        {query ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute left-3 top-2.5 text-muted-foreground h-5 w-5 p-0"
            onClick={handleClearSearch}
          >
            <X className="h-4 w-4" />
          </Button>
        ) : (
          <Search className="absolute left-3 top-2.5 text-muted-foreground h-5 w-5" />
        )}
        
        {/* Advanced Search Button */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={`${isMobile ? 'hidden' : 'block'} absolute -left-9 top-1.5 text-muted-foreground hover:text-primary transition duration-200 h-7 w-7 p-0`}
          onClick={handleAdvancedSearch}
          title="جستجوی پیشرفته"
        >
          <SlidersHorizontal className="h-5 w-5" />
        </Button>
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
      variant="outline"
      size="sm"
      className="text-white border-primary/30 bg-primary/20 hover:bg-primary/30 transition duration-200"
      onClick={handleAdvancedSearch}
    >
      جستجوی پیشرفته
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
        className="relative text-foreground hover:text-primary transition-colors"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="اعلانات"
      >
        <BellRing className="h-5 w-5" />
        {notifications.length > 0 && (
          <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
        )}
      </Button>
      
      {isOpen && (
        <div className="absolute left-0 top-10 rtl:left-auto rtl:right-0 z-50 w-72 md:w-80 bg-background border rounded-md shadow-md p-2 text-foreground animate-in slide-in-from-top-5 fade-in-20 duration-200">
          <div className="font-bold text-lg border-b pb-2 mb-2">اعلانات</div>
          
          <div className="max-h-96 overflow-y-auto space-y-3">
            {notifications.map(notification => (
              <div key={notification.id} className="border-b border-border pb-3">
                <div className="font-bold">{notification.title}</div>
                <p className="text-sm text-muted-foreground">{notification.text}</p>
                <div className="text-xs text-muted-foreground mt-1">{notification.date}</div>
              </div>
            ))}
          </div>
          
          {notifications.length === 0 && (
            <div className="py-4 text-center text-muted-foreground">
              هیچ اعلانی وجود ندارد
            </div>
          )}
          
          <div className="mt-2 text-center">
            <Button variant="link" size="sm" className="text-primary text-xs">
              مشاهده همه اعلانات
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
