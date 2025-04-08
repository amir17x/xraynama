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
import { AlertCircle, Bug, Send, Upload } from 'lucide-react';
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Form validation schema
const reportFormSchema = z.object({
  contentId: z.string().optional(),
  title: z.string().min(5, {
    message: 'عنوان باید حداقل ۵ کاراکتر باشد',
  }),
  type: z.enum(['playback', 'subtitle', 'audio', 'translation', 'content', 'other'], {
    required_error: 'لطفاً نوع مشکل را انتخاب کنید',
  }),
  description: z.string().min(10, {
    message: 'توضیحات باید حداقل ۱۰ کاراکتر باشد',
  }),
  email: z.string().email({
    message: 'لطفاً یک ایمیل معتبر وارد کنید',
  }),
});

type ReportFormValues = z.infer<typeof reportFormSchema>;

export default function ReportPage() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<ReportFormValues>({
    resolver: zodResolver(reportFormSchema),
    defaultValues: {
      contentId: '',
      title: '',
      type: undefined,
      description: '',
      email: '',
    },
  });
  
  function onSubmit(data: ReportFormValues) {
    setIsSubmitting(true);
    
    // In a real application, you would send this data to your API
    console.log('Report data:', data);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: 'گزارش شما با موفقیت ثبت شد',
        description: 'با تشکر از همکاری شما، کارشناسان ما در اسرع وقت مشکل را بررسی خواهند کرد.',
      });
      form.reset();
    }, 1500);
  }
  
  return (
    <>
      <Header />
      
      <main className="container mx-auto px-4 py-8 min-h-[calc(100vh-200px)] relative">
        {/* Background glow effect */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute w-1/2 h-1/2 top-0 left-[20%] bg-[#00BFFF]/20 rounded-full blur-[120px] opacity-50"></div>
          <div className="absolute w-1/3 h-1/3 bottom-[15%] right-[5%] bg-[#00BFFF]/20 rounded-full blur-[120px] opacity-50"></div>
        </div>
        
        <div className="max-w-3xl mx-auto relative z-10">
          <h1 className="text-3xl font-bold text-foreground mb-6">گزارش خطا</h1>
          <p className="text-muted-foreground mb-10">
            با استفاده از فرم زیر می‌توانید هرگونه مشکل یا خطا در محتوا و وبسایت را گزارش دهید. تیم فنی ما در اسرع وقت به گزارش شما رسیدگی خواهد کرد.
          </p>
          
          <Alert className="mb-8 border-[#00BFFF]/20 bg-[#00142c]/80 backdrop-blur-lg shadow-[0_0_25px_rgba(0,191,255,0.15)] relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#00BFFF]/30 to-transparent"></div>
            <AlertCircle className="h-5 w-5 ml-2 text-[#00BFFF]" />
            <AlertTitle className="text-white">نکته مهم</AlertTitle>
            <AlertDescription className="text-[#CCDDEE]">
              لطفاً پیش از ارسال گزارش، از به‌روز بودن مرورگر خود اطمینان حاصل کنید. همچنین توصیه می‌کنیم قبل از گزارش، صفحه را یک بار رفرش کنید.
            </AlertDescription>
          </Alert>
          
          <Card className="border-[#00BFFF]/20 bg-[#00142c]/80 backdrop-blur-lg shadow-[0_0_25px_rgba(0,191,255,0.15)] rounded-xl overflow-hidden">
            <CardHeader className="pb-4 relative">
              {/* نوار تزئینی بالای کارت */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#00BFFF]/30 to-transparent"></div>
              
              <CardTitle className="text-2xl font-bold text-center text-white">
                <Bug className="inline-block mr-2 h-5 w-5 text-[#00BFFF]" />
                فرم گزارش خطا
              </CardTitle>
              <CardDescription className="text-center text-[#CCDDEE]">
                جزئیات مشکل مشاهده شده را با دقت وارد کنید
              </CardDescription>
            </CardHeader>
            
            <CardContent className="relative">
              {/* افکت‌های پس‌زمینه */}
              <div className="absolute left-[15%] top-[10%] w-32 h-32 bg-[#00BFFF]/5 rounded-full blur-3xl pointer-events-none opacity-70"></div>
              <div className="absolute right-[5%] bottom-[10%] w-24 h-24 bg-[#00BFFF]/5 rounded-full blur-3xl pointer-events-none opacity-70"></div>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 relative z-10">
                  <FormField
                    control={form.control}
                    name="contentId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">شناسه محتوا (اختیاری)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              className="bg-[#001c3d]/50 border-[#00BFFF]/30 focus:border-[#00BFFF] focus:ring-[#00BFFF]/20 transition-all duration-300" 
                              placeholder="مثال: 12345" 
                              {...field} 
                            />
                          </div>
                        </FormControl>
                        <FormDescription className="text-[#CCDDEE]/80 text-xs">
                          اگر مشکل مربوط به محتوای خاصی است، شناسه یا URL آن را وارد کنید
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">عنوان مشکل</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              className="bg-[#001c3d]/50 border-[#00BFFF]/30 focus:border-[#00BFFF] focus:ring-[#00BFFF]/20 transition-all duration-300" 
                              placeholder="مشکل را در یک جمله کوتاه توضیح دهید" 
                              {...field} 
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">نوع مشکل</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-[#001c3d]/50 border-[#00BFFF]/30 focus:border-[#00BFFF] focus:ring-[#00BFFF]/20 transition-all duration-300">
                              <SelectValue placeholder="نوع مشکل را انتخاب کنید" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-[#001c3d] border-[#00BFFF]/30">
                            <SelectItem value="playback">مشکل در پخش ویدیو</SelectItem>
                            <SelectItem value="subtitle">مشکل در زیرنویس</SelectItem>
                            <SelectItem value="audio">مشکل در صدا</SelectItem>
                            <SelectItem value="translation">مشکل در ترجمه</SelectItem>
                            <SelectItem value="content">محتوای نامناسب</SelectItem>
                            <SelectItem value="other">سایر موارد</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">توضیحات</FormLabel>
                        <FormControl>
                          <Textarea 
                            className="bg-[#001c3d]/50 border-[#00BFFF]/30 focus:border-[#00BFFF] focus:ring-[#00BFFF]/20 transition-all duration-300 min-h-[120px]" 
                            placeholder="لطفاً جزئیات مشکل را توضیح دهید. موارد زیر را حتماً ذکر کنید: مرورگر، سیستم عامل، و مراحل تکرار خطا" 
                            rows={5}
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
                        <FormLabel className="text-white">ایمیل</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              type="email" 
                              className="bg-[#001c3d]/50 border-[#00BFFF]/30 focus:border-[#00BFFF] focus:ring-[#00BFFF]/20 transition-all duration-300" 
                              placeholder="برای اطلاع‌رسانی نتیجه بررسی" 
                              {...field} 
                            />
                          </div>
                        </FormControl>
                        <FormDescription className="text-[#CCDDEE]/80 text-xs">
                          نتیجه بررسی از طریق این ایمیل به اطلاع شما خواهد رسید
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex flex-col sm:flex-row gap-4 pt-2">
                    <Button 
                      type="button" 
                      variant="outline"
                      className="sm:flex-1 border-[#00BFFF]/30 text-[#00BFFF] hover:bg-[#00BFFF]/10 hover:text-white transition-all duration-300"
                      disabled={isSubmitting}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      افزودن تصویر (اختیاری)
                    </Button>
                    
                    <Button 
                      type="submit" 
                      className="sm:flex-1 bg-[#00BFFF] hover:bg-[#00BFFF]/90 text-white border border-[#00BFFF]/50 shadow-[0_0_15px_rgba(0,191,255,0.3)] transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,191,255,0.5)] transform hover:scale-[1.02]"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <span className="animate-spin mr-2">⏳</span>
                          در حال ارسال...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          ارسال گزارش
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </>
  );
}