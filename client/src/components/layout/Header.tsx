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
        "fixed top-0 inset-x-0 z-50 transition-all duration-300 px-4",
        isScrolled ? "bg-opacity-90" : ""
      )}
    >
      {/* هدر اصلی */}
      <div className="w-full mx-auto flex flex-col max-w-[1600px]">
        <div 
          className={cn(
            "w-full py-2",
            "bg-[#00142c]/80 backdrop-blur-lg",
            "border-[#00BFFF]/20 border-b-0 shadow-[0_0_25px_rgba(0,191,255,0.15)]",
            "transition-all duration-300 ease-in-out",
            "rounded-t-xl"
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
                      className="w-64 rounded-full border-[#00BFFF]/30 bg-[#001c3d]/50 placeholder-gray-400
                              text-white pl-10 pr-10 py-1 text-sm focus:border-[#00BFFF] focus:ring-[#00BFFF]/20"
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
                  className="md:hidden p-2 hover:bg-[#001c3d]/70 rounded-full transition-colors"
                >
                  <Search className="w-5 h-5 text-[#CCDDEE]" />
                </button>

                {/* اعلان‌ها */}
                <div className="relative menu-container">
                  <button 
                    onClick={() => {
                      setShowNotifications(!showNotifications);
                      setShowUserMenu(false);
                    }}
                    className="relative p-2 hover:bg-[#001c3d]/70 rounded-full transition-colors"
                  >
                    <Bell className="h-5 w-5 text-[#CCDDEE]" />
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
                        className="flex items-center gap-1.5 p-1 px-1.5 rounded-full hover:bg-[#001c3d]/70 transition-colors"
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
                        <ChevronDown className="w-4 h-4 text-[#AABBCC] hidden sm:inline" />
                      </button>

                      {/* منوی کاربر */}
                      {showUserMenu && (
                        <div className="absolute left-0 sm:right-0 top-full mt-2 w-64 bg-[#00142c]/80 backdrop-blur-lg rounded-xl overflow-hidden shadow-[0_4px_25px_rgba(0,191,255,0.15)] border border-[#00BFFF]/20 z-[150] animate-in fade-in slide-in-from-top-5 duration-300">
                          {/* هدر منوی کاربر */}
                          <div className="p-4 border-b border-[#00BFFF]/10 relative">
                            {/* نوار تزئینی بالای کارت */}
                            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#00BFFF]/30 to-transparent"></div>
                            
                            <div className="flex items-center gap-3">
                              <Avatar className="w-12 h-12 border-2 border-[#00BFFF]/30 shadow-[0_0_10px_rgba(0,191,255,0.2)]">
                                <AvatarImage src={user.avatar || undefined} />
                                <AvatarFallback className="bg-[#001c3d] text-[#00BFFF]">
                                  {user.name?.charAt(0) || user.username.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-bold text-white text-base">{user.name || user.username}</div>
                                <div className="text-xs text-[#AABBCC]">@{user.username}</div>
                              </div>
                            </div>
                          </div>

                          {/* افکت‌های داخلی منو */}
                          <div className="absolute left-[15%] top-[40%] w-24 h-24 bg-[#00BFFF]/5 rounded-full blur-3xl pointer-events-none opacity-70"></div>
                          <div className="absolute right-[10%] bottom-[20%] w-20 h-20 bg-[#00BFFF]/5 rounded-full blur-3xl pointer-events-none opacity-70"></div>

                          {/* آیتم‌های منوی کاربر */}
                          <div className="p-2 relative z-10">
                            <div className="mb-1">
                              <Link href="/profile">
                                <div className="flex items-center gap-2.5 p-2.5 hover:bg-[#001c3d]/70 rounded-lg text-sm text-[#CCDDEE] hover:text-white cursor-pointer transition-all duration-300 group">
                                  <div className="bg-[#001c3d] p-2 rounded-lg group-hover:bg-[#00BFFF]/20 transition-all duration-300">
                                    <User size={18} className="text-[#00BFFF]" />
                                  </div>
                                  <span>پروفایل</span>
                                </div>
                              </Link>
                            </div>

                            <div className="mb-1">
                              <Link href="/profile?tab=favorites">
                                <div className="flex items-center gap-2.5 p-2.5 hover:bg-[#001c3d]/70 rounded-lg text-sm text-[#CCDDEE] hover:text-white cursor-pointer transition-all duration-300 group">
                                  <div className="bg-[#001c3d] p-2 rounded-lg group-hover:bg-[#00BFFF]/20 transition-all duration-300">
                                    <Heart size={18} className="text-[#00BFFF]" />
                                  </div>
                                  <span>علاقه‌مندی‌ها</span>
                                </div>
                              </Link>
                            </div>

                            <div className="mb-1">
                              <Link href="/profile?tab=history">
                                <div className="flex items-center gap-2.5 p-2.5 hover:bg-[#001c3d]/70 rounded-lg text-sm text-[#CCDDEE] hover:text-white cursor-pointer transition-all duration-300 group">
                                  <div className="bg-[#001c3d] p-2 rounded-lg group-hover:bg-[#00BFFF]/20 transition-all duration-300">
                                    <Clock size={18} className="text-[#00BFFF]" />
                                  </div>
                                  <span>تاریخچه تماشا</span>
                                </div>
                              </Link>
                            </div>

                            <div className="mb-1">
                              <Link href="/profile?tab=settings">
                                <div className="flex items-center gap-2.5 p-2.5 hover:bg-[#001c3d]/70 rounded-lg text-sm text-[#CCDDEE] hover:text-white cursor-pointer transition-all duration-300 group">
                                  <div className="bg-[#001c3d] p-2 rounded-lg group-hover:bg-[#00BFFF]/20 transition-all duration-300">
                                    <Settings size={18} className="text-[#00BFFF]" />
                                  </div>
                                  <span>تنظیمات</span>
                                </div>
                              </Link>
                            </div>

                            <div className="h-px my-2 bg-gradient-to-r from-transparent via-[#00BFFF]/20 to-transparent" />

                            {user.role === "admin" && (
                              <>
                                <div className="mb-1">
                                  <Link href="/admin">
                                    <div className="flex items-center gap-2.5 p-2.5 hover:bg-[#001c3d]/70 rounded-lg text-sm text-[#4ADE80] hover:text-white cursor-pointer transition-all duration-300 group">
                                      <div className="bg-[#001c3d] p-2 rounded-lg group-hover:bg-[#4ADE80]/20 transition-all duration-300">
                                        <Shield size={18} className="text-[#4ADE80]" />
                                      </div>
                                      <span>پنل مدیریت</span>
                                    </div>
                                  </Link>
                                </div>
                                <div className="h-px my-2 bg-gradient-to-r from-transparent via-[#00BFFF]/20 to-transparent" />
                              </>
                            )}
                            
                            <button 
                              onClick={handleLogout}
                              className="w-full flex items-center gap-2.5 p-2.5 hover:bg-[#300]/20 rounded-lg text-sm text-[#FF5757] hover:text-white cursor-pointer transition-all duration-300 group"
                            >
                              <div className="bg-[#001c3d] p-2 rounded-lg group-hover:bg-[#FF5757]/20 transition-all duration-300">
                                <LogOut size={18} className="text-[#FF5757]" />
                              </div>
                              <span>خروج</span>
                            </button>
                          </div>
                          
                          {/* خط تزئینی پایین کارت */}
                          <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#00BFFF]/30 to-transparent"></div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div>
                      <Link href="/auth/login">
                        <Button 
                          className="bg-gradient-to-r from-[#006BFF] to-[#00BFFF] hover:from-[#00BFFF] hover:to-[#006BFF] 
                                   text-white border border-[#00BFFF]/20 shadow-[0_0_15px_rgba(0,191,255,0.2)] 
                                   hover:shadow-[0_0_20px_rgba(0,191,255,0.4)] transform hover:scale-[1.02] 
                                   transition-all duration-300 relative overflow-hidden group"
                          size="sm"
                        >
                          <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-[#00BFFF]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                          <span className="relative z-10">ورود / ثبت‌نام</span>
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>

                {/* دکمه منوی موبایل */}
                <button 
                  onClick={() => setShowMainMenu(!showMainMenu)}
                  className="md:hidden p-2 rounded-full hover:bg-[#001c3d]/70 transition-colors"
                >
                  {showMainMenu ? (
                    <X className="h-5 w-5 text-[#CCDDEE]" />
                  ) : (
                    <MenuIcon className="h-5 w-5 text-[#CCDDEE]" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* منوی ناوبری ثابت */}
        <div className="w-full bg-[#00142c]/80 backdrop-blur-lg shadow-[0_4px_25px_rgba(0,191,255,0.15)] border-b border-[#00BFFF]/20 py-1.5 hidden md:block -mt-[1px] rounded-b-xl">
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
                            ? "text-[#00BFFF]" 
                            : "text-gray-200 hover:text-[#00BFFF]"
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
        <div className="absolute top-full left-0 right-0 p-4 bg-[#00142c]/90 backdrop-blur-lg border-b border-[#00BFFF]/20 shadow-[0_4px_25px_rgba(0,191,255,0.15)] z-[100] md:hidden animate-in fade-in slide-in-from-top-5 duration-200">
          <div className="relative">
            {/* افکت‌های داخلی منو */}
            <div className="absolute left-1/4 top-1/2 w-24 h-24 bg-[#00BFFF]/5 rounded-full blur-3xl pointer-events-none opacity-70"></div>
            <div className="absolute right-1/4 top-1/2 w-20 h-20 bg-[#00BFFF]/5 rounded-full blur-3xl pointer-events-none opacity-70"></div>
            
            {/* نوار تزئینی بالای منو */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#00BFFF]/30 to-transparent"></div>
            
            <form onSubmit={handleSearch} className="relative z-10">
              <Input
                type="text"
                placeholder="جستجو در فیلم‌ها و سریال‌ها..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-full border-[#00BFFF]/30 bg-[#001c3d]/50 placeholder-[#AABBCC]
                          text-white pl-10 pr-10 py-2.5 text-sm focus:border-[#00BFFF] focus:ring-[#00BFFF]/20
                          shadow-[0_0_15px_rgba(0,191,255,0.1)] transition-all duration-300 focus:shadow-[0_0_20px_rgba(0,191,255,0.2)]"
                autoFocus
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#AABBCC] hover:text-[#00BFFF] transition-colors duration-300"
              >
                <Search className="h-4 w-4" />
              </button>
              
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowSearchBar(false)}
                  className="p-1 rounded-full bg-[#001c3d]/70 text-[#AABBCC] hover:text-[#00BFFF] hover:bg-[#001c3d] transition-all duration-300"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </form>
            
            {/* نوار تزئینی پایین منو */}
            <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#00BFFF]/30 to-transparent"></div>
          </div>
        </div>
      )}

      {/* منوی موبایل */}
      {showMainMenu && (
        <div className="absolute top-full left-0 right-0 z-40 bg-[#00142c]/90 backdrop-blur-lg border-b border-[#00BFFF]/20 shadow-[0_4px_25px_rgba(0,191,255,0.15)] md:hidden animate-in fade-in slide-in-from-top-5 duration-200">
          <div className="container mx-auto px-4 py-3 max-h-[calc(100vh-80px)] overflow-y-auto relative">
            {/* افکت‌های داخلی منو */}
            <div className="absolute left-[10%] top-[20%] w-32 h-32 bg-[#00BFFF]/5 rounded-full blur-3xl pointer-events-none opacity-70"></div>
            <div className="absolute right-[15%] bottom-[15%] w-32 h-32 bg-[#00BFFF]/5 rounded-full blur-3xl pointer-events-none opacity-70"></div>
            
            {/* نوار تزئینی بالای منو */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#00BFFF]/30 to-transparent"></div>
            
            <nav className="flex flex-col space-y-1.5 relative z-10">
              {menuItems.map((item, idx) => (
                <div key={idx}>
                  <Link href={item.href}>
                    <div 
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg transition-all duration-300 cursor-pointer",
                        location === item.href 
                          ? "bg-[#001c3d]/70 text-[#00BFFF] font-medium shadow-[0_0_10px_rgba(0,191,255,0.1)]" 
                          : "text-[#CCDDEE] hover:bg-[#001c3d]/50 hover:text-white"
                      )}
                      onClick={() => setShowMainMenu(false)}
                    >
                      <div className={cn(
                        "p-2 rounded-lg transition-all duration-300",
                        location === item.href 
                          ? "bg-[#00BFFF]/10" 
                          : "bg-[#001c3d]"
                      )}>
                        {React.cloneElement(item.icon, { 
                          size: 20,
                          className: cn(
                            "transition-colors duration-300",
                            location === item.href 
                              ? "text-[#00BFFF]" 
                              : "text-[#00BFFF]/80"
                          )
                        })}
                      </div>
                      <span>{item.text}</span>
                    </div>
                  </Link>
                </div>
              ))}
            </nav>
            
            {user && (
              <div className="mt-4 pt-4 relative z-10">
                {/* خط تزئینی جداکننده */}
                <div className="h-px mb-3 bg-gradient-to-r from-transparent via-[#00BFFF]/20 to-transparent"></div>
                
                <div className="grid grid-cols-2 gap-2">
                  <Link href="/profile?tab=favorites">
                    <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm bg-[#001c3d]/40 text-[#CCDDEE] hover:bg-[#001c3d]/70 hover:text-white cursor-pointer transition-all duration-300 border border-[#00BFFF]/10 shadow-[0_2px_10px_rgba(0,191,255,0.05)]">
                      <Heart size={16} className="text-[#00BFFF]" />
                      <span>علاقه‌مندی‌ها</span>
                    </div>
                  </Link>
                  
                  <Link href="/profile?tab=history">
                    <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm bg-[#001c3d]/40 text-[#CCDDEE] hover:bg-[#001c3d]/70 hover:text-white cursor-pointer transition-all duration-300 border border-[#00BFFF]/10 shadow-[0_2px_10px_rgba(0,191,255,0.05)]">
                      <Clock size={16} className="text-[#00BFFF]" />
                      <span>تاریخچه تماشا</span>
                    </div>
                  </Link>
                </div>
              </div>
            )}
            
            {/* نوار تزئینی پایین منو */}
            <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#00BFFF]/30 to-transparent"></div>
          </div>
        </div>
      )}
    </header>
  );
};