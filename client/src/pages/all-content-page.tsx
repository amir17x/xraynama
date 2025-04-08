import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Search, ChevronDown, ChevronUp, Filter, X, ChevronLeft, ChevronRight } from 'lucide-react';

import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ContentCard } from '@/components/common/ContentCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { ContentType } from '@/types';

interface SearchFilters {
  type?: string;
  year_from?: number;
  year_to?: number;
  min_rating?: number;
  has_dubbing?: boolean;
  has_subtitle?: boolean;
  actor?: string;
  director?: string;
  network?: string;
  country?: string;
}

const AllContentPage: React.FC = () => {
  const [locationPath] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  
  // Get URL query parameters
  const queryFromUrl = searchParams.get('q') || '';
  const advancedFromUrl = searchParams.get('advanced') === 'true';
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState(queryFromUrl);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(advancedFromUrl);
  const [filters, setFilters] = useState<SearchFilters>({
    type: searchParams.get('type') || undefined,
    year_from: searchParams.get('year_from') ? parseInt(searchParams.get('year_from') || '1900') : 1900,
    year_to: searchParams.get('year_to') ? parseInt(searchParams.get('year_to') || '2025') : 2025,
    min_rating: searchParams.get('min_rating') ? parseFloat(searchParams.get('min_rating') || '0') : undefined,
    has_dubbing: searchParams.get('has_dubbing') === 'true',
    has_subtitle: searchParams.get('has_subtitle') === 'true',
    actor: searchParams.get('actor') || undefined,
    director: searchParams.get('director') || undefined
  });
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('newest');
  const itemsPerPage = 24;
  
  // Fetch all content
  const { data: allContents, isLoading } = useQuery<ContentType[]>({
    queryKey: ['/api/content'],
    retry: false,
  });
  
  // Apply filters to content
  const filteredContents = React.useMemo(() => {
    if (!allContents) return [];
    
    return allContents.filter(content => {
      // Search query filter
      if (searchQuery && !content.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
          !content.englishTitle.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !content.description.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      // Content type filter
      if (filters.type && filters.type !== 'all' && content.type !== filters.type) {
        return false;
      }
      
      // Year range filter
      if (filters.year_from && content.year < filters.year_from) {
        return false;
      }
      
      if (filters.year_to && content.year > filters.year_to) {
        return false;
      }
      
      // Rating filter
      if (filters.min_rating && (!content.imdbRating || parseFloat(content.imdbRating) < filters.min_rating)) {
        return false;
      }
      
      // Dubbing filter
      if (filters.has_dubbing && !content.hasPersianDubbing) {
        return false;
      }
      
      // Subtitle filter
      if (filters.has_subtitle && !content.hasPersianSubtitle) {
        return false;
      }
      
      return true;
    });
  }, [allContents, searchQuery, filters]);
  
  // Sort content
  const sortedContents = React.useMemo(() => {
    if (!filteredContents) return [];
    
    return [...filteredContents].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'highest-rating':
          return parseFloat(b.imdbRating || '0') - parseFloat(a.imdbRating || '0');
        case 'lowest-rating':
          return parseFloat(a.imdbRating || '0') - parseFloat(b.imdbRating || '0');
        case 'a-z':
          return a.title.localeCompare(b.title);
        case 'z-a':
          return b.title.localeCompare(a.title);
        default:
          return 0;
      }
    });
  }, [filteredContents, sortBy]);
  
  // Paginate content
  const totalPages = Math.ceil((sortedContents?.length || 0) / itemsPerPage);
  const currentContents = sortedContents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  // Reset to first page when search or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filters, sortBy]);
  
  // Update URL with search params
  const [, navigate] = useLocation();
  
  const updateQueryParams = () => {
    const params = new URLSearchParams();
    
    if (searchQuery) {
      params.set('q', searchQuery);
    }
    
    if (filters.type && filters.type !== 'all') {
      params.set('type', filters.type);
    }
    
    if (filters.year_from && filters.year_from !== 1900) {
      params.set('year_from', filters.year_from.toString());
    }
    
    if (filters.year_to && filters.year_to !== 2025) {
      params.set('year_to', filters.year_to.toString());
    }
    
    if (filters.min_rating) {
      params.set('min_rating', filters.min_rating.toString());
    }
    
    if (filters.has_dubbing) {
      params.set('has_dubbing', 'true');
    }
    
    if (filters.has_subtitle) {
      params.set('has_subtitle', 'true');
    }
    
    if (filters.actor) {
      params.set('actor', filters.actor);
    }
    
    if (filters.director) {
      params.set('director', filters.director);
    }
    
    const queryString = params.toString();
    navigate(`/all-content${queryString ? `?${queryString}` : ''}`);
  };
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateQueryParams();
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
  
  const resetFilters = () => {
    setFilters({
      type: undefined,
      year_from: 1900,
      year_to: 2025,
      min_rating: undefined,
      has_dubbing: false,
      has_subtitle: false,
      actor: undefined,
      director: undefined
    });
    setSearchQuery('');
  };
  
  const applyFilters = () => {
    updateQueryParams();
  };
  
  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#111827] bg-gradient-to-b from-black/70 to-gray-900/70 pt-6">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-8">
            {searchQuery ? `نتایج جستجو برای "${searchQuery}"` : "تمام محتواها"}
          </h1>
          
          {/* Basic Search Bar */}
          <div className="mb-6">
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="جستجو در عنوان، توضیحات و..."
                  className="bg-black/20 border-gray-700 pr-10 pl-4 text-white placeholder:text-gray-400"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <Button 
                type="button" 
                variant="outline" 
                className="gap-2 bg-black/20 border-gray-700 text-white hover:bg-gray-700"
                onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
              >
                {showAdvancedSearch ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                جستجوی پیشرفته
              </Button>
              
              <Button 
                type="submit"
                className="gap-2 bg-primary hover:bg-primary/90"
              >
                <Search className="h-4 w-4" />
                جستجو
              </Button>
            </form>
          </div>
          
          {/* Advanced Search Panel */}
          {showAdvancedSearch && (
            <div className="glass-effect shadow rounded-lg p-6 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <Label className="block mb-2 text-white">نوع محتوا</Label>
                  <Select
                    value={filters.type || 'all'}
                    onValueChange={(value) => handleFilterChange('type', value === 'all' ? undefined : value)}
                  >
                    <SelectTrigger className="bg-black/20 border-gray-700 text-white">
                      <SelectValue placeholder="همه" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700 text-white">
                      <SelectItem value="all">همه</SelectItem>
                      <SelectItem value="movie">فیلم</SelectItem>
                      <SelectItem value="series">سریال</SelectItem>
                      <SelectItem value="animation">انیمیشن</SelectItem>
                      <SelectItem value="documentary">مستند</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label className="block mb-2 text-white">سال انتشار</Label>
                  <div className="px-2 pt-4">
                    <Slider
                      value={[filters.year_from || 1900, filters.year_to || 2025]}
                      min={1900}
                      max={2025}
                      step={1}
                      onValueChange={handleYearRangeChange}
                      className="mb-2"
                    />
                    <div className="flex justify-between mt-2 text-sm text-gray-400">
                      <span>{filters.year_from || 1900}</span>
                      <span>{filters.year_to || 2025}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label className="block mb-2 text-white">حداقل امتیاز</Label>
                  <Select
                    value={filters.min_rating?.toString() || ''}
                    onValueChange={(value) => handleFilterChange('min_rating', value === '' ? undefined : parseFloat(value))}
                  >
                    <SelectTrigger className="bg-black/20 border-gray-700 text-white">
                      <SelectValue placeholder="بدون محدودیت" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700 text-white">
                      <SelectItem value="">بدون محدودیت</SelectItem>
                      <SelectItem value="5">بالای 5</SelectItem>
                      <SelectItem value="6">بالای 6</SelectItem>
                      <SelectItem value="7">بالای 7</SelectItem>
                      <SelectItem value="8">بالای 8</SelectItem>
                      <SelectItem value="9">بالای 9</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label className="block mb-2 text-white">بازیگر</Label>
                  <Input
                    placeholder="نام بازیگر..."
                    className="bg-black/20 border-gray-700 text-white placeholder:text-gray-400"
                    value={filters.actor || ''}
                    onChange={(e) => handleFilterChange('actor', e.target.value || undefined)}
                  />
                </div>
                
                <div>
                  <Label className="block mb-2 text-white">کارگردان</Label>
                  <Input
                    placeholder="نام کارگردان..."
                    className="bg-black/20 border-gray-700 text-white placeholder:text-gray-400"
                    value={filters.director || ''}
                    onChange={(e) => handleFilterChange('director', e.target.value || undefined)}
                  />
                </div>
                
                <div className="flex flex-col justify-end">
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <Checkbox 
                        id="dubbing" 
                        checked={filters.has_dubbing}
                        onCheckedChange={(checked) => handleFilterChange('has_dubbing', checked === true)}
                      />
                      <Label htmlFor="dubbing" className="text-white mr-2">دوبله فارسی</Label>
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <Checkbox 
                        id="subtitle" 
                        checked={filters.has_subtitle}
                        onCheckedChange={(checked) => handleFilterChange('has_subtitle', checked === true)}
                      />
                      <Label htmlFor="subtitle" className="text-white mr-2">زیرنویس فارسی</Label>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end mt-6 gap-2">
                <Button 
                  variant="outline" 
                  onClick={resetFilters}
                  className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
                >
                  <X className="h-4 w-4 ml-2" />
                  پاک کردن فیلترها
                </Button>
                <Button onClick={applyFilters}>
                  <Filter className="h-4 w-4 ml-2" />
                  اعمال فیلتر
                </Button>
              </div>
            </div>
          )}
          
          {/* Sort Bar */}
          <div className="flex justify-between items-center mb-6">
            <div className="text-gray-400">
              {sortedContents.length} محتوا یافت شد
            </div>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px] bg-black/20 border-gray-700 text-white">
                <SelectValue placeholder="مرتب‌سازی بر اساس" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700 text-white">
                <SelectItem value="newest">جدیدترین</SelectItem>
                <SelectItem value="oldest">قدیمی‌ترین</SelectItem>
                <SelectItem value="highest-rating">بیشترین امتیاز</SelectItem>
                <SelectItem value="lowest-rating">کمترین امتیاز</SelectItem>
                <SelectItem value="a-z">حروف الفبا (الف تا ی)</SelectItem>
                <SelectItem value="z-a">حروف الفبا (ی تا الف)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Content Grid */}
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {[...Array(24)].map((_, i) => (
                <div key={i} className="relative bg-black/20 rounded-lg overflow-hidden">
                  <Skeleton className="w-full aspect-[2/3]" />
                  <div className="p-3">
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-3 w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : sortedContents.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-400 text-lg">محتوایی یافت نشد.</p>
              <p className="text-gray-500 mt-2">لطفاً فیلترهای جستجو را تغییر دهید.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {currentContents.map((content) => (
                  <ContentCard key={content.id} content={content} />
                ))}
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-10">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="bg-black/20 border-gray-700 text-white hover:bg-gray-700"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  
                  {[...Array(totalPages)].map((_, i) => {
                    const page = i + 1;
                    // Show current page, first, last, and at most 2 pages around current
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          className={currentPage === page 
                            ? "bg-primary" 
                            : "bg-black/20 border-gray-700 text-white hover:bg-gray-700"}
                        >
                          {page}
                        </Button>
                      );
                    } else if (
                      page === 2 ||
                      page === totalPages - 1
                    ) {
                      return <span key={page} className="text-gray-500">...</span>;
                    }
                    return null;
                  })}
                  
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="bg-black/20 border-gray-700 text-white hover:bg-gray-700"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
};

export default AllContentPage;