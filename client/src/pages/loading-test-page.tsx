import React from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useLoading } from '@/contexts/LoadingContext';
import { useToast } from '@/hooks/use-toast';

export default function LoadingTestPage() {
  const { startLoading, stopLoading, showLoadingFor } = useLoading();
  const { toast } = useToast();

  // نمایش لودینگ برای ۳ ثانیه
  const handleShowLoading3Seconds = async () => {
    toast({
      title: 'لودینگ شروع شد',
      description: 'لودینگ برای ۳ ثانیه نمایش داده می‌شود'
    });
    
    await showLoadingFor(3000);
    
    toast({
      title: 'لودینگ تمام شد',
      description: 'نمایش لودینگ با موفقیت به پایان رسید'
    });
  };

  // شروع لودینگ بدون توقف خودکار
  const handleStartLoading = () => {
    startLoading();
    toast({
      title: 'لودینگ شروع شد',
      description: 'برای پایان دادن به لودینگ، دکمه «پایان لودینگ» را بزنید'
    });
  };

  // پایان دادن به لودینگ
  const handleStopLoading = () => {
    stopLoading();
    toast({
      title: 'لودینگ متوقف شد',
      description: 'نمایش لودینگ با موفقیت متوقف شد'
    });
  };

  return (
    <>
      <Header />
      <main className="container mx-auto py-8 px-4">
        <Card className="mx-auto max-w-2xl">
          <CardHeader>
            <CardTitle className="text-center text-xl md:text-2xl">
              تست لودینگ اسپینر
            </CardTitle>
            <CardDescription className="text-center">
              در این صفحه می‌توانید عملکرد کامپوننت لودینگ با دایره چرخان را تست کنید
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="flex flex-col">
              <h3 className="font-medium mb-2">نمونه‌های اسپینر (درون‌خطی):</h3>
              <div className="grid grid-cols-3 gap-4 p-4 bg-muted rounded-md">
                <div className="flex flex-col items-center justify-center">
                  <h4 className="text-sm mb-2">سایز کوچک</h4>
                  <LoadingSpinner size="sm" text="کوچک" />
                </div>
                <div className="flex flex-col items-center justify-center">
                  <h4 className="text-sm mb-2">سایز متوسط</h4>
                  <LoadingSpinner size="md" text="متوسط" />
                </div>
                <div className="flex flex-col items-center justify-center">
                  <h4 className="text-sm mb-2">سایز بزرگ</h4>
                  <LoadingSpinner size="lg" text="بزرگ" />
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-medium mb-2">تست لودینگ تمام صفحه:</h3>
              <div className="flex flex-col md:flex-row gap-4">
                <Button 
                  onClick={handleShowLoading3Seconds}
                  className="flex-1"
                >
                  نمایش لودینگ برای ۳ ثانیه
                </Button>
                <Button 
                  onClick={handleStartLoading}
                  className="flex-1"
                  variant="secondary"
                >
                  شروع لودینگ
                </Button>
                <Button 
                  onClick={handleStopLoading}
                  className="flex-1"
                  variant="destructive"
                >
                  پایان لودینگ
                </Button>
              </div>
            </div>
            
            <div className="bg-muted p-4 rounded-md text-sm">
              <p className="font-medium mb-2">راهنمای استفاده:</p>
              <ol className="list-decimal list-inside space-y-1 rtl:pr-4">
                <li>دکمه «نمایش لودینگ برای ۳ ثانیه» را بزنید تا لودینگ به صورت خودکار برای ۳ ثانیه نمایش داده شود.</li>
                <li>دکمه «شروع لودینگ» را بزنید تا لودینگ با دایره چرخان نمایش داده شود.</li>
                <li>دکمه «پایان لودینگ» را بزنید تا نمایش لودینگ متوقف شود.</li>
              </ol>
            </div>
            
            <div className="bg-blue-100 dark:bg-blue-900/20 p-4 rounded-md text-blue-800 dark:text-blue-200 text-sm">
              <p>
                این کامپوننت به گونه‌ای طراحی شده که به راحتی در تمام صفحات قابل استفاده باشد.
                هنگام انتقال بین صفحات یا انجام عملیات سنگین (مثل دریافت داده از API)، می‌توانید 
                با فراخوانی «startLoading» و «stopLoading» از این کامپوننت استفاده کنید.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </>
  );
}