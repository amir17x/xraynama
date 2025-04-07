import { useEffect } from "react";
import { useAuth, loginSchema, registerSchema, LoginData, RegisterData } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation } from "wouter";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LogIn, UserPlus, Mail, Lock, User, ArrowRight } from "lucide-react";

const AuthPage = () => {
  const { user, loginMutation, registerMutation } = useAuth();
  const [location, navigate] = useLocation();
  
  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  // Login form
  const loginForm = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: ""
    }
  });

  // Register form
  const registerForm = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      passwordConfirm: "",
      email: "",
      emailConfirm: "",
      displayName: ""
    }
  });

  // Submit login form
  const onLoginSubmit = (data: LoginData) => {
    loginMutation.mutate(data);
  };

  // Submit register form
  const onRegisterSubmit = (data: RegisterData) => {
    registerMutation.mutate(data);
  };

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
        {/* Auth Forms Column */}
        <div>
          <Card className="bg-dark-card border-dark-border">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold">خوش آمدید</CardTitle>
              <CardDescription className="text-text-secondary">
                برای دسترسی به تمامی امکانات وارد شوید یا حساب کاربری جدید ایجاد کنید
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="login" className="space-y-4">
                <TabsList className="grid grid-cols-2 bg-dark-lighter">
                  <TabsTrigger value="login" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                    <LogIn className="ml-2 h-4 w-4" />
                    ورود
                  </TabsTrigger>
                  <TabsTrigger value="register" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                    <UserPlus className="ml-2 h-4 w-4" />
                    ثبت‌نام
                  </TabsTrigger>
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
                                <User className="absolute right-3 top-3 h-4 w-4 text-text-secondary" />
                                <Input 
                                  className="pl-3 pr-10 bg-dark" 
                                  placeholder="نام کاربری خود را وارد کنید" 
                                  {...field} 
                                />
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
                                <Lock className="absolute right-3 top-3 h-4 w-4 text-text-secondary" />
                                <Input 
                                  className="pl-3 pr-10 bg-dark" 
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
                          <div className="flex items-center">
                            <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin ml-2"></div>
                            در حال ورود...
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <LogIn className="ml-2 h-4 w-4" />
                            ورود به حساب
                          </div>
                        )}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>

                {/* Register Form */}
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
                                <User className="absolute right-3 top-3 h-4 w-4 text-text-secondary" />
                                <Input 
                                  className="pl-3 pr-10 bg-dark" 
                                  placeholder="نام کاربری" 
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
                        name="displayName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>نام نمایشی</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <User className="absolute right-3 top-3 h-4 w-4 text-text-secondary" />
                                <Input 
                                  className="pl-3 pr-10 bg-dark" 
                                  placeholder="نام نمایشی (اختیاری)" 
                                  {...field} 
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={registerForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>ایمیل</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Mail className="absolute right-3 top-3 h-4 w-4 text-text-secondary" />
                                  <Input 
                                    className="pl-3 pr-10 bg-dark" 
                                    type="email" 
                                    placeholder="ایمیل" 
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
                          name="emailConfirm"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>تأیید ایمیل</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Mail className="absolute right-3 top-3 h-4 w-4 text-text-secondary" />
                                  <Input 
                                    className="pl-3 pr-10 bg-dark" 
                                    type="email" 
                                    placeholder="تأیید ایمیل" 
                                    {...field} 
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={registerForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>رمز عبور</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Lock className="absolute right-3 top-3 h-4 w-4 text-text-secondary" />
                                  <Input 
                                    className="pl-3 pr-10 bg-dark" 
                                    type="password" 
                                    placeholder="رمز عبور" 
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
                          name="passwordConfirm"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>تأیید رمز عبور</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Lock className="absolute right-3 top-3 h-4 w-4 text-text-secondary" />
                                  <Input 
                                    className="pl-3 pr-10 bg-dark" 
                                    type="password" 
                                    placeholder="تأیید رمز عبور" 
                                    {...field} 
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <Button 
                        type="submit" 
                        className="w-full"
                        disabled={registerMutation.isPending}
                      >
                        {registerMutation.isPending ? (
                          <div className="flex items-center">
                            <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin ml-2"></div>
                            در حال ثبت‌نام...
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <UserPlus className="ml-2 h-4 w-4" />
                            ساخت حساب کاربری
                          </div>
                        )}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Hero Column */}
        <div className="hidden lg:flex items-center justify-center glass-effect rounded-2xl overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent"></div>
          <div className="z-10 p-10 text-center">
            <h1 className="text-3xl font-bold mb-6">Xraynama</h1>
            <p className="text-lg mb-8 max-w-md">
              پلتفرم پخش آنلاین و دانلود رایگان انیمیشن، فیلم سینمایی، سریال و مستند خارجی با کیفیت بالا
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <Play className="h-6 w-6 text-primary" />
                </div>
                <div className="text-right">
                  <h3 className="font-bold">پخش آنلاین با کیفیت بالا</h3>
                  <p className="text-text-secondary text-sm">پخش با کیفیت‌های مختلف 480p، 720p و 1080p</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <Download className="h-6 w-6 text-primary" />
                </div>
                <div className="text-right">
                  <h3 className="font-bold">دانلود مستقیم</h3>
                  <p className="text-text-secondary text-sm">دانلود به صورت مستقیم با لینک‌های اختصاصی</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div className="text-right">
                  <h3 className="font-bold">تماشای گروهی</h3>
                  <p className="text-text-secondary text-sm">تماشای فیلم و سریال با دوستان به صورت همزمان</p>
                </div>
              </div>
            </div>
            <Button asChild className="mt-8" variant="outline">
              <a href="#" onClick={(e) => { e.preventDefault(); navigate("/"); }}>
                مشاهده محتواها
                <ArrowRight className="mr-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
