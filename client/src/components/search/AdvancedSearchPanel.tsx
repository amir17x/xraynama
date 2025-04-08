import React, { useState } from 'react';
import { Search, Filter, Film, Tv, Star, Flag, Users, Video, Mic, Globe, SortDesc, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { PortalContextMenu } from '@/components/common/PortalContextMenu';

// تعریف ژانرها با آیکون‌ها
const genres = [
  { id: 'action', name: 'اکشن', icon: '💥' },
  { id: 'comedy', name: 'کمدی', icon: '😂' },
  { id: 'drama', name: 'درام', icon: '🎭' },
  { id: 'horror', name: 'ترسناک', icon: '👻' },
  { id: 'romance', name: 'عاشقانه', icon: '❤️' },
  { id: 'sci-fi', name: 'علمی تخیلی', icon: '🚀' },
  { id: 'fantasy', name: 'فانتزی', icon: '🧙‍♂️' },
  { id: 'animation', name: 'انیمیشن', icon: '🧸' },
  { id: 'documentary', name: 'مستند', icon: '📹' },
  { id: 'thriller', name: 'هیجانی', icon: '😱' },
];

// تعریف کشورها با پرچم‌ها
const countries = [
  { id: 'us', name: 'آمریکا', flag: '🇺🇸' },
  { id: 'uk', name: 'انگلستان', flag: '🇬🇧' },
  { id: 'fr', name: 'فرانسه', flag: '🇫🇷' },
  { id: 'kr', name: 'کره جنوبی', flag: '🇰🇷' },
  { id: 'jp', name: 'ژاپن', flag: '🇯🇵' },
  { id: 'cn', name: 'چین', flag: '🇨🇳' },
  { id: 'in', name: 'هند', flag: '🇮🇳' },
  { id: 'ir', name: 'ایران', flag: '🇮🇷' },
  { id: 'de', name: 'آلمان', flag: '🇩🇪' },
  { id: 'it', name: 'ایتالیا', flag: '🇮🇹' },
];

// تعریف رده‌های سنی
const ageRatings = [
  { id: 'g', name: 'همه سنین', badge: 'G' },
  { id: 'pg', name: 'راهنمایی والدین', badge: 'PG' },
  { id: 'pg13', name: 'بالای ۱۳ سال', badge: 'PG-13' },
  { id: 'r', name: 'بالای ۱۷ سال', badge: 'R' },
  { id: 'nc17', name: 'بزرگسالان', badge: 'NC-17' },
];

// کیفیت‌های ویدیو
const qualities = [
  { id: '720p', name: '720p' },
  { id: '1080p', name: '1080p' },
  { id: '2k', name: '2K' },
  { id: '4k', name: '4K' },
  { id: '8k', name: '8K' },
];

// گزینه‌های مرتب‌سازی
const sortOptions = [
  { id: 'newest', name: 'جدیدترین' },
  { id: 'oldest', name: 'قدیمی‌ترین' },
  { id: 'rating', name: 'امتیاز' },
  { id: 'popularity', name: 'محبوبیت' },
];

interface AdvancedSearchPanelProps {
  className?: string;
  onSearch?: (searchParams: any) => void;
}

/**
 * پنل جستجوی پیشرفته با طراحی گلس‌مورفیسم
 * دارای فیلترهای متنوع برای جستجوی دقیق محتوا
 */
const AdvancedSearchPanel: React.FC<AdvancedSearchPanelProps> = ({ className, onSearch }) => {
  // حالت جستجو: فیلم یا سریال
  const [searchMode, setSearchMode] = useState<'movie' | 'series'>('movie');
  
  // مقادیر فیلترها
  const [yearRange, setYearRange] = useState<[number, number]>([1980, 2025]);
  const [ratingRange, setRatingRange] = useState<[number, number]>([1, 10]);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedQuality, setSelectedQuality] = useState<string | null>(null);
  const [selectedAgeRating, setSelectedAgeRating] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [actorName, setActorName] = useState<string>('');
  const [directorName, setDirectorName] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('newest');
  
  // گزینه‌های پخش
  const [isDubbed, setIsDubbed] = useState<boolean>(false);
  const [hasSubtitle, setHasSubtitle] = useState<boolean>(false);
  const [isCensored, setIsCensored] = useState<boolean>(false);
  const [hasOnlineStream, setHasOnlineStream] = useState<boolean>(true);
  
  // نمایش فیلترهای پیشرفته
  const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(false);
  
  // انیمیشن اسکن تصادفی
  const [isScanning, setIsScanning] = useState<boolean>(false);
  
  // اجرای جستجو
  const handleSearch = () => {
    setIsScanning(true);
    
    const searchParams = {
      mode: searchMode,
      yearRange,
      ratingRange,
      selectedGenres,
      selectedQuality,
      selectedAgeRating,
      selectedCountry,
      actorName,
      directorName,
      sortBy,
      options: {
        isDubbed,
        hasSubtitle,
        isCensored,
        hasOnlineStream
      }
    };
    
    // شبیه‌سازی زمان جستجو
    setTimeout(() => {
      setIsScanning(false);
      
      // اگر تابع onSearch تعریف شده باشد، آن را فراخوانی می‌کنیم
      if (onSearch) {
        onSearch(searchParams);
      } else {
        // در غیر این‌صورت نتیجه را در کنسول نمایش می‌دهیم
        console.log(searchParams);
      }
    }, 1500);
  };
  
  // افزودن/حذف ژانر از لیست انتخاب‌شده
  const toggleGenre = (genreId: string) => {
    if (selectedGenres.includes(genreId)) {
      setSelectedGenres(selectedGenres.filter(id => id !== genreId));
    } else {
      setSelectedGenres([...selectedGenres, genreId]);
    }
  };
  
  // نمایش ژانرهای انتخاب شده
  const selectedGenresDisplay = () => {
    if (selectedGenres.length === 0) return 'انتخاب ژانر';
    
    if (selectedGenres.length === 1) {
      const genre = genres.find(g => g.id === selectedGenres[0]);
      return genre ? `${genre.icon} ${genre.name}` : 'انتخاب ژانر';
    }
    
    return `${selectedGenres.length} ژانر انتخاب شده`;
  };
  
  return (
    <div 
      className={cn(
        "relative overflow-hidden rounded-2xl bg-[#00142c]/90 backdrop-blur-md border border-[#00BFFF]/10 shadow-lg",
        className
      )}
      dir="rtl"
    >
      {/* تزئینات پس‌زمینه - دایره‌های نورانی محو */}
      <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-[#00BFFF]/10 blur-3xl"></div>
      <div className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full bg-[#00BFFF]/10 blur-3xl"></div>
      
      <div className="p-5 md:p-6">
        {/* عنوان و جستجوی کلیدی */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div className="flex items-center">
            <div className="h-10 w-10 ml-3 rounded-full bg-gradient-to-br from-[#00BFFF] to-[#0077b6] flex items-center justify-center shadow-[0_0_15px_rgba(0,191,255,0.3)]">
              <Search className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">جستجوی پیشرفته</h2>
              <p className="text-sm text-[#00BFFF]">فیلم‌ها و سریال‌ها را با جزئیات دقیق پیدا کنید</p>
            </div>
          </div>
          
          {/* انتخاب حالت: فیلم یا سریال */}
          <div className="flex items-center p-1 bg-black/30 backdrop-blur-sm rounded-full border border-[#00BFFF]/20">
            <button
              className={cn(
                "px-5 py-2 rounded-full flex items-center gap-2 transition-all duration-300",
                searchMode === 'movie' 
                  ? "bg-gradient-to-r from-[#00BFFF] to-[#0077b6] text-white shadow-[0_0_10px_rgba(0,191,255,0.3)]" 
                  : "text-gray-400 hover:text-white"
              )}
              onClick={() => setSearchMode('movie')}
            >
              <Film className={cn("h-4 w-4 ml-1", searchMode === 'movie' ? "text-white" : "text-gray-400")} />
              فیلم
            </button>
            <button
              className={cn(
                "px-5 py-2 rounded-full flex items-center gap-2 transition-all duration-300",
                searchMode === 'series' 
                  ? "bg-gradient-to-r from-[#00BFFF] to-[#0077b6] text-white shadow-[0_0_10px_rgba(0,191,255,0.3)]" 
                  : "text-gray-400 hover:text-white"
              )}
              onClick={() => setSearchMode('series')}
            >
              <Tv className={cn("h-4 w-4 ml-1", searchMode === 'series' ? "text-white" : "text-gray-400")} />
              سریال
            </button>
          </div>
        </div>
        
        {/* فیلترهای اصلی */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* اسلایدر سال ساخت */}
          <div className="bg-[#00142c]/70 backdrop-blur-md rounded-xl p-4 border border-[#00BFFF]/10 hover:border-[#00BFFF]/30 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-white">سال ساخت</label>
              <span className="text-xs text-[#00BFFF] font-bold bg-[#00142c]/80 px-2 py-1 rounded border border-[#00BFFF]/20">
                {yearRange[0]} - {yearRange[1]}
              </span>
            </div>
            <Slider
              defaultValue={[yearRange[0], yearRange[1]]}
              min={1888}
              max={2025}
              step={1}
              value={[yearRange[0], yearRange[1]]}
              onValueChange={(values) => setYearRange([values[0], values[1]])}
              className="my-4"
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>۱۸۸۸</span>
              <span>۲۰۲۵</span>
            </div>
          </div>
          
          {/* اسلایدر امتیاز */}
          <div className="bg-[#00142c]/70 backdrop-blur-md rounded-xl p-4 border border-[#00BFFF]/10 hover:border-[#00BFFF]/30 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-white">امتیاز</label>
              <div className="flex items-center text-xs bg-[#00142c]/80 px-2 py-1 rounded border border-[#00BFFF]/20">
                <Star className="h-3 w-3 text-[#00BFFF] ml-1 fill-[#00BFFF]" />
                <span className="text-[#00BFFF] font-bold">
                  {ratingRange[0]} - {ratingRange[1]}
                </span>
              </div>
            </div>
            <Slider
              defaultValue={[ratingRange[0], ratingRange[1]]}
              min={1}
              max={10}
              step={0.1}
              value={[ratingRange[0], ratingRange[1]]}
              onValueChange={(values) => setRatingRange([values[0], values[1]])}
              className="my-4"
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>۱.۰</span>
              <span>۱۰.۰</span>
            </div>
          </div>
          
          {/* انتخاب ژانر - با منوی بهبود یافته */}
          <div className="bg-[#00142c]/70 backdrop-blur-md rounded-xl p-4 border border-[#00BFFF]/10 hover:border-[#00BFFF]/30 transition-all duration-300">
            <label className="text-sm font-medium text-white block mb-2">ژانر</label>
            <div>
              {/* استفاده از state برای کنترل نمایش منو */}
              {(() => {
                const [genreMenuOpen, setGenreMenuOpen] = useState(false);
                const [genreButtonRef, setGenreButtonRef] = useState<HTMLButtonElement | null>(null);
                
                return (
                  <>
                    <Button 
                      variant="outline" 
                      className="w-full justify-between border-[#00BFFF]/20 bg-[#00142c]/80 text-white hover:bg-[#00142c]"
                      onClick={() => setGenreMenuOpen(true)}
                      ref={setGenreButtonRef}
                    >
                      <span>{selectedGenresDisplay()}</span>
                      <Filter className="h-4 w-4 mr-2 text-[#00BFFF]/70" />
                    </Button>

                    {/* استفاده از کامپوننت PortalContextMenu برای موقعیت‌دهی دقیق */}
                    <PortalContextMenu
                      open={genreMenuOpen}
                      onClose={() => setGenreMenuOpen(false)}
                      anchorElement={genreButtonRef}
                      width="100%"
                      maxHeight="320px"
                      className="p-0"
                    >
                      <div className="grid grid-cols-2 p-2 gap-1">
                        {genres.map((genre) => (
                          <button
                            key={genre.id}
                            className={cn(
                              "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all",
                              selectedGenres.includes(genre.id)
                                ? "bg-[#00BFFF]/20 text-[#00BFFF]"
                                : "hover:bg-[#00142c]/80 text-gray-300"
                            )}
                            onClick={() => {
                              toggleGenre(genre.id);
                              // بستن منو با کلیک روی آیتم‌ها را می‌توان با توجه به نیاز تغییر داد
                              // setGenreMenuOpen(false);
                            }}
                          >
                            <span className="text-lg">{genre.icon}</span>
                            <span>{genre.name}</span>
                            {selectedGenres.includes(genre.id) && (
                              <Check className="h-3 w-3 mr-auto text-[#00BFFF]" />
                            )}
                          </button>
                        ))}
                      </div>
                    </PortalContextMenu>
                  </>
                );
              })()}
            </div>
          </div>
          
          {/* کشور سازنده - با منوی بهبود یافته */}
          <div className="bg-[#00142c]/70 backdrop-blur-md rounded-xl p-4 border border-[#00BFFF]/10 hover:border-[#00BFFF]/30 transition-all duration-300">
            <label className="text-sm font-medium text-white block mb-2">کشور</label>
            <div>
              {/* استفاده از state برای کنترل نمایش منو */}
              {(() => {
                const [countryMenuOpen, setCountryMenuOpen] = useState(false);
                const [countryButtonRef, setCountryButtonRef] = useState<HTMLButtonElement | null>(null);
                
                // نمایش کشور انتخاب شده
                const selectedCountryDisplay = () => {
                  if (!selectedCountry) return "کشور سازنده";
                  
                  const country = countries.find(c => c.id === selectedCountry);
                  return country ? `${country.flag} ${country.name}` : "کشور سازنده";
                };
                
                return (
                  <>
                    <Button 
                      variant="outline" 
                      className="w-full justify-between border-[#00BFFF]/20 bg-[#00142c]/80 text-white hover:bg-[#00142c]"
                      onClick={() => setCountryMenuOpen(true)}
                      ref={setCountryButtonRef}
                    >
                      <span>{selectedCountryDisplay()}</span>
                      <Flag className="h-4 w-4 mr-2 text-[#00BFFF]/70" />
                    </Button>

                    {/* استفاده از کامپوننت PortalContextMenu برای موقعیت‌دهی دقیق */}
                    <PortalContextMenu
                      open={countryMenuOpen}
                      onClose={() => setCountryMenuOpen(false)}
                      anchorElement={countryButtonRef}
                      width="100%"
                      maxHeight="320px"
                      className="p-0"
                    >
                      <div className="p-2">
                        <div className="mb-2 px-3 py-2">
                          <h4 className="text-[#00BFFF] text-sm font-medium">کشورها</h4>
                        </div>
                        <div className="grid grid-cols-1 gap-1 max-h-[250px] overflow-y-auto">
                          {countries.map((country) => (
                            <button
                              key={country.id}
                              className={cn(
                                "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all w-full text-right",
                                selectedCountry === country.id
                                  ? "bg-[#00BFFF]/20 text-[#00BFFF]"
                                  : "hover:bg-[#00142c]/80 text-gray-300"
                              )}
                              onClick={() => {
                                setSelectedCountry(country.id);
                                setCountryMenuOpen(false);
                              }}
                            >
                              <span className="text-lg">{country.flag}</span>
                              <span>{country.name}</span>
                              {selectedCountry === country.id && (
                                <Check className="h-3 w-3 mr-auto text-[#00BFFF]" />
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    </PortalContextMenu>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
        
        {/* گزینه‌های پخش - سوئیچ‌ها */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-[#00142c]/70 backdrop-blur-md rounded-xl p-3 border border-[#00BFFF]/10 hover:border-[#00BFFF]/30 transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Mic className="h-4 w-4 text-[#00BFFF] ml-2" />
                <label className="text-sm text-white">دوبله فارسی</label>
              </div>
              <Switch
                checked={isDubbed}
                onCheckedChange={setIsDubbed}
                className="data-[state=checked]:bg-[#00BFFF]"
              />
            </div>
          </div>
          
          <div className="bg-[#00142c]/70 backdrop-blur-md rounded-xl p-3 border border-[#00BFFF]/10 hover:border-[#00BFFF]/30 transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Globe className="h-4 w-4 text-[#00BFFF] ml-2" />
                <label className="text-sm text-white">زیرنویس</label>
              </div>
              <Switch
                checked={hasSubtitle}
                onCheckedChange={setHasSubtitle}
                className="data-[state=checked]:bg-[#00BFFF]"
              />
            </div>
          </div>
          
          <div className="bg-[#00142c]/70 backdrop-blur-md rounded-xl p-3 border border-[#00BFFF]/10 hover:border-[#00BFFF]/30 transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Filter className="h-4 w-4 text-[#00BFFF] ml-2" />
                <label className="text-sm text-white">سانسور شده</label>
              </div>
              <Switch
                checked={isCensored}
                onCheckedChange={setIsCensored}
                className="data-[state=checked]:bg-[#00BFFF]"
              />
            </div>
          </div>
          
          <div className="bg-[#00142c]/70 backdrop-blur-md rounded-xl p-3 border border-[#00BFFF]/10 hover:border-[#00BFFF]/30 transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Video className="h-4 w-4 text-[#00BFFF] ml-2" />
                <label className="text-sm text-white">پخش آنلاین</label>
              </div>
              <Switch
                checked={hasOnlineStream}
                onCheckedChange={setHasOnlineStream}
                className="data-[state=checked]:bg-[#00BFFF]"
              />
            </div>
          </div>
        </div>
        
        {/* نوار جستجو و دکمه‌های اصلی */}
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-[#00BFFF]" />
            </div>
            <Input
              type="text"
              placeholder="جستجوی عنوان فیلم، سریال یا کلیدواژه..."
              className="w-full pr-10 border-[#00BFFF]/20 bg-[#00142c]/80 text-white placeholder:text-gray-400 focus:border-[#00BFFF]/50 focus:ring-[#00BFFF]/30"
            />
            
            {/* انیمیشن اسکن در زمان جستجو */}
            {isScanning && (
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#00BFFF]/20 to-transparent animate-scan"></div>
              </div>
            )}
          </div>
          
          <div className="flex gap-3">
            <Button 
              variant="outline"
              className="border-[#00BFFF]/20 bg-[#00142c]/80 text-white hover:bg-[#00142c] hover:border-[#00BFFF]/30"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            >
              <Filter className="h-4 w-4 ml-2 text-[#00BFFF]" />
              فیلترهای پیشرفته
            </Button>
            
            <Button 
              className="bg-gradient-to-r from-[#00BFFF] to-[#0077b6] text-white hover:shadow-[0_0_15px_rgba(0,191,255,0.3)] transition-all duration-300 relative overflow-hidden group"
              onClick={handleSearch}
              disabled={isScanning}
            >
              <span className="relative z-10 flex items-center">
                <Search className="h-4 w-4 ml-2" />
                جستجو
              </span>
              
              {/* افکت هاله نورانی دکمه */}
              <span className="absolute inset-0 bg-[#00BFFF]/20 blur-md group-hover:opacity-100 opacity-0 transition-opacity"></span>
              <span className="absolute -inset-x-1 bottom-0 h-px bg-gradient-to-r from-transparent via-[#00BFFF]/50 to-transparent"></span>
            </Button>
          </div>
        </div>
        
        {/* فیلترهای پیشرفته - با انیمیشن */}
        <div 
          className={cn(
            "grid gap-5 transition-all duration-500 overflow-hidden",
            showAdvancedFilters 
              ? "grid-rows-[1fr] opacity-100 max-h-[500px]" 
              : "grid-rows-[0fr] opacity-0 max-h-0"
          )}
        >
          <div className="min-h-0">
            <div className="pt-4 border-t border-[#00BFFF]/10">
              <h3 className="text-sm font-semibold text-[#00BFFF] mb-4 flex items-center">
                <Filter className="h-4 w-4 ml-2" />
                فیلترهای پیشرفته
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* جستجوی نام بازیگر */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white block">بازیگر</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <Users className="h-4 w-4 text-[#00BFFF]" />
                    </div>
                    <Input
                      type="text"
                      placeholder="نام بازیگر..."
                      value={actorName}
                      onChange={(e) => setActorName(e.target.value)}
                      className="w-full pr-10 border-[#00BFFF]/20 bg-[#00142c]/80 text-white placeholder:text-gray-400 focus:border-[#00BFFF]/50 focus:ring-[#00BFFF]/30"
                    />
                  </div>
                </div>
                
                {/* جستجوی نام کارگردان */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white block">کارگردان</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <Video className="h-4 w-4 text-[#00BFFF]" />
                    </div>
                    <Input
                      type="text"
                      placeholder="نام کارگردان..."
                      value={directorName}
                      onChange={(e) => setDirectorName(e.target.value)}
                      className="w-full pr-10 border-[#00BFFF]/20 bg-[#00142c]/80 text-white placeholder:text-gray-400 focus:border-[#00BFFF]/50 focus:ring-[#00BFFF]/30"
                    />
                  </div>
                </div>
                
                {/* رده سنی */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white block">رده سنی</label>
                  <Select value={selectedAgeRating || ""} onValueChange={setSelectedAgeRating}>
                    <SelectTrigger className="border-[#00BFFF]/20 bg-[#00142c]/80 text-white hover:bg-[#00142c]">
                      <SelectValue placeholder="انتخاب رده سنی" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#00142c]/95 backdrop-blur-xl border-[#00BFFF]/20 text-white">
                      <SelectGroup>
                        <SelectLabel className="text-[#00BFFF]">رده‌های سنی</SelectLabel>
                        {ageRatings.map((rating) => (
                          <SelectItem key={rating.id} value={rating.id} className="hover:bg-[#00BFFF]/10">
                            <div className="flex items-center gap-2">
                              <Badge className="bg-[#00142c] border border-[#00BFFF]/30 text-[#00BFFF] text-xs py-0 px-1.5">
                                {rating.badge}
                              </Badge>
                              <span>{rating.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                {/* کیفیت */}
                <div className="bg-[#00142c]/70 backdrop-blur-md rounded-xl p-4 border border-[#00BFFF]/10 hover:border-[#00BFFF]/30 transition-all">
                  <label className="text-sm font-medium text-white block mb-3">کیفیت</label>
                  <div className="flex flex-wrap gap-2">
                    {qualities.map((quality) => (
                      <button
                        key={quality.id}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-sm transition-all",
                          selectedQuality === quality.id
                            ? "bg-gradient-to-r from-[#00BFFF] to-[#0077b6] text-white shadow-[0_0_10px_rgba(0,191,255,0.3)]" 
                            : "bg-[#00142c]/90 text-gray-300 hover:bg-[#00142c] border border-[#00BFFF]/20"
                        )}
                        onClick={() => setSelectedQuality(quality.id)}
                      >
                        {quality.name}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* مرتب‌سازی */}
                <div className="bg-[#00142c]/70 backdrop-blur-md rounded-xl p-4 border border-[#00BFFF]/10 hover:border-[#00BFFF]/30 transition-all">
                  <label className="text-sm font-medium text-white block mb-3">ترتیب نمایش</label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="border-[#00BFFF]/20 bg-[#00142c]/80 text-white hover:bg-[#00142c]">
                      <SelectValue placeholder="ترتیب نمایش" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#00142c]/95 backdrop-blur-xl border-[#00BFFF]/20 text-white">
                      <SelectGroup>
                        <SelectLabel className="text-[#00BFFF]">ترتیب</SelectLabel>
                        {sortOptions.map((option) => (
                          <SelectItem key={option.id} value={option.id} className="hover:bg-[#00BFFF]/10">
                            <div className="flex items-center gap-2">
                              <SortDesc className="h-3.5 w-3.5 text-[#00BFFF]" />
                              <span>{option.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* حذف فیلترها */}
                <div className="flex items-end">
                  <Button 
                    variant="outline"
                    className="border-[#00BFFF]/20 bg-[#00142c]/80 text-white hover:bg-red-500/20 hover:text-red-300 hover:border-red-500/30 transition-all"
                    onClick={() => {
                      // بازنشانی فیلترها
                      setYearRange([1980, 2025]);
                      setRatingRange([1, 10]);
                      setSelectedGenres([]);
                      setSelectedQuality(null);
                      setSelectedAgeRating(null);
                      setSelectedCountry(null);
                      setActorName('');
                      setDirectorName('');
                      setSortBy('newest');
                      setIsDubbed(false);
                      setHasSubtitle(false);
                      setIsCensored(false);
                      setHasOnlineStream(true);
                    }}
                  >
                    پاک کردن فیلترها
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* درباره جستجوی پیشرفته */}
        <div className="mt-4 flex justify-start">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="text-xs text-gray-500 hover:text-[#00BFFF] transition-colors">
                  درباره جستجوی پیشرفته
                </button>
              </TooltipTrigger>
              <TooltipContent className="bg-[#00142c]/95 backdrop-blur-xl border-[#00BFFF]/20 text-white max-w-xs">
                <p>با استفاده از این ابزار می‌توانید دقیق‌ترین جستجوی ممکن را در محتواهای سایت انجام دهید.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
};

export default AdvancedSearchPanel;