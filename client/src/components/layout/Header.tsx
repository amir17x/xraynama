import React, { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  Search,
  Bell,
  Menu as MenuIcon,
  X,
  Film,
  Tv,
  Video,
  BookOpen,
  CircleUser,
  DownloadCloud,
  Home,
  ChevronDown,
  Clock,
  Heart,
  LogOut,
  User,
  Shield,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";

export const Header: React.FC = () => {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [showMainMenu, setShowMainMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // کنترل وضعیت اسکرول
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // بستن منوها هنگام کلیک در خارج از آنها
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (showUserMenu || showNotifications || showMainMenu) {
        const target = e.target as HTMLElement;
        if (!target.closest(".menu-container")) {
          setShowUserMenu(false);
          setShowNotifications(false);
          setShowMainMenu(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showUserMenu, showNotifications, showMainMenu]);

  // پردازش جستجو
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
      setShowSearchBar(false);
    }
  };

  // خروج از حساب کاربری
  const handleLogout = () => {
    logoutMutation.mutate();
    setShowUserMenu(false);
  };

  // آیتم‌های منوی اصلی
  const menuItems = [
    { icon: <Home size={20} />, text: "خانه", href: "/" },
    { icon: <Film size={20} />, text: "فیلم‌ها", href: "/movies" },
    { icon: <Tv size={20} />, text: "سریال‌ها", href: "/series" },
    { icon: <Video size={20} />, text: "انیمیشن‌ها", href: "/animations" },
    { icon: <BookOpen size={20} />, text: "مستندها", href: "/documentaries" },
    { icon: <CircleUser size={20} />, text: "هنرمندان", href: "/artists" },
    { icon: <DownloadCloud size={20} />, text: "اپلیکیشن", href: "/app" },
  ];

  // اعلان‌های نمونه
  const notifications = [
    {
      id: 1,
      title: "پخش آنلاین",
      text: "جهت پخش مروگر Chrome را به آخرین نسخه آپدیت نمایید.",
      time: "2 ساعت پیش",
      isNew: true,
    },
    {
      id: 2,
      title: "پخش آنلاین",
      text: "پخش آنلاین تنها با مرورگر Chrome امکان پذیر است.",
      time: "2 روز پیش",
      isNew: false,
    },
    {
      id: 3,
      title: "انتقاد و پیشنهاد",
      text: "نظر، انتقاد و پیشنهادات خود را از طریق تیکت برای ما ارسال نمایید.",
      time: "1 هفته پیش",
      isNew: false,
    },
  ];

  return (
    <header 
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-300",
        isScrolled ? "py-1 bg-opacity-90" : "py-0"
      )}
    >
      {/* هدر اصلی */}
      <div className="w-full mx-auto">
        <div 
          className={cn(
            "w-full py-2",
            "bg-gradient-to-r from-blue-950 to-indigo-950 backdrop-blur-md",
            "border-b border-blue-800/30 shadow-lg",
            "transition-all duration-300 ease-in-out"
          )}
        >
          <div className="w-full max-w-7xl mx-auto px-4 md:px-6">
            <div className="flex items-center justify-between">
              {/* لوگو و جستجو */}
              <div className="flex items-center">
                {/* لوگو */}
                <div className="flex items-center mr-4">
                  <Link href="/">
                    <span className="text-[#00BFFF] text-2xl font-bold cursor-pointer">X<span className="text-white">raynama</span></span>
                  </Link>
                </div>

                {/* جستجو */}
                <div className="relative menu-container hidden md:block">
                  <form onSubmit={handleSearch} className="relative">
                    <Input
                      type="text"
                      placeholder="جستجو در فیلم‌ها و سریال‌ها..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-64 rounded-full border-blue-700/50 bg-blue-950 placeholder-gray-400 
                              text-white pl-10 pr-10 py-1 text-sm focus:border-blue-500"
                    />
                    <button
                      type="submit"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    >
                      <Search className="h-4 w-4" />
                    </button>
                  </form>
                </div>
              </div>

              {/* کنترل‌های کاربر */}
              <div className="flex items-center gap-1">
                {/* جستجو در موبایل */}
                <button 
                  onClick={() => setShowSearchBar(!showSearchBar)}
                  className="md:hidden p-2 hover:bg-blue-800/40 rounded-full"
                >
                  <Search className="w-5 h-5 text-gray-300" />
                </button>

                {/* اعلان‌ها */}
                <div className="relative menu-container">
                  <button 
                    onClick={() => {
                      setShowNotifications(!showNotifications);
                      setShowUserMenu(false);
                    }}
                    className="relative p-2 hover:bg-blue-800/40 rounded-full transition-colors"
                  >
                    <Bell className="h-5 w-5 text-gray-300" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full">
                      <span className="absolute inset-0 w-full h-full bg-red-500 rounded-full animate-ping opacity-75"></span>
                    </span>
                  </button>

                  {/* منوی اعلان‌ها */}
                  {showNotifications && (
                    <div className="absolute left-0 top-full mt-2 w-80 bg-gradient-to-b from-blue-900/95 to-blue-950/95 backdrop-blur-md rounded-lg overflow-hidden shadow-xl border border-blue-700/40 z-[100]">
                      {/* هدر منوی اعلان‌ها */}
                      <div className="p-3 border-b border-blue-700/20 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Bell className="w-4 h-4 text-blue-400" />
                          <span className="font-medium text-sm text-white">اعلانات</span>
                        </div>
                        <span className="px-2 py-0.5 text-xs bg-red-500/20 text-red-400 rounded-full">
                          جدید
                        </span>
                      </div>
                      
                      {/* لیست اعلان‌ها */}
                      <div className="max-h-[300px] overflow-y-auto p-2 space-y-1">
                        {notifications.map((notification) => (
                          <div 
                            key={notification.id}
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
                                  <span className="mr-1.5 px-1 py-0.5 text-[9px] bg-red-500/20 text-red-400 rounded-full">
                                    جدید
                                  </span>
                                )}
                              </h4>
                            </div>
                            <p className="mt-1 text-xs text-gray-300">{notification.text}</p>
                            <div className="mt-1 text-[10px] text-gray-400 flex items-center">
                              <Clock className="w-3 h-3 ml-1" />
                              {notification.time}
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {/* فوتر منوی اعلان‌ها */}
                      <div className="p-2 border-t border-blue-700/20 text-center">
                        <button className="text-xs text-blue-400 hover:text-blue-300">
                          مشاهده همه اعلانات
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* پروفایل کاربر/ورود */}
                <div className="relative menu-container">
                  {user ? (
                    <>
                      <button 
                        onClick={() => {
                          setShowUserMenu(!showUserMenu);
                          setShowNotifications(false);
                        }}
                        className="flex items-center gap-1.5 p-1 px-1.5 rounded-full hover:bg-blue-800/40 transition-colors"
                      >
                        <Avatar className="w-7 h-7 border border-blue-400/30">
                          <AvatarImage src={user.avatar || undefined} />
                          <AvatarFallback className="bg-blue-800 text-blue-100 text-xs">
                            {user.name?.charAt(0) || user.username.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="hidden sm:inline text-sm text-white font-medium">
                          {user.name || user.username}
                        </span>
                        <ChevronDown className="w-4 h-4 text-gray-400 hidden sm:inline" />
                      </button>

                      {/* منوی کاربر */}
                      {showUserMenu && (
                        <div className="absolute left-0 sm:right-0 top-full mt-2 w-64 bg-gradient-to-b from-blue-900/95 to-blue-950/95 backdrop-blur-md rounded-lg overflow-hidden shadow-xl border border-blue-700/40 z-[100]">
                          {/* هدر منوی کاربر */}
                          <div className="p-3 border-b border-blue-700/20">
                            <div className="flex items-center gap-3">
                              <Avatar className="w-10 h-10 border-2 border-blue-500/30 shadow-md">
                                <AvatarImage src={user.avatar || undefined} />
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

                          {/* آیتم‌های منوی کاربر */}
                          <div className="p-1.5">
                            <div>
                              <Link href="/profile">
                                <div className="flex items-center gap-2 p-2 hover:bg-blue-800/30 rounded-md text-sm text-gray-200 hover:text-white cursor-pointer">
                                  <User size={16} className="text-blue-400" />
                                  <span>پروفایل</span>
                                </div>
                              </Link>
                            </div>
                            <div>
                              <Link href="/profile?tab=favorites">
                                <div className="flex items-center gap-2 p-2 hover:bg-blue-800/30 rounded-md text-sm text-gray-200 hover:text-white cursor-pointer">
                                  <Heart size={16} className="text-blue-400" />
                                  <span>علاقه‌مندی‌ها</span>
                                </div>
                              </Link>
                            </div>
                            <div>
                              <Link href="/profile?tab=history">
                                <div className="flex items-center gap-2 p-2 hover:bg-blue-800/30 rounded-md text-sm text-gray-200 hover:text-white cursor-pointer">
                                  <Clock size={16} className="text-blue-400" />
                                  <span>تاریخچه تماشا</span>
                                </div>
                              </Link>
                            </div>
                            <div>
                              <Link href="/profile?tab=settings">
                                <div className="flex items-center gap-2 p-2 hover:bg-blue-800/30 rounded-md text-sm text-gray-200 hover:text-white cursor-pointer">
                                  <Settings size={16} className="text-blue-400" />
                                  <span>تنظیمات</span>
                                </div>
                              </Link>
                            </div>

                            <div className="h-px my-1 bg-blue-700/20" />

                            {user.role === "admin" && (
                              <>
                                <div>
                                  <Link href="/admin">
                                    <div className="flex items-center gap-2 p-2 hover:bg-blue-800/30 rounded-md text-sm text-green-400 hover:text-green-300 cursor-pointer">
                                      <Shield size={16} className="text-green-400" />
                                      <span>پنل مدیریت</span>
                                    </div>
                                  </Link>
                                </div>
                                <div className="h-px my-1 bg-blue-700/20" />
                              </>
                            )}
                            
                            <button 
                              onClick={handleLogout}
                              className="w-full flex items-center gap-2 p-2 hover:bg-red-900/20 rounded-md text-sm text-red-400 hover:text-red-300"
                            >
                              <LogOut size={16} className="text-red-400" />
                              <span>خروج</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div>
                      <Link href="/auth/login">
                        <Button 
                          className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 
                                    text-white border-0 shadow-md hover:shadow-lg transition-all"
                          size="sm"
                        >
                          ورود / ثبت‌نام
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>

                {/* دکمه منوی موبایل */}
                <button 
                  onClick={() => setShowMainMenu(!showMainMenu)}
                  className="md:hidden p-2 rounded-full hover:bg-blue-800/40 transition-colors"
                >
                  {showMainMenu ? (
                    <X className="h-5 w-5 text-gray-300" />
                  ) : (
                    <MenuIcon className="h-5 w-5 text-gray-300" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* منوی ناوبری ثابت */}
        <div className="w-full bg-gradient-to-r from-blue-900 to-indigo-900 shadow-md border-b border-blue-800/30 py-1 hidden md:block">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <nav className="flex justify-center">
              <ul className="flex items-center justify-between space-x-2 space-x-reverse">
                {menuItems.map((item, idx) => (
                  <li key={idx}>
                    <Link href={item.href}>
                      <div 
                        className={cn(
                          "flex flex-col items-center gap-1 px-4 py-1 rounded-lg transition-colors cursor-pointer",
                          location === item.href 
                            ? "text-blue-300" 
                            : "text-gray-200 hover:text-blue-300"
                        )}
                      >
                        {item.icon}
                        <span className="text-xs font-medium">{item.text}</span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      </div>

      {/* منوی جستجوی موبایل */}
      {showSearchBar && (
        <div className="absolute top-full left-0 right-0 p-4 bg-gradient-to-b from-blue-900/95 to-blue-950/95 backdrop-blur-md border-b border-blue-800/40 z-[100] md:hidden">
          <form onSubmit={handleSearch} className="relative">
            <Input
              type="text"
              placeholder="جستجو در فیلم‌ها و سریال‌ها..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full border-blue-700/50 bg-blue-950/70 placeholder-gray-400 
                        text-white pl-10 pr-10 py-2 text-sm focus:border-blue-500"
              autoFocus
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
            >
              <Search className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}

      {/* منوی موبایل */}
      {showMainMenu && (
        <div className="absolute top-full left-0 right-0 z-40 bg-gradient-to-b from-blue-900/95 to-blue-950/95 backdrop-blur-sm border-b border-blue-800/40 shadow-lg md:hidden">
          <div className="container mx-auto px-4 py-3 max-h-[calc(100vh-80px)] overflow-y-auto">
            <nav className="flex flex-col space-y-1">
              {menuItems.map((item, idx) => (
                <div key={idx}>
                  <Link href={item.href}>
                    <div 
                      className={cn(
                        "flex items-center gap-2 px-3 py-2.5 rounded-lg transition-colors cursor-pointer",
                        location === item.href 
                          ? "bg-blue-800/50 text-white font-medium" 
                          : "text-gray-200 hover:bg-blue-800/30 hover:text-white"
                      )}
                      onClick={() => setShowMainMenu(false)}
                    >
                      {item.icon}
                      <span>{item.text}</span>
                    </div>
                  </Link>
                </div>
              ))}
            </nav>
            
            {user && (
              <div className="mt-4 pt-3 border-t border-blue-800/30 flex space-x-2 space-x-reverse">
                <div>
                  <Link href="/profile?tab=favorites">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm bg-blue-900/40 text-gray-200 hover:bg-blue-800/60 cursor-pointer">
                      <Heart size={16} className="text-blue-400" />
                      <span>علاقه‌مندی‌ها</span>
                    </div>
                  </Link>
                </div>
                <div>
                  <Link href="/profile?tab=history">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm bg-blue-900/40 text-gray-200 hover:bg-blue-800/60 cursor-pointer">
                      <Clock size={16} className="text-blue-400" />
                      <span>تاریخچه تماشا</span>
                    </div>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};