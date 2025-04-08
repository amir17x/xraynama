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
                <div className="relative ml-1">
                  <Button 
                    ref={triggerRef}
                    variant="ghost" 
                    className="glassmorphic-icon flex items-center focus:outline-none px-2 py-1 rounded-full"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    aria-haspopup="true"
                    aria-expanded={isMenuOpen}
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
                    <ChevronDown className={`mr-1 text-[#00BFFF] h-4 w-4 md:hidden transition-transform duration-200 ${isMenuOpen ? 'transform rotate-180' : ''}`} />
                  </Button>
                  
                  {/* استفاده از PortalOverride بهبود یافته برای منوی پروفایل با طراحی گلاسمورفیسم */}
                  <PortalOverride 
                    triggerRef={triggerRef} 
                    isOpen={isMenuOpen} 
                    onClose={() => setIsMenuOpen(false)}
                    alignRight={true}
                    maxHeight={500}
                    minWidth={280}
                    stickyHeader={
                      <div className="py-4 px-4 border-b border-[#00BFFF]/20 bg-[#00142c]/95 backdrop-blur-lg flex items-center">
                        <Avatar className="w-12 h-12 mr-3 border-2 border-[#00BFFF]/50 shadow-glow-sm shadow-[#00BFFF]/20">
                          <AvatarImage src={user.avatar || undefined} />
                          <AvatarFallback className="bg-[#00142c] text-[#00BFFF] font-semibold text-lg">
                            {user.name?.charAt(0) || user.username.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="text-base font-medium text-white truncate">{user.name || user.username}</div>
                          <div className="text-xs text-[#00BFFF] truncate flex items-center mt-1">
                            {user?.role === 'admin' ? (
                              <>
                                <ShieldAlert className="h-3 w-3 ml-1" />
                                <span>مدیر سیستم</span>
                              </>
                            ) : (
                              <>
                                <User className="h-3 w-3 ml-1" />
                                <span>کاربر</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    }
                  >
                    <div className="dropdown-glass text-white p-3">
                      <Link 
                        href="/profile"
                        className="w-full flex items-center p-3 rounded-md text-sm hover:bg-[#00BFFF]/10 transition-all duration-300 group"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <div className="ml-3 w-8 h-8 rounded-full bg-[#00BFFF]/10 flex items-center justify-center group-hover:bg-[#00BFFF]/20 transition-all duration-300">
                          <User className="h-4 w-4 text-[#00BFFF]" />
                        </div>
                        <span>پروفایل</span>
                      </Link>
                      
                      <Link 
                        href="/profile?tab=favorites"
                        className="w-full flex items-center p-3 rounded-md text-sm hover:bg-[#00BFFF]/10 transition-all duration-300 group"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <div className="ml-3 w-8 h-8 rounded-full bg-[#00BFFF]/10 flex items-center justify-center group-hover:bg-[#00BFFF]/20 transition-all duration-300">
                          <Heart className="h-4 w-4 text-[#00BFFF]" />
                        </div>
                        <span>علاقه‌مندی‌ها</span>
                      </Link>
                      
                      <Link 
                        href="/profile?tab=playlists"
                        className="w-full flex items-center p-3 rounded-md text-sm hover:bg-[#00BFFF]/10 transition-all duration-300 group"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <div className="ml-3 w-8 h-8 rounded-full bg-[#00BFFF]/10 flex items-center justify-center group-hover:bg-[#00BFFF]/20 transition-all duration-300">
                          <ListVideo className="h-4 w-4 text-[#00BFFF]" />
                        </div>
                        <span>پلی‌لیست‌ها</span>
                      </Link>
                      
                      <Link 
                        href="/profile?tab=settings"
                        className="w-full flex items-center p-3 rounded-md text-sm hover:bg-[#00BFFF]/10 transition-all duration-300 group"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <div className="ml-3 w-8 h-8 rounded-full bg-[#00BFFF]/10 flex items-center justify-center group-hover:bg-[#00BFFF]/20 transition-all duration-300">
                          <Settings className="h-4 w-4 text-[#00BFFF]" />
                        </div>
                        <span>تنظیمات</span>
                      </Link>
                      
                      {/* نمایش گزینه مدیر سیستم فقط برای کاربران ادمین با طراحی بهبود یافته */}
                      {user?.role === 'admin' && (
                        <>
                          <div className="h-0.5 bg-gradient-to-r from-[#00BFFF]/0 via-[#00BFFF]/20 to-[#00BFFF]/0 my-3"></div>
                          <Link 
                            href="/admin/dashboard"
                            className="w-full flex items-center p-3 rounded-md bg-[#00BFFF]/5 text-white hover:bg-[#00BFFF]/15 text-sm font-medium transition-all duration-300 group"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            <div className="ml-3 w-8 h-8 rounded-full bg-[#00BFFF]/15 flex items-center justify-center group-hover:bg-[#00BFFF]/25 transition-all duration-300">
                              <ShieldAlert className="h-4 w-4 text-[#00BFFF]" />
                            </div>
                            <div>
                              <span className="font-medium">پنل مدیریت</span>
                              <p className="text-xs text-[#00BFFF]/70 mt-0.5">دسترسی به تنظیمات سایت</p>
                            </div>
                          </Link>
                        </>
                      )}
                      
                      <div className="h-0.5 bg-gradient-to-r from-[#00BFFF]/0 via-[#00BFFF]/20 to-[#00BFFF]/0 my-3"></div>
                      <button 
                        className="w-full flex items-center p-3 rounded-md text-sm group hover:bg-red-500/10 transition-all duration-300"
                        onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                        disabled={logoutMutation.isPending}
                      >
                        <div className="ml-3 w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center group-hover:bg-red-500/20 transition-all duration-300">
                          <LogOut className="h-4 w-4 text-red-400" />
                        </div>
                        <span className="group-hover:text-red-400 transition-colors duration-300">خروج از حساب کاربری</span>
                        {logoutMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin text-red-400" />}
                      </button>
                    </div>
                  </PortalOverride>
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
