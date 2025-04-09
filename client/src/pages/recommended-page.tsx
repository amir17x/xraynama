import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ContentType } from '@/types';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';
import { ContentCard } from '@/components/common/ContentCard';
import { Button } from '@/components/ui/button';
import { SparklesIcon } from '@/components/icons/RoundedIcons';
import { AlertCircle } from 'lucide-react';

export default function RecommendedPage() {
  const [, setLocation] = useLocation();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      setLocation('/auth/login', { replace: true });
    }
  }, [isAuthLoading, isAuthenticated, setLocation]);

  // Fetch AI recommended content
  const { data: recommendedContent, isLoading } = useQuery<ContentType[]>({
    queryKey: ['/api/content/recommended', 20], // More items than on homepage
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: isAuthenticated, // Only fetch if authenticated
  });

  // If still checking auth status, show minimal loading
  if (isAuthLoading) {
    return (
      <>
        <Header />
        <div className="container mx-auto px-4 py-16">
          <Skeleton className="h-8 w-64 mb-6" />
          <Skeleton className="h-4 w-full max-w-2xl mb-10" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {Array(10).fill(0).map((_, i) => (
              <div key={i} className="flex flex-col gap-2">
                <Skeleton className="aspect-[2/3] w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // If not authenticated (about to redirect), show login prompt
  if (!isAuthenticated) {
    return (
      <>
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="bg-card p-8 rounded-lg border border-border shadow-lg max-w-lg mx-auto">
            <AlertCircle className="h-16 w-16 mx-auto mb-4 text-amber-500" />
            <h1 className="text-2xl font-bold mb-4">ورود به حساب کاربری</h1>
            <p className="mb-6">
              برای مشاهده پیشنهادهای هوشمند و شخصی‌سازی شده، ابتدا باید وارد حساب کاربری خود شوید.
            </p>
            <div className="flex justify-center gap-4">
              <Button onClick={() => setLocation('/auth/login')}>
                ورود به حساب
              </Button>
              <Button variant="outline" onClick={() => setLocation('/auth/register')}>
                ثبت‌نام
              </Button>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main>
        <div className="container mx-auto px-4 py-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="glassmorphic-icon p-2">
              <SparklesIcon className="h-5 w-5 text-[#00BFFF]" />
            </div>
            <h1 className="text-2xl font-bold">پیشنهادهای ویژه برای شما</h1>
          </div>
          <p className="text-muted-foreground mb-10 max-w-3xl">
            با استفاده از هوش مصنوعی و بر اساس علاقه‌مندی‌ها و سابقه تماشای شما، محتواهای زیر برای شما پیشنهاد شده است.
            این پیشنهادها با گذشت زمان و با تعامل بیشتر شما با سایت، دقیق‌تر خواهند شد.
          </p>

          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {Array(15).fill(0).map((_, i) => (
                <div key={i} className="flex flex-col gap-2">
                  <Skeleton className="aspect-[2/3] w-full rounded-lg" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              ))}
            </div>
          ) : recommendedContent && recommendedContent.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {recommendedContent.map((content) => (
                <ContentCard 
                  key={content.id} 
                  content={content} 
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-card border border-border rounded-lg">
              <SparklesIcon className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-medium mb-2">هنوز پیشنهادی برای شما نداریم</h2>
              <p className="text-muted-foreground max-w-md mx-auto mb-6">
                با تماشای محتوا، افزودن به علاقه‌مندی‌ها و امتیازدهی به فیلم‌ها و سریال‌ها، به ما کمک کنید تا پیشنهادهای بهتری برای شما آماده کنیم.
              </p>
              <Button onClick={() => setLocation('/')}>
                مشاهده محتواهای برتر
              </Button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}