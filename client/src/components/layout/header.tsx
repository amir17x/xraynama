import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import {
  Bell,
  Search,
  Heart,
  Film,
  Home,
  PlayCircle,
  Clapperboard,
  BookOpen,
  VideoIcon,
  TrendingUp,
  User,
  ChevronDown,
  Menu as MenuIcon,
  X,
  LogOut,
} from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import * as Popover from '@radix-ui/react-popover';
import { cn } from '@/lib/utils';

const Header = () => {
  const [location, navigate] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // کنترل اسکرول برای هدر با افکت چسبندگی
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // پردازش جستجو
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  // خروج از حساب کاربری
  const handleLogout = () => {
    logoutMutation.mutate();
  };

  // آیتم‌های منوی ناوبری
  const navItems = [
    { 
      icon: <Home className="w-5 h-5" />, 
      text: 'خانه', 
      href: '/' 
    },
    { 
      icon: <Clapperboard className="w-5 h-5" />, 
      text: 'فیلم‌ها', 
      href: '/category/movie' 
    },
    { 
      icon: <PlayCircle className="w-5 h-5" />, 
      text: 'سریال‌ها', 
      href: '/category/series' 
    },
    { 
      icon: <VideoIcon className="w-5 h-5" />, 
      text: 'انیمیشن', 
      href: '/category/animation' 
    },
    { 
      icon: <BookOpen className="w-5 h-5" />, 
      text: 'مستند', 
      href: '/category/documentary' 
    },
    { 
      icon: <Film className="w-5 h-5" />, 
      text: 'محتوا', 
      href: '/content' 
    },
    { 
      icon: <TrendingUp className="w-5 h-5" />, 
      text: 'محبوب‌ها', 
      href: '/trending' 
    },
  ];

  return (
    <header 
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        isScrolled ? "py-2" : "py-3"
      )}
    >
      <div className="w-full mx-auto max-w-[1920px] px-4">
        <div 
          className={cn(
            "w-full rounded-xl relative overflow-hidden transition-all duration-300",
            "bg-gradient-to-br from-blue-950/80 to-blue-900/60 backdrop-blur-md",
            "border border-blue-800/30 shadow-lg",
            isScrolled ? "py-2" : "py-3"
          )}
        >
          {/* اثر درخشان بالای هدر */}
          <div className="absolute -top-[80%] left-1/4 w-1/2 h-[200px] bg-blue-500/20 blur-[80px] rounded-full pointer-events-none"></div>
          
          <div className="w-full flex flex-col gap-4">
            {/* بخش بالایی هدر: لوگو، جستجو، پروفایل */}
            <div className="flex items-center justify-between px-4">
              {/* لوگو */}
              <div className="flex-shrink-0">
                <Link href="/">
                  <a className="flex items-center space-x-2 space-x-reverse">
                    <span className="text-[#00BFFF] text-2xl font-bold">X<span className="text-white">raynama</span></span>
                  </a>
                </Link>
              </div>

              {/* جستجو - نمایش در دسکتاپ */}
              <div className="hidden md:flex items-center max-w-md w-full mx-4">
                <form onSubmit={handleSearch} className="w-full relative">
                  <Input
                    type="text"
                    placeholder="جستجو..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-full border-blue-700/50 bg-blue-950/50 placeholder-gray-400 
                              text-white pl-10 pr-4 py-2 text-sm focus:border-blue-500"
                  />
                  <button
                    type="submit"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    <Search className="h-4 w-4" />
                  </button>
                </form>
              </div>

              {/* کنترل‌های کاربر */}
              <div className="flex items-center space-x-1 space-x-reverse">
                {/* جستجو در موبایل */}
                <button className="md:hidden p-2 hover:bg-blue-800/50 rounded-full">
                  <Search className="w-5 h-5 text-gray-300" />
                </button>

                {/* منوی اعلان‌ها */}
                <NotificationsMenu />
                
                {/* علاقه‌مندی‌ها */}
                {user && (
                  <Link href="/profile?tab=favorites">
                    <a className="p-2 hover:bg-blue-800/50 rounded-full">
                      <Heart className="w-5 h-5 text-gray-300" />
                    </a>
                  </Link>
                )}

                {/* منوی پروفایل کاربر */}
                <UserMenu user={user} onLogout={handleLogout} />

                {/* دکمه منوی موبایل */}
                <button 
                  className="md:hidden p-2 hover:bg-blue-800/50 rounded-full"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                  {isMobileMenuOpen ? 
                    <X className="w-5 h-5 text-gray-300" /> : 
                    <MenuIcon className="w-5 h-5 text-gray-300" />
                  }
                </button>
              </div>
            </div>

            {/* بخش پایینی هدر: لینک‌های ناوبری */}
            <nav className="hidden md:flex justify-center items-center pb-1">
              <ul className="flex items-center space-x-1 space-x-reverse">
                {navItems.map((item, index) => (
                  <li key={index}>
                    <Link href={item.href}>
                      <a className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                        location === item.href 
                          ? "bg-blue-700/40 text-white" 
                          : "text-gray-200 hover:bg-blue-800/30 hover:text-white"
                      )}>
                        {item.icon}
                        <span>{item.text}</span>
                      </a>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      </div>

      {/* منوی موبایل */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-[72px] z-40 bg-gradient-to-b from-blue-950/95 to-blue-900/90 backdrop-blur-md 
                       border-t border-blue-800/30 border-b border-blue-800/40 animate-in-fade-down">
          <ul className="px-4 py-3 max-h-[calc(100vh-160px)] overflow-y-auto">
            {navItems.map((item, index) => (
              <li key={index} className="mb-1">
                <Link href={item.href}>
                  <a 
                    className={cn(
                      "flex items-center gap-2 px-3 py-2.5 rounded-lg text-base transition-colors",
                      location === item.href 
                        ? "bg-blue-700/40 text-white" 
                        : "text-gray-200 hover:bg-blue-800/30 hover:text-white"
                    )}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.icon}
                    <span>{item.text}</span>
                  </a>
                </Link>
              </li>
            ))}
            <li className="mt-4">
              <form onSubmit={handleSearch} className="relative">
                <Input
                  type="text"
                  placeholder="جستجو..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-full border-blue-700/50 bg-blue-950/50 placeholder-gray-400 
                            text-white pl-10 pr-4 py-2 text-sm focus:border-blue-500"
                />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  <Search className="h-4 w-4" />
                </button>
              </form>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
};

// کامپوننت منوی پروفایل کاربر 
const UserMenu = ({ user, onLogout }: { 
  user: { 
    id: string | number; 
    username: string; 
    name?: string | null; 
    avatar?: string | null; 
    role?: string | "user" | "admin"; 
  } | null; 
  onLogout: () => void;
}) => {
  if (!user) {
    return (
      <Button 
        asChild 
        variant="default" 
        size="sm" 
        className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 
                   text-white border-0 shadow-md hover:shadow-lg transition-all"
      >
        <Link href="/auth/login">ورود / ثبت‌نام</Link>
      </Button>
    );
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="flex items-center gap-1 py-1 px-2 rounded-full hover:bg-blue-800/40 transition-colors">
          <Avatar className="w-7 h-7 border border-blue-400/30">
            <AvatarImage src={user.avatar || undefined} alt={user.name || user.username} />
            <AvatarFallback className="bg-blue-800 text-blue-100 text-xs">
              {user.name?.charAt(0) || user.username.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <span className="hidden sm:inline text-sm text-white font-medium">
            {user.name || user.username}
          </span>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={5}
          className="z-[100] min-w-[220px] overflow-hidden rounded-xl border border-blue-700/40 
                     bg-gradient-to-br from-blue-950/95 to-blue-900/90 backdrop-blur-xl
                     shadow-xl shadow-blue-900/20 transition-all duration-200 opacity-100"
        >
          <div className="p-3 border-b border-blue-700/20">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10 border-2 border-blue-500/30 shadow-md">
                <AvatarImage src={user.avatar || undefined} alt={user.name || user.username} />
                <AvatarFallback className="bg-blue-800 text-blue-100">
                  {user.name?.charAt(0) || user.username.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium text-white">{user.name || user.username}</div>
                <div className="text-xs text-gray-400">@{user.username}</div>
              </div>
            </div>
          </div>

          <div className="p-2">
            <MenuItem href="/profile" icon={<User size={16} />} label="پروفایل" />
            <MenuItem href="/profile?tab=favorites" icon={<Heart size={16} />} label="علاقه‌مندی‌ها" />
            <MenuItem href="/profile?tab=history" icon={<Film size={16} />} label="تاریخچه تماشا" />

            <DropdownMenu.Separator className="h-px my-1 bg-blue-700/20" />

            {user.role === 'admin' && (
              <>
                <MenuItem href="/admin" icon={<TrendingUp size={16} />} label="پنل مدیریت" />
                <DropdownMenu.Separator className="h-px my-1 bg-blue-700/20" />
              </>
            )}

            <DropdownMenu.Item 
              onClick={onLogout}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 cursor-pointer rounded-md text-sm text-red-400 
                         hover:bg-red-950/30 hover:text-red-300 outline-none"
            >
              <LogOut size={16} />
              <span>خروج</span>
            </DropdownMenu.Item>
          </div>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};

// کامپوننت آیتم منوی پروفایل کاربر
const MenuItem = ({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) => (
  <DropdownMenu.Item asChild>
    <Link 
      href={href} 
      className="w-full flex items-center gap-2 px-2.5 py-1.5 cursor-pointer rounded-md text-sm text-gray-200 
                 hover:bg-blue-800/30 hover:text-white outline-none"
    >
      {icon}
      <span>{label}</span>
    </Link>
  </DropdownMenu.Item>
);

// کامپوننت منوی اعلانات
const NotificationsMenu = () => {
  const [hasUnread, setHasUnread] = useState(true);
  const notifications = [
    {
      id: 1,
      title: 'پخش آنلاین',
      text: 'جهت پخش مروگر Chrome را به آخرین نسخه آپدیت نمایید.',
      time: '2 ساعت پیش',
      isNew: true
    },
    {
      id: 2,
      title: 'پخش آنلاین',
      text: 'پخش آنلاین تنها با مرورگر Chrome امکان پذیر است.',
      time: '2 روز پیش',
      isNew: false
    },
    {
      id: 3,
      title: 'انتقاد و پیشنهاد',
      text: 'نظر، انتقاد و پیشنهادات خود را از طریق تیکت برای ما ارسال نمایید.',
      time: '1 هفته پیش',
      isNew: false
    }
  ];

  const markAsRead = (id: number) => {
    // در اینجا می‌توان با API ارتباط برقرار کرد
    console.log(`Notification ${id} marked as read`);
  };

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button className="relative p-2 hover:bg-blue-800/50 rounded-full">
          <Bell className="w-5 h-5 text-gray-300" />
          {hasUnread && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full">
              <span className="absolute inset-0 w-full h-full bg-red-500 rounded-full animate-ping opacity-75"></span>
            </span>
          )}
        </button>
      </Popover.Trigger>
      
      <Popover.Portal>
        <Popover.Content 
          align="end" 
          sideOffset={5}
          className="z-[100] w-80 overflow-hidden rounded-xl border border-blue-700/40 
                     bg-gradient-to-br from-blue-950/95 to-blue-900/90 backdrop-blur-xl
                     shadow-xl shadow-blue-900/20 transition-all duration-200 opacity-100"
        >
          <div className="p-3 border-b border-blue-700/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-blue-400" />
              <span className="font-medium text-sm text-white">اعلانات</span>
            </div>
            {hasUnread && (
              <span className="px-2 py-0.5 text-xs bg-red-500/20 text-red-400 rounded-full">
                جدید
              </span>
            )}
          </div>
          
          <div className="max-h-[280px] overflow-y-auto">
            {notifications.length > 0 ? (
              <div className="p-2 space-y-1">
                {notifications.map(notification => (
                  <div 
                    key={notification.id}
                    onClick={() => markAsRead(notification.id)}
                    className={cn(
                      "p-2 rounded-lg cursor-pointer transition-colors",
                      notification.isNew 
                        ? "bg-blue-800/20 border-r-2 border-blue-500" 
                        : "hover:bg-blue-800/20"
                    )}
                  >
                    <div className="flex justify-between">
                      <h4 className="text-sm font-medium text-white">
                        {notification.title}
                        {notification.isNew && (
                          <span className="mr-1.5 px-1 py-0.5 text-[10px] bg-red-500/20 text-red-400 rounded-full">
                            جدید
                          </span>
                        )}
                      </h4>
                    </div>
                    <p className="mt-1 text-xs text-gray-300">{notification.text}</p>
                    <div className="mt-1 text-[10px] text-gray-400 flex items-center">
                      <Bell className="w-3 h-3 ml-1" />
                      {notification.time}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <Bell className="mx-auto w-8 h-8 text-gray-500 mb-2" />
                <p className="text-gray-400 text-sm">اعلان جدیدی ندارید</p>
              </div>
            )}
          </div>
          
          <div className="p-2 border-t border-blue-700/20 text-center">
            <Popover.Close className="text-xs text-blue-400 hover:text-blue-300">
              مشاهده همه اعلانات
            </Popover.Close>
          </div>
          
          <Popover.Arrow className="fill-blue-950" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};

export default Header;