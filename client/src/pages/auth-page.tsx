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
import { User, KeyRound, AtSign, Lock, Heart, Play, MessageCircle, History, ListVideo, CheckCircle } from 'lucide-react';

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
      
      <main className="container mx-auto px-4 py-8 min-h-[calc(100vh-200px)] flex items-center justify-center relative">
        {/* Background glow effect */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute w-1/2 h-1/2 top-0 left-[20%] bg-[#00BFFF]/20 rounded-full blur-[120px] opacity-50"></div>
          <div className="absolute w-1/3 h-1/3 bottom-[15%] right-[5%] bg-[#00BFFF]/20 rounded-full blur-[120px] opacity-50"></div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full max-w-5xl relative z-10">
          {/* Auth forms */}
          <Card className="border-[#00BFFF]/20 bg-[#00142c]/80 backdrop-blur-lg shadow-[0_0_25px_rgba(0,191,255,0.15)] rounded-xl overflow-hidden">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl font-bold text-center text-white">
                {activeTab === 'login' ? 'ورود به حساب کاربری' : 'ثبت‌نام در سایت'}
              </CardTitle>
              <CardDescription className="text-center text-[#CCDDEE]">
                {activeTab === 'login' 
                  ? 'برای استفاده از امکانات ویژه وارد شوید'
                  : 'با چند کلیک ساده عضو شوید و از امکانات سایت بهره‌مند شوید'
                }
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-2 mb-6 bg-[#001c3d]/70 border border-[#00BFFF]/20 p-1">
                  <TabsTrigger value="login" className="data-[state=active]:bg-[#00BFFF] data-[state=active]:text-white">ورود</TabsTrigger>
                  <TabsTrigger value="register" className="data-[state=active]:bg-[#00BFFF] data-[state=active]:text-white">ثبت‌نام</TabsTrigger>
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
                                <User className="absolute right-3 top-2.5 h-5 w-5 text-[#00BFFF]" />
                                <Input className="pr-10 bg-[#001c3d]/50 border-[#00BFFF]/30 focus:border-[#00BFFF] focus:ring-[#00BFFF]/20" placeholder="نام کاربری خود را وارد کنید" {...field} />
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
                                <KeyRound className="absolute right-3 top-2.5 h-5 w-5 text-[#00BFFF]" />
                                <Input 
                                  className="pr-10 bg-[#001c3d]/50 border-[#00BFFF]/30 focus:border-[#00BFFF] focus:ring-[#00BFFF]/20" 
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
                      
                      <div className="flex items-center justify-between mb-2">
                        <button
                          type="button"
                          className="text-sm text-primary hover:underline"
                          onClick={() => navigate('/forgot-password')}
                        >
                          رمز عبور را فراموش کرده‌اید؟
                        </button>
                      </div>
                      
                      <Button 
                        type="submit" 
                        className="w-full bg-[#00BFFF] hover:bg-[#00BFFF]/90 text-white border border-[#00BFFF]/50 shadow-[0_0_15px_rgba(0,191,255,0.3)]"
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
                                <User className="absolute right-3 top-2.5 h-5 w-5 text-[#00BFFF]" />
                                <Input className="pr-10 bg-[#001c3d]/50 border-[#00BFFF]/30 focus:border-[#00BFFF] focus:ring-[#00BFFF]/20" placeholder="یک نام کاربری منحصر به فرد انتخاب کنید" {...field} />
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
                                <AtSign className="absolute right-3 top-2.5 h-5 w-5 text-[#00BFFF]" />
                                <Input className="pr-10 bg-[#001c3d]/50 border-[#00BFFF]/30 focus:border-[#00BFFF] focus:ring-[#00BFFF]/20" type="email" placeholder="ایمیل خود را وارد کنید" {...field} />
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
                              <Input className="bg-[#001c3d]/50 border-[#00BFFF]/30 focus:border-[#00BFFF] focus:ring-[#00BFFF]/20" placeholder="نام و نام خانوادگی خود را وارد کنید" {...field} />
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
                                <Lock className="absolute right-3 top-2.5 h-5 w-5 text-[#00BFFF]" />
                                <Input 
                                  className="pr-10 bg-[#001c3d]/50 border-[#00BFFF]/30 focus:border-[#00BFFF] focus:ring-[#00BFFF]/20" 
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
                                <Lock className="absolute right-3 top-2.5 h-5 w-5 text-[#00BFFF]" />
                                <Input 
                                  className="pr-10 bg-[#001c3d]/50 border-[#00BFFF]/30 focus:border-[#00BFFF] focus:ring-[#00BFFF]/20" 
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
                        className="w-full bg-[#00BFFF] hover:bg-[#00BFFF]/90 text-white border border-[#00BFFF]/50 shadow-[0_0_15px_rgba(0,191,255,0.3)]"
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
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-[#00BFFF]/10 border border-[#00BFFF]/30">
                <p className="text-sm text-[#CCDDEE]">
                  {activeTab === 'login' ? (
                    <>
                      حساب کاربری ندارید؟{' '}
                      <button
                        type="button"
                        className="text-[#00BFFF] hover:underline font-medium"
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
                        className="text-[#00BFFF] hover:underline font-medium"
                        onClick={() => setActiveTab('login')}
                      >
                        وارد شوید
                      </button>
                    </>
                  )}
                </p>
              </div>
            </CardFooter>
          </Card>
          
          {/* Hero section */}
          <div className="hidden lg:flex flex-col justify-center">
            <div className="p-8 rounded-xl border border-[#00BFFF]/20 bg-[#00142c]/80 backdrop-blur-lg shadow-[0_0_25px_rgba(0,191,255,0.1)] relative overflow-hidden">
              {/* Background shapes */}
              <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-[#00BFFF]/10 rounded-full"></div>
              <div className="absolute -top-32 -right-32 w-64 h-64 bg-[#00BFFF]/5 rounded-full"></div>
              
              <div className="relative z-10">
                <h1 className="text-3xl font-bold mb-6 text-white">
                  به <span className="text-[#00BFFF]">Xraynama</span> خوش آمدید
                </h1>
                <p className="text-lg text-[#CCDDEE] mb-8">
                  با عضویت در سایت ما از امکانات زیر بهره‌مند شوید:
                </p>
                
                <ul className="space-y-5">
                  <li className="flex items-center transform transition-transform hover:translate-x-1 duration-300">
                    <span className="bg-[#00BFFF]/20 p-2.5 rounded-full ml-4 border border-[#00BFFF]/30">
                      <Play className="h-5 w-5 text-[#00BFFF]" />
                    </span>
                    <span className="text-white text-lg">پخش آنلاین با کیفیت‌های مختلف</span>
                  </li>
                  <li className="flex items-center transform transition-transform hover:translate-x-1 duration-300">
                    <span className="bg-[#00BFFF]/20 p-2.5 rounded-full ml-4 border border-[#00BFFF]/30">
                      <Heart className="h-5 w-5 text-[#00BFFF]" />
                    </span>
                    <span className="text-white text-lg">ایجاد لیست علاقه‌مندی‌ها</span>
                  </li>
                  <li className="flex items-center transform transition-transform hover:translate-x-1 duration-300">
                    <span className="bg-[#00BFFF]/20 p-2.5 rounded-full ml-4 border border-[#00BFFF]/30">
                      <ListVideo className="h-5 w-5 text-[#00BFFF]" />
                    </span>
                    <span className="text-white text-lg">ساخت پلی‌لیست‌های شخصی</span>
                  </li>
                  <li className="flex items-center transform transition-transform hover:translate-x-1 duration-300">
                    <span className="bg-[#00BFFF]/20 p-2.5 rounded-full ml-4 border border-[#00BFFF]/30">
                      <MessageCircle className="h-5 w-5 text-[#00BFFF]" />
                    </span>
                    <span className="text-white text-lg">نظر دادن و امتیازدهی به محتوا</span>
                  </li>
                  <li className="flex items-center transform transition-transform hover:translate-x-1 duration-300">
                    <span className="bg-[#00BFFF]/20 p-2.5 rounded-full ml-4 border border-[#00BFFF]/30">
                      <History className="h-5 w-5 text-[#00BFFF]" />
                    </span>
                    <span className="text-white text-lg">دسترسی به تاریخچه تماشا</span>
                  </li>
                </ul>
                
                <div className="mt-10 text-center">
                  <div className="inline-flex items-center px-4 py-2 rounded-full bg-[#00BFFF]/10 border border-[#00BFFF]/30">
                    <CheckCircle className="text-[#00BFFF] w-5 h-5 ml-2" />
                    <p className="text-sm text-[#CCDDEE]">
                      با ثبت‌نام در Xraynama، با تمامی{' '}
                      <a href="/terms" className="text-[#00BFFF] hover:underline">
                        قوانین و مقررات
                      </a>{' '}
                      سایت موافقت می‌کنید
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </>
  );
}
