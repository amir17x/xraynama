import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { 
  Loader2, Menu, ChevronDown, User, Heart, ListVideo, Settings, LogOut, 
  Search, Film, Tv, Video, FileVideo, TrendingUp, Users
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { SearchBar } from '@/components/common/SearchBar';
import { MobileMenu } from './MobileMenu';

export function Header() {
  const { user, isLoading, logoutMutation } = useAuth();
  const [, setLocation] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const navItems = [
    { label: 'صفحه اصلی', href: '/', icon: <Film className="ml-2 h-5 w-5" /> },
    { label: 'فیلم‌ها', href: '/category/movie', icon: <Film className="ml-2 h-5 w-5" /> },
    { label: 'سریال‌ها', href: '/category/series', icon: <Tv className="ml-2 h-5 w-5" /> },
    { label: 'انیمیشن', href: '/category/animation', icon: <Video className="ml-2 h-5 w-5" /> },
    { label: 'مستند', href: '/category/documentary', icon: <FileVideo className="ml-2 h-5 w-5" /> },
    { label: 'برترین‌ها', href: '/top-imdb', icon: <TrendingUp className="ml-2 h-5 w-5" /> },
    { label: 'تماشای گروهی', href: '/watch-party', icon: <Users className="ml-2 h-5 w-5" /> },
  ];

  return (
    <>
      <header className={`glass-effect sticky top-0 z-50 px-4 py-3 flex items-center justify-between transition-shadow duration-300 ${isScrolled ? 'shadow-lg' : ''}`}>
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
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center focus:outline-none">
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
                  </DropdownMenuTrigger>
                  
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => setLocation('/profile')}>
                      <User className="mr-2 h-4 w-4" />
                      <span>پروفایل</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setLocation('/profile?tab=favorites')}>
                      <Heart className="mr-2 h-4 w-4" />
                      <span>علاقه‌مندی‌ها</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setLocation('/profile?tab=playlists')}>
                      <ListVideo className="mr-2 h-4 w-4" />
                      <span>پلی‌لیست‌ها</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setLocation('/profile?tab=settings')}>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>تنظیمات</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} disabled={logoutMutation.isPending}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>خروج</span>
                      {logoutMutation.isPending && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
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
