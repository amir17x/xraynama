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
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Mail, Phone, MapPin, Clock, Send } from 'lucide-react';
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

// Form validation schema
const contactFormSchema = z.object({
  name: z.string().min(2, {
    message: 'نام باید حداقل ۲ کاراکتر باشد',
  }),
  email: z.string().email({
    message: 'لطفاً یک ایمیل معتبر وارد کنید',
  }),
  subject: z.string().min(5, {
    message: 'موضوع باید حداقل ۵ کاراکتر باشد',
  }),
  message: z.string().min(10, {
    message: 'پیام باید حداقل ۱۰ کاراکتر باشد',
  }),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

export default function ContactPage() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: '',
      email: '',
      subject: '',
      message: '',
    },
  });
  
  function onSubmit(data: ContactFormValues) {
    setIsSubmitting(true);
    
    // In a real application, you would send this data to your API
    console.log('Form data:', data);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: 'پیام شما با موفقیت ارسال شد',
        description: 'کارشناسان ما در اسرع وقت با شما تماس خواهند گرفت.',
      });
      form.reset();
    }, 1500);
  }
  
  return (
    <>
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold text-foreground mb-6">تماس با ما</h1>
          <p className="text-muted-foreground mb-10">
            برای ارتباط با تیم پشتیبانی Xraynama می‌توانید از فرم زیر استفاده کنید یا از طریق راه‌های ارتباطی دیگر با ما در تماس باشید.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <Card className="glass-effect">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center">
                  <Phone className="mr-2 h-5 w-5 text-primary" />
                  تلفن تماس
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">(+98) 21-1234-5678</p>
                <p className="text-muted-foreground">(+98) 21-8765-4321</p>
              </CardContent>
            </Card>
            
            <Card className="glass-effect">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center">
                  <Mail className="mr-2 h-5 w-5 text-primary" />
                  پست الکترونیکی
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">support@xraynama.com</p>
                <p className="text-muted-foreground">info@xraynama.com</p>
              </CardContent>
            </Card>
            
            <Card className="glass-effect">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center">
                  <Clock className="mr-2 h-5 w-5 text-primary" />
                  ساعات کاری
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">شنبه تا چهارشنبه: ۹ صبح تا ۶ عصر</p>
                <p className="text-muted-foreground">پنجشنبه: ۹ صبح تا ۱ بعدازظهر</p>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <Card className="glass-effect">
                <CardHeader>
                  <CardTitle>فرم تماس با ما</CardTitle>
                  <CardDescription>
                    از طریق این فرم می‌توانید پیام خود را برای ما ارسال کنید.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>نام و نام خانوادگی</FormLabel>
                            <FormControl>
                              <Input placeholder="نام و نام خانوادگی خود را وارد کنید" {...field} />
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
                              <Input type="email" placeholder="ایمیل خود را وارد کنید" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="subject"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>موضوع</FormLabel>
                            <FormControl>
                              <Input placeholder="موضوع پیام خود را وارد کنید" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="message"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>پیام</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="پیام خود را اینجا بنویسید..." 
                                rows={5}
                                {...field} 
                              />
                            </FormControl>
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
                            در حال ارسال...
                          </>
                        ) : (
                          <>
                            <Send className="mr-2 h-4 w-4" />
                            ارسال پیام
                          </>
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>
            
            <div>
              <Card className="glass-effect mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPin className="mr-2 h-5 w-5 text-primary" />
                    آدرس
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    تهران، خیابان ولیعصر، بالاتر از میدان ونک، برج تماشا، طبقه ۱۵، واحد ۱۵۰۵
                  </p>
                  <div className="bg-muted rounded-lg h-[300px] flex items-center justify-center">
                    <p className="text-muted-foreground">نقشه محل شرکت در اینجا نمایش داده می‌شود</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="glass-effect">
                <CardHeader>
                  <CardTitle>سوالات متداول</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    برای مشاهده پاسخ سوالات متداول کاربران به صفحه سوالات متداول مراجعه کنید.
                  </p>
                  <Button variant="outline" className="w-full" asChild>
                    <a href="/faq">مشاهده سوالات متداول</a>
                  </Button>
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