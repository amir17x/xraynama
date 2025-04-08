import { useQuery } from '@tanstack/react-query';
import { ContentType } from '@/types';
import { SectionLayout } from '@/components/layout/SectionLayout';
import { ContentGrid } from '@/components/common/ContentGrid';
import { Video } from 'lucide-react';
import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FeaturedSlider } from '@/components/common/FeaturedSlider';

export default function SeriesPage() {
  const [currentTab, setCurrentTab] = useState('all');
  const [genreFilter, setGenreFilter] = useState('all');
  
  // لیست سریال‌ها
  const { data: series, isLoading: isSeriesLoading } = useQuery<ContentType[]>({
    queryKey: ['/api/content/type/series'],
    staleTime: 1000 * 60 * 5, // 5 دقیقه
  });
  
  // سریال‌های برتر
  const { data: topRatedSeries, isLoading: isTopRatedLoading } = useQuery<ContentType[]>({
    queryKey: ['/api/content/top-rated/series', 5],
    staleTime: 1000 * 60 * 5,
  });
  
  // فیلتر محتوا بر اساس تب انتخاب شده
  const filteredSeries = () => {
    if (!series) return [];
    
    let filtered = [...series];
    
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
      filtered = filtered.filter(item => {
        if (item.genres && Array.isArray(item.genres)) {
          // اگر آرایه عددی است
          return item.genres.includes(parseInt(genreFilter));
        } else if (item.genres && typeof item.genres === 'string') {
          // اگر رشته است، آن را به آرایه تبدیل کرده و بررسی می‌کنیم
          return item.genres.split(',').map(g => g.trim()).includes(genreFilter);
        }
        return false;
      });
    }
    
    return filtered;
  };
  
  return (
    <SectionLayout 
      title="سریال‌ها"
      description="مجموعه سریال‌های برتر ایرانی و خارجی با زیرنویس فارسی و دوبله اختصاصی"
      icon={<Video className="h-8 w-8" />}
    >
      {/* سریال‌های برتر با اسلایدر */}
      {topRatedSeries && topRatedSeries.length > 0 && (
        <div className="mb-12">
          <FeaturedSlider
            content={topRatedSeries}
            isLoading={isTopRatedLoading}
          />
        </div>
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
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      {/* نمایش گرید سریال‌ها */}
      <ContentGrid 
        content={filteredSeries()} 
        isLoading={isSeriesLoading}
        filterOptions={false} // فیلترها در بالا اضافه شده‌اند
      />
    </SectionLayout>
  );
}