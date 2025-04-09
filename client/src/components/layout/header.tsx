import { useState, useRef } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  Search,
  Heart,
  Menu,
  Film,
  Home,
  PlayCircle,
  TrendingUp,
  Filter,
  UserCircle,
  Clock,
  List,
  Settings,
  LogOut,
  User,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NotificationsMenu } from "@/components/common/NotificationsMenu";
import { UserProfileMenu } from "@/components/common/UserProfileMenu";

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
    <header className="sticky top-0 z-[100] bg-dark-lighter/80 backdrop-blur-md border-b border-dark-border">
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

            {/* Notification Menu */}
            <div className="ml-2">
              <NotificationsMenu />
            </div>

            {/* Favorites Link */}
            {user && (
              <Link href="/profile?tab=favorites">
                <a className="p-2 glassmorphic-icon" aria-label="لیست علاقه‌مندی‌ها">
                  <Heart className="h-5 w-5 text-blue-500" />
                </a>
              </Link>
            )}

            {/* User Profile Menu - Using New Component */}
            <UserProfileMenu user={user ? {...user, id: String(user.id)} : null} />

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
