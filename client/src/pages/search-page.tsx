import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import ContentSection from "@/components/sections/content-section";
import TagsSection from "@/components/sections/tags-section";
import { Content } from "@shared/schema";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import {
  Search,
  SlidersHorizontal,
  X,
  Tag,
  Calendar,
  Star,
  Filter
} from "lucide-react";

interface SearchPageProps {}

const SearchPage: React.FC<SearchPageProps> = () => {
  const [location, setLocation] = useLocation();
  
  // Get search parameters from URL
  const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const initialQuery = searchParams.get('q') || '';
  const initialType = searchParams.get('type') || '';
  const initialYear = searchParams.get('year') ? parseInt(searchParams.get('year') as string) : undefined;
  const initialGenres = searchParams.get('genres') ? (searchParams.get('genres') as string).split(',') : [];
  const initialTags = searchParams.get('tags') ? (searchParams.get('tags') as string).split(',') : [];
  const initialMinRating = searchParams.get('minRating') ? parseFloat(searchParams.get('minRating') as string) : 0;
  
  // Search state
  const [query, setQuery] = useState<string>(initialQuery);
  const [type, setType] = useState<string>(initialType);
  const [year, setYear] = useState<number | undefined>(initialYear);
  const [genres, setGenres] = useState<string[]>(initialGenres);
  const [tags, setTags] = useState<string[]>(initialTags);
  const [minRating, setMinRating] = useState<number>(initialMinRating);
  const [showMobileFilters, setShowMobileFilters] = useState<boolean>(false);
  
  // List of available genres for filtering
  const availableGenres = [
    { title: "اکشن", slug: "action" },
    { title: "کمدی", slug: "comedy" },
    { title: "درام", slug: "drama" },
    { title: "علمی-تخیلی", slug: "scifi" },
    { title: "ترسناک", slug: "horror" },
    { title: "ماجراجویی", slug: "adventure" },
    { title: "فانتزی", slug: "fantasy" },
    { title: "جنایی", slug: "crime" },
    { title: "خانوادگی", slug: "family" },
    { title: "عاشقانه", slug: "romance" },
    { title: "بیوگرافی", slug: "biography" },
    { title: "تاریخی", slug: "historical" },
    { title: "موزیکال", slug: "musical" },
    { title: "جنگی", slug: "war" },
    { title: "وسترن", slug: "western" },
    { title: "ورزشی", slug: "sport" },
    { title: "راز و رمز", slug: "mystery" }
  ];
  
  // List of available tags for filtering
  const availableTags = [
    { title: "دوبله فارسی", slug: "persian_dub" },
    { title: "زیرنویس فارسی", slug: "persian_sub" },
    { title: "4K", slug: "4k" },
    { title: "HDR", slug: "hdr" },
    { title: "برنده اسکار", slug: "oscar" },
    { title: "برترین IMDB", slug: "top_imdb" },
    { title: "سه‌بعدی", slug: "3d" }
  ];
  
  // List of available years
  const years = Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - i);
  
  // Construct search query parameters
  const buildSearchQueryParams = () => {
    const params: Record<string, string> = {};
    
    if (query) params.q = query;
    if (type) params.type = type;
    if (year) params.year = year.toString();
    if (genres.length > 0) params.genres = genres.join(',');
    if (tags.length > 0) params.tags = tags.join(',');
    if (minRating > 0) params.minRating = minRating.toString();
    
    return params;
  };
  
  // Execute search
  const handleSearch = () => {
    const params = buildSearchQueryParams();
    const queryString = new URLSearchParams(params).toString();
    setLocation(`/search?${queryString}`);
  };
  
  // Reset all filters
  const resetFilters = () => {
    setQuery(initialQuery);
    setType('');
    setYear(undefined);
    setGenres([]);
    setTags([]);
    setMinRating(0);
  };
  
  // Handle genre selection
  const handleGenreToggle = (slug: string) => {
    setGenres(prev => {
      if (prev.includes(slug)) {
        return prev.filter(g => g !== slug);
      } else {
        return [...prev, slug];
      }
    });
  };
  
  // Handle tag selection
  const handleTagToggle = (slug: string) => {
    setTags(prev => {
      if (prev.includes(slug)) {
        return prev.filter(t => t !== slug);
      } else {
        return [...prev, slug];
      }
    });
  };
  
  // Fetch search results
  const { data: searchResults = [], isLoading } = useQuery<Content[]>({
    queryKey: ['/api/search', query, type, year, genres.join(','), tags.join(','), minRating],
    queryFn: async () => {
      const params = buildSearchQueryParams();
      const queryString = new URLSearchParams(params).toString();
      const res = await fetch(`/api/search?${queryString}`);
      if (!res.ok) throw new Error('Failed to fetch search results');
      return await res.json();
    },
    enabled: !!(query || type || year || genres.length > 0 || tags.length > 0 || minRating > 0)
  });
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="flex items-center gap-3 mb-8">
        <Search className="h-6 w-6 text-primary" />
        <h1 className="text-3xl font-bold">جستجوی پیشرفته</h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Desktop Filter Sidebar */}
        <div className="hidden lg:block">
          <div className="bg-dark-card rounded-lg overflow-hidden border border-dark-border shadow-lg sticky top-20">
            <div className="p-4 bg-dark-lighter border-b border-dark-border flex justify-between items-center">
              <h2 className="font-bold flex items-center gap-2">
                <Filter className="h-5 w-5" />
                فیلترها
              </h2>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 px-2 text-sm"
                onClick={resetFilters}
              >
                <X className="h-4 w-4 ml-1" />
                پاک کردن
              </Button>
            </div>
            
            <div className="p-4 space-y-6">
              {/* Content Type Filter */}
              <div>
                <h3 className="font-medium mb-3">نوع محتوا</h3>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger className="w-full bg-dark">
                    <SelectValue placeholder="همه انواع" />
                  </SelectTrigger>
                  <SelectContent className="bg-dark-card border-dark-border">
                    <SelectItem value="">همه انواع</SelectItem>
                    <SelectItem value="movie">فیلم</SelectItem>
                    <SelectItem value="series">سریال</SelectItem>
                    <SelectItem value="animation">انیمیشن</SelectItem>
                    <SelectItem value="documentary">مستند</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Year Filter */}
              <div>
                <h3 className="font-medium mb-3">سال انتشار</h3>
                <Select value={year?.toString() || ''} onValueChange={(val) => setYear(val ? parseInt(val) : undefined)}>
                  <SelectTrigger className="w-full bg-dark">
                    <SelectValue placeholder="انتخاب سال" />
                  </SelectTrigger>
                  <SelectContent className="bg-dark-card border-dark-border max-h-60">
                    <SelectItem value="">همه سال‌ها</SelectItem>
                    {years.map(y => (
                      <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Minimum Rating Filter */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-medium">حداقل امتیاز IMDB</h3>
                  <span className="text-sm bg-primary/30 px-2 py-0.5 rounded">
                    {minRating.toFixed(1)}
                  </span>
                </div>
                <Slider
                  value={[minRating]}
                  min={0}
                  max={10}
                  step={0.1}
                  onValueChange={(val) => setMinRating(val[0])}
                />
              </div>
              
              {/* Genres Filter */}
              <div>
                <h3 className="font-medium mb-3">ژانرها</h3>
                <div className="flex flex-wrap gap-2">
                  {availableGenres.map(genre => (
                    <Button
                      key={genre.slug}
                      variant={genres.includes(genre.slug) ? "default" : "outline"}
                      size="sm"
                      className={`text-xs ${genres.includes(genre.slug) ? 'bg-primary' : 'bg-dark'}`}
                      onClick={() => handleGenreToggle(genre.slug)}
                    >
                      {genre.title}
                    </Button>
                  ))}
                </div>
              </div>
              
              {/* Tags Filter */}
              <div>
                <h3 className="font-medium mb-3">برچسب‌ها</h3>
                <div className="flex flex-wrap gap-2">
                  {availableTags.map(tag => (
                    <Button
                      key={tag.slug}
                      variant={tags.includes(tag.slug) ? "default" : "outline"}
                      size="sm"
                      className={`text-xs ${tags.includes(tag.slug) ? 'bg-primary' : 'bg-dark'}`}
                      onClick={() => handleTagToggle(tag.slug)}
                    >
                      {tag.title}
                    </Button>
                  ))}
                </div>
              </div>
              
              {/* Apply Filters Button */}
              <Button className="w-full" onClick={handleSearch}>
                اعمال فیلترها
              </Button>
            </div>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Search Box */}
          <div className="bg-dark-card rounded-lg p-4 mb-6 border border-dark-border">
            <div className="flex gap-2">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="جستجو در عنوان، خلاصه، کارگردان، بازیگران..."
                className="bg-dark flex-1"
              />
              
              {/* Mobile Filter Button */}
              <Sheet open={showMobileFilters} onOpenChange={setShowMobileFilters}>
                <SheetTrigger asChild>
                  <Button variant="outline" className="lg:hidden">
                    <SlidersHorizontal className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="bg-dark-card border-dark-border w-[85vw] sm:max-w-md overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                      <Filter className="h-5 w-5" />
                      فیلترها
                    </SheetTitle>
                  </SheetHeader>
                  
                  <div className="mt-6 space-y-6">
                    {/* Mobile Content Type Filter */}
                    <div>
                      <h3 className="font-medium mb-3">نوع محتوا</h3>
                      <Select value={type} onValueChange={setType}>
                        <SelectTrigger className="w-full bg-dark">
                          <SelectValue placeholder="همه انواع" />
                        </SelectTrigger>
                        <SelectContent className="bg-dark-card border-dark-border">
                          <SelectItem value="">همه انواع</SelectItem>
                          <SelectItem value="movie">فیلم</SelectItem>
                          <SelectItem value="series">سریال</SelectItem>
                          <SelectItem value="animation">انیمیشن</SelectItem>
                          <SelectItem value="documentary">مستند</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {/* Mobile Year Filter */}
                    <div>
                      <h3 className="font-medium mb-3">سال انتشار</h3>
                      <Select value={year?.toString() || ''} onValueChange={(val) => setYear(val ? parseInt(val) : undefined)}>
                        <SelectTrigger className="w-full bg-dark">
                          <SelectValue placeholder="انتخاب سال" />
                        </SelectTrigger>
                        <SelectContent className="bg-dark-card border-dark-border max-h-60">
                          <SelectItem value="">همه سال‌ها</SelectItem>
                          {years.map(y => (
                            <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {/* Mobile Minimum Rating Filter */}
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="font-medium">حداقل امتیاز IMDB</h3>
                        <span className="text-sm bg-primary/30 px-2 py-0.5 rounded">
                          {minRating.toFixed(1)}
                        </span>
                      </div>
                      <Slider
                        value={[minRating]}
                        min={0}
                        max={10}
                        step={0.1}
                        onValueChange={(val) => setMinRating(val[0])}
                      />
                    </div>
                    
                    {/* Mobile Category Tabs */}
                    <Tabs defaultValue="genres">
                      <TabsList className="grid grid-cols-2 w-full">
                        <TabsTrigger value="genres">ژانرها</TabsTrigger>
                        <TabsTrigger value="tags">برچسب‌ها</TabsTrigger>
                      </TabsList>
                      
                      {/* Mobile Genres Tab */}
                      <TabsContent value="genres" className="mt-4">
                        <div className="flex flex-wrap gap-2">
                          {availableGenres.map(genre => (
                            <Button
                              key={genre.slug}
                              variant={genres.includes(genre.slug) ? "default" : "outline"}
                              size="sm"
                              className={`text-xs ${genres.includes(genre.slug) ? 'bg-primary' : 'bg-dark'}`}
                              onClick={() => handleGenreToggle(genre.slug)}
                            >
                              {genre.title}
                            </Button>
                          ))}
                        </div>
                      </TabsContent>
                      
                      {/* Mobile Tags Tab */}
                      <TabsContent value="tags" className="mt-4">
                        <div className="flex flex-wrap gap-2">
                          {availableTags.map(tag => (
                            <Button
                              key={tag.slug}
                              variant={tags.includes(tag.slug) ? "default" : "outline"}
                              size="sm"
                              className={`text-xs ${tags.includes(tag.slug) ? 'bg-primary' : 'bg-dark'}`}
                              onClick={() => handleTagToggle(tag.slug)}
                            >
                              {tag.title}
                            </Button>
                          ))}
                        </div>
                      </TabsContent>
                    </Tabs>
                    
                    {/* Mobile Action Buttons */}
                    <div className="flex gap-2 mt-6">
                      <Button variant="outline" className="flex-1" onClick={resetFilters}>
                        <X className="h-4 w-4 ml-1" />
                        پاک کردن
                      </Button>
                      <Button className="flex-1" onClick={() => {
                        handleSearch();
                        setShowMobileFilters(false);
                      }}>
                        اعمال فیلترها
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
              
              <Button onClick={handleSearch}>
                <Search className="h-5 w-5 ml-1" />
                جستجو
              </Button>
            </div>
            
            {/* Active Filters Display */}
            {(type || year || genres.length > 0 || tags.length > 0 || minRating > 0) && (
              <div className="mt-4 flex flex-wrap gap-2 items-center">
                <span className="text-text-secondary text-sm">فیلترهای فعال:</span>
                
                {type && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-7 bg-primary/20 border-primary/30 text-primary-light"
                    onClick={() => setType('')}
                  >
                    {type === 'movie' ? 'فیلم' : 
                     type === 'series' ? 'سریال' : 
                     type === 'animation' ? 'انیمیشن' : 
                     type === 'documentary' ? 'مستند' : type}
                    <X className="h-3 w-3 mr-1" />
                  </Button>
                )}
                
                {year && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-7 bg-primary/20 border-primary/30 text-primary-light flex items-center"
                    onClick={() => setYear(undefined)}
                  >
                    <Calendar className="h-3 w-3 ml-1" />
                    {year}
                    <X className="h-3 w-3 mr-1" />
                  </Button>
                )}
                
                {minRating > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-7 bg-primary/20 border-primary/30 text-primary-light flex items-center"
                    onClick={() => setMinRating(0)}
                  >
                    <Star className="h-3 w-3 ml-1" />
                    IMDB &gt;= {minRating.toFixed(1)}
                    <X className="h-3 w-3 mr-1" />
                  </Button>
                )}
                
                {genres.map(genre => {
                  const genreTitle = availableGenres.find(g => g.slug === genre)?.title || genre;
                  return (
                    <Button
                      key={genre}
                      variant="outline"
                      size="sm"
                      className="text-xs h-7 bg-primary/20 border-primary/30 text-primary-light"
                      onClick={() => handleGenreToggle(genre)}
                    >
                      {genreTitle}
                      <X className="h-3 w-3 mr-1" />
                    </Button>
                  );
                })}
                
                {tags.map(tag => {
                  const tagTitle = availableTags.find(t => t.slug === tag)?.title || tag;
                  return (
                    <Button
                      key={tag}
                      variant="outline"
                      size="sm"
                      className="text-xs h-7 bg-primary/20 border-primary/30 text-primary-light flex items-center"
                      onClick={() => handleTagToggle(tag)}
                    >
                      <Tag className="h-3 w-3 ml-1" />
                      {tagTitle}
                      <X className="h-3 w-3 mr-1" />
                    </Button>
                  );
                })}
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs h-7 text-text-secondary"
                  onClick={resetFilters}
                >
                  پاک کردن همه
                </Button>
              </div>
            )}
          </div>
          
          {/* Search Results */}
          <ContentSection
            title={`نتایج جستجو (${searchResults.length})`}
            contents={searchResults}
            isLoading={isLoading}
            emptyMessage={
              query || type || year || genres.length > 0 || tags.length > 0 || minRating > 0
                ? "هیچ نتیجه‌ای با معیارهای جستجوی شما یافت نشد"
                : "لطفاً یک عبارت جستجو یا فیلتر وارد کنید"
            }
          />
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
