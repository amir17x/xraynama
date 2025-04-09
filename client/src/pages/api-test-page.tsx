import React, { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';

export default function APITestPage() {
  const [query, setQuery] = useState('');
  const [testType, setTestType] = useState('unified');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [showCacheStats, setShowCacheStats] = useState(false);
  const { toast } = useToast();

  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    try {
      // مختلف API برای تست انواع مسیرهای 
      let url = '';
      
      switch(testType) {
        case 'unified':
          url = `/api/tmdb/unified-search?query=${encodeURIComponent(query)}`;
          break;
        case 'search':
          url = `/api/tmdb/search/movies?query=${encodeURIComponent(query)}`;
          break;
        case 'discover':
          url = `/api/tmdb/discover/movies?with_genres=28`; // Genre code for Action
          break;
        case 'find':
          url = `/api/tmdb/find/tt0499549?external_source=imdb_id`; // Avatar IMDb ID
          break;
        case 'details':
          url = `/api/tmdb/movies/76600`; // Avatar: The Way of Water ID
          break;
        case 'popular':
          url = `/api/tmdb/movies/popular`;
          break;
        case 'cache-stats':
          url = `/api/tmdb/cache-stats`;
          break;
        default:
          url = `/api/tmdb/unified-search?query=${encodeURIComponent(query)}`;
      }
      
      console.log('Making request to:', url);
      
      const response = await fetch(url);
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`خطای شبکه - کد وضعیت: ${response.status}`);
      }
      
      // اینجا تست می‌کنیم که آیا محتوای پاسخ JSON است یا HTML
      const contentType = response.headers.get('content-type');
      console.log('Content Type:', contentType);
      
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        setResponse(data);
      } else {
        const textData = await response.text();
        console.log('Response is not JSON, first 100 chars:', textData.substring(0, 100));
        throw new Error('پاسخ به فرمت JSON نیست');
      }
    } catch (err) {
      console.error('Error during fetch:', err);
      setError(err.message || 'خطای ناشناخته');
      toast({
        title: "خطا در دریافت اطلاعات",
        description: err.message || 'خطای ناشناخته',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <main className="container px-4 py-8 mx-auto">
        <h1 className="mb-6 text-3xl font-bold">صفحه تست API</h1>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>تست API های TMDB</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="test-type">انتخاب نوع تست:</Label>
                <Select value={testType} onValueChange={setTestType}>
                  <SelectTrigger>
                    <SelectValue placeholder="انتخاب نوع تست" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unified">جستجوی جامع</SelectItem>
                    <SelectItem value="search">جستجوی ساده</SelectItem>
                    <SelectItem value="discover">کشف فیلم‌ها</SelectItem>
                    <SelectItem value="find">یافتن با IMDB ID</SelectItem>
                    <SelectItem value="details">جزئیات فیلم</SelectItem>
                    <SelectItem value="popular">فیلم‌های محبوب</SelectItem>
                    <SelectItem value="cache-stats">آمار کش TMDB</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {(testType === 'unified' || testType === 'search') && (
                <div className="flex flex-col gap-2">
                  <Label htmlFor="query">متن جستجو:</Label>
                  <Input 
                    id="query" 
                    value={query} 
                    onChange={(e) => setQuery(e.target.value)} 
                    placeholder="مثال: avatar"
                  />
                </div>
              )}
              
              <Button onClick={handleSearch} disabled={loading}>
                {loading ? 'در حال جستجو...' : 'جستجو'}
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {error && (
          <Card className="mb-8 border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">خطا</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{error}</p>
            </CardContent>
          </Card>
        )}
        
        {response && (
          <>
            {testType === 'cache-stats' ? (
              <Card className="mb-8 border-blue-500 container-glass">
                <CardHeader className="bg-blue-50/5 backdrop-blur-sm border-b border-blue-200/20 dark:border-blue-800/20">
                  <CardTitle className="text-blue-500 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                      <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                      <line x1="12" y1="22.08" x2="12" y2="12"></line>
                    </svg>
                    آمار کش TMDB
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  {response.error ? (
                    <div className="p-4 mb-4 text-red-700 bg-red-100 border border-red-400 rounded-md dark:bg-red-900/30 dark:text-red-300 dark:border-red-800">
                      <p className="font-semibold">خطا در دریافت آمار کش:</p>
                      <p>{response.error}</p>
                    </div>
                  ) : (
                    <div className="grid gap-6 md:grid-cols-2">
                      <Card className="border-blue-200/20 dark:border-blue-900/30 bg-blue-50/5 backdrop-blur-sm shadow-sm">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">خلاصه آمار کش</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <p className="text-sm text-muted-foreground">تعداد کل داده‌ها</p>
                              <p className="text-2xl font-bold">{response.summary.total}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm text-muted-foreground">داده‌های معتبر</p>
                              <div className="flex items-center">
                                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{response.summary.valid}</p>
                                <p className="mr-2 text-sm text-green-600 dark:text-green-400">
                                  ({response.summary.validPercentage}%)
                                </p>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm text-muted-foreground">داده‌های منقضی شده</p>
                              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{response.summary.expired}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm text-muted-foreground">حافظه مصرفی</p>
                              <p className="text-2xl font-bold">{response.summary.storageSizeKB} KB</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm text-muted-foreground">مدت اعتبار کش</p>
                              <p className="text-2xl font-bold">{response.summary.ttlHours} ساعت</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm text-muted-foreground">بانک داده</p>
                              <p className="text-base font-medium truncate">{response.summary.databaseName}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-blue-200/20 dark:border-blue-900/30 bg-blue-50/5 backdrop-blur-sm shadow-sm">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">زمان‌بندی کش</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="space-y-1">
                              <p className="text-sm text-muted-foreground">زمان سرور</p>
                              <p className="text-base font-medium">
                                {new Date(response.timestamps.serverTime).toLocaleString('fa-IR')}
                              </p>
                            </div>
                            {response.timestamps.oldestCacheCreated && (
                              <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">قدیمی‌ترین داده کش</p>
                                <p className="text-base font-medium">
                                  {new Date(response.timestamps.oldestCacheCreated).toLocaleString('fa-IR')}
                                </p>
                              </div>
                            )}
                            {response.timestamps.newestCacheCreated && (
                              <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">جدیدترین داده کش</p>
                                <p className="text-base font-medium">
                                  {new Date(response.timestamps.newestCacheCreated).toLocaleString('fa-IR')}
                                </p>
                              </div>
                            )}
                            {response.timestamps.nextExpiry && (
                              <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">زمان انقضای بعدی</p>
                                <p className="text-base font-medium">
                                  {new Date(response.timestamps.nextExpiry).toLocaleString('fa-IR')}
                                </p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>

                      {response.endpointDistribution && response.endpointDistribution.length > 0 && (
                        <Card className="md:col-span-2 border-blue-200/20 dark:border-blue-900/30 bg-blue-50/5 backdrop-blur-sm shadow-sm">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-lg">توزیع داده‌های کش</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="overflow-x-auto">
                              <table className="w-full">
                                <thead>
                                  <tr className="bg-blue-50/10 text-right">
                                    <th className="p-2 text-blue-700 dark:text-blue-300 font-medium rounded-r-md">نقطه پایانی API</th>
                                    <th className="p-2 text-blue-700 dark:text-blue-300 font-medium">تعداد</th>
                                    <th className="p-2 text-blue-700 dark:text-blue-300 font-medium rounded-l-md">درصد</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {response.endpointDistribution.map((item: any, index: number) => (
                                    <tr key={index} className="border-b border-blue-100/10 last:border-0 hover:bg-blue-50/5">
                                      <td className="p-2 font-mono text-sm">{item.endpoint}</td>
                                      <td className="p-2">{item.count}</td>
                                      <td className="p-2">
                                        {Math.round((item.count / response.summary.total) * 100)}%
                                        <div className="w-full bg-blue-100/20 h-2 mt-1 rounded-full overflow-hidden">
                                          <div 
                                            className="bg-blue-500 h-full rounded-full" 
                                            style={{ width: `${Math.round((item.count / response.summary.total) * 100)}%` }}
                                          ></div>
                                        </div>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>
                    {testType === 'popular' ? 'فیلم‌های محبوب' : 
                    testType === 'details' ? 'جزئیات فیلم' : 
                    testType === 'find' ? 'نتیجه جستجو با IMDB ID' : 
                    testType === 'discover' ? 'نتایج کشف فیلم‌ها' : 
                    'نتیجه جستجو'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px] w-full p-4 border rounded-md">
                    <pre className="text-wrap">
                      {JSON.stringify(response, null, 2)}
                    </pre>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </main>
      <Footer />
    </>
  );
}