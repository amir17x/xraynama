import { useEffect, useState } from 'react';
import { useLocation, Link } from 'wouter';
import { ChevronDown, Filter, SlidersHorizontal, Star, Clock, Calendar } from 'lucide-react';
import { ContentType } from '@/types';
import { ContentCard } from '@/components/common/ContentCard';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

// کاتگوری‌های سایت
const categories = [
  { id: 'action', name: 'اکشن', icon: '🔥', color: 'from-red-500/20 to-orange-500/20', borderColor: 'border-red-500/30', hoverColor: 'group-hover:border-red-500/50' },
  { id: 'comedy', name: 'کمدی', icon: '😄', color: 'from-yellow-500/20 to-amber-500/20', borderColor: 'border-yellow-500/30', hoverColor: 'group-hover:border-yellow-500/50' },
  { id: 'drama', name: 'درام', icon: '🎭', color: 'from-blue-500/20 to-indigo-500/20', borderColor: 'border-blue-500/30', hoverColor: 'group-hover:border-blue-500/50' },
  { id: 'sci-fi', name: 'علمی-تخیلی', icon: '🚀', color: 'from-purple-500/20 to-violet-500/20', borderColor: 'border-purple-500/30', hoverColor: 'group-hover:border-purple-500/50' },
  { id: 'horror', name: 'ترسناک', icon: '👻', color: 'from-gray-500/20 to-slate-500/20', borderColor: 'border-gray-500/30', hoverColor: 'group-hover:border-gray-500/50' },
  { id: 'documentary', name: 'مستند', icon: '🎥', color: 'from-green-500/20 to-emerald-500/20', borderColor: 'border-green-500/30', hoverColor: 'group-hover:border-green-500/50' },
  { id: 'animation', name: 'انیمیشن', icon: '🎬', color: 'from-pink-500/20 to-rose-500/20', borderColor: 'border-pink-500/30', hoverColor: 'group-hover:border-pink-500/50' },
  { id: 'family', name: 'خانوادگی', icon: '👨‍👩‍👧‍👦', color: 'from-teal-500/20 to-cyan-500/20', borderColor: 'border-teal-500/30', hoverColor: 'group-hover:border-teal-500/50' },
];

// گزینه‌های فیلتر
const filterOptions = [
  { name: 'امتیاز', options: ['بالاترین امتیاز', 'پایین‌ترین امتیاز'], icon: <Star className="h-4 w-4" /> },
  { name: 'زمان', options: ['جدیدترین', 'قدیمی‌ترین'], icon: <Clock className="h-4 w-4" /> },
  { name: 'سال', options: ['2024', '2023', '2022', '2021', '2020', 'قبل از 2020'], icon: <Calendar className="h-4 w-4" /> },
];

const CategoriesPage = () => {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [currentCategory, setCurrentCategory] = useState<string | null>(null);
  const [content, setContent] = useState<ContentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [openFilter, setOpenFilter] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    rating: '',
    year: '',
    time: '',
  });

  // از ادرس بار دسته‌بندی فعلی را استخراج می‌کنیم
  useEffect(() => {
    const pathParts = location.split('/');
    const categoryFromPath = pathParts[pathParts.length - 1];
    
    // اگر آدرس شامل یکی از دسته‌بندی‌های معتبر بود، آن را به عنوان دسته‌بندی فعلی تنظیم می‌کنیم
    if (categories.some(cat => cat.id === categoryFromPath)) {
      setCurrentCategory(categoryFromPath);
    } else {
      // در غیر این صورت، اولین دسته‌بندی را به عنوان دسته‌بندی پیش‌فرض انتخاب می‌کنیم
      setCurrentCategory(categories[0].id);
    }
  }, [location]);

  // لود محتوا بر اساس دسته‌بندی انتخاب شده
  useEffect(() => {
    const fetchCategoryContent = async () => {
      if (!currentCategory) return;
      
      setLoading(true);
      try {
        // درخواست API برای دریافت محتوای مرتبط با دسته‌بندی
        const response = await apiRequest({ 
          url: `/api/content/genre/${currentCategory}` 
        });
        if (response) {
          setContent(response as ContentType[]);
        } else {
          setContent([]);
        }
      } catch (error) {
        console.error("Error fetching category content:", error);
        toast({
          title: "خطا در بارگذاری",
          description: "متأسفانه مشکلی در دریافت اطلاعات رخ داده است. لطفاً دوباره تلاش کنید.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryContent();
  }, [currentCategory, toast]);

  const handleCategoryChange = (category: string) => {
    setLocation(`/genres/${category}`);
  };

  const toggleFilter = (filterName: string) => {
    if (openFilter === filterName) {
      setOpenFilter(null);
    } else {
      setOpenFilter(filterName);
    }
  };

  const applyFilter = (filterType: string, value: string) => {
    setFilters({
      ...filters,
      [filterType]: value,
    });
    setOpenFilter(null);
  };

  const filteredContent = () => {
    let result = [...content];
    
    // اعمال فیلتر امتیاز
    if (filters.rating) {
      if (filters.rating === 'بالاترین امتیاز') {
        result.sort((a, b) => ((b.imdbRating as number) || 0) - ((a.imdbRating as number) || 0));
      } else if (filters.rating === 'پایین‌ترین امتیاز') {
        result.sort((a, b) => ((a.imdbRating as number) || 0) - ((b.imdbRating as number) || 0));
      }
    }
    
    // اعمال فیلتر زمان (بر اساس تاریخ ایجاد)
    if (filters.time) {
      if (filters.time === 'جدیدترین') {
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      } else if (filters.time === 'قدیمی‌ترین') {
        result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      }
    }
    
    // اعمال فیلتر سال
    if (filters.year) {
      if (filters.year === 'قبل از 2020') {
        result = result.filter(item => item.year < 2020);
      } else {
        const year = parseInt(filters.year);
        result = result.filter(item => item.year === year);
      }
    }
    
    return result;
  };

  // نمایش لودینگ
  if (!currentCategory) {
    return (
      <div className="container mx-auto py-16 min-h-[50vh] flex items-center justify-center">
        <div className="shimmer-effect w-full h-32 rounded-xl"></div>
      </div>
    );
  }

  return (
    <div className="py-12 container-fluid px-4 md:px-6 lg:px-8 relative overflow-hidden">
      {/* Background gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-background/20 via-background/10 to-background/20 backdrop-blur-sm z-0"></div>
      
      <div className="relative z-10">
        <div className="container-glass mb-10 p-6 rounded-xl">
          <h1 className="text-3xl md:text-4xl font-bold mb-6 text-center text-foreground/90">دسته‌بندی‌ها</h1>
          
          {/* Category tabs */}
          <Tabs 
            defaultValue={currentCategory}
            value={currentCategory || categories[0].id}
            onValueChange={handleCategoryChange}
            className="w-full mt-4"
          >
            <div className="relative overflow-hidden rounded-xl">
              <TabsList className="category-tabs-list w-full justify-start overflow-x-auto flex-nowrap scrollbar-hide">
                {categories.map((category) => (
                  <TabsTrigger
                    key={category.id}
                    value={category.id}
                    className="category-tab-item data-[state=active]:bg-primary/15 data-[state=active]:text-primary py-2.5 px-4"
                  >
                    <span className="mr-2">{category.icon}</span>
                    {category.name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {/* Filter section */}
            <div className="flex justify-between items-center my-6">
              <div className="filter-section flex items-center space-x-2 rtl:space-x-reverse">
                <div className="text-sm text-muted-foreground flex items-center">
                  <Filter className="h-4 w-4 mr-2" />
                  <span>فیلترها:</span>
                </div>
                
                {filterOptions.map((filter) => (
                  <div key={filter.name} className="relative">
                    <Button
                      variant="outline"
                      size="sm"
                      className="filter-button bg-card/30 backdrop-blur-sm border-primary/20 hover:bg-primary/20"
                      onClick={() => toggleFilter(filter.name)}
                    >
                      {filter.icon}
                      <span className="mx-2">{filter.name}</span>
                      <ChevronDown className={cn(
                        "h-4 w-4 transition-transform",
                        openFilter === filter.name ? "transform rotate-180" : ""
                      )} />
                    </Button>
                    
                    {/* Filter dropdown */}
                    {openFilter === filter.name && (
                      <div className="absolute z-50 top-full left-0 mt-1 w-48 glassmorphic-dropdown p-2 rounded-lg border border-border/30 shadow-lg">
                        <div className="py-1">
                          {filter.options.map((option) => (
                            <button
                              key={option}
                              className="w-full text-right px-3 py-2 text-sm rounded-md hover:bg-primary/20 transition-colors"
                              onClick={() => {
                                let filterType = '';
                                switch (filter.name) {
                                  case 'امتیاز':
                                    filterType = 'rating';
                                    break;
                                  case 'زمان':
                                    filterType = 'time';
                                    break;
                                  case 'سال':
                                    filterType = 'year';
                                    break;
                                }
                                applyFilter(filterType, option);
                              }}
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              <Button 
                variant="outline" 
                size="sm" 
                className="filter-reset-button"
                onClick={() => setFilters({ rating: '', year: '', time: '' })}
              >
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                پاک کردن فیلترها
              </Button>
            </div>

            {/* Active filters display */}
            {(filters.rating || filters.year || filters.time) && (
              <div className="flex flex-wrap gap-2 mb-6">
                {filters.rating && (
                  <div className="px-3 py-1 text-xs rounded-full bg-primary/20 text-primary flex items-center">
                    امتیاز: {filters.rating}
                    <button 
                      className="ml-2 hover:bg-primary/30 rounded-full p-0.5"
                      onClick={() => setFilters({...filters, rating: ''})}
                    >
                      &times;
                    </button>
                  </div>
                )}
                {filters.time && (
                  <div className="px-3 py-1 text-xs rounded-full bg-primary/20 text-primary flex items-center">
                    زمان: {filters.time}
                    <button 
                      className="ml-2 hover:bg-primary/30 rounded-full p-0.5"
                      onClick={() => setFilters({...filters, time: ''})}
                    >
                      &times;
                    </button>
                  </div>
                )}
                {filters.year && (
                  <div className="px-3 py-1 text-xs rounded-full bg-primary/20 text-primary flex items-center">
                    سال: {filters.year}
                    <button 
                      className="ml-2 hover:bg-primary/30 rounded-full p-0.5"
                      onClick={() => setFilters({...filters, year: ''})}
                    >
                      &times;
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Content display area for each category */}
            {categories.map((category) => (
              <TabsContent 
                key={category.id} 
                value={category.id} 
                className={cn(
                  "mt-6 transition-all duration-500 animate-fadeIn category-content",
                  currentCategory === category.id ? "opacity-100" : "opacity-0",
                )}
              >
                <div className="glassmorphic-card p-6 rounded-xl mb-6 bg-gradient-to-br border border-primary/10 shadow-inner">
                  <div className="flex items-center mb-6">
                    <span className="text-4xl mr-3">{category.icon}</span>
                    <div>
                      <h2 className="text-xl md:text-2xl font-bold">{category.name}</h2>
                      <p className="text-muted-foreground">محتوای مرتبط با ژانر {category.name}</p>
                    </div>
                  </div>
                </div>
                
                {loading ? (
                  // Loading skeleton
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <div key={i} className="shimmer-card aspect-[2/3] rounded-xl overflow-hidden">
                        <div className="shimmer-effect w-full h-full"></div>
                      </div>
                    ))}
                  </div>
                ) : filteredContent().length > 0 ? (
                  // Content grid
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
                    {filteredContent().map((item) => (
                      <ContentCard 
                        key={item.id}
                        content={item}
                        className="h-full w-full"
                      />
                    ))}
                  </div>
                ) : (
                  // No content found
                  <div className="glassmorphic-card p-10 rounded-xl text-center">
                    <h3 className="text-xl font-medium mb-3">محتوایی یافت نشد</h3>
                    <p className="text-muted-foreground mb-4">محتوایی با این شرایط در دسته‌بندی {category.name} وجود ندارد.</p>
                    <Button onClick={() => setFilters({ rating: '', year: '', time: '' })}>
                      پاک کردن فیلترها
                    </Button>
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </div>
        
        {/* Category cards section */}
        <div className="mt-16">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center text-foreground/90">همه دسته‌بندی‌ها</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Link key={category.id} href={`/genres/${category.id}`}>
                <div className={cn(
                  "glassmorphic-category-card group p-6 rounded-xl cursor-pointer transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl border-2",
                  category.borderColor,
                  category.hoverColor
                )}>
                  <div className={cn(
                    "absolute inset-0 rounded-xl bg-gradient-to-br opacity-30 -z-10",
                    category.color
                  )}></div>
                  <div className="flex flex-col items-center justify-center text-center h-full">
                    <span className="text-5xl mb-4 transform transition-transform group-hover:scale-110">{category.icon}</span>
                    <h3 className="text-xl font-bold">{category.name}</h3>
                    <div className="mt-4 w-0 group-hover:w-20 h-0.5 bg-primary/50 transition-all duration-300"></div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoriesPage;