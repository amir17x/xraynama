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
import { Mail, Phone, MapPin, Clock, Send, AtSign, User, MessageCircle } from 'lucide-react';
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
      
      <main className="container mx-auto px-4 py-8 min-h-[calc(100vh-200px)] relative">
        {/* Background glow effect */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute w-1/2 h-1/2 top-0 left-[20%] bg-[#00BFFF]/20 rounded-full blur-[120px] opacity-50"></div>
          <div className="absolute w-1/3 h-1/3 bottom-[15%] right-[5%] bg-[#00BFFF]/20 rounded-full blur-[120px] opacity-50"></div>
        </div>
        
        <div className="max-w-5xl mx-auto relative z-10">
          <h1 className="text-3xl font-bold text-foreground mb-6">تماس با ما</h1>
          <p className="text-muted-foreground mb-10">
            برای ارتباط با تیم پشتیبانی Xraynama می‌توانید از فرم زیر استفاده کنید یا از طریق راه‌های ارتباطی دیگر با ما در تماس باشید.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <Card className="border-[#00BFFF]/20 bg-[#00142c]/80 backdrop-blur-lg shadow-[0_0_25px_rgba(0,191,255,0.15)] rounded-xl overflow-hidden transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,191,255,0.25)] hover:bg-[#00142c]/90">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center">
                  <Phone className="mr-2 h-5 w-5 text-[#00BFFF]" />
                  تلفن تماس
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[#CCDDEE]">(+98) 21-1234-5678</p>
                <p className="text-[#CCDDEE]">(+98) 21-8765-4321</p>
              </CardContent>
            </Card>
            
            <Card className="border-[#00BFFF]/20 bg-[#00142c]/80 backdrop-blur-lg shadow-[0_0_25px_rgba(0,191,255,0.15)] rounded-xl overflow-hidden transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,191,255,0.25)] hover:bg-[#00142c]/90">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center">
                  <Mail className="mr-2 h-5 w-5 text-[#00BFFF]" />
                  پست الکترونیکی
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[#CCDDEE]">support@xraynama.com</p>
                <p className="text-[#CCDDEE]">info@xraynama.com</p>
              </CardContent>
            </Card>
            
            <Card className="border-[#00BFFF]/20 bg-[#00142c]/80 backdrop-blur-lg shadow-[0_0_25px_rgba(0,191,255,0.15)] rounded-xl overflow-hidden transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,191,255,0.25)] hover:bg-[#00142c]/90">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center">
                  <Clock className="mr-2 h-5 w-5 text-[#00BFFF]" />
                  ساعات کاری
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[#CCDDEE]">شنبه تا چهارشنبه: ۹ صبح تا ۶ عصر</p>
                <p className="text-[#CCDDEE]">پنجشنبه: ۹ صبح تا ۱ بعدازظهر</p>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <Card className="border-[#00BFFF]/20 bg-[#00142c]/80 backdrop-blur-lg shadow-[0_0_25px_rgba(0,191,255,0.15)] rounded-xl overflow-hidden">
                <CardHeader className="pb-4 relative">
                  {/* نوار تزئینی بالای کارت */}
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#00BFFF]/30 to-transparent"></div>
                  
                  <CardTitle className="text-2xl font-bold text-center text-white">
                    فرم تماس با ما
                  </CardTitle>
                  <CardDescription className="text-center text-[#CCDDEE]">
                    از طریق این فرم می‌توانید پیام خود را برای ما ارسال کنید
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="relative">
                  {/* افکت‌های پس‌زمینه */}
                  <div className="absolute left-[15%] top-[10%] w-32 h-32 bg-[#00BFFF]/5 rounded-full blur-3xl pointer-events-none opacity-70"></div>
                  <div className="absolute right-[5%] bottom-[10%] w-24 h-24 bg-[#00BFFF]/5 rounded-full blur-3xl pointer-events-none opacity-70"></div>
                  
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 relative z-10">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">نام و نام خانوادگی</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <User className="absolute right-3 top-2.5 h-5 w-5 text-[#00BFFF]" />
                                <Input 
                                  className="pr-10 bg-[#001c3d]/50 border-[#00BFFF]/30 focus:border-[#00BFFF] focus:ring-[#00BFFF]/20 transition-all duration-300" 
                                  placeholder="نام و نام خانوادگی خود را وارد کنید" 
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
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">ایمیل</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <AtSign className="absolute right-3 top-2.5 h-5 w-5 text-[#00BFFF]" />
                                <Input 
                                  className="pr-10 bg-[#001c3d]/50 border-[#00BFFF]/30 focus:border-[#00BFFF] focus:ring-[#00BFFF]/20 transition-all duration-300" 
                                  type="email" 
                                  placeholder="ایمیل خود را وارد کنید" 
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
                        name="subject"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">موضوع</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <MessageCircle className="absolute right-3 top-2.5 h-5 w-5 text-[#00BFFF]" />
                                <Input 
                                  className="pr-10 bg-[#001c3d]/50 border-[#00BFFF]/30 focus:border-[#00BFFF] focus:ring-[#00BFFF]/20 transition-all duration-300" 
                                  placeholder="موضوع پیام خود را وارد کنید" 
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
                        name="message"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">پیام</FormLabel>
                            <FormControl>
                              <Textarea 
                                className="bg-[#001c3d]/50 border-[#00BFFF]/30 focus:border-[#00BFFF] focus:ring-[#00BFFF]/20 transition-all duration-300 min-h-[120px]" 
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
                        className="w-full bg-[#00BFFF] hover:bg-[#00BFFF]/90 text-white border border-[#00BFFF]/50 shadow-[0_0_15px_rgba(0,191,255,0.3)] transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,191,255,0.5)] transform hover:scale-[1.02]"
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
                
                <CardFooter className="flex justify-center pt-2 pb-6">
                  <div className="inline-flex items-center px-4 py-2 rounded-full bg-[#00BFFF]/10 border border-[#00BFFF]/30">
                    <p className="text-sm text-[#CCDDEE]">
                      ما معمولاً در کمتر از 24 ساعت پاسخ می‌دهیم
                    </p>
                  </div>
                </CardFooter>
              </Card>
            </div>
            
            <div className="space-y-6">
              <Card className="border-[#00BFFF]/20 bg-[#00142c]/80 backdrop-blur-lg shadow-[0_0_25px_rgba(0,191,255,0.15)] rounded-xl overflow-hidden">
                <CardHeader className="pb-2 relative">
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#00BFFF]/30 to-transparent"></div>
                  <CardTitle className="flex items-center">
                    <MapPin className="mr-2 h-5 w-5 text-[#00BFFF]" />
                    آدرس
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative">
                  <div className="absolute left-[15%] top-[50%] w-32 h-32 bg-[#00BFFF]/5 rounded-full blur-3xl pointer-events-none opacity-70"></div>
                  
                  <p className="text-[#CCDDEE] mb-4 relative z-10">
                    تهران، خیابان ولیعصر، بالاتر از میدان ونک، برج تماشا، طبقه ۱۵، واحد ۱۵۰۵
                  </p>
                  
                  <div className="relative z-10 bg-[#001c3d]/50 rounded-lg border border-[#00BFFF]/20 shadow-inner overflow-hidden">
                    <div className="h-[250px] flex items-center justify-center">
                      <p className="text-[#CCDDEE]">نقشه محل شرکت در اینجا نمایش داده می‌شود</p>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#00BFFF]/30 to-transparent"></div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-[#00BFFF]/20 bg-[#00142c]/80 backdrop-blur-lg shadow-[0_0_25px_rgba(0,191,255,0.15)] rounded-xl overflow-hidden">
                <CardHeader className="pb-2 relative">
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#00BFFF]/30 to-transparent"></div>
                  <CardTitle className="flex items-center">
                    <MessageCircle className="mr-2 h-5 w-5 text-[#00BFFF]" />
                    سوالات متداول
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-[#CCDDEE] mb-4">
                    برای مشاهده پاسخ سوالات متداول کاربران به صفحه سوالات متداول مراجعه کنید.
                  </p>
                  <Button 
                    variant="outline" 
                    className="w-full border-[#00BFFF]/30 text-[#00BFFF] hover:bg-[#00BFFF]/10 hover:text-white transition-all duration-300"
                    asChild
                  >
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