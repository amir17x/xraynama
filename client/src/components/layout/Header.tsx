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
      icon: <Home className="h-5 w-5 mb-1" />
    },
    { 
      label: 'فیلم‌ها', 
      englishLabel: 'MOVIES',
      href: '/movies', 
      icon: <Film className="h-5 w-5 mb-1" />
    },
    { 
      label: 'سریال‌ها', 
      englishLabel: 'SERIES',
      href: '/series', 
      icon: <Video className="h-5 w-5 mb-1" />
    },
    { 
      label: 'انیمیشن‌ها', 
      englishLabel: 'ANIMATIONS',
      href: '/animations', 
      icon: <FileVideo className="h-5 w-5 mb-1" />
    },
    { 
      label: 'مستندها', 
      englishLabel: 'DOCUMENTARIES',
      href: '/documentaries', 
      icon: <Theater className="h-5 w-5 mb-1" />
    },
    { 
      label: 'هنرمندان', 
      englishLabel: 'ARTISTS',
      href: '/artists', 
      icon: <Users className="h-5 w-5 mb-1" />
    },
    { 
      label: 'اپلیکیشن', 
      englishLabel: 'APP',
      href: '/app', 
      icon: <Smartphone className="h-5 w-5 mb-1 text-green-400" />
    },
  ];

  return (
    <>
      <header className={`
        sticky z-50 
        px-6 py-4 
        mx-4 my-2
        flex items-center justify-between 
        rounded-xl 
        glass-header
        ${isScrolled 
          ? 'header-shadow top-2 header-scroll-transition' 
          : 'top-3'
        }
      `}>
        <div className="flex items-center">
          <div className="mr-4">
            <Link href="/" className="flex items-center">
              <span className="text-primary text-2xl font-bold">X<span className="text-foreground">raynama</span></span>
            </Link>
          </div>
          
          <nav className="hidden md:flex items-center space-x-2 rtl:space-x-reverse mr-6">
            {navItems.map((item) => (
              <Link 
                key={item.href} 
                href={item.href}
                className="flex flex-col items-center px-4 py-2 rounded-md hover:bg-black/40 transition-all duration-300 group"
              >
                <div className="group-hover:text-orange-400 transition-colors duration-300">
                  {item.icon}
                </div>
                <span className="text-sm font-medium mb-0.5">{item.label}</span>
                <span className="text-xs text-slate-400 group-hover:text-orange-400 transition-colors duration-300">
                  {item.englishLabel}
                </span>
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center">
          {/* قسمت قرمز - دکمه جستجوی پیشرفته */}
          <div className="ml-4">
            <AdvancedSearchButton />
          </div>
          
          {/* قسمت بنفش - دکمه اعلانات */}
          <div className="ml-4">
            <NotificationsButton />
          </div>
          
          <SearchBar />

          <div className="flex items-center mr-2">
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground ml-4" />
            ) : !user ? (
              // Not logged in
              <div className="flex items-center">
                <Link href="/auth" className="unified-button">
                  ورود
                </Link>
                <Link href="/auth" className="unified-button mx-2 bg-[#006bd6] hover:bg-[#006bd6]/90 border-[#006bd6]/70 text-white">
                  ثبت نام
                </Link>
              </div>
            ) : (
              // Logged in
              <div className="relative" style={{ position: 'relative' }}>
                <Button 
                  ref={triggerRef}
                  variant="ghost" 
                  className="unified-icon-button flex items-center focus:outline-none"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                  <Avatar className="w-8 h-8 border-2 border-primary">
                    <AvatarImage src={user.avatar || undefined} />
                    <AvatarFallback className="bg-muted text-primary font-semibold">
                      {user.name?.charAt(0) || user.username.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="mr-2 text-foreground hidden md:block">
                    {user.name || user.username}
                  </span>
                  <ChevronDown className="text-xs mr-1 text-muted-foreground h-4 w-4" />
                </Button>
                
                {isMenuOpen && (
                  <div style={{ right: '0', left: 'auto' }} className="profile-dropdown w-48 bg-popover border rounded-md shadow-md p-1 text-popover-foreground animate-fade-in z-50 absolute top-full mt-2">
                    <Link 
                      href="/profile"
                      className="unified-button w-full flex items-center p-2 rounded text-sm"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <User className="ml-2 h-4 w-4" />
                      <span>پروفایل</span>
                    </Link>
                    
                    <Link 
                      href="/profile?tab=favorites"
                      className="unified-button w-full flex items-center p-2 rounded text-sm"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Heart className="ml-2 h-4 w-4" />
                      <span>علاقه‌مندی‌ها</span>
                    </Link>
                    
                    <Link 
                      href="/profile?tab=playlists"
                      className="unified-button w-full flex items-center p-2 rounded text-sm"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <ListVideo className="ml-2 h-4 w-4" />
                      <span>پلی‌لیست‌ها</span>
                    </Link>
                    
                    <Link 
                      href="/profile?tab=settings"
                      className="unified-button w-full flex items-center p-2 rounded text-sm"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Settings className="ml-2 h-4 w-4" />
                      <span>تنظیمات</span>
                    </Link>
                    
                    {/* نمایش گزینه مدیر سیستم فقط برای کاربران ادمین */}
                    {user?.role === 'admin' && (
                      <>
                        <div className="h-px bg-muted my-1 -mx-1"></div>
                        <Link 
                          href="/admin/dashboard"
                          className="w-full flex items-center p-2 rounded bg-[#006bd6]/10 text-[#006bd6] hover:bg-[#006bd6]/20 text-sm font-semibold transition-all duration-300"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <ShieldAlert className="ml-2 h-4 w-4" />
                          <span>مدیر سیستم</span>
                        </Link>
                      </>
                    )}
                    
                    <div className="h-px bg-muted my-1 -mx-1"></div>
                    <button 
                      className="unified-button w-full flex items-center p-2 rounded text-sm"
                      onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                      disabled={logoutMutation.isPending}
                    >
                      <LogOut className="ml-2 h-4 w-4" />
                      <span>خروج</span>
                      {logoutMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    </button>
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
              className="unified-icon-button" 
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      <MobileMenu 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
        navItems={navItems}
      />
    </>
  );
}
