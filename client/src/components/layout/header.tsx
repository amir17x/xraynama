import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Heart,
  User,
  Menu,
  LogOut,
  UserCircle,
  Clock,
  List,
  Film,
  Home,
  PlayCircle,
  TrendingUp,
  Calendar,
  Globe,
  Flag,
  Users,
  Star,
  Filter,
  Info,
  Tag,
  Award,
  FileText,
  Settings,
} from "lucide-react";
import { Input } from "@/components/ui/input";

const Header = () => {
  const [location, navigate] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownMenuRef = useRef<HTMLDivElement>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setShowMobileSearch(false);
    }
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <header className="sticky top-0 z-50 bg-dark-lighter/80 backdrop-blur-md border-b border-dark-border">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 space-x-reverse relative z-10">
            <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center text-white font-bold text-lg">
              X
            </div>
            <h1 className="text-lg md:text-xl font-bold text-white">Xraynama</h1>
          </Link>

          {/* Main Navigation - Desktop */}
          <nav className="hidden md:flex items-center space-x-1 space-x-reverse relative z-10">
            <Link href="/">
              <a className="px-3 py-2 rounded-md text-sm font-medium text-white hover:bg-dark-card transition duration-200">
                خانه
              </a>
            </Link>
            <Link href="/category/animation">
              <a className="px-3 py-2 rounded-md text-sm font-medium text-white hover:bg-dark-card transition duration-200">
                انیمیشن
              </a>
            </Link>
            <Link href="/category/movie">
              <a className="px-3 py-2 rounded-md text-sm font-medium text-white hover:bg-dark-card transition duration-200">
                فیلم
              </a>
            </Link>
            <Link href="/category/series">
              <a className="px-3 py-2 rounded-md text-sm font-medium text-white hover:bg-dark-card transition duration-200">
                سریال
              </a>
            </Link>
            <Link href="/category/documentary">
              <a className="px-3 py-2 rounded-md text-sm font-medium text-white hover:bg-dark-card transition duration-200">
                مستند
              </a>
            </Link>
          </nav>

          {/* Search Bar - Desktop */}
          <form 
            onSubmit={handleSearch}
            className="hidden md:flex items-center flex-1 mx-4 max-w-xl relative z-10"
          >
            <Input
              type="text"
              placeholder="جستجو..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-dark rounded-lg border border-dark-border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-sm placeholder-text-secondary"
            />
            <button 
              type="submit" 
              className="absolute left-2 text-text-secondary"
              aria-label="جستجو"
            >
              <Search className="h-5 w-5" />
            </button>
            <Link href="/search">
              <a className="absolute right-2 text-text-secondary" aria-label="جستجوی پیشرفته">
                <Filter className="h-5 w-5" />
              </a>
            </Link>
          </form>

          {/* User Actions */}
          <div className="flex items-center space-x-3 space-x-reverse relative z-10">
            {/* Mobile Search Button */}
            <button
              className="md:hidden text-white p-2 glassmorphic-icon"
              aria-label="جستجو"
              onClick={() => setShowMobileSearch(!showMobileSearch)}
            >
              <Search className="h-5 w-5 text-blue-500" />
            </button>

            {/* Favorites Link */}
            {user && (
              <Link href="/profile?tab=favorites">
                <a className="p-2 glassmorphic-icon" aria-label="لیست علاقه‌مندی‌ها">
                  <Heart className="h-5 w-5 text-blue-500" />
                </a>
              </Link>
            )}

            {/* User Menu / Auth Button */}
            {user ? (
              <div className="relative" ref={dropdownMenuRef}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative z-50 text-white hover:text-blue-400 glassmorphic-icon">
                      <UserCircle className="h-6 w-6" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="min-w-[200px] bg-dark-card border border-blue-900/50 backdrop-blur-lg z-40 rounded-lg shadow-xl">
                    <div className="p-3 flex items-center border-b border-blue-900/30">
                      <div className="w-10 h-10 bg-blue-900/40 rounded-full flex items-center justify-center mr-3">
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.name || user.username} className="w-full h-full rounded-full object-cover" />
                        ) : (
                          <UserCircle className="h-6 w-6 text-blue-500" />
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white">
                          {user.name || user.username}
                        </div>
                        <div className="text-xs text-gray-400">@{user.username}</div>
                      </div>
                    </div>
                    <div className="p-2">
                      <DropdownMenuItem asChild className="rounded-md my-1 hover:bg-blue-900/20 focus:bg-blue-900/20">
                        <Link href="/profile" className="cursor-pointer">
                          <a className="flex items-center py-1 px-2">
                            <User className="ml-2 h-4 w-4 text-blue-500" />
                            <span>پروفایل</span>
                          </a>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="rounded-md my-1 hover:bg-blue-900/20 focus:bg-blue-900/20">
                        <Link href="/profile?tab=favorites" className="cursor-pointer">
                          <a className="flex items-center py-1 px-2">
                            <Heart className="ml-2 h-4 w-4 text-blue-500" />
                            <span>علاقه‌مندی‌ها</span>
                          </a>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="rounded-md my-1 hover:bg-blue-900/20 focus:bg-blue-900/20">
                        <Link href="/profile?tab=playlists" className="cursor-pointer">
                          <a className="flex items-center py-1 px-2">
                            <List className="ml-2 h-4 w-4 text-blue-500" />
                            <span>پلی‌لیست‌ها</span>
                          </a>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="rounded-md my-1 hover:bg-blue-900/20 focus:bg-blue-900/20">
                        <Link href="/profile?tab=history" className="cursor-pointer">
                          <a className="flex items-center py-1 px-2">
                            <Clock className="ml-2 h-4 w-4 text-blue-500" />
                            <span>تاریخچه تماشا</span>
                          </a>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="rounded-md my-1 hover:bg-blue-900/20 focus:bg-blue-900/20">
                        <Link href="/profile?tab=settings" className="cursor-pointer">
                          <a className="flex items-center py-1 px-2">
                            <Settings className="ml-2 h-4 w-4 text-blue-500" />
                            <span>تنظیمات</span>
                          </a>
                        </Link>
                      </DropdownMenuItem>
                    </div>
                    <DropdownMenuSeparator className="bg-blue-900/30 mx-2" />
                    <div className="p-2">
                      <DropdownMenuItem onClick={handleLogout} className="cursor-pointer rounded-md hover:bg-red-900/20 focus:bg-red-900/20 py-1 px-2">
                        <LogOut className="ml-2 h-4 w-4 text-red-500" />
                        <span className="text-red-400">خروج</span>
                      </DropdownMenuItem>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <Button asChild variant="default" size="sm" className="bg-blue-700 hover:bg-blue-600 text-white">
                <Link href="/auth/login">ورود / ثبت‌نام</Link>
              </Button>
            )}

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 glassmorphic-icon"
              aria-label="منو"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
            >
              <Menu className="h-5 w-5 text-blue-500" />
            </button>
          </div>
        </div>

        {/* Mobile Search (Hidden by default) */}
        {showMobileSearch && (
          <div className="md:hidden px-4 py-2 bg-dark animate-fade-in">
            <form onSubmit={handleSearch} className="relative">
              <Input
                type="text"
                placeholder="جستجو..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-dark-lighter rounded-lg border border-dark-border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />
              <button
                type="submit"
                className="absolute left-2 top-2 text-text-secondary"
                aria-label="جستجو"
              >
                <Search className="h-5 w-5" />
              </button>
            </form>
          </div>
        )}

        {/* Mobile Menu (Hidden by default) */}
        {showMobileMenu && (
          <div className="md:hidden bg-dark-lighter border-t border-dark-border animate-fade-in">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link href="/">
                <a className="flex items-center px-3 py-2 rounded-md text-base font-medium text-white hover:bg-dark-card">
                  <Home className="ml-2 h-5 w-5" />
                  <span>خانه</span>
                </a>
              </Link>
              <Link href="/category/animation">
                <a className="flex items-center px-3 py-2 rounded-md text-base font-medium text-white hover:bg-dark-card">
                  <Film className="ml-2 h-5 w-5" />
                  <span>انیمیشن</span>
                </a>
              </Link>
              <Link href="/category/movie">
                <a className="flex items-center px-3 py-2 rounded-md text-base font-medium text-white hover:bg-dark-card">
                  <Film className="ml-2 h-5 w-5" />
                  <span>فیلم</span>
                </a>
              </Link>
              <Link href="/category/series">
                <a className="flex items-center px-3 py-2 rounded-md text-base font-medium text-white hover:bg-dark-card">
                  <PlayCircle className="ml-2 h-5 w-5" />
                  <span>سریال</span>
                </a>
              </Link>
              <Link href="/category/documentary">
                <a className="flex items-center px-3 py-2 rounded-md text-base font-medium text-white hover:bg-dark-card">
                  <Film className="ml-2 h-5 w-5" />
                  <span>مستند</span>
                </a>
              </Link>
              <Link href="/search">
                <a className="flex items-center px-3 py-2 rounded-md text-base font-medium text-white hover:bg-dark-card">
                  <Search className="ml-2 h-5 w-5" />
                  <span>جستجوی پیشرفته</span>
                </a>
              </Link>
              <Link href="/leaderboard">
                <a className="flex items-center px-3 py-2 rounded-md text-base font-medium text-white hover:bg-dark-card">
                  <TrendingUp className="ml-2 h-5 w-5" />
                  <span>برترین کاربران</span>
                </a>
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
