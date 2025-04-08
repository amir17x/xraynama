import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Film,
  Tv,
  FileVideo,
  BookOpen,
  Users,
  MessageCircle,
  Star,
  Tag,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Link } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminDashboard() {
  const { toast } = useToast();
  
  // دریافت آمار کاربران
  const usersQuery = useQuery({
    queryKey: ['/api/admin/stats/users'],
    retry: 1,
    staleTime: 60 * 1000, // 1 minute
  });
  
  // دریافت آمار محتوا
  const contentQuery = useQuery({
    queryKey: ['/api/admin/stats/content'],
    retry: 1,
    staleTime: 60 * 1000, // 1 minute
  });
  
  // دریافت آمار نظرات
  const commentsQuery = useQuery({
    queryKey: ['/api/admin/stats/comments'],
    retry: 1,
    staleTime: 60 * 1000, // 1 minute
  });
  
  // دریافت آمار نقدها
  const reviewsQuery = useQuery({
    queryKey: ['/api/admin/stats/reviews'],
    retry: 1,
    staleTime: 60 * 1000, // 1 minute
  });
  
  // نمایش خطا در صورت وجود
  useEffect(() => {
    if (usersQuery.error) {
      toast({
        title: "خطا در دریافت آمار کاربران",
        description: "لطفاً صفحه را مجدداً بارگذاری کنید یا با پشتیبانی تماس بگیرید.",
        variant: "destructive",
      });
    }
    
    if (contentQuery.error) {
      toast({
        title: "خطا در دریافت آمار محتوا",
        description: "لطفاً صفحه را مجدداً بارگذاری کنید یا با پشتیبانی تماس بگیرید.",
        variant: "destructive",
      });
    }
    
    if (commentsQuery.error) {
      toast({
        title: "خطا در دریافت آمار نظرات",
        description: "لطفاً صفحه را مجدداً بارگذاری کنید یا با پشتیبانی تماس بگیرید.",
        variant: "destructive",
      });
    }
    
    if (reviewsQuery.error) {
      toast({
        title: "خطا در دریافت آمار نقدها",
        description: "لطفاً صفحه را مجدداً بارگذاری کنید یا با پشتیبانی تماس بگیرید.",
        variant: "destructive",
      });
    }
  }, [usersQuery.error, contentQuery.error, commentsQuery.error, reviewsQuery.error, toast]);
  
  // چک کردن وضعیت بارگذاری
  const isLoading = usersQuery.isLoading || contentQuery.isLoading || commentsQuery.isLoading || reviewsQuery.isLoading;
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">پنل مدیریت</h1>
        <div className="text-sm opacity-70">به سیستم مدیریت محتوای موجود خوش آمدید</div>
      </div>

      {/* آمار کلی */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* آمار کاربران */}
        <Card className="bg-primary/10 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center justify-between">
              <span>کاربران</span>
              <Users className="h-5 w-5 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-full" />
            ) : (
              <div className="text-center">
                <div className="text-3xl font-bold">{usersQuery.data?.total || 0}</div>
                <div className="text-sm opacity-70">
                  {usersQuery.data?.new || 0} کاربر جدید امروز
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* آمار محتوا */}
        <Card className="bg-primary/10 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center justify-between">
              <span>محتوا</span>
              <FileVideo className="h-5 w-5 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-full" />
            ) : (
              <div className="text-center">
                <div className="text-3xl font-bold">{contentQuery.data?.total || 0}</div>
                <div className="text-sm opacity-70">
                  فیلم، سریال و انیمیشن
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* آمار نظرات */}
        <Card className="bg-primary/10 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center justify-between">
              <span>نظرات</span>
              <MessageCircle className="h-5 w-5 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-full" />
            ) : (
              <div className="text-center">
                <div className="text-3xl font-bold">{commentsQuery.data?.total || 0}</div>
                <div className="text-sm opacity-70">
                  {commentsQuery.data?.pending || 0} نظر در انتظار تایید
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* آمار نقدها */}
        <Card className="bg-primary/10 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center justify-between">
              <span>نقدها</span>
              <Star className="h-5 w-5 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-full" />
            ) : (
              <div className="text-center">
                <div className="text-3xl font-bold">{reviewsQuery.data?.total || 0}</div>
                <div className="text-sm opacity-70">
                  {reviewsQuery.data?.pending || 0} نقد در انتظار تایید
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* بخش‌های مدیریتی */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* مدیریت کاربران */}
        <Card className="bg-primary/5 border-primary/10 hover:bg-primary/10 cursor-pointer transition-colors">
          <Link href="/admin/users">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>مدیریت کاربران</span>
                <Users className="h-5 w-5 text-primary" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm opacity-70">
                کاربران و دسترسی‌ها
              </div>
              <ul className="mt-4 space-y-2 text-sm">
                <li className="flex items-center">• لیست کاربران</li>
                <li className="flex items-center">• مدیران سیستم</li>
              </ul>
            </CardContent>
          </Link>
        </Card>

        {/* مدیریت محتوا */}
        <Card className="bg-primary/5 border-primary/10 hover:bg-primary/10 cursor-pointer transition-colors">
          <Link href="/admin/content">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>مدیریت محتوا</span>
                <FileVideo className="h-5 w-5 text-primary" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm opacity-70">
                محتوای سایت
              </div>
              <ul className="mt-4 space-y-2 text-sm">
                <li className="flex items-center">• لیست محتوا</li>
                <li className="flex items-center">• فیلم‌ها</li>
                <li className="flex items-center">• سریال‌ها</li>
                <li className="flex items-center">• افزودن محتوای جدید</li>
              </ul>
            </CardContent>
          </Link>
        </Card>

        {/* دسته‌بندی و برچسب‌ها */}
        <Card className="bg-primary/5 border-primary/10 hover:bg-primary/10 cursor-pointer transition-colors">
          <Link href="/admin/categories">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>دسته‌بندی و برچسب‌ها</span>
                <Tag className="h-5 w-5 text-primary" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm opacity-70">
                مدیریت ژانرها و برچسب‌ها
              </div>
              <ul className="mt-4 space-y-2 text-sm">
                <li className="flex items-center">• ژانرها</li>
                <li className="flex items-center">• برچسب‌ها</li>
              </ul>
            </CardContent>
          </Link>
        </Card>

        {/* مدیریت نظرات */}
        <Card className="bg-primary/5 border-primary/10 hover:bg-primary/10 cursor-pointer transition-colors">
          <Link href="/admin/comments">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>مدیریت نظرات</span>
                <MessageCircle className="h-5 w-5 text-primary" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm opacity-70">
                نظرات و نقدها
              </div>
              <ul className="mt-4 space-y-2 text-sm">
                <li className="flex items-center">• نظرات در انتظار تایید</li>
                <li className="flex items-center">• نقدها در انتظار تایید</li>
                <li className="flex items-center">• نظرات رد شده</li>
              </ul>
            </CardContent>
          </Link>
        </Card>

        {/* آمار سایت */}
        <Card className="bg-primary/5 border-primary/10 hover:bg-primary/10 cursor-pointer transition-colors">
          <Link href="/admin/statistics">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>آمار سایت</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M3 3v18h18"></path><path d="M18 17V9"></path><path d="M13 17V5"></path><path d="M8 17v-3"></path></svg>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm opacity-70">
                گزارشات آماری
              </div>
              <ul className="mt-4 space-y-2 text-sm">
                <li className="flex items-center">• کاربران فعال</li>
                <li className="flex items-center">• محتوای پربازدید</li>
                <li className="flex items-center">• محتوای برتر</li>
                <li className="flex items-center">• محتوای محبوب</li>
              </ul>
            </CardContent>
          </Link>
        </Card>
      </div>

      {/* آمار محتوا بر اساس نوع */}
      {!isLoading && contentQuery.data && (
        <Card className="bg-primary/5 border-primary/10 mb-8">
          <CardHeader>
            <CardTitle>توزیع محتوا</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex flex-col items-center p-4 rounded-lg bg-blue-500/10">
                <Film className="h-8 w-8 text-blue-500 mb-2" />
                <div className="text-xl font-bold">{contentQuery.data.movies || 0}</div>
                <div className="text-sm opacity-70">فیلم‌ها</div>
              </div>
              
              <div className="flex flex-col items-center p-4 rounded-lg bg-purple-500/10">
                <Tv className="h-8 w-8 text-purple-500 mb-2" />
                <div className="text-xl font-bold">{contentQuery.data.series || 0}</div>
                <div className="text-sm opacity-70">سریال‌ها</div>
              </div>
              
              <div className="flex flex-col items-center p-4 rounded-lg bg-green-500/10">
                <FileVideo className="h-8 w-8 text-green-500 mb-2" />
                <div className="text-xl font-bold">{contentQuery.data.animations || 0}</div>
                <div className="text-sm opacity-70">انیمیشن‌ها</div>
              </div>
              
              <div className="flex flex-col items-center p-4 rounded-lg bg-amber-500/10">
                <BookOpen className="h-8 w-8 text-amber-500 mb-2" />
                <div className="text-xl font-bold">{contentQuery.data.documentaries || 0}</div>
                <div className="text-sm opacity-70">مستندها</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}