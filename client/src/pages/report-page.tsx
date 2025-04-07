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
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-foreground mb-6">گزارش خطا</h1>
          <p className="text-muted-foreground mb-10">
            با استفاده از فرم زیر می‌توانید هرگونه مشکل یا خطا در محتوا و وبسایت را گزارش دهید. تیم فنی ما در اسرع وقت به گزارش شما رسیدگی خواهد کرد.
          </p>
          
          <Alert className="mb-8 glass-effect">
            <AlertCircle className="h-4 w-4 ml-2" />
            <AlertTitle>نکته مهم</AlertTitle>
            <AlertDescription>
              لطفاً پیش از ارسال گزارش، از به‌روز بودن مرورگر خود اطمینان حاصل کنید. همچنین توصیه می‌کنیم قبل از گزارش، صفحه را یک بار رفرش کنید.
            </AlertDescription>
          </Alert>
          
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bug className="mr-2 h-5 w-5 text-primary" />
                فرم گزارش خطا
              </CardTitle>
              <CardDescription>
                جزئیات مشکل مشاهده شده را با دقت وارد کنید
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="contentId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>شناسه محتوا (اختیاری)</FormLabel>
                        <FormControl>
                          <Input placeholder="مثال: 12345" {...field} />
                        </FormControl>
                        <FormDescription>
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
                        <FormLabel>عنوان مشکل</FormLabel>
                        <FormControl>
                          <Input placeholder="مشکل را در یک جمله کوتاه توضیح دهید" {...field} />
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
                        <FormLabel>نوع مشکل</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="نوع مشکل را انتخاب کنید" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
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
                        <FormLabel>توضیحات</FormLabel>
                        <FormControl>
                          <Textarea 
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
                        <FormLabel>ایمیل</FormLabel>
                        <FormControl>
                          <Input 
                            type="email" 
                            placeholder="برای اطلاع‌رسانی نتیجه بررسی" 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          نتیجه بررسی از طریق این ایمیل به اطلاع شما خواهد رسید
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex gap-4 items-center">
                    <Button 
                      type="button" 
                      variant="outline"
                      className="flex-1"
                      disabled={isSubmitting}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      افزودن تصویر (اختیاری)
                    </Button>
                    
                    <Button 
                      type="submit" 
                      className="flex-1"
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