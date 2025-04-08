import { useQuery } from '@tanstack/react-query';
import { ContentType } from '@/types';
import { SectionLayout } from '@/components/layout/SectionLayout';
import { ContentGrid } from '@/components/common/ContentGrid';
import { FilmIcon } from 'lucide-react';
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import FeaturedContentSection from '@/components/content/FeaturedContentSection';

export default function MoviesPage() {
  const [currentTab, setCurrentTab] = useState('all');
  const [genreFilter, setGenreFilter] = useState('all');
  
  // لیست فیلم‌ها
  const { data: movies, isLoading: isMoviesLoading } = useQuery<ContentType[]>({
    queryKey: ['/api/content/type/movie'],
    staleTime: 1000 * 60 * 5, // 5 دقیقه
  });
  
  // فیلم‌های برتر
  const { data: topRatedMovies, isLoading: isTopRatedLoading } = useQuery<ContentType[]>({
    queryKey: ['/api/content/top-rated/movie', 10],
    staleTime: 1000 * 60 * 5,
  });
  
  // فیلتر محتوا بر اساس تب انتخاب شده
  const filteredMovies = () => {
    if (!movies) return [];
    
    let filtered = [...movies];
    
    // فیلتر بر اساس تب
    switch (currentTab) {
      case 'new':
        filtered = filtered.sort((a, b) => b.year - a.year);
        break;
      case 'popular':
        filtered = filtered.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
        break;
      case 'top-rated':
        filtered = filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      default:
        break;
    }
    
    // فیلتر بر اساس ژانر
    if (genreFilter !== 'all') {
      filtered = filtered.filter(movie => {
        if (movie.genres && Array.isArray(movie.genres)) {
          // اگر آرایه عددی است
          return movie.genres.includes(parseInt(genreFilter));
        } else if (movie.genres && typeof movie.genres === 'string') {
          // اگر رشته است، آن را به آرایه تبدیل کرده و بررسی می‌کنیم
          return movie.genres.split(',').map(g => g.trim()).includes(genreFilter);
        }
        return false;
      });
    }
    
    return filtered;
  };
  
  return (
    <SectionLayout 
      title="فیلم‌های سینمایی"
      description="مجموعه فیلم‌های برتر ایرانی و خارجی با کیفیت‌های مختلف به‌روزترین فیلم‌های روز دنیا"
      icon={<FilmIcon className="h-8 w-8" />}
    >
      {/* فیلم‌های برتر با استایل گلاسمورفیسم */}
      {topRatedMovies && topRatedMovies.length > 0 && (
        <FeaturedContentSection
          title="فیلم‌های برتر"
          subtitle="برترین فیلم‌های سایت بر اساس امتیاز IMDB"
          content={topRatedMovies || []}
          isLoading={isTopRatedLoading}
          icon="award"
          className="mb-12 glass-effect p-6 rounded-xl"
        />
      )}
      
      {/* دسته‌بندی‌ها و فیلترها */}
      <div className="mb-8 glass-effect p-4 rounded-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <Tabs 
            defaultValue="all" 
            value={currentTab}
            onValueChange={setCurrentTab}
            className="w-full md:w-auto"
          >
            <TabsList className="grid grid-cols-4 w-full md:w-auto bg-card/30">
              <TabsTrigger value="all">همه</TabsTrigger>
              <TabsTrigger value="new">جدیدترین</TabsTrigger>
              <TabsTrigger value="popular">محبوب‌ترین</TabsTrigger>
              <TabsTrigger value="top-rated">برترین‌ها</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="flex items-center">
            <span className="ml-2 text-sm text-muted-foreground">ژانر:</span>
            <Select
              value={genreFilter}
              onValueChange={setGenreFilter}
            >
              <SelectTrigger className="w-[180px] bg-card/30 border-[#00BFFF]/20">
                <SelectValue placeholder="انتخاب ژانر" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">همه ژانرها</SelectItem>
                <SelectItem value="1">اکشن</SelectItem>
                <SelectItem value="2">درام</SelectItem>
                <SelectItem value="3">کمدی</SelectItem>
                <SelectItem value="4">علمی تخیلی</SelectItem>
                <SelectItem value="5">ترسناک</SelectItem>
                <SelectItem value="6">ماجراجویی</SelectItem>
                <SelectItem value="7">انیمیشن</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      {/* نمایش گرید فیلم‌ها */}
      <ContentGrid 
        content={filteredMovies()} 
        isLoading={isMoviesLoading}
        filterOptions={false} // فیلترها در بالا اضافه شده‌اند
      />
    </SectionLayout>
  );
}