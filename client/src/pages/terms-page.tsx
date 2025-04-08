import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, FileText, Eye, Copyright, Bell, Check } from 'lucide-react';

export default function TermsPage() {
  return (
    <>
      <Header />
      
      <main className="container mx-auto px-4 py-8 min-h-[calc(100vh-200px)] relative">
        {/* Background glow effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute w-2/3 h-1/2 top-0 left-[15%] bg-[#00BFFF]/10 rounded-full blur-[150px] opacity-60"></div>
          <div className="absolute w-1/3 h-1/3 bottom-[10%] right-[10%] bg-[#00BFFF]/15 rounded-full blur-[100px] opacity-60"></div>
        </div>
        
        <div className="max-w-4xl mx-auto relative z-10">
          <h1 className="text-3xl font-bold text-white mb-4">قوانین و مقررات</h1>
          <p className="text-[#CCDDEE] mb-8">
            لطفاً قوانین و مقررات استفاده از وبسایت <span className="text-[#00BFFF] font-bold">X</span>raynama را با دقت مطالعه کنید. استفاده از خدمات این وبسایت به معنی پذیرش این قوانین است.
          </p>
          
          <div className="border border-[#00BFFF]/20 bg-[#00142c]/80 backdrop-blur-lg shadow-[0_0_25px_rgba(0,191,255,0.15)] rounded-xl overflow-hidden p-6 relative">
            {/* نوار تزئینی بالای کارت */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#00BFFF]/50 to-transparent"></div>
            
            <Tabs defaultValue="terms">
              <TabsList className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-transparent mb-6 p-0">
                <TabsTrigger 
                  value="terms" 
                  className="flex items-center bg-[#001c3d]/50 border border-transparent data-[state=active]:border-[#00BFFF]/40 data-[state=active]:bg-[#00BFFF]/10 data-[state=active]:shadow-[0_0_10px_rgba(0,191,255,0.3)] transition-all duration-300"
                >
                  <FileText className="ml-2 h-4 w-4 text-[#00BFFF]" />
                  شرایط استفاده
                </TabsTrigger>
                <TabsTrigger 
                  value="privacy" 
                  className="flex items-center bg-[#001c3d]/50 border border-transparent data-[state=active]:border-[#00BFFF]/40 data-[state=active]:bg-[#00BFFF]/10 data-[state=active]:shadow-[0_0_10px_rgba(0,191,255,0.3)] transition-all duration-300"
                >
                  <Eye className="ml-2 h-4 w-4 text-[#00BFFF]" />
                  حریم خصوصی
                </TabsTrigger>
                <TabsTrigger 
                  value="copyright" 
                  className="flex items-center bg-[#001c3d]/50 border border-transparent data-[state=active]:border-[#00BFFF]/40 data-[state=active]:bg-[#00BFFF]/10 data-[state=active]:shadow-[0_0_10px_rgba(0,191,255,0.3)] transition-all duration-300"
                >
                  <Copyright className="ml-2 h-4 w-4 text-[#00BFFF]" />
                  حق نشر
                </TabsTrigger>
                <TabsTrigger 
                  value="notifications" 
                  className="flex items-center bg-[#001c3d]/50 border border-transparent data-[state=active]:border-[#00BFFF]/40 data-[state=active]:bg-[#00BFFF]/10 data-[state=active]:shadow-[0_0_10px_rgba(0,191,255,0.3)] transition-all duration-300"
                >
                  <Bell className="ml-2 h-4 w-4 text-[#00BFFF]" />
                  اعلانات
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="terms" className="p-4 rounded-md relative bg-[#00142c]/60 border border-[#00BFFF]/10">
                <div className="absolute inset-0 bg-[#00BFFF]/5 backdrop-blur-md rounded-md -z-10"></div>
                <h2 className="text-2xl font-bold mb-4 text-white">شرایط استفاده</h2>
                
                <section className="mb-6">
                  <h3 className="text-xl font-semibold mb-2 text-[#00BFFF]">۱. پذیرش شرایط</h3>
                  <p className="text-[#CCDDEE] mb-4">
                    شما تمامی شرایط و قوانین مندرج در این صفحه را پذیرفته‌اید. اگر با هر یک از این شرایط موافق نیستید، لطفاً از استفاده از این وبسایت خودداری کنید.
                  </p>
                </section>
                
                <section className="mb-6">
                  <h3 className="text-xl font-semibold mb-2 text-[#00BFFF]">۲. تغییرات در قوانین</h3>
                  <p className="text-[#CCDDEE] mb-4">
                    <span className="text-[#00BFFF]">X</span>raynama حق تغییر، اصلاح، اضافه کردن یا حذف بخش‌هایی از این قوانین را در هر زمان برای خود محفوظ می‌دارد. بررسی مداوم این صفحه مسئولیت کاربران است. استفادۀ مداوم از وبسایت پس از اعمال تغییرات به معنای پذیرش آن‌ها است.
                  </p>
                </section>
                
                <section className="mb-6">
                  <h3 className="text-xl font-semibold mb-2 text-[#00BFFF]">۳. قوانین استفاده</h3>
                  <p className="text-[#CCDDEE] mb-2">
                    کاربران موظف هستند:
                  </p>
                  <ul className="space-y-3 pr-6 mb-4 text-[#CCDDEE]">
                    <li className="flex items-start">
                      <span className="text-[#00BFFF] ml-2 mt-1 text-lg">•</span>
                      <span>از استفاده از وبسایت برای اهداف غیرقانونی خودداری کنند.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-[#00BFFF] ml-2 mt-1 text-lg">•</span>
                      <span>از ارسال محتوای نامناسب، توهین‌آمیز یا تهدیدکننده خودداری کنند.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-[#00BFFF] ml-2 mt-1 text-lg">•</span>
                      <span>از هک، تلاش برای نفوذ یا آسیب به سیستم‌های وبسایت خودداری کنند.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-[#00BFFF] ml-2 mt-1 text-lg">•</span>
                      <span>از استفاده از بات‌ها یا اسکریپت‌های خودکار برای دانلود محتوا خودداری کنند.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-[#00BFFF] ml-2 mt-1 text-lg">•</span>
                      <span>از به اشتراک‌گذاری حساب کاربری خود با دیگران خودداری کنند.</span>
                    </li>
                  </ul>
                </section>
                
                <section className="mb-6">
                  <h3 className="text-xl font-semibold mb-2 text-[#00BFFF]">۴. حساب کاربری</h3>
                  <p className="text-[#CCDDEE] mb-4">
                    شما مسئول حفظ محرمانگی اطلاعات حساب کاربری خود هستید و همچنین مسئول تمام فعالیت‌هایی که تحت حساب کاربری شما انجام می‌شود. در صورت استفاده غیرمجاز از حساب کاربری، باید فوراً به ما اطلاع دهید.
                  </p>
                </section>
                
                <section>
                  <h3 className="text-xl font-semibold mb-2 text-[#00BFFF]">۵. محدودیت مسئولیت</h3>
                  <p className="text-[#CCDDEE] mb-4">
                    <span className="text-[#00BFFF]">X</span>raynama هیچگونه تضمینی برای در دسترس بودن دائمی سرویس ارائه نمی‌کند و ممکن است سرویس در برخی مواقع به دلایل فنی یا بروزرسانی موقتاً در دسترس نباشد. ما مسئولیتی در قبال خسارات ناشی از استفاده یا عدم امکان استفاده از وبسایت نداریم.
                  </p>
                </section>
              </TabsContent>
              
              <TabsContent value="privacy" className="p-4 rounded-md relative bg-[#00142c]/60 border border-[#00BFFF]/10">
                <div className="absolute inset-0 bg-[#00BFFF]/5 backdrop-blur-md rounded-md -z-10"></div>
                <h2 className="text-2xl font-bold mb-4 text-white">حریم خصوصی</h2>
                
                <section className="mb-6">
                  <h3 className="text-xl font-semibold mb-2 text-[#00BFFF]">۱. اطلاعات جمع‌آوری شده</h3>
                  <p className="text-[#CCDDEE] mb-4">
                    <span className="text-[#00BFFF]">X</span>raynama ممکن است اطلاعات زیر را از کاربران جمع‌آوری کند:
                  </p>
                  <ul className="space-y-3 pr-6 mb-4 text-[#CCDDEE]">
                    <li className="flex items-start">
                      <div className="min-w-[3px] h-[calc(100%-8px)] ml-3 bg-[#00BFFF]/40 self-center rounded-full"></div>
                      <span>اطلاعات شخصی مانند نام، ایمیل و اطلاعات تماس که به صورت داوطلبانه توسط کاربر ارائه می‌شود.</span>
                    </li>
                    <li className="flex items-start">
                      <div className="min-w-[3px] h-[calc(100%-8px)] ml-3 bg-[#00BFFF]/40 self-center rounded-full"></div>
                      <span>اطلاعات ورود مانند آدرس IP، مرورگر، سیستم عامل و صفحات بازدید شده.</span>
                    </li>
                    <li className="flex items-start">
                      <div className="min-w-[3px] h-[calc(100%-8px)] ml-3 bg-[#00BFFF]/40 self-center rounded-full"></div>
                      <span>تاریخچه تماشا و ترجیحات محتوایی برای بهبود تجربه کاربری.</span>
                    </li>
                    <li className="flex items-start">
                      <div className="min-w-[3px] h-[calc(100%-8px)] ml-3 bg-[#00BFFF]/40 self-center rounded-full"></div>
                      <span>کوکی‌ها و فناوری‌های مشابه برای بهبود عملکرد وبسایت.</span>
                    </li>
                  </ul>
                </section>
                
                <section className="mb-6">
                  <h3 className="text-xl font-semibold mb-2 text-[#00BFFF]">۲. استفاده از اطلاعات</h3>
                  <p className="text-[#CCDDEE] mb-2">
                    ما از اطلاعات جمع‌آوری شده برای اهداف زیر استفاده می‌کنیم:
                  </p>
                  <ul className="space-y-3 pr-6 mb-4 text-[#CCDDEE]">
                    <li className="flex items-start">
                      <div className="min-w-[3px] h-[calc(100%-8px)] ml-3 bg-[#00BFFF]/40 self-center rounded-full"></div>
                      <span>ارائه، نگهداری و بهبود خدمات وبسایت.</span>
                    </li>
                    <li className="flex items-start">
                      <div className="min-w-[3px] h-[calc(100%-8px)] ml-3 bg-[#00BFFF]/40 self-center rounded-full"></div>
                      <span>شخصی‌سازی تجربه کاربری و توصیه محتوا بر اساس ترجیحات کاربر.</span>
                    </li>
                    <li className="flex items-start">
                      <div className="min-w-[3px] h-[calc(100%-8px)] ml-3 bg-[#00BFFF]/40 self-center rounded-full"></div>
                      <span>ارتباط با کاربران درباره به‌روزرسانی‌ها، تغییرات یا محتوای جدید.</span>
                    </li>
                    <li className="flex items-start">
                      <div className="min-w-[3px] h-[calc(100%-8px)] ml-3 bg-[#00BFFF]/40 self-center rounded-full"></div>
                      <span>تحلیل الگوهای استفاده برای بهبود عملکرد وبسایت.</span>
                    </li>
                    <li className="flex items-start">
                      <div className="min-w-[3px] h-[calc(100%-8px)] ml-3 bg-[#00BFFF]/40 self-center rounded-full"></div>
                      <span>شناسایی و جلوگیری از فعالیت‌های تقلب‌آمیز یا غیرمجاز.</span>
                    </li>
                  </ul>
                </section>
                
                <section className="mb-6">
                  <h3 className="text-xl font-semibold mb-2 text-[#00BFFF]">۳. اشتراک‌گذاری اطلاعات</h3>
                  <p className="text-[#CCDDEE] mb-4">
                    <span className="text-[#00BFFF]">X</span>raynama اطلاعات شخصی کاربران را با اشخاص ثالث به اشتراک نمی‌گذارد، مگر در موارد زیر:
                  </p>
                  <ul className="space-y-3 pr-6 mb-4 text-[#CCDDEE]">
                    <li className="flex items-start">
                      <div className="min-w-[3px] h-[calc(100%-8px)] ml-3 bg-[#00BFFF]/40 self-center rounded-full"></div>
                      <span>با رضایت صریح کاربر.</span>
                    </li>
                    <li className="flex items-start">
                      <div className="min-w-[3px] h-[calc(100%-8px)] ml-3 bg-[#00BFFF]/40 self-center rounded-full"></div>
                      <span>با ارائه‌دهندگان خدمات که برای عملکرد وبسایت ضروری هستند.</span>
                    </li>
                    <li className="flex items-start">
                      <div className="min-w-[3px] h-[calc(100%-8px)] ml-3 bg-[#00BFFF]/40 self-center rounded-full"></div>
                      <span>در صورت الزام قانونی یا درخواست مراجع قضایی.</span>
                    </li>
                    <li className="flex items-start">
                      <div className="min-w-[3px] h-[calc(100%-8px)] ml-3 bg-[#00BFFF]/40 self-center rounded-full"></div>
                      <span>برای محافظت از حقوق، مالکیت یا امنیت <span className="text-[#00BFFF]">X</span>raynama، کاربران یا عموم مردم.</span>
                    </li>
                  </ul>
                </section>
                
                <section>
                  <h3 className="text-xl font-semibold mb-2 text-[#00BFFF]">۴. حقوق کاربران</h3>
                  <p className="text-[#CCDDEE] mb-4">
                    کاربران حق دارند به اطلاعات شخصی خود دسترسی داشته باشند، آن‌ها را اصلاح کنند، یا درخواست حذف کنند. برای اعمال این حقوق، لطفاً از طریق صفحه تماس با ما ارتباط برقرار کنید.
                  </p>
                </section>
              </TabsContent>
              
              <TabsContent value="copyright" className="p-4 rounded-md relative bg-[#00142c]/60 border border-[#00BFFF]/10">
                <div className="absolute inset-0 bg-[#00BFFF]/5 backdrop-blur-md rounded-md -z-10"></div>
                <h2 className="text-2xl font-bold mb-4 text-white">حق نشر و مالکیت معنوی</h2>
                
                <section className="mb-6">
                  <h3 className="text-xl font-semibold mb-2 text-[#00BFFF]">۱. مالکیت محتوا</h3>
                  <p className="text-[#CCDDEE] mb-4">
                    تمامی محتوای ارائه شده در <span className="text-[#00BFFF]">X</span>raynama شامل فیلم‌ها، سریال‌ها، تصاویر، لوگوها، طراحی وبسایت و سایر عناصر تحت حمایت قوانین حق نشر و مالکیت معنوی قرار دارند. استفاده غیرمجاز از این محتوا بدون کسب اجازه کتبی ممنوع است.
                  </p>
                </section>
                
                <section className="mb-6">
                  <h3 className="text-xl font-semibold mb-2 text-[#00BFFF]">۲. استفاده مجاز</h3>
                  <p className="text-[#CCDDEE] mb-4">
                    کاربران مجاز به استفاده از محتوای <span className="text-[#00BFFF]">X</span>raynama فقط برای مصرف شخصی و غیرتجاری هستند. هرگونه بازتولید، توزیع، نمایش عمومی، اجرای عمومی، تغییر یا ایجاد آثار مشتق شده بدون اجازه کتبی ممنوع است.
                  </p>
                </section>
                
                <section className="mb-6">
                  <h3 className="text-xl font-semibold mb-2 text-[#00BFFF]">۳. محتوای کاربران</h3>
                  <p className="text-[#CCDDEE] mb-4">
                    با ارسال نظرات، نقدها یا سایر محتوا به <span className="text-[#00BFFF]">X</span>raynama، شما به ما اجازه می‌دهید تا از این محتوا برای اهداف مرتبط با وبسایت استفاده کنیم. همچنین تضمین می‌کنید که محتوای ارسالی شما حقوق اشخاص ثالث را نقض نمی‌کند.
                  </p>
                </section>
                
                <section>
                  <h3 className="text-xl font-semibold mb-2 text-[#00BFFF]">۴. گزارش نقض حق نشر</h3>
                  <p className="text-[#CCDDEE] mb-4">
                    اگر معتقدید محتوایی در <span className="text-[#00BFFF]">X</span>raynama حقوق مالکیت معنوی شما را نقض می‌کند، لطفاً از طریق صفحه تماس با ما، گزارش دهید. گزارش باید شامل توضیح دقیق محتوای مورد نظر، مدارک مالکیت شما و اطلاعات تماس باشد.
                  </p>
                </section>
              </TabsContent>
              
              <TabsContent value="notifications" className="p-4 rounded-md relative bg-[#00142c]/60 border border-[#00BFFF]/10">
                <div className="absolute inset-0 bg-[#00BFFF]/5 backdrop-blur-md rounded-md -z-10"></div>
                <h2 className="text-2xl font-bold mb-4 text-white">اعلانات و ارتباطات</h2>
                
                <section className="mb-6">
                  <h3 className="text-xl font-semibold mb-2 text-[#00BFFF]">۱. انواع اعلانات</h3>
                  <p className="text-[#CCDDEE] mb-4">
                    <span className="text-[#00BFFF]">X</span>raynama ممکن است انواع مختلف اعلانات را برای کاربران ارسال کند، از جمله:
                  </p>
                  <ul className="space-y-3 pr-6 mb-4 text-[#CCDDEE]">
                    <li className="flex items-start">
                      <div className="min-w-[3px] h-[calc(100%-8px)] ml-3 bg-[#00BFFF]/40 self-center rounded-full"></div>
                      <span>اعلانات سیستمی مربوط به حساب کاربری و امنیت.</span>
                    </li>
                    <li className="flex items-start">
                      <div className="min-w-[3px] h-[calc(100%-8px)] ml-3 bg-[#00BFFF]/40 self-center rounded-full"></div>
                      <span>اطلاعیه‌های به‌روزرسانی سرویس و تغییرات در قوانین.</span>
                    </li>
                    <li className="flex items-start">
                      <div className="min-w-[3px] h-[calc(100%-8px)] ml-3 bg-[#00BFFF]/40 self-center rounded-full"></div>
                      <span>اعلانات مربوط به محتوای جدید یا محتوای درخواستی.</span>
                    </li>
                    <li className="flex items-start">
                      <div className="min-w-[3px] h-[calc(100%-8px)] ml-3 bg-[#00BFFF]/40 self-center rounded-full"></div>
                      <span>خبرنامه‌ها و پیشنهادات ویژه (در صورت عضویت).</span>
                    </li>
                  </ul>
                </section>
                
                <section className="mb-6">
                  <h3 className="text-xl font-semibold mb-2 text-[#00BFFF]">۲. تنظیمات اعلانات</h3>
                  <p className="text-[#CCDDEE] mb-4">
                    کاربران می‌توانند تنظیمات اعلانات خود را از طریق پنل کاربری مدیریت کنند. شما می‌توانید انواع خاصی از اعلانات را فعال یا غیرفعال کنید، اما برخی اعلانات مهم سیستمی قابل غیرفعال‌سازی نیستند.
                  </p>
                </section>
                
                <section className="mb-6">
                  <h3 className="text-xl font-semibold mb-2 text-[#00BFFF]">۳. ایمیل‌های تبلیغاتی</h3>
                  <p className="text-[#CCDDEE] mb-4">
                    در صورت عضویت در خبرنامه، شما ایمیل‌های تبلیغاتی و اطلاعات مربوط به محتوای جدید را دریافت خواهید کرد. در هر ایمیل ارسالی، لینک لغو عضویت وجود دارد که می‌توانید از طریق آن از دریافت ایمیل‌های آینده انصراف دهید.
                  </p>
                </section>
                
                <section>
                  <h3 className="text-xl font-semibold mb-2 text-[#00BFFF]">۴. ارتباطات مهم</h3>
                  <p className="text-[#CCDDEE] mb-4">
                    حتی اگر از دریافت ایمیل‌های تبلیغاتی انصراف دهید، ما همچنان ممکن است اعلانات مهم مربوط به حساب کاربری شما یا تغییرات در شرایط خدمات را ارسال کنیم. این ارتباطات بخشی از رابطه کاربری ما با شماست و برای استفاده از خدمات ضروری هستند.
                  </p>
                </section>
              </TabsContent>
            </Tabs>
            
            <div className="mt-10 border border-[#00BFFF]/30 bg-[#001c3d]/60 backdrop-blur-sm shadow-[0_0_15px_rgba(0,191,255,0.1)] rounded-lg overflow-hidden relative">
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#00BFFF]/40 to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#00BFFF]/20 to-transparent"></div>
              
              <div className="p-5 text-right">
                <div className="flex flex-row-reverse items-center mb-2">
                  <Shield className="mr-2 h-5 w-5 text-[#00BFFF]" />
                  <h3 className="text-xl font-bold text-white">تعهد ما به کاربران</h3>
                </div>
                <p className="text-[#CCDDEE]/90 text-sm mb-4">
                  ما متعهد هستیم به حفظ حقوق کاربران و ارائه خدمات با کیفیت
                </p>
                
                <p className="text-[#CCDDEE] mb-4">
                  تیم <span className="text-[#00BFFF]">X</span>raynama به طور مداوم در تلاش است تا:
                </p>
                <ul className="space-y-2 text-[#CCDDEE]">
                  <li className="flex flex-row-reverse">
                    <Check className="mr-2 h-5 w-5 text-[#00BFFF]" />
                    <span>امنیت اطلاعات کاربران را با استفاده از استانداردهای بالای امنیتی تضمین کند.</span>
                  </li>
                  <li className="flex flex-row-reverse">
                    <Check className="mr-2 h-5 w-5 text-[#00BFFF]" />
                    <span>محتوای با کیفیت و متنوع را برای سلیقه‌های مختلف فراهم آورد.</span>
                  </li>
                  <li className="flex flex-row-reverse">
                    <Check className="mr-2 h-5 w-5 text-[#00BFFF]" />
                    <span>به بازخوردها و پیشنهادات کاربران توجه کرده و در جهت بهبود سرویس تلاش کند.</span>
                  </li>
                  <li className="flex flex-row-reverse">
                    <Check className="mr-2 h-5 w-5 text-[#00BFFF]" />
                    <span>شفافیت در سیاست‌ها و تصمیمات را حفظ کند.</span>
                  </li>
                </ul>
                <div className="mt-4 text-sm text-[#CCDDEE]/70 flex justify-end items-center">
                  <span>آخرین بروزرسانی: فروردین ۱۴۰۴</span>
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