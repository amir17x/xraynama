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
          <Card>
            <CardHeader>
              <CardTitle>نتیجه جستجو</CardTitle>
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
      </main>
      <Footer />
    </>
  );
}