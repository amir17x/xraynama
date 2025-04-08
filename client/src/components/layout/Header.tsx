import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'wouter';
import { SearchBar, AdvancedSearchButton, NotificationsButton } from '@/components/common/SearchBar';
import { useAuth } from '@/hooks/use-auth';
import { 
  Loader2, Menu, ChevronDown, User, Heart, ListVideo, Settings, LogOut, ShieldAlert,
  Home, Film, Video, Theater, Smartphone, Users, FileVideo
} from 'lucide-react';
import { PortalOverride } from '@/components/common/PortalOverride';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MobileMenu } from './MobileMenu';

export function Header() {
  const { user, isLoading, logoutMutation } = useAuth();
  const [, setLocation] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  
  // Handle scroll effect with enhanced animation
  useEffect(() => {
    let lastScrollY = window.scrollY;
    
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      // اسکرول به پایین - هدر را کوچکتر و بالاتر می‌کند
      if (currentScrollY > 50) {
        setIsScrolled(true);
      } 
      // اسکرول به بالا یا در بالای صفحه - هدر به حالت عادی برمی‌گردد
      else if (currentScrollY <= 50) {
        setIsScrolled(false);
      }
      
      lastScrollY = currentScrollY;
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (triggerRef.current && !triggerRef.current.contains(event.target as Node) && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const navItems = [
    { 
      label: 'خانه', 
      englishLabel: 'HOME',
      href: '/', 
      icon: <Home className="h-5 w-5" />
    },
    { 
      label: 'فیلم‌ها', 
      englishLabel: 'MOVIES',
      href: '/movies', 
      icon: <Film className="h-5 w-5" />
    },
    { 
      label: 'سریال‌ها', 
      englishLabel: 'SERIES',
      href: '/series', 
      icon: <Video className="h-5 w-5" />
    },
    { 
      label: 'انیمیشن‌ها', 
      englishLabel: 'ANIMATIONS',
      href: '/animations', 
      icon: <FileVideo className="h-5 w-5" />
    },
    { 
      label: 'مستندها', 
      englishLabel: 'DOCUMENTARIES',
      href: '/documentaries', 
      icon: <Theater className="h-5 w-5" />
    },
    { 
      label: 'هنرمندان', 
      englishLabel: 'ARTISTS',
      href: '/artists', 
      icon: <Users className="h-5 w-5" />
    },
    { 
      label: 'اپلیکیشن', 
      englishLabel: 'APP',
      href: '/app', 
      icon: <Smartphone className="h-5 w-5" />
    },
  ];

  return (
    <>
      <div className={`
        sticky z-50 
        mx-4 my-2
        flex flex-col
        rounded-xl 
        overflow-hidden
        glass-header
        ${isScrolled 
          ? 'header-shadow top-2 header-scroll-transition' 
          : 'top-3'
        }
      `}>
        {/* بخش بالایی هدر - پروفایل، جستجو، اعلانات */}
        <header className="px-6 py-3 flex items-center justify-between">
          <div className="flex items-center">
            <div className="mr-4">
              <Link href="/" className="flex items-center">
                <span className="text-[#00BFFF] text-2xl font-bold">X<span className="text-white">raynama</span></span>
              </Link>
            </div>
          </div>

          <div className="flex items-center">
            {/* دکمه جستجوی پیشرفته */}
            <div className="ml-3">
              <AdvancedSearchButton />
            </div>
            
            {/* دکمه اعلانات */}
            <div className="ml-3">
              <NotificationsButton />
            </div>
            
            <SearchBar />

            <div className="flex items-center mr-2">
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin text-[#00BFFF] ml-4" />
              ) : !user ? (
                // Not logged in
                <div className="flex items-center">
                  <Link href="/auth" className="px-4 py-2 rounded-md bg-[#00BFFF] hover:bg-[#00BFFF]/90 text-white border border-[#00BFFF]/70 transition-all duration-300 flex items-center space-x-1 space-x-reverse">
                    <User className="ml-1 h-4 w-4" />
                    <span>ورود / ثبت نام</span>
                  </Link>
                </div>
              ) : (
                // Logged in
                <div className="relative ml-1" style={{ position: 'relative' }}>
                  <Button 
                    ref={triggerRef}
                    variant="ghost" 
                    className="glassmorphic-icon flex items-center focus:outline-none px-2 py-1 rounded-full"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                  >
                    <Avatar className="w-8 h-8 border-2 border-[#00BFFF]/80">
                      <AvatarImage src={user.avatar || undefined} />
                      <AvatarFallback className="bg-[#00142c] text-[#00BFFF] font-semibold">
                        {user.name?.charAt(0) || user.username.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="mr-2 flex flex-col items-start hidden md:block">
                      <span className="text-white text-sm font-medium">
                        {user.name || user.username}
                      </span>
                      <span className="text-xs text-[#00BFFF]">
                        {user?.role === 'admin' ? 'مدیر سیستم' : 'کاربر'}
                      </span>
                    </div>
                    <ChevronDown className="mr-1 text-[#00BFFF] h-4 w-4 md:hidden" />
                  </Button>
                  
                  {isMenuOpen && (
                    <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)}>
                      <div 
                        onClick={(e) => e.stopPropagation()} 
                        className="profile-dropdown w-56 bg-[#00142c]/95 border border-[#00BFFF]/20 rounded-lg shadow-lg backdrop-blur-md p-2 text-white z-50 absolute top-[calc(100%+4px)] md:right-1 right-2"
                        style={{
                          animation: 'dropdown-fade-in 0.25s ease-out'
                        }}
                      >
                        <div className="py-2 px-3 mb-1 border-b border-[#00BFFF]/10">
                          <div className="text-sm font-medium text-white truncate">{user.name || user.username}</div>
                          <div className="text-xs text-[#00BFFF]/80 truncate">
                            {user?.role === 'admin' ? 'مدیر سیستم' : 'کاربر معمولی'}
                          </div>
                        </div>
                        
                        <Link 
                          href="/profile"
                          className="w-full flex items-center p-2 rounded-md text-sm hover:bg-[#00BFFF]/10 transition-colors duration-200"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <User className="ml-2 h-4 w-4 text-[#00BFFF]" />
                          <span>پروفایل</span>
                        </Link>
                        
                        <Link 
                          href="/profile?tab=favorites"
                          className="w-full flex items-center p-2 rounded-md text-sm hover:bg-[#00BFFF]/10 transition-colors duration-200"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <Heart className="ml-2 h-4 w-4 text-[#00BFFF]" />
                          <span>علاقه‌مندی‌ها</span>
                        </Link>
                        
                        <Link 
                          href="/profile?tab=playlists"
                          className="w-full flex items-center p-2 rounded-md text-sm hover:bg-[#00BFFF]/10 transition-colors duration-200"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <ListVideo className="ml-2 h-4 w-4 text-[#00BFFF]" />
                          <span>پلی‌لیست‌ها</span>
                        </Link>
                        
                        <Link 
                          href="/profile?tab=settings"
                          className="w-full flex items-center p-2 rounded-md text-sm hover:bg-[#00BFFF]/10 transition-colors duration-200"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <Settings className="ml-2 h-4 w-4 text-[#00BFFF]" />
                          <span>تنظیمات</span>
                        </Link>
                        
                        {/* نمایش گزینه مدیر سیستم فقط برای کاربران ادمین */}
                        {user?.role === 'admin' && (
                          <>
                            <div className="h-px bg-[#00BFFF]/10 my-1"></div>
                            <Link 
                              href="/admin/dashboard"
                              className="w-full flex items-center p-2 rounded-md bg-[#00BFFF]/10 text-[#00BFFF] hover:bg-[#00BFFF]/20 text-sm font-semibold transition-all duration-300"
                              onClick={() => setIsMenuOpen(false)}
                            >
                              <ShieldAlert className="ml-2 h-4 w-4" />
                              <span>مدیر سیستم</span>
                            </Link>
                          </>
                        )}
                        
                        <div className="h-px bg-[#00BFFF]/10 my-1"></div>
                        <button 
                          className="w-full flex items-center p-2 rounded-md text-sm hover:bg-red-500/10 hover:text-red-400 transition-colors duration-200"
                          onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                          disabled={logoutMutation.isPending}
                        >
                          <LogOut className="ml-2 h-4 w-4" />
                          <span>خروج</span>
                          {logoutMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Mobile menu button */}
            <div className="md:hidden ml-4">
              <Button 
                variant="ghost" 
                size="icon"
                className="glassmorphic-icon w-9 h-9 flex items-center justify-center" 
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <Menu className="h-5 w-5 text-[#00BFFF]" />
              </Button>
            </div>
          </div>
        </header>
        
        {/* نوار ناوبری پایین - مخفی در حالت موبایل */}
        <nav className="header-navigation hidden md:flex">
          <div className="flex items-center justify-center gap-0 w-full">
            {navItems.map((item) => (
              <Link 
                key={item.href} 
                href={item.href}
                className="nav-item"
              >
                <div className="nav-icon">
                  {item.icon}
                </div>
                <span className="nav-label">{item.label}</span>
                <span className="nav-english-label">
                  {item.englishLabel}
                </span>
              </Link>
            ))}
          </div>
        </nav>
      </div>

      {/* Mobile menu */}
      <MobileMenu 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
        navItems={navItems}
      />
    </>
  );
}
