import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'wouter';
import { SearchBar, AdvancedSearchButton, NotificationsButton } from '@/components/common/SearchBar';
import { useAuth } from '@/hooks/use-auth';
import { Loader2, Menu, ChevronDown, User, Heart, ListVideo, Settings, LogOut, ShieldAlert } from 'lucide-react';
import { PortalOverride } from '@/components/common/PortalOverride';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
    { label: 'صفحه اصلی', href: '/' },
    { label: 'صفحه دسته‌بندی شده', href: '/index' },
    { label: 'فیلم‌ها', href: '/movies' },
    { label: 'سریال‌ها', href: '/series' },
    { label: 'انیمیشن‌ها', href: '/animations' },
    { label: 'مستندها', href: '/documentaries' },
    { label: 'همه محتواها', href: '/all-content' },
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
          
          <nav className="hidden md:flex space-x-1 mr-6">
            {navItems.map((item) => (
              <Link 
                key={item.href} 
                href={item.href}
                className="px-4 py-2 rounded-md hover:bg-muted text-foreground transition duration-200 mx-1"
              >
                {item.label}
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
                <Link href="/auth" className="px-4 py-2 text-foreground hover:text-primary transition duration-200">
                  ورود
                </Link>
                <Link href="/auth" className="px-4 py-2 text-white bg-primary hover:bg-primary/90 rounded-md transition duration-200">
                  ثبت نام
                </Link>
              </div>
            ) : (
              // Logged in
              <div className="relative">
                <Button 
                  ref={triggerRef}
                  variant="ghost" 
                  className="flex items-center focus:outline-none"
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
                  <PortalOverride triggerRef={triggerRef}>
                    <div className="w-48 bg-popover border rounded-md shadow-md p-1 text-popover-foreground animate-fade-in">
                      <button 
                        className="w-full flex items-center p-2 rounded hover:bg-accent hover:text-accent-foreground text-sm"
                        onClick={() => { setLocation('/profile'); setIsMenuOpen(false); }}
                      >
                        <User className="ml-2 h-4 w-4" />
                        <span>پروفایل</span>
                      </button>
                      
                      <button 
                        className="w-full flex items-center p-2 rounded hover:bg-accent hover:text-accent-foreground text-sm"
                        onClick={() => { setLocation('/profile?tab=favorites'); setIsMenuOpen(false); }}
                      >
                        <Heart className="ml-2 h-4 w-4" />
                        <span>علاقه‌مندی‌ها</span>
                      </button>
                      
                      <button 
                        className="w-full flex items-center p-2 rounded hover:bg-accent hover:text-accent-foreground text-sm"
                        onClick={() => { setLocation('/profile?tab=playlists'); setIsMenuOpen(false); }}
                      >
                        <ListVideo className="ml-2 h-4 w-4" />
                        <span>پلی‌لیست‌ها</span>
                      </button>
                      
                      <button 
                        className="w-full flex items-center p-2 rounded hover:bg-accent hover:text-accent-foreground text-sm"
                        onClick={() => { setLocation('/profile?tab=settings'); setIsMenuOpen(false); }}
                      >
                        <Settings className="ml-2 h-4 w-4" />
                        <span>تنظیمات</span>
                      </button>
                      
                      {/* نمایش گزینه مدیر سیستم فقط برای کاربران ادمین */}
                      {user?.role === 'admin' && (
                        <>
                          <div className="h-px bg-muted my-1 -mx-1"></div>
                          <button 
                            className="w-full flex items-center p-2 rounded hover:bg-accent hover:text-accent-foreground text-sm text-primary font-semibold"
                            onClick={() => { setLocation('/admin/dashboard'); setIsMenuOpen(false); }}
                          >
                            <ShieldAlert className="ml-2 h-4 w-4" />
                            <span>مدیر سیستم</span>
                          </button>
                        </>
                      )}
                      
                      <div className="h-px bg-muted my-1 -mx-1"></div>
                      <button 
                        className="w-full flex items-center p-2 rounded hover:bg-accent hover:text-accent-foreground text-sm"
                        onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                        disabled={logoutMutation.isPending}
                      >
                        <LogOut className="ml-2 h-4 w-4" />
                        <span>خروج</span>
                        {logoutMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      </button>
                    </div>
                  </PortalOverride>
                )}
              </div>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden ml-4">
            <Button 
              variant="ghost" 
              size="icon"
              className="text-foreground hover:text-primary" 
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
