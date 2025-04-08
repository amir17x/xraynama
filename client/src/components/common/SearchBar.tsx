import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'wouter';
import { 
  Search, X, SlidersHorizontal, BellRing, 
  Info, AlertCircle, MessageCircle, ArrowLeftCircle, 
  Bell, Clock as ClockIcon
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ContentType, SearchFilters } from '@/types';
import { useMediaQuery } from '@/hooks/use-mobile';
import { PortalOverride } from '@/components/common/PortalOverride';

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

// کامپوننت نمایش اعلانات - طراحی بهبود یافته با افکت گلاسمورفیسم
export function NotificationsButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'پخش آنلاین',
      text: 'جهت پخش مروگر Chrome را به آخرین نسخه آپدیت نمایید.',
      date: '2 ماه پیش',
      isNew: true,
      icon: 'info',
    },
    {
      id: 2,
      title: 'پخش آنلاین',
      text: 'پخش آنلاین تنها با مرورگر Chrome امکان پذیر است.',
      date: '2 ماه پیش',
      isNew: false,
      icon: 'warning',
    },
    {
      id: 3,
      title: 'انتقاد و پیشنهاد',
      text: 'نظر، انتقاد و پیشنهادات خود را از طریق تیکت برای ما ارسال نمو...',
      date: '2 ماه پیش',
      isNew: false,
      icon: 'message',
    },
  ]);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const hasUnreadNotifications = notifications.some(n => n.isNew);

  // رندر آیکون مناسب برای هر نوع اعلان
  const renderNotificationIcon = (icon: string) => {
    switch (icon) {
      case 'info':
        return <Info className="h-4 w-4 text-blue-400" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-amber-400" />;
      case 'message':
        return <MessageCircle className="h-4 w-4 text-green-400" />;
      default:
        return <Info className="h-4 w-4 text-blue-400" />;
    }
  };

  const handleNotificationClick = (id: number) => {
    // در یک پیاده‌سازی واقعی، این مورد به API درخواست ارسال می‌کند
    // برای آزمایش، وضعیت isNew را تغییر می‌دهیم
    setNotifications(
      notifications.map(notif => 
        notif.id === id ? { ...notif, isNew: false } : notif
      )
    );
  };

  return (
    <div className="relative z-50">
      <Button
        ref={buttonRef}
        variant="ghost"
        size="icon"
        className="glassmorphic-icon relative w-9 h-9 flex items-center justify-center overflow-hidden"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label="اعلانات"
      >
        <BellRing className={`h-5 w-5 ${hasUnreadNotifications ? 'text-[#00BFFF]' : 'text-white'} transition-colors duration-300`} />
        
        {/* نشانگر اعلان جدید با انیمیشن پالس */}
        {hasUnreadNotifications && (
          <span className="absolute top-0 right-0 h-2.5 w-2.5 bg-red-500 rounded-full shadow-md animate-pulse">
            <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-75"></span>
          </span>
        )}
        
        {/* افکت هاله نور در هنگام هاور */}
        <span className="absolute inset-0 rounded-full bg-[#00BFFF]/0 hover:bg-[#00BFFF]/10 transition-all duration-300"></span>
      </Button>
      
      {/* استفاده از PortalOverride بهبود یافته برای منوی اعلان‌ها */}
      <PortalOverride 
        triggerRef={buttonRef} 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)}
        alignRight={false}
        maxHeight={450}
        minWidth={320}
        forceMaxHeight={false}
        stickyHeader={
          <div className="font-bold text-lg border-b border-[#00BFFF]/20 p-4 flex items-center bg-[#00142c]/95 sticky top-0 backdrop-blur-lg">
            <BellRing className="h-5 w-5 ml-3 text-[#00BFFF]" />
            <span>اعلانات</span>
            {hasUnreadNotifications && (
              <span className="mr-2 px-2 py-0.5 rounded-full bg-red-500/20 text-xs font-normal text-red-400">
                جدید
              </span>
            )}
          </div>
        }
        stickyFooter={
          <div className="text-center border-t border-[#00BFFF]/20 p-3 bg-[#00142c]/95 sticky bottom-0 backdrop-blur-lg">
            <Button 
              variant="link" 
              size="sm" 
              className="text-[#00BFFF] text-xs hover:text-[#00BFFF]/80 transition-all duration-300"
            >
              مشاهده همه اعلانات
              <ArrowLeftCircle className="mr-1 h-3.5 w-3.5" />
            </Button>
          </div>
        }
      >
        <div className="dropdown-glass text-white">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <Bell className="h-12 w-12 text-[#00BFFF]/30 mb-3" />
              <p className="text-sm text-gray-400">اعلان جدیدی ندارید</p>
            </div>
          ) : (
            <div className="space-y-1 p-3">
              {notifications.map(notification => (
                <div 
                  key={notification.id} 
                  className={`
                    border-b border-[#00BFFF]/10 pb-3 mb-3 hover:bg-[#00BFFF]/10 p-3 rounded-lg 
                    transition-all duration-300 cursor-pointer relative overflow-hidden
                    ${notification.isNew ? 'bg-[#00BFFF]/5 border-r-2 border-r-[#00BFFF]' : ''}
                  `}
                  onClick={() => handleNotificationClick(notification.id)}
                >
                  {/* افکت شیمر برای اعلان‌های جدید */}
                  {notification.isNew && <div className="shimmer-effect"></div>}
                  
                  <div className="flex items-start">
                    <div className="ml-3 p-2 rounded-full bg-[#00BFFF]/10">
                      {renderNotificationIcon(notification.icon)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="font-bold text-sm">
                          {notification.title}
                          {notification.isNew && (
                            <span className="mr-2 px-1.5 py-0.5 text-[10px] bg-red-500/20 text-red-400 rounded-full">
                              جدید
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-gray-300 mt-1 leading-5">{notification.text}</p>
                      <div className="text-[10px] text-gray-400 mt-2 flex items-center">
                        <ClockIcon className="h-3 w-3 ml-1" />
                        {notification.date}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </PortalOverride>
    </div>
  );
}
