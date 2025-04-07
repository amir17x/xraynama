import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Film, Send } from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';

// Form validation schema
const requestFormSchema = z.object({
  title: z.string().min(2, {
    message: 'عنوان باید حداقل ۲ کاراکتر باشد',
  }),
  year: z.string().optional(),
  type: z.enum(['movie', 'series', 'animation', 'documentary'], {
    required_error: 'لطفاً نوع محتوا را انتخاب کنید',
  }),
  description: z.string().optional(),
  imdbUrl: z.string().optional(),
  email: z.string().email({
    message: 'لطفاً یک ایمیل معتبر وارد کنید',
  }),
});

type RequestFormValues = z.infer<typeof requestFormSchema>;

export default function RequestPage() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestCount, setRequestCount] = useState<number>(
    Math.floor(Math.random() * 50) + 150
  );
  
  const form = useForm<RequestFormValues>({
    resolver: zodResolver(requestFormSchema),
    defaultValues: {
      title: '',
      year: '',
      type: undefined,
      description: '',
      imdbUrl: '',
      email: '',
    },
  });
  
  function onSubmit(data: RequestFormValues) {
    setIsSubmitting(true);
    
    // In a real application, you would send this data to your API
    console.log('Request data:', data);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setRequestCount(prev => prev + 1);
      toast({
        title: 'درخواست شما با موفقیت ثبت شد',
        description: 'درخواست شما در صف بررسی قرار گرفت. در صورت تایید، محتوای مورد نظر به زودی اضافه خواهد شد.',
      });
      form.reset();
    }, 1500);
  }
  
  // Sample popular requests
  const popularRequests = [
    { id: 1, title: 'Avatar 3', type: 'movie', year: '2025', requests: 68 },
    { id: 2, title: 'Stranger Things (Season 5)', type: 'series', year: '2024', requests: 45 },
    { id: 3, title: 'Dune: Part Three', type: 'movie', year: '2026', requests: 39 },
    { id: 4, title: 'The Last of Us (Season 2)', type: 'series', year: '2024', requests: 27 },
    { id: 5, title: 'Inside Out 3', type: 'animation', year: '2026', requests: 19 },
  ];
  
  return (
    <>
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-foreground mb-6">درخواست محتوا</h1>
          <p className="text-muted-foreground mb-10">
            با استفاده از فرم زیر می‌توانید فیلم، سریال، انیمیشن یا مستند مورد نظر خود را درخواست دهید. تیم محتوایی ما تلاش می‌کند تا درخواست‌های پرتکرار را در اولویت قرار دهد.
          </p>
          
          <div className="glass-effect p-4 rounded-lg mb-8">
            <div className="flex items-center justify-between flex-wrap">
              <div className="flex items-center">
                <Film className="h-5 w-5 text-primary mr-2" />
                <span className="font-medium">تعداد درخواست‌های ثبت شده:</span>
                <span className="text-primary font-bold mx-2">{requestCount}</span>
              </div>
              <div className="text-sm text-muted-foreground">
                آخرین بروزرسانی: امروز
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <Card className="glass-effect">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Film className="mr-2 h-5 w-5 text-primary" />
                    فرم درخواست محتوا
                  </CardTitle>
                  <CardDescription>
                    مشخصات محتوای مورد نظر خود را دقیق وارد کنید
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>عنوان محتوا</FormLabel>
                            <FormControl>
                              <Input placeholder="نام فیلم یا سریال مورد نظر" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="type"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>نوع محتوا</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="انتخاب کنید" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="movie">فیلم</SelectItem>
                                  <SelectItem value="series">سریال</SelectItem>
                                  <SelectItem value="animation">انیمیشن</SelectItem>
                                  <SelectItem value="documentary">مستند</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="year"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>سال انتشار</FormLabel>
                              <FormControl>
                                <Input placeholder="مثال: 2024" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="imdbUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>لینک IMDB (اختیاری)</FormLabel>
                            <FormControl>
                              <Input placeholder="https://www.imdb.com/title/..." {...field} />
                            </FormControl>
                            <FormDescription>
                              با وارد کردن لینک IMDB، فرآیند بررسی سریع‌تر انجام می‌شود
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>توضیحات تکمیلی (اختیاری)</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="هر گونه اطلاعات مفید دیگر مانند کارگردان، بازیگران یا توضیحات دیگر..." 
                                rows={3}
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>ایمیل</FormLabel>
                            <FormControl>
                              <Input 
                                type="email" 
                                placeholder="برای اطلاع‌رسانی اضافه شدن محتوا" 
                                {...field} 
                              />
                            </FormControl>
                            <FormDescription>
                              پس از اضافه شدن محتوای درخواستی، به شما اطلاع داده خواهد شد
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button 
                        type="submit" 
                        className="w-full"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <span className="animate-spin mr-2">⏳</span>
                            در حال ثبت...
                          </>
                        ) : (
                          <>
                            <Send className="mr-2 h-4 w-4" />
                            ثبت درخواست
                          </>
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>
            
            <div>
              <Card className="glass-effect">
                <CardHeader>
                  <CardTitle>درخواست‌های پرتکرار</CardTitle>
                  <CardDescription>
                    محتواهایی که بیشترین درخواست را داشته‌اند و در اولویت اضافه شدن هستند
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {popularRequests.map((request, index) => (
                      <div key={request.id}>
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">{request.title}</h3>
                            <div className="text-sm text-muted-foreground flex mt-1">
                              <span className="ml-2">{request.year}</span>
                              <span>
                                {request.type === 'movie' && 'فیلم'}
                                {request.type === 'series' && 'سریال'}
                                {request.type === 'animation' && 'انیمیشن'}
                                {request.type === 'documentary' && 'مستند'}
                              </span>
                            </div>
                          </div>
                          <div className="bg-primary/10 px-2 py-1 rounded text-xs font-bold text-primary">
                            {request.requests} درخواست
                          </div>
                        </div>
                        {index < popularRequests.length - 1 && (
                          <Separator className="my-3" />
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card className="glass-effect mt-6">
                <CardHeader>
                  <CardTitle>راهنمای درخواست محتوا</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex">
                      <span className="text-primary ml-2">•</span>
                      درخواست‌های تکراری از سوی کاربران مختلف در اولویت قرار می‌گیرند.
                    </li>
                    <li className="flex">
                      <span className="text-primary ml-2">•</span>
                      محتواهای جدید که به تازگی منتشر شده‌اند، معمولاً زمان بیشتری برای اضافه شدن نیاز دارند.
                    </li>
                    <li className="flex">
                      <span className="text-primary ml-2">•</span>
                      برای سریال‌ها، لطفاً مشخص کنید که کدام فصل مورد نظر شماست.
                    </li>
                    <li className="flex">
                      <span className="text-primary ml-2">•</span>
                      لطفاً از درخواست‌های تکراری خودداری کنید.
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </>
  );
}