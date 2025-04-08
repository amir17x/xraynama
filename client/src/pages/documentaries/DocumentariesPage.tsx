import { useQuery } from '@tanstack/react-query';
import { ContentType } from '@/types';
import { SectionLayout } from '@/components/layout/SectionLayout';
import { ContentGrid } from '@/components/common/ContentGrid';
import { Theater, Globe, Tags, Info } from 'lucide-react';
import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

// کارت اطلاعاتی برای مستندها
const DocumentaryInfoCard = () => {
  return (
    <div className="mb-8 glass-effect p-6 rounded-xl">
      <div className="flex items-start">
        <div className="ml-4 bg-[#00BFFF]/10 p-3 rounded-full">
          <Info className="h-6 w-6 text-[#00BFFF]" />
        </div>
        <div>
          <h3 className="text-lg font-medium mb-2">درباره مستندها</h3>
          <p className="text-muted-foreground">
            مستندها دریچه‌ای به دنیای واقعی هستند. از طبیعت و حیات وحش گرفته تا تاریخ، علم، فرهنگ و موضوعات اجتماعی، 
            مستندها با روایت داستان‌های واقعی به ما کمک می‌کنند دنیای پیرامون خود را بهتر درک کنیم.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="bg-[#00BFFF]/5 p-4 rounded-lg flex items-start">
              <Globe className="h-5 w-5 text-[#00BFFF] mt-1 ml-3" />
              <div>
                <h4 className="font-medium mb-1">دسته‌بندی متنوع</h4>
                <p className="text-sm text-muted-foreground">طبیعت، علمی، تاریخی، اجتماعی و...</p>
              </div>
            </div>
            <div className="bg-[#00BFFF]/5 p-4 rounded-lg flex items-start">
              <Tags className="h-5 w-5 text-[#00BFFF] mt-1 ml-3" />
              <div>
                <h4 className="font-medium mb-1">بهترین تولیدکنندگان</h4>
                <p className="text-sm text-muted-foreground">National Geographic، BBC، Netflix و...</p>
              </div>
            </div>
            <div className="bg-[#00BFFF]/5 p-4 rounded-lg flex items-start">
              <Info className="h-5 w-5 text-[#00BFFF] mt-1 ml-3" />
              <div>
                <h4 className="font-medium mb-1">زیرنویس و دوبله</h4>
                <p className="text-sm text-muted-foreground">مستندها با کیفیت بالا و زیرنویس فارسی</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// دسته‌بندی‌های مستند
const DocumentaryCategories = () => {
  const categories = [
    { title: 'طبیعت', count: 42, color: 'from-green-500/20 to-green-600/40' },
    { title: 'تاریخی', count: 28, color: 'from-amber-500/20 to-amber-600/40' },
    { title: 'علمی', count: 35, color: 'from-blue-500/20 to-blue-600/40' },
    { title: 'اجتماعی', count: 19, color: 'from-purple-500/20 to-purple-600/40' },
    { title: 'فرهنگی', count: 23, color: 'from-pink-500/20 to-pink-600/40' },
    { title: 'پزشکی', count: 16, color: 'from-red-500/20 to-red-600/40' },
  ];
  
  return (
    <div className="mb-8">
      <h3 className="text-lg font-medium mb-4 flex items-center">
        <Tags className="ml-2 h-5 w-5 text-[#00BFFF]" />
        دسته‌بندی‌های مستند
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {categories.map((category, index) => (
          <div 
            key={index}
            className="glass-effect relative overflow-hidden rounded-xl p-4 cursor-pointer transition-all duration-300 hover:transform hover:scale-105 border border-white/5 hover:border-[#00BFFF]/30"
          >
            <div className={`absolute inset-0 opacity-20 bg-gradient-to-br ${category.color} -z-10`}></div>
            <h4 className="font-medium text-center mb-1">{category.title}</h4>
            <p className="text-sm text-center text-muted-foreground">{category.count} مستند</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function DocumentariesPage() {
  const [currentTab, setCurrentTab] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  
  // لیست مستندها
  const { data: documentaries, isLoading: isDocumentariesLoading } = useQuery<ContentType[]>({
    queryKey: ['/api/content/type/documentary'],
    staleTime: 1000 * 60 * 5, // 5 دقیقه
  });
  
  // فیلتر محتوا بر اساس تب انتخاب شده
  const filteredDocumentaries = () => {
    if (!documentaries) return [];
    
    let filtered = [...documentaries];
    
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
    
    // فیلتر بر اساس دسته‌بندی (به صورت نمادین)
    if (categoryFilter !== 'all') {
      // در اینجا فرض کردیم که مستندها بر اساس ژانر فیلتر می‌شوند
      filtered = filtered.filter(item => {
        if (item.genres && Array.isArray(item.genres)) {
          // اگر آرایه عددی است
          return item.genres.includes(parseInt(categoryFilter));
        } else if (item.genres && typeof item.genres === 'string') {
          // اگر رشته است، آن را به آرایه تبدیل کرده و بررسی می‌کنیم
          return item.genres.split(',').map(g => g.trim()).includes(categoryFilter);
        }
        return false;
      });
    }
    
    return filtered;
  };
  
  return (
    <SectionLayout 
      title="مستندها"
      description="دنیایی از دانش و اطلاعات در قالب مستندهای جذاب و آموزنده با کیفیت بالا"
      icon={<Theater className="h-8 w-8" />}
    >
      {/* کارت اطلاعاتی */}
      <DocumentaryInfoCard />
      
      {/* دسته‌بندی‌های مستند */}
      <DocumentaryCategories />
      
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
            <span className="ml-2 text-sm text-muted-foreground">دسته‌بندی:</span>
            <Select
              value={categoryFilter}
              onValueChange={setCategoryFilter}
            >
              <SelectTrigger className="w-[180px] bg-card/30 border-[#00BFFF]/20">
                <SelectValue placeholder="انتخاب دسته‌بندی" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">همه دسته‌بندی‌ها</SelectItem>
                <SelectItem value="9">طبیعت</SelectItem>
                <SelectItem value="10">تاریخی</SelectItem>
                <SelectItem value="11">علمی</SelectItem>
                <SelectItem value="12">اجتماعی</SelectItem>
                <SelectItem value="13">فرهنگی</SelectItem>
                <SelectItem value="14">پزشکی</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      {/* نمایش گرید مستندها */}
      <ContentGrid 
        content={filteredDocumentaries()} 
        isLoading={isDocumentariesLoading}
        filterOptions={false} // فیلترها در بالا اضافه شده‌اند
      />
      
      <div className="flex justify-center mt-8">
        <Button variant="outline" className="glass-effect border-[#00BFFF]/20 hover:border-[#00BFFF]/40">
          مشاهده بیشتر
        </Button>
      </div>
    </SectionLayout>
  );
}