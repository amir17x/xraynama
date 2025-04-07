import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { ContentType, SearchFilters } from '@/types';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ContentCard } from '@/components/common/ContentCard';
import { Button } from '@/components/ui/button';
import {
  Slider
} from '@/components/ui/slider';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useDebounce } from '@/hooks/use-debounce';
import { 
  Search, 
  Loader2, 
  Filter, 
  X, 
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

export default function SearchPage() {
  const [, params] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({});
  const [appliedFilters, setAppliedFilters] = useState<SearchFilters>({});
  const [yearRange, setYearRange] = useState<[number, number]>([1980, new Date().getFullYear()]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState<string>('newest');
  
  // Extract query parameters
  useEffect(() => {
    const searchParams = new URLSearchParams(params);
    const queryParam = searchParams.get('q');
    const typeParam = searchParams.get('type');
    const yearFromParam = searchParams.get('year_from');
    const yearToParam = searchParams.get('year_to');
    const minRatingParam = searchParams.get('min_rating');
    const genreParam = searchParams.get('genre');
    const tagParam = searchParams.get('tag');
    const sortParam = searchParams.get('sort');
    
    const initialFilters: SearchFilters = {};
    if (typeParam) initialFilters.type = typeParam as any;
    if (yearFromParam) initialFilters.year_from = parseInt(yearFromParam);
    if (yearToParam) initialFilters.year_to = parseInt(yearToParam);
    if (minRatingParam) initialFilters.min_rating = parseFloat(minRatingParam);
    if (genreParam) initialFilters.genre = genreParam;
    if (tagParam) initialFilters.tag = tagParam;
    
    setSearchQuery(queryParam || '');
    setFilters(initialFilters);
    setAppliedFilters(initialFilters);
    
    if (yearFromParam && yearToParam) {
      setYearRange([parseInt(yearFromParam), parseInt(yearToParam)]);
    }
    
    if (sortParam) {
      setSortBy(sortParam);
    }
    
    // Reset to page 1 when filters change
    setPage(1);
  }, [params]);
  
  const debouncedQuery = useDebounce(searchQuery, 500);
  const ITEMS_PER_PAGE = 20;
  
  // Search API call
  const {
    data: searchResults,
    isLoading,
    isError,
    refetch
  } = useQuery<ContentType[]>({
    queryKey: ['/api/search', debouncedQuery, appliedFilters, page, sortBy],
    queryFn: async () => {
      const params = new URLSearchParams();
      
      if (debouncedQuery) {
        params.append('q', debouncedQuery);
      }
      
      if (appliedFilters.type) {
        params.append('type', appliedFilters.type);
      }
      
      if (appliedFilters.year_from) {
        params.append('year_from', appliedFilters.year_from.toString());
      }
      
      if (appliedFilters.year_to) {
        params.append('year_to', appliedFilters.year_to.toString());
      }
      
      if (appliedFilters.min_rating) {
        params.append('min_rating', appliedFilters.min_rating.toString());
      }
      
      if (appliedFilters.genre) {
        params.append('genre', appliedFilters.genre);
      }
      
      if (appliedFilters.tag) {
        params.append('tag', appliedFilters.tag);
      }
      
      // Pagination
      params.append('limit', ITEMS_PER_PAGE.toString());
      params.append('offset', ((page - 1) * ITEMS_PER_PAGE).toString());
      
      // Sorting
      params.append('sort', sortBy);
      
      try {
        const res = await apiRequest('GET', `/api/search?${params.toString()}`);
        const data = await res.json();
        
        // Update total pages - assuming the API returns a count field
        if (data.total) {
          setTotalPages(Math.ceil(data.total / ITEMS_PER_PAGE));
        } else {
          // If no count is returned, estimate based on returned results
          if (data.length < ITEMS_PER_PAGE) {
            setTotalPages(page);
          } else {
            setTotalPages(page + 1);
          }
        }
        
        return data.results || data;
      } catch (error) {
        console.error('Search error:', error);
        throw error;
      }
    },
    enabled: !!debouncedQuery || Object.keys(appliedFilters).length > 0,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  // Genre data
  const { data: genres } = useQuery({
    queryKey: ['/api/genres'],
    staleTime: 1000 * 60 * 60, // 1 hour
  });
  
  // Tags data
  const { data: tags } = useQuery({
    queryKey: ['/api/tags'],
    staleTime: 1000 * 60 * 60, // 1 hour
  });
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setAppliedFilters(filters);
    setPage(1);
    refetch();
  };
  
  const handleClearFilters = () => {
    setFilters({});
    setYearRange([1980, new Date().getFullYear()]);
    setAppliedFilters({});
    setPage(1);
  };
  
  const handleYearRangeChange = (value: number[]) => {
    setYearRange([value[0], value[1]]);
    setFilters(prev => ({
      ...prev,
      year_from: value[0],
      year_to: value[1]
    }));
  };
  
  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  const handleSortChange = (value: string) => {
    setSortBy(value);
    setPage(1);
    // Trigger a refetch with the new sort parameter
    setTimeout(() => refetch(), 0);
  };
  
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // Generate pagination
  const renderPagination = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    
    let startPage = Math.max(1, page - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
    
    // Adjust if we're near the end
    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    
    return (
      <div className="flex items-center justify-center mt-8 space-x-2 rtl:space-x-reverse">
        <Button
          variant="outline"
          size="icon"
          onClick={() => handlePageChange(Math.max(1, page - 1))}
          disabled={page === 1}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        
        {startPage > 1 && (
          <>
            <Button
              variant={page === 1 ? "default" : "outline"}
              size="sm"
              onClick={() => handlePageChange(1)}
            >
              1
            </Button>
            {startPage > 2 && <span className="text-muted-foreground">...</span>}
          </>
        )}
        
        {pageNumbers.map(num => (
          <Button
            key={num}
            variant={page === num ? "default" : "outline"}
            size="sm"
            onClick={() => handlePageChange(num)}
          >
            {num}
          </Button>
        ))}
        
        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className="text-muted-foreground">...</span>}
            <Button
              variant={page === totalPages ? "default" : "outline"}
              size="sm"
              onClick={() => handlePageChange(totalPages)}
            >
              {totalPages}
            </Button>
          </>
        )}
        
        <Button
          variant="outline"
          size="icon"
          onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>
    );
  };
  
  // Get applied filters count
  const getAppliedFiltersCount = () => {
    return Object.keys(appliedFilters).length;
  };
  
  return (
    <>
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-6">
            {debouncedQuery 
              ? `نتایج جستجو برای "${debouncedQuery}"` 
              : getAppliedFiltersCount() > 0 
                ? 'نتایج فیلتر شده' 
                : 'جستجوی پیشرفته'}
          </h1>
          
          <div className="glass-effect p-6 rounded-lg mb-8">
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-grow">
                  <Search className="absolute right-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="جستجو فیلم، سریال، انیمیشن یا مستند..."
                    className="pr-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute left-2 top-2 h-6 w-6 p-0"
                      onClick={() => setSearchQuery('')}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                
                {/* Mobile filter sheet */}
                <div className="md:hidden">
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="outline" className="flex items-center">
                        <Filter className="h-4 w-4 mr-2" />
                        فیلترها
                        {getAppliedFiltersCount() > 0 && (
                          <span className="ml-2 bg-primary text-primary-foreground rounded-full text-xs w-5 h-5 flex items-center justify-center">
                            {getAppliedFiltersCount()}
                          </span>
                        )}
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-[85vw] sm:w-[400px]">
                      <SheetHeader>
                        <SheetTitle>فیلترهای جستجو</SheetTitle>
                      </SheetHeader>
                      <div className="py-4 space-y-6">
                        <div className="space-y-2">
                          <Label>نوع محتوا</Label>
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
                          <Label>سال انتشار</Label>
                          <div className="px-2 pt-2">
                            <Slider
                              value={yearRange}
                              min={1900}
                              max={new Date().getFullYear()}
                              step={1}
                              onValueChange={handleYearRangeChange}
                              minStepsBetweenThumbs={1}
                            />
                            <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                              <span>{yearRange[0]}</span>
                              <span>{yearRange[1]}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label>حداقل امتیاز</Label>
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
                        
                        {genres && genres.length > 0 && (
                          <div className="space-y-2">
                            <Label>ژانر</Label>
                            <Select
                              value={filters.genre}
                              onValueChange={(value) => handleFilterChange('genre', value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="همه ژانرها" />
                              </SelectTrigger>
                              <SelectContent>
                                {genres.map((genre: any) => (
                                  <SelectItem key={genre.id} value={genre.slug}>
                                    {genre.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                        
                        <div className="flex justify-end space-x-2 rtl:space-x-reverse pt-4">
                          <Button 
                            variant="outline"
                            onClick={handleClearFilters}
                          >
                            پاک کردن
                          </Button>
                          <Button 
                            onClick={() => {
                              handleSearch(new Event('submit') as any);
                              document.querySelector('[data-radix-dialog-close]')?.dispatchEvent(
                                new MouseEvent('click', { bubbles: true })
                              );
                            }}
                          >
                            اعمال فیلترها
                          </Button>
                        </div>
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>
                
                <div className="hidden md:flex md:space-x-2 rtl:space-x-reverse">
                  <Button type="submit">جستجو</Button>
                  {getAppliedFiltersCount() > 0 && (
                    <Button 
                      variant="outline" 
                      type="button"
                      onClick={handleClearFilters}
                    >
                      پاک کردن فیلترها
                    </Button>
                  )}
                </div>
              </div>
              
              {/* Desktop filters */}
              <div className="hidden md:flex flex-wrap gap-4 pt-4">
                <div className="flex flex-col space-y-1 min-w-[200px]">
                  <Label>نوع محتوا</Label>
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
                
                <div className="flex flex-col space-y-1 min-w-[200px]">
                  <Label>حداقل امتیاز</Label>
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
                
                {genres && genres.length > 0 && (
                  <div className="flex flex-col space-y-1 min-w-[200px]">
                    <Label>ژانر</Label>
                    <Select
                      value={filters.genre}
                      onValueChange={(value) => handleFilterChange('genre', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="همه ژانرها" />
                      </SelectTrigger>
                      <SelectContent>
                        {genres.map((genre: any) => (
                          <SelectItem key={genre.id} value={genre.slug}>
                            {genre.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                <div className="flex flex-col space-y-1 min-w-[250px]">
                  <Label>سال انتشار</Label>
                  <div className="px-2 pt-6">
                    <Slider
                      value={yearRange}
                      min={1900}
                      max={new Date().getFullYear()}
                      step={1}
                      onValueChange={handleYearRangeChange}
                      minStepsBetweenThumbs={1}
                    />
                    <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                      <span>{yearRange[0]}</span>
                      <span>{yearRange[1]}</span>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
          
          {/* Results section */}
          <div className="flex justify-between items-center mb-6">
            <div className="text-muted-foreground">
              {searchResults && !isLoading ? (
                <span>
                  {searchResults.length > 0 
                    ? `${searchResults.length} نتیجه یافت شد` 
                    : 'نتیجه‌ای یافت نشد'}
                </span>
              ) : null}
            </div>
            
            <div className="flex items-center">
              <SlidersHorizontal className="h-4 w-4 mr-2 text-muted-foreground" />
              <Select
                value={sortBy}
                onValueChange={handleSortChange}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="مرتب‌سازی" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">جدیدترین</SelectItem>
                  <SelectItem value="oldest">قدیمی‌ترین</SelectItem>
                  <SelectItem value="imdb">امتیاز IMDB</SelectItem>
                  <SelectItem value="rating">امتیاز کاربران</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          ) : isError ? (
            <div className="text-center py-12 glass-effect rounded-lg p-8">
              <div className="text-xl font-bold text-foreground mb-4">خطا در جستجو</div>
              <p className="text-muted-foreground mb-6">متأسفانه خطایی در هنگام جستجو رخ داد. لطفاً دوباره تلاش کنید.</p>
              <Button onClick={() => refetch()}>تلاش مجدد</Button>
            </div>
          ) : searchResults && searchResults.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {searchResults.map(item => (
                  <ContentCard key={item.id} content={item} className="w-full" />
                ))}
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && renderPagination()}
            </>
          ) : (
            (debouncedQuery || getAppliedFiltersCount() > 0) && (
              <div className="text-center py-12 glass-effect rounded-lg p-8">
                <div className="text-xl font-bold text-foreground mb-4">نتیجه‌ای یافت نشد</div>
                <p className="text-muted-foreground mb-6">متأسفانه محتوایی مطابق با جستجوی شما یافت نشد. لطفاً معیارهای جستجو را تغییر دهید.</p>
                <Button onClick={handleClearFilters}>پاک کردن فیلترها</Button>
              </div>
            )
          )}
        </div>
      </main>
      
      <Footer />
    </>
  );
}
