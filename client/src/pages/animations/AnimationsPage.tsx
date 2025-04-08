import { useQuery } from '@tanstack/react-query';
import { ContentType } from '@/types';
import { SectionLayout } from '@/components/layout/SectionLayout';
import { ContentGrid } from '@/components/common/ContentGrid';
import { FileVideo } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import FeaturedContentSection from '@/components/content/FeaturedContentSection';

// کامپوننت انیمیشن کارت ویژه با جلوه گلاسمورفیسم
function AnimationHeroCard({ animation }: { animation: ContentType }) {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div 
      className="relative overflow-hidden rounded-2xl aspect-video glass-effect h-[400px] group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div 
        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out"
        style={{ 
          backgroundImage: `url(${animation.poster})`,
          transform: isHovered ? 'scale(1.05)' : 'scale(1)'
        }}
      ></div>
      
      <div className="absolute inset-0 bg-gradient-to-t from-[#00142c] via-[#00142c]/60 to-transparent"></div>
      
      {/* اطلاعات انیمیشن */}
      <div className="absolute bottom-0 left-0 right-0 p-6 z-10 transform transition-transform duration-500 ease-out">
        <div className="bg-[#00BFFF]/10 backdrop-blur-md rounded-xl p-4 border border-[#00BFFF]/20">
          <h3 className="text-xl md:text-2xl font-bold mb-2 text-white">{animation.title}</h3>
          <p className="text-gray-300 text-sm mb-3">{animation.englishTitle}</p>
          
          <div className="flex items-center mb-4">
            <div className="bg-[#00BFFF]/20 text-white px-2 py-1 rounded text-xs ml-3">
              {animation.year}
            </div>
            <div className="bg-[#00BFFF]/20 text-white px-2 py-1 rounded text-xs ml-3">
              انیمیشن
            </div>
            {animation.rating && (
              <div className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded text-xs flex items-center">
                <span className="ml-1">IMDB</span>
                <span>{animation.rating.toFixed(1)}</span>
              </div>
            )}
          </div>
          
          <p className="text-gray-300 text-sm mb-4 line-clamp-2">{animation.description}</p>
          
          <div className="flex space-x-2 space-x-reverse">
            <button className="w-full flex items-center justify-center bg-[#00BFFF] hover:bg-[#00BFFF]/90 text-white rounded-lg px-4 py-2 transition duration-300 transform hover:scale-105">
              <FileVideo className="ml-2 h-5 w-5" />
              مشاهده انیمیشن
            </button>
          </div>
        </div>
      </div>
      
      {/* افکت گلاسمورفیسم بهبود یافته */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[400px] -left-[300px] w-[800px] h-[800px] rounded-full bg-[#00BFFF]/5 blur-[100px]"></div>
        <div className="absolute -bottom-[400px] -right-[300px] w-[800px] h-[800px] rounded-full bg-[#00BFFF]/5 blur-[100px]"></div>
      </div>
      
      {/* افکت نئون در هنگام هاور */}
      <div className={`
        absolute inset-0 border-2 border-transparent rounded-2xl transition-all duration-700 ease-out pointer-events-none
        ${isHovered ? 'border-[#00BFFF]/30 shadow-[0_0_15px_2px_rgba(0,191,255,0.2)]' : ''}
      `}></div>
    </div>
  );
}

export default function AnimationsPage() {
  const [currentTab, setCurrentTab] = useState('all');
  const [genreFilter, setGenreFilter] = useState('all');
  const [featuredAnimation, setFeaturedAnimation] = useState<ContentType | null>(null);
  
  // لیست انیمیشن‌ها
  const { data: animations, isLoading: isAnimationsLoading } = useQuery<ContentType[]>({
    queryKey: ['/api/content/type/animation'],
    staleTime: 1000 * 60 * 5, // 5 دقیقه
  });
  
  // انیمیشن‌های محبوب
  const { data: popularAnimations, isLoading: isPopularLoading } = useQuery<ContentType[]>({
    queryKey: ['/api/content/popular/animation', 5],
    staleTime: 1000 * 60 * 5,
  });
  
  // انتخاب یک انیمیشن ویژه برای نمایش در بالای صفحه
  useEffect(() => {
    if (animations && animations.length > 0) {
      // انتخاب بهترین انیمیشن از نظر امتیاز
      const bestAnimation = [...animations].sort((a, b) => (b.rating || 0) - (a.rating || 0))[0];
      setFeaturedAnimation(bestAnimation);
    }
  }, [animations]);
  
  // فیلتر محتوا بر اساس تب انتخاب شده
  const filteredAnimations = () => {
    if (!animations) return [];
    
    let filtered = [...animations];
    
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
    
    // حذف انیمیشن ویژه از لیست برای جلوگیری از تکرار
    if (featuredAnimation) {
      filtered = filtered.filter(item => item.id !== featuredAnimation.id);
    }
    
    return filtered;
  };
  
  return (
    <SectionLayout 
      title="انیمیشن‌ها"
      description="دنیای جذاب انیمیشن‌ها برای تمام سنین با بهترین کیفیت"
      icon={<FileVideo className="h-8 w-8" />}
    >
      {/* انیمیشن ویژه */}
      {featuredAnimation && (
        <div className="mb-12">
          <AnimationHeroCard animation={featuredAnimation} />
        </div>
      )}
      
      {/* انیمیشن‌های محبوب با استایل گلاسمورفیسم */}
      {popularAnimations && popularAnimations.length > 0 && (
        <FeaturedContentSection
          title="انیمیشن‌های محبوب"
          subtitle="محبوب‌ترین انیمیشن‌های سایت بر اساس بازدید"
          content={popularAnimations || []}
          isLoading={isPopularLoading}
          icon="star"
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
                <SelectItem value="7">انیمیشن</SelectItem>
                <SelectItem value="1">اکشن</SelectItem>
                <SelectItem value="3">کمدی</SelectItem>
                <SelectItem value="6">ماجراجویی</SelectItem>
                <SelectItem value="4">علمی تخیلی</SelectItem>
                <SelectItem value="8">خانوادگی</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      {/* نمایش گرید انیمیشن‌ها */}
      <ContentGrid 
        content={filteredAnimations()} 
        isLoading={isAnimationsLoading}
        filterOptions={false} // فیلترها در بالا اضافه شده‌اند
      />
    </SectionLayout>
  );
}