import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Skeleton } from '@/components/ui/skeleton';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  ArrowLeft,
  Users,
  Activity,
  Star,
  TrendingUp,
  Eye,
  Film,
  Tv,
  BookOpen,
  FileVideo,
  Heart,
  Bookmark,
  MessageCircle,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Link } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns-jalali';

// رنگ‌های نمودار 
const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f97316', '#10b981', '#14b8a6', '#6366f1'];

// تابع تبدیل تاریخ به فرمت دلخواه
function formatDate(dateString: string | undefined) {
  if (!dateString) return '-';
  try {
    return format(new Date(dateString), 'yyyy/MM/dd HH:mm');
  } catch (error) {
    return dateString;
  }
}

// تابع کوتاه کردن متن
function truncateText(text: string, maxLength: number = 100) {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

// کامپوننت اصلی آمار سایت
export default function AdminStatistics() {
  const { toast } = useToast();
  
  // استیت‌ها
  const [activeTab, setActiveTab] = useState("users");
  const [timePeriod, setTimePeriod] = useState("month"); // day, week, month, year
  
  // کوئری‌ها
  const usersStatsQuery = useQuery({
    queryKey: ['/api/admin/stats/users', timePeriod],
    retry: 1,
    staleTime: 60 * 1000, // 1 minute
  });
  
  const contentStatsQuery = useQuery({
    queryKey: ['/api/admin/stats/content/analytics', timePeriod],
    retry: 1,
    staleTime: 60 * 1000, // 1 minute
  });
  
  const topUsersQuery = useQuery({
    queryKey: ['/api/admin/stats/users/top', timePeriod],
    retry: 1,
    staleTime: 60 * 1000, // 1 minute
  });
  
  const topContentQuery = useQuery({
    queryKey: ['/api/admin/stats/content/top', timePeriod],
    retry: 1,
    staleTime: 60 * 1000, // 1 minute
  });
  
  // نمایش خطا در صورت وجود
  useEffect(() => {
    if (usersStatsQuery.error) {
      toast({
        title: "خطا در دریافت آمار کاربران",
        description: "لطفاً صفحه را مجدداً بارگذاری کنید یا با پشتیبانی تماس بگیرید.",
        variant: "destructive",
      });
    }
    
    if (contentStatsQuery.error) {
      toast({
        title: "خطا در دریافت آمار محتوا",
        description: "لطفاً صفحه را مجدداً بارگذاری کنید یا با پشتیبانی تماس بگیرید.",
        variant: "destructive",
      });
    }
  }, [usersStatsQuery.error, contentStatsQuery.error, toast]);
  
  // داده‌های نمودار پای محتوا بر حسب نوع
  const contentTypeData = contentStatsQuery.data?.typeDistribution || [
    { name: 'فیلم', value: 40 },
    { name: 'سریال', value: 30 },
    { name: 'انیمیشن', value: 20 },
    { name: 'مستند', value: 10 },
  ];
  
  // داده‌های نمودار ستونی تعداد کاربران جدید در روزهای اخیر
  const newUsersTrendData = usersStatsQuery.data?.newUsersTrend || [
    { name: '۱ فروردین', count: 4 },
    { name: '۲ فروردین', count: 7 },
    { name: '۳ فروردین', count: 5 },
    { name: '۴ فروردین', count: 8 },
    { name: '۵ فروردین', count: 12 },
    { name: '۶ فروردین', count: 9 },
    { name: '۷ فروردین', count: 11 },
  ];
  
  // داده‌های نمودار بازدید محتوا
  const contentViewsTrendData = contentStatsQuery.data?.viewsTrend || [
    { name: '۱ فروردین', views: 240 },
    { name: '۲ فروردین', views: 320 },
    { name: '۳ فروردین', views: 280 },
    { name: '۴ فروردین', views: 390 },
    { name: '۵ فروردین', views: 430 },
    { name: '۶ فروردین', views: 380 },
    { name: '۷ فروردین', views: 460 },
  ];
  
  // چک کردن وضعیت بارگذاری
  const isLoading = usersStatsQuery.isLoading || contentStatsQuery.isLoading;
  
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <Link href="/admin/dashboard">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Activity className="h-6 w-6" /> آمار سایت
          </h1>
        </div>
        <Select
          value={timePeriod}
          onValueChange={setTimePeriod}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="انتخاب بازه زمانی" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="day">۲۴ ساعت گذشته</SelectItem>
            <SelectItem value="week">هفته گذشته</SelectItem>
            <SelectItem value="month">ماه گذشته</SelectItem>
            <SelectItem value="year">سال گذشته</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {/* آمار کاربران */}
        <Card className="bg-primary/5 border-primary/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-1.5">
              <Users className="h-4 w-4 text-primary" />
              <span>کاربران فعال</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-full" />
            ) : (
              <div className="text-3xl font-bold">{usersStatsQuery.data?.activeUsers || 0}</div>
            )}
          </CardContent>
        </Card>
        
        {/* آمار بازدیدها */}
        <Card className="bg-primary/5 border-primary/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-1.5">
              <Eye className="h-4 w-4 text-primary" />
              <span>بازدیدها</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-full" />
            ) : (
              <div className="text-3xl font-bold">{contentStatsQuery.data?.totalViews || 0}</div>
            )}
          </CardContent>
        </Card>
        
        {/* آمار علاقه‌مندی‌ها */}
        <Card className="bg-primary/5 border-primary/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-1.5">
              <Heart className="h-4 w-4 text-primary" />
              <span>علاقه‌مندی‌ها</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-full" />
            ) : (
              <div className="text-3xl font-bold">{contentStatsQuery.data?.totalFavorites || 0}</div>
            )}
          </CardContent>
        </Card>
        
        {/* آمار نظرات */}
        <Card className="bg-primary/5 border-primary/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-1.5">
              <MessageCircle className="h-4 w-4 text-primary" />
              <span>نظرات</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-full" />
            ) : (
              <div className="text-3xl font-bold">{contentStatsQuery.data?.totalComments || 0}</div>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="users">آمار کاربران</TabsTrigger>
          <TabsTrigger value="content">آمار محتوا</TabsTrigger>
        </TabsList>
        
        <TabsContent value="users" className="pt-4 space-y-6">
          {/* نمودار کاربران جدید */}
          <Card className="bg-primary/5 border-primary/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-1.5">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span>روند کاربران جدید</span>
              </CardTitle>
              <CardDescription>
                نمودار کاربران جدید ثبت نام شده در {timePeriod === 'day' ? '24 ساعت گذشته' : timePeriod === 'week' ? 'هفته گذشته' : timePeriod === 'month' ? 'ماه گذشته' : 'سال گذشته'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-[300px] flex items-center justify-center">
                  <Skeleton className="h-full w-full" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={newUsersTrendData}
                    margin={{
                      top: 20,
                      right: 20,
                      left: 20,
                      bottom: 50,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" tick={{ fontSize: 12 }} />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value} کاربر`, 'تعداد']} />
                    <Bar dataKey="count" name="تعداد کاربران جدید" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
          
          {/* کاربران فعال */}
          <Card className="bg-primary/5 border-primary/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-1.5">
                <Users className="h-4 w-4 text-primary" />
                <span>کاربران فعال</span>
              </CardTitle>
              <CardDescription>
                فعال‌ترین کاربران بر اساس تعداد بازدید و تعامل
              </CardDescription>
            </CardHeader>
            <CardContent>
              {usersStatsQuery.isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">رتبه</TableHead>
                      <TableHead>نام کاربری</TableHead>
                      <TableHead>تاریخ عضویت</TableHead>
                      <TableHead>تعداد بازدید</TableHead>
                      <TableHead>نظرات</TableHead>
                      <TableHead>علاقه‌مندی‌ها</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topUsersQuery.data?.map((user: any, index: number) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{index + 1}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <Users className="h-3.5 w-3.5 text-primary" />
                            <span>{user.username}</span>
                          </div>
                        </TableCell>
                        <TableCell>{formatDate(user.createdAt)}</TableCell>
                        <TableCell>{user.viewCount || 0}</TableCell>
                        <TableCell>{user.commentCount || 0}</TableCell>
                        <TableCell>{user.favoriteCount || 0}</TableCell>
                      </TableRow>
                    ))}
                    {(!topUsersQuery.data || topUsersQuery.data.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                          داده‌ای یافت نشد
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="content" className="pt-4 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* نمودار توزیع محتوا بر اساس نوع */}
            <Card className="bg-primary/5 border-primary/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-1.5">
                  <FileVideo className="h-4 w-4 text-primary" />
                  <span>توزیع محتوا</span>
                </CardTitle>
                <CardDescription>
                  نمودار توزیع محتوا بر اساس نوع
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="h-[300px] flex items-center justify-center">
                    <Skeleton className="h-full w-full" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={contentTypeData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {contentTypeData.map((_: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value}`, 'تعداد']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
            
            {/* نمودار بازدید محتوا */}
            <Card className="bg-primary/5 border-primary/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-1.5">
                  <Eye className="h-4 w-4 text-primary" />
                  <span>روند بازدید محتوا</span>
                </CardTitle>
                <CardDescription>
                  نمودار بازدید محتوا در {timePeriod === 'day' ? '24 ساعت گذشته' : timePeriod === 'week' ? 'هفته گذشته' : timePeriod === 'month' ? 'ماه گذشته' : 'سال گذشته'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="h-[300px] flex items-center justify-center">
                    <Skeleton className="h-full w-full" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={contentViewsTrendData}
                      margin={{
                        top: 20,
                        right: 20,
                        left: 20,
                        bottom: 50,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" tick={{ fontSize: 12 }} />
                      <YAxis />
                      <Tooltip formatter={(value) => [`${value} بازدید`, 'تعداد']} />
                      <Bar dataKey="views" name="تعداد بازدید" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* محتوای پربازدید */}
          <Card className="bg-primary/5 border-primary/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-1.5">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span>محتوای پربازدید</span>
              </CardTitle>
              <CardDescription>
                محتوایی که بیشترین بازدید را داشته‌اند
              </CardDescription>
            </CardHeader>
            <CardContent>
              {contentStatsQuery.isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">رتبه</TableHead>
                      <TableHead>عنوان</TableHead>
                      <TableHead>نوع</TableHead>
                      <TableHead>تعداد بازدید</TableHead>
                      <TableHead>امتیاز</TableHead>
                      <TableHead>علاقه‌مندی‌ها</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topContentQuery.data?.map((content: any, index: number) => (
                      <TableRow key={content.id}>
                        <TableCell className="font-medium">{index + 1}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span>{content.title}</span>
                            <span className="text-xs opacity-70">{content.englishTitle}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            {content.type === 'movie' ? (
                              <Film className="h-3.5 w-3.5 text-blue-500" />
                            ) : content.type === 'series' ? (
                              <Tv className="h-3.5 w-3.5 text-purple-500" />
                            ) : content.type === 'animation' ? (
                              <FileVideo className="h-3.5 w-3.5 text-green-500" />
                            ) : (
                              <BookOpen className="h-3.5 w-3.5 text-amber-500" />
                            )}
                            <span>
                              {content.type === 'movie' ? 'فیلم' : 
                               content.type === 'series' ? 'سریال' : 
                               content.type === 'animation' ? 'انیمیشن' : 'مستند'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{content.viewCount || 0}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                            <span>{content.averageRating || 0}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Heart className="h-3.5 w-3.5 text-red-500" />
                            <span>{content.favoriteCount || 0}</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {(!topContentQuery.data || topContentQuery.data.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                          داده‌ای یافت نشد
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
          
          {/* محتوای محبوب */}
          <Card className="bg-primary/5 border-primary/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-1.5">
                <Star className="h-4 w-4 text-primary" />
                <span>محتوای برتر</span>
              </CardTitle>
              <CardDescription>
                محتوایی که بالاترین امتیاز را کسب کرده‌اند
              </CardDescription>
            </CardHeader>
            <CardContent>
              {contentStatsQuery.isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">رتبه</TableHead>
                      <TableHead>عنوان</TableHead>
                      <TableHead>نوع</TableHead>
                      <TableHead>امتیاز IMDb</TableHead>
                      <TableHead>امتیاز کاربران</TableHead>
                      <TableHead>تعداد رأی</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topContentQuery.data?.sort((a: any, b: any) => b.averageRating - a.averageRating).slice(0, 10).map((content: any, index: number) => (
                      <TableRow key={content.id}>
                        <TableCell className="font-medium">{index + 1}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span>{content.title}</span>
                            <span className="text-xs opacity-70">{content.englishTitle}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            {content.type === 'movie' ? (
                              <Film className="h-3.5 w-3.5 text-blue-500" />
                            ) : content.type === 'series' ? (
                              <Tv className="h-3.5 w-3.5 text-purple-500" />
                            ) : content.type === 'animation' ? (
                              <FileVideo className="h-3.5 w-3.5 text-green-500" />
                            ) : (
                              <BookOpen className="h-3.5 w-3.5 text-amber-500" />
                            )}
                            <span>
                              {content.type === 'movie' ? 'فیلم' : 
                               content.type === 'series' ? 'سریال' : 
                               content.type === 'animation' ? 'انیمیشن' : 'مستند'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                            <span>{content.imdbRating || 0}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Star className="h-3.5 w-3.5 text-primary" />
                            <span>{content.averageRating || 0}</span>
                          </div>
                        </TableCell>
                        <TableCell>{content.ratingCount || 0}</TableCell>
                      </TableRow>
                    ))}
                    {(!topContentQuery.data || topContentQuery.data.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                          داده‌ای یافت نشد
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}