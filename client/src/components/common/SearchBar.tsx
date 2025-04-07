import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Slider
} from '@/components/ui/slider';
import { ContentType, SearchFilters } from '@/types';
import { apiRequest } from '@/lib/queryClient';
import { useDebounce } from '@/hooks/use-debounce';
import { ContentCard } from './ContentCard';
import { useMediaQuery } from '@/hooks/use-mobile';

export function SearchBar() {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [searchResults, setSearchResults] = useState<ContentType[]>([]);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({});
  const debouncedQuery = useDebounce(query, 500);
  const [, navigate] = useLocation();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const searchRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close results
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Search when query changes
  useEffect(() => {
    async function performSearch() {
      if (debouncedQuery.trim().length < 2) {
        setSearchResults([]);
        setShowResults(false);
        return;
      }
      
      try {
        setIsSearching(true);
        const res = await apiRequest('GET', `/api/search?q=${encodeURIComponent(debouncedQuery)}&limit=5`);
        const data = await res.json();
        setSearchResults(data);
        setShowResults(true);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsSearching(false);
      }
    }
    
    performSearch();
  }, [debouncedQuery]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    if (e.target.value.trim() === '') {
      setShowResults(false);
    }
  };

  const handleClearSearch = () => {
    setQuery('');
    setShowResults(false);
  };

  const handleInputFocus = () => {
    if (query.trim().length >= 2) {
      setShowResults(true);
    }
  };

  const handleFullSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (query.trim().length === 0) return;
    
    // Build search URL with filters
    let searchUrl = `/search?q=${encodeURIComponent(query)}`;
    
    if (filters.type) {
      searchUrl += `&type=${filters.type}`;
    }
    
    if (filters.year_from) {
      searchUrl += `&year_from=${filters.year_from}`;
    }
    
    if (filters.year_to) {
      searchUrl += `&year_to=${filters.year_to}`;
    }
    
    if (filters.min_rating) {
      searchUrl += `&min_rating=${filters.min_rating}`;
    }
    
    navigate(searchUrl);
    setShowResults(false);
  };

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleYearRangeChange = (value: number[]) => {
    setFilters(prev => ({
      ...prev,
      year_from: value[0],
      year_to: value[1]
    }));
  };

  return (
    <div ref={searchRef} className="relative ml-4">
      <form onSubmit={handleFullSearch} className="relative">
        <Input
          type="text"
          placeholder="جستجو..."
          className={`w-64 md:w-80 pl-10 bg-muted border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground`}
          value={query}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
        />
        
        {query ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute left-3 top-2.5 text-muted-foreground h-5 w-5 p-0"
            onClick={handleClearSearch}
          >
            <X className="h-4 w-4" />
          </Button>
        ) : (
          <Search className="absolute left-3 top-2.5 text-muted-foreground h-5 w-5" />
        )}
        
        <Popover open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={`${isMobile ? 'hidden' : 'block'} absolute -left-9 top-1.5 text-muted-foreground hover:text-primary transition duration-200 h-7 w-7 p-0`}
            >
              <SlidersHorizontal className="h-5 w-5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80">
            <div className="space-y-4">
              <h3 className="font-medium text-foreground">جستجوی پیشرفته</h3>
              
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">نوع محتوا</label>
                <Select
                  value={filters.type}
                  onValueChange={(value) => handleFilterChange('type', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="همه" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="movie">فیلم</SelectItem>
                    <SelectItem value="series">سریال</SelectItem>
                    <SelectItem value="animation">انیمیشن</SelectItem>
                    <SelectItem value="documentary">مستند</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">سال انتشار</label>
                <div className="px-2">
                  <Slider
                    defaultValue={[1980, new Date().getFullYear()]}
                    min={1900}
                    max={new Date().getFullYear()}
                    step={1}
                    onValueChange={handleYearRangeChange}
                  />
                  <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                    <span>{filters.year_from || 1900}</span>
                    <span>{filters.year_to || new Date().getFullYear()}</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">حداقل امتیاز</label>
                <Select
                  value={filters.min_rating?.toString()}
                  onValueChange={(value) => handleFilterChange('min_rating', parseFloat(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="بدون محدودیت" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">بالای 5</SelectItem>
                    <SelectItem value="6">بالای 6</SelectItem>
                    <SelectItem value="7">بالای 7</SelectItem>
                    <SelectItem value="8">بالای 8</SelectItem>
                    <SelectItem value="9">بالای 9</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex justify-end">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  className="mr-2"
                  onClick={() => setFilters({})}
                >
                  پاک کردن
                </Button>
                <Button 
                  type="button" 
                  size="sm"
                  onClick={() => {
                    handleFullSearch();
                    setIsAdvancedOpen(false);
                  }}
                >
                  اعمال فیلتر
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </form>
      
      {/* Search results dropdown */}
      {showResults && (
        <div className="absolute z-30 right-0 top-12 w-full md:w-[400px] rounded-md bg-card border border-input shadow-lg max-h-96 overflow-y-auto scrollbar-hide">
          {isSearching ? (
            <div className="p-4 text-center text-muted-foreground">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2">در حال جستجو...</p>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              نتیجه‌ای یافت نشد
            </div>
          ) : (
            <>
              <div className="p-3 border-b border-border">
                <p className="text-sm text-muted-foreground">
                  {searchResults.length} نتیجه برای "{query}"
                </p>
              </div>
              <div className="divide-y divide-border">
                {searchResults.map(result => (
                  <div 
                    key={result.id}
                    className="p-2 hover:bg-muted transition-colors"
                    onClick={() => {
                      navigate(`/content/${result.id}`);
                      setShowResults(false);
                    }}
                  >
                    <div className="flex items-center">
                      <img
                        src={result.poster}
                        alt={result.title}
                        className="w-16 h-20 object-cover rounded"
                      />
                      <div className="mr-3 flex-1">
                        <h4 className="font-medium text-foreground">{result.title}</h4>
                        <p className="text-sm text-muted-foreground">{result.englishTitle}</p>
                        <div className="flex items-center mt-1">
                          <span className="text-xs text-muted-foreground ml-2">{result.year}</span>
                          {result.imdbRating && (
                            <div className="flex items-center text-xs">
                              <svg className="w-3 h-3 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                              </svg>
                              <span>{result.imdbRating}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-3 border-t border-border">
                <Button 
                  variant="link" 
                  className="w-full text-primary"
                  onClick={handleFullSearch}
                >
                  مشاهده همه نتایج
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
