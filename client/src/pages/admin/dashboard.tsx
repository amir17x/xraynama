import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Users,
  Film,
  Tag,
  MessageSquare,
  Star,
  Activity,
  EyeIcon,
  Heart,
  List,
  Layers,
  BarChart3,
  Type,
  BookOpen,
  User,
  FileText,
  BadgeCheck,
  FileX
} from 'lucide-react';
import { Link } from 'wouter';

export default function AdminDashboard() {
  // Fetch basic stats
  const { data: userStats, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['/api/admin/stats/users'],
  });

  const { data: contentStats, isLoading: isLoadingContent } = useQuery({
    queryKey: ['/api/admin/stats/content'],
  });

  const { data: commentsStats, isLoading: isLoadingComments } = useQuery({
    queryKey: ['/api/admin/stats/comments'],
  });

  const { data: reviewsStats, isLoading: isLoadingReviews } = useQuery({
    queryKey: ['/api/admin/stats/reviews'],
  });

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">پنل مدیریت</h1>
            <p className="text-gray-400">به سیستم مدیریت محتوا خوش آمدید</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-dark-card border-dark-border hover:border-blue-900 transition-colors">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Users className="w-5 h-5 mr-2 text-blue-500" />
                کاربران
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {isLoadingUsers ? (
                  <div className="h-8 w-16 bg-dark-lighter animate-pulse rounded"></div>
                ) : (
                  userStats?.total || 0
                )}
              </div>
              <p className="text-sm text-gray-400 mt-1">
                {isLoadingUsers ? (
                  <div className="h-4 w-24 bg-dark-lighter animate-pulse rounded"></div>
                ) : (
                  `${userStats?.new || 0} کاربر جدید امروز`
                )}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-dark-card border-dark-border hover:border-blue-900 transition-colors">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Film className="w-5 h-5 mr-2 text-blue-500" />
                محتوا
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {isLoadingContent ? (
                  <div className="h-8 w-16 bg-dark-lighter animate-pulse rounded"></div>
                ) : (
                  contentStats?.total || 0
                )}
              </div>
              <p className="text-sm text-gray-400 mt-1">
                {isLoadingContent ? (
                  <div className="h-4 w-24 bg-dark-lighter animate-pulse rounded"></div>
                ) : (
                  `${contentStats?.series || 0} سریال، ${contentStats?.movies || 0} فیلم`
                )}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-dark-card border-dark-border hover:border-blue-900 transition-colors">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <MessageSquare className="w-5 h-5 mr-2 text-blue-500" />
                نظرات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {isLoadingComments ? (
                  <div className="h-8 w-16 bg-dark-lighter animate-pulse rounded"></div>
                ) : (
                  commentsStats?.total || 0
                )}
              </div>
              <p className="text-sm text-gray-400 mt-1">
                {isLoadingComments ? (
                  <div className="h-4 w-24 bg-dark-lighter animate-pulse rounded"></div>
                ) : (
                  `${commentsStats?.pending || 0} در انتظار تأیید`
                )}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-dark-card border-dark-border hover:border-blue-900 transition-colors">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Star className="w-5 h-5 mr-2 text-blue-500" />
                نقدها
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {isLoadingReviews ? (
                  <div className="h-8 w-16 bg-dark-lighter animate-pulse rounded"></div>
                ) : (
                  reviewsStats?.total || 0
                )}
              </div>
              <p className="text-sm text-gray-400 mt-1">
                {isLoadingReviews ? (
                  <div className="h-4 w-24 bg-dark-lighter animate-pulse rounded"></div>
                ) : (
                  `${reviewsStats?.pending || 0} در انتظار تأیید`
                )}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Admin Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="bg-dark-card border-dark-border hover:border-blue-900 transition-colors">
            <CardHeader>
              <CardTitle>مدیریت کاربران</CardTitle>
              <CardDescription>کاربران و دسترسی‌ها</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/admin/users">
                <a className="flex items-center p-2 rounded-md hover:bg-dark-lighter text-gray-300 hover:text-white transition-colors">
                  <User className="w-4 h-4 ml-2 text-blue-500" />
                  <span>لیست کاربران</span>
                </a>
              </Link>
              <Link href="/admin/users?role=admin">
                <a className="flex items-center p-2 rounded-md hover:bg-dark-lighter text-gray-300 hover:text-white transition-colors">
                  <BadgeCheck className="w-4 h-4 ml-2 text-blue-500" />
                  <span>مدیران سیستم</span>
                </a>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-dark-card border-dark-border hover:border-blue-900 transition-colors">
            <CardHeader>
              <CardTitle>مدیریت محتوا</CardTitle>
              <CardDescription>محتوای سایت</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/admin/content">
                <a className="flex items-center p-2 rounded-md hover:bg-dark-lighter text-gray-300 hover:text-white transition-colors">
                  <Layers className="w-4 h-4 ml-2 text-blue-500" />
                  <span>لیست محتوا</span>
                </a>
              </Link>
              <Link href="/admin/content/movies">
                <a className="flex items-center p-2 rounded-md hover:bg-dark-lighter text-gray-300 hover:text-white transition-colors">
                  <Film className="w-4 h-4 ml-2 text-blue-500" />
                  <span>فیلم‌ها</span>
                </a>
              </Link>
              <Link href="/admin/content/series">
                <a className="flex items-center p-2 rounded-md hover:bg-dark-lighter text-gray-300 hover:text-white transition-colors">
                  <Type className="w-4 h-4 ml-2 text-blue-500" />
                  <span>سریال‌ها</span>
                </a>
              </Link>
              <Link href="/admin/content/create">
                <a className="flex items-center p-2 rounded-md hover:bg-dark-lighter text-gray-300 hover:text-white transition-colors">
                  <BookOpen className="w-4 h-4 ml-2 text-blue-500" />
                  <span>افزودن محتوای جدید</span>
                </a>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-dark-card border-dark-border hover:border-blue-900 transition-colors">
            <CardHeader>
              <CardTitle>دسته‌بندی و برچسب‌ها</CardTitle>
              <CardDescription>مدیریت ژانرها و برچسب‌ها</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/admin/genres">
                <a className="flex items-center p-2 rounded-md hover:bg-dark-lighter text-gray-300 hover:text-white transition-colors">
                  <List className="w-4 h-4 ml-2 text-blue-500" />
                  <span>ژانرها</span>
                </a>
              </Link>
              <Link href="/admin/tags">
                <a className="flex items-center p-2 rounded-md hover:bg-dark-lighter text-gray-300 hover:text-white transition-colors">
                  <Tag className="w-4 h-4 ml-2 text-blue-500" />
                  <span>برچسب‌ها</span>
                </a>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-dark-card border-dark-border hover:border-blue-900 transition-colors">
            <CardHeader>
              <CardTitle>مدیریت نظرات</CardTitle>
              <CardDescription>نظرات و نقدها</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/admin/comments?status=pending">
                <a className="flex items-center p-2 rounded-md hover:bg-dark-lighter text-gray-300 hover:text-white transition-colors">
                  <MessageSquare className="w-4 h-4 ml-2 text-blue-500" />
                  <span>نظرات در انتظار تأیید</span>
                </a>
              </Link>
              <Link href="/admin/reviews?status=pending">
                <a className="flex items-center p-2 rounded-md hover:bg-dark-lighter text-gray-300 hover:text-white transition-colors">
                  <FileText className="w-4 h-4 ml-2 text-blue-500" />
                  <span>نقدهای در انتظار تأیید</span>
                </a>
              </Link>
              <Link href="/admin/comments?status=rejected">
                <a className="flex items-center p-2 rounded-md hover:bg-dark-lighter text-gray-300 hover:text-white transition-colors">
                  <FileX className="w-4 h-4 ml-2 text-blue-500" />
                  <span>نظرات رد شده</span>
                </a>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-dark-card border-dark-border hover:border-blue-900 transition-colors">
            <CardHeader>
              <CardTitle>آمار سایت</CardTitle>
              <CardDescription>گزارش‌های آماری</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/admin/stats/users">
                <a className="flex items-center p-2 rounded-md hover:bg-dark-lighter text-gray-300 hover:text-white transition-colors">
                  <Users className="w-4 h-4 ml-2 text-blue-500" />
                  <span>کاربران فعال</span>
                </a>
              </Link>
              <Link href="/admin/stats/content">
                <a className="flex items-center p-2 rounded-md hover:bg-dark-lighter text-gray-300 hover:text-white transition-colors">
                  <EyeIcon className="w-4 h-4 ml-2 text-blue-500" />
                  <span>محتوای پربازدید</span>
                </a>
              </Link>
              <Link href="/admin/stats/ratings">
                <a className="flex items-center p-2 rounded-md hover:bg-dark-lighter text-gray-300 hover:text-white transition-colors">
                  <Star className="w-4 h-4 ml-2 text-blue-500" />
                  <span>محتوای برتر</span>
                </a>
              </Link>
              <Link href="/admin/stats/favorites">
                <a className="flex items-center p-2 rounded-md hover:bg-dark-lighter text-gray-300 hover:text-white transition-colors">
                  <Heart className="w-4 h-4 ml-2 text-blue-500" />
                  <span>محتوای محبوب</span>
                </a>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </>
  );
}