import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useAuth } from '@/hooks/use-auth';
import { User, KeyRound, AtSign, Lock, Heart, Play, MessageCircle, History, ListVideo } from 'lucide-react';

// Login schema
const loginSchema = z.object({
  username: z.string().min(3, {
    message: 'نام کاربری باید حداقل ۳ کاراکتر باشد',
  }),
  password: z.string().min(6, {
    message: 'رمز عبور باید حداقل ۶ کاراکتر باشد',
  }),
});

// Registration schema
const registerSchema = z.object({
  username: z.string().min(3, {
    message: 'نام کاربری باید حداقل ۳ کاراکتر باشد',
  }),
  email: z.string().email({
    message: 'لطفا یک ایمیل معتبر وارد کنید',
  }),
  name: z.string().min(2, {
    message: 'نام باید حداقل ۲ کاراکتر باشد',
  }),
  password: z.string().min(6, {
    message: 'رمز عبور باید حداقل ۶ کاراکتر باشد',
  }),
  confirmPassword: z.string().min(6, {
    message: 'تکرار رمز عبور باید حداقل ۶ کاراکتر باشد',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'رمز عبور و تکرار آن باید یکسان باشند',
  path: ['confirmPassword'],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<string>('login');
  const { user, loginMutation, registerMutation } = useAuth();
  const [, navigate] = useLocation();
  
  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  // Login form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  // Registration form
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      email: '',
      name: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onLoginSubmit = (data: LoginFormValues) => {
    loginMutation.mutate(data);
  };

  const onRegisterSubmit = (data: RegisterFormValues) => {
    registerMutation.mutate(data);
  };

  return (
    <>
      <Header />
      
      <main className="container mx-auto px-4 py-8 min-h-[calc(100vh-200px)] flex items-center justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full max-w-5xl">
          {/* Auth forms */}
          <Card className="border-muted shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center">
                {activeTab === 'login' ? 'ورود به حساب کاربری' : 'ثبت‌نام در سایت'}
              </CardTitle>
              <CardDescription className="text-center">
                {activeTab === 'login' 
                  ? 'برای استفاده از امکانات ویژه وارد شوید'
                  : 'با چند کلیک ساده عضو شوید و از امکانات سایت بهره‌مند شوید'
                }
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-2 mb-6">
                  <TabsTrigger value="login">ورود</TabsTrigger>
                  <TabsTrigger value="register">ثبت‌نام</TabsTrigger>
                </TabsList>
                
                {/* Login Form */}
                <TabsContent value="login">
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                      <FormField
                        control={loginForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>نام کاربری</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <User className="absolute right-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                <Input className="pr-10" placeholder="نام کاربری خود را وارد کنید" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>رمز عبور</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <KeyRound className="absolute right-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                <Input 
                                  className="pr-10" 
                                  type="password" 
                                  placeholder="رمز عبور خود را وارد کنید" 
                                  {...field} 
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button 
                        type="submit" 
                        className="w-full"
                        disabled={loginMutation.isPending}
                      >
                        {loginMutation.isPending ? (
                          <>
                            <span className="animate-spin mr-2">⏳</span>
                            در حال ورود...
                          </>
                        ) : 'ورود به حساب'}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>
                
                {/* Registration Form */}
                <TabsContent value="register">
                  <Form {...registerForm}>
                    <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                      <FormField
                        control={registerForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>نام کاربری</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <User className="absolute right-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                <Input className="pr-10" placeholder="یک نام کاربری منحصر به فرد انتخاب کنید" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>ایمیل</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <AtSign className="absolute right-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                <Input className="pr-10" type="email" placeholder="ایمیل خود را وارد کنید" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
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
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>رمز عبور</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Lock className="absolute right-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                <Input 
                                  className="pr-10" 
                                  type="password" 
                                  placeholder="یک رمز عبور قوی انتخاب کنید" 
                                  {...field} 
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>تکرار رمز عبور</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Lock className="absolute right-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                <Input 
                                  className="pr-10" 
                                  type="password" 
                                  placeholder="رمز عبور را مجدداً وارد کنید" 
                                  {...field} 
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button 
                        type="submit" 
                        className="w-full"
                        disabled={registerMutation.isPending}
                      >
                        {registerMutation.isPending ? (
                          <>
                            <span className="animate-spin mr-2">⏳</span>
                            در حال ثبت‌نام...
                          </>
                        ) : 'ثبت‌نام'}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>
              </Tabs>
            </CardContent>
            
            <CardFooter className="flex justify-center">
              <p className="text-sm text-muted-foreground">
                {activeTab === 'login' ? (
                  <>
                    حساب کاربری ندارید؟{' '}
                    <button
                      type="button"
                      className="text-primary hover:underline"
                      onClick={() => setActiveTab('register')}
                    >
                      ثبت‌نام کنید
                    </button>
                  </>
                ) : (
                  <>
                    قبلاً ثبت‌نام کرده‌اید؟{' '}
                    <button
                      type="button"
                      className="text-primary hover:underline"
                      onClick={() => setActiveTab('login')}
                    >
                      وارد شوید
                    </button>
                  </>
                )}
              </p>
            </CardFooter>
          </Card>
          
          {/* Hero section */}
          <div className="hidden lg:flex flex-col justify-center">
            <div className="glass-effect p-8 rounded-xl border border-border">
              <h1 className="text-3xl font-bold mb-6 text-foreground">به Xraynama خوش آمدید</h1>
              <p className="text-lg text-muted-foreground mb-6">
                با عضویت در سایت ما از امکانات زیر بهره‌مند شوید:
              </p>
              
              <ul className="space-y-4">
                <li className="flex items-center">
                  <span className="bg-primary/20 p-2 rounded-full mr-3">
                    <Play className="h-5 w-5 text-primary" />
                  </span>
                  <span className="text-foreground">پخش آنلاین با کیفیت‌های مختلف</span>
                </li>
                <li className="flex items-center">
                  <span className="bg-primary/20 p-2 rounded-full mr-3">
                    <Heart className="h-5 w-5 text-primary" />
                  </span>
                  <span className="text-foreground">ایجاد لیست علاقه‌مندی‌ها</span>
                </li>
                <li className="flex items-center">
                  <span className="bg-primary/20 p-2 rounded-full mr-3">
                    <ListVideo className="h-5 w-5 text-primary" />
                  </span>
                  <span className="text-foreground">ساخت پلی‌لیست‌های شخصی</span>
                </li>
                <li className="flex items-center">
                  <span className="bg-primary/20 p-2 rounded-full mr-3">
                    <MessageCircle className="h-5 w-5 text-primary" />
                  </span>
                  <span className="text-foreground">نظر دادن و امتیازدهی به محتوا</span>
                </li>
                <li className="flex items-center">
                  <span className="bg-primary/20 p-2 rounded-full mr-3">
                    <History className="h-5 w-5 text-primary" />
                  </span>
                  <span className="text-foreground">دسترسی به تاریخچه تماشا</span>
                </li>
              </ul>
              
              <div className="mt-8 text-center">
                <p className="text-sm text-muted-foreground">
                  با ثبت‌نام در Xraynama، با تمامی{' '}
                  <a href="/terms" className="text-primary hover:underline">
                    قوانین و مقررات
                  </a>{' '}
                  سایت موافقت می‌کنید.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </>
  );
}
