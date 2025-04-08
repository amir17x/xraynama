import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'wouter';
import { SearchBar, AdvancedSearchButton, NotificationsButton } from '@/components/common/SearchBar';
import { useAuth } from '@/hooks/use-auth';
import { Loader2, Menu, ChevronDown, User, Heart, ListVideo, Settings, LogOut, ShieldAlert } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MobileMenu } from './MobileMenu';
import { motion } from 'framer-motion';

export function Header() {
  const { user, isLoading, logoutMutation } = useAuth();
  const [, setLocation] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  
  // Handle scroll effect with enhanced animation
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
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
      <motion.header 
        initial={{ backdropFilter: "blur(5px)", backgroundColor: "rgba(10, 10, 10, 0.2)" }}
        animate={{ 
          backdropFilter: isScrolled ? "blur(15px)" : "blur(5px)",
          backgroundColor: isScrolled ? "rgba(10, 10, 10, 0.9)" : "rgba(10, 10, 10, 0.2)",
          boxShadow: isScrolled ? "0 4px 20px rgba(0, 0, 0, 0.2)" : "none",
          y: isScrolled ? 0 : 8,
          height: isScrolled ? "70px" : "80px"
        }}
        transition={{ duration: 0.3 }}
        className="sticky z-50 px-6 py-4 mx-4 my-2 flex items-center justify-between rounded-xl glass-header transition-all duration-300"
      >
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
                className="unified-button mx-1"
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
                  <motion.div 
                    style={{ right: '0', left: 'auto' }} 
                    className="profile-dropdown w-48 bg-popover border rounded-md shadow-md p-1 text-popover-foreground z-50 absolute top-full mt-2"
                    initial={{ opacity: 0, y: -5, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <button 
                      className="w-full flex items-center p-2 rounded hover:bg-[#006bd6]/10 hover:text-[#006bd6] text-sm transition-all duration-300"
                      onClick={() => { setLocation('/profile'); setIsMenuOpen(false); }}
                    >
                      <User className="ml-2 h-4 w-4" />
                      <span>پروفایل</span>
                    </button>
                    
                    <button 
                      className="w-full flex items-center p-2 rounded hover:bg-[#006bd6]/10 hover:text-[#006bd6] text-sm transition-all duration-300"
                      onClick={() => { setLocation('/profile?tab=favorites'); setIsMenuOpen(false); }}
                    >
                      <Heart className="ml-2 h-4 w-4" />
                      <span>علاقه‌مندی‌ها</span>
                    </button>
                    
                    <button 
                      className="w-full flex items-center p-2 rounded hover:bg-[#006bd6]/10 hover:text-[#006bd6] text-sm transition-all duration-300"
                      onClick={() => { setLocation('/profile?tab=playlists'); setIsMenuOpen(false); }}
                    >
                      <ListVideo className="ml-2 h-4 w-4" />
                      <span>پلی‌لیست‌ها</span>
                    </button>
                    
                    <button 
                      className="w-full flex items-center p-2 rounded hover:bg-[#006bd6]/10 hover:text-[#006bd6] text-sm transition-all duration-300"
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
                          className="w-full flex items-center p-2 rounded bg-[#006bd6]/10 text-[#006bd6] hover:bg-[#006bd6]/20 text-sm font-semibold transition-all duration-300"
                          onClick={() => { setLocation('/admin/dashboard'); setIsMenuOpen(false); }}
                        >
                          <ShieldAlert className="ml-2 h-4 w-4" />
                          <span>مدیر سیستم</span>
                        </button>
                      </>
                    )}
                    
                    <div className="h-px bg-muted my-1 -mx-1"></div>
                    <button 
                      className="w-full flex items-center p-2 rounded hover:bg-[#006bd6]/10 hover:text-[#006bd6] text-sm transition-all duration-300"
                      onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                      disabled={logoutMutation.isPending}
                    >
                      <LogOut className="ml-2 h-4 w-4" />
                      <span>خروج</span>
                      {logoutMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    </button>
                  </motion.div>
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
      </motion.header>

      {/* Mobile menu */}
      <MobileMenu 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
        navItems={navItems}
      />
    </>
  );
}