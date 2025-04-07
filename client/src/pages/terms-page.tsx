import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, FileText, Eye, Copyright, Bell } from 'lucide-react';

export default function TermsPage() {
  return (
    <>
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-foreground mb-6">قوانین و مقررات</h1>
          <p className="text-muted-foreground mb-10">
            لطفاً قوانین و مقررات استفاده از وبسایت Xraynama را با دقت مطالعه کنید. استفاده از خدمات این وبسایت به معنی پذیرش این قوانین است.
          </p>
          
          <Tabs defaultValue="terms" className="glass-effect rounded-lg p-4">
            <TabsList className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-transparent mb-4">
              <TabsTrigger value="terms" className="flex items-center data-[state=active]:glass-effect">
                <FileText className="ml-2 h-4 w-4" />
                شرایط استفاده
              </TabsTrigger>
              <TabsTrigger value="privacy" className="flex items-center data-[state=active]:glass-effect">
                <Eye className="ml-2 h-4 w-4" />
                حریم خصوصی
              </TabsTrigger>
              <TabsTrigger value="copyright" className="flex items-center data-[state=active]:glass-effect">
                <Copyright className="ml-2 h-4 w-4" />
                حق نشر
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center data-[state=active]:glass-effect">
                <Bell className="ml-2 h-4 w-4" />
                اعلانات
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="terms" className="p-4">
              <h2 className="text-2xl font-bold mb-4">شرایط استفاده</h2>
              
              <section className="mb-6">
                <h3 className="text-lg font-semibold mb-2">1. پذیرش شرایط</h3>
                <p className="text-muted-foreground mb-4">
                  با استفاده از وبسایت Xraynama، شما تمامی شرایط و قوانین مندرج در این صفحه را پذیرفته‌اید. اگر با هر یک از این شرایط موافق نیستید، لطفاً از استفاده از این وبسایت خودداری کنید.
                </p>
              </section>
              
              <section className="mb-6">
                <h3 className="text-lg font-semibold mb-2">2. تغییرات در قوانین</h3>
                <p className="text-muted-foreground mb-4">
                  Xraynama حق تغییر، اصلاح، اضافه کردن یا حذف بخش‌هایی از این قوانین را در هر زمان برای خود محفوظ می‌دارد. بررسی مداوم این صفحه مسئولیت کاربران است. استفادۀ مداوم از وبسایت پس از اعمال تغییرات به معنای پذیرش آن‌ها است.
                </p>
              </section>
              
              <section className="mb-6">
                <h3 className="text-lg font-semibold mb-2">3. قوانین استفاده</h3>
                <p className="text-muted-foreground mb-2">
                  کاربران موظف هستند:
                </p>
                <ul className="list-disc list-inside mb-4 text-muted-foreground">
                  <li>از استفاده از وبسایت برای اهداف غیرقانونی خودداری کنند.</li>
                  <li>از ارسال محتوای نامناسب، توهین‌آمیز یا تهدیدکننده خودداری کنند.</li>
                  <li>از هک، تلاش برای نفوذ یا آسیب به سیستم‌های وبسایت خودداری کنند.</li>
                  <li>از استفاده از بات‌ها یا اسکریپت‌های خودکار برای دانلود محتوا خودداری کنند.</li>
                  <li>از به اشتراک‌گذاری حساب کاربری خود با دیگران خودداری کنند.</li>
                </ul>
              </section>
              
              <section className="mb-6">
                <h3 className="text-lg font-semibold mb-2">4. حساب کاربری</h3>
                <p className="text-muted-foreground mb-4">
                  شما مسئول حفظ محرمانگی اطلاعات حساب کاربری خود هستید و همچنین مسئول تمام فعالیت‌هایی که تحت حساب کاربری شما انجام می‌شود. در صورت استفاده غیرمجاز از حساب کاربری، باید فوراً به ما اطلاع دهید.
                </p>
              </section>
              
              <section>
                <h3 className="text-lg font-semibold mb-2">5. محدودیت مسئولیت</h3>
                <p className="text-muted-foreground mb-4">
                  Xraynama هیچگونه تضمینی برای در دسترس بودن دائمی سرویس ارائه نمی‌کند و ممکن است سرویس در برخی مواقع به دلایل فنی یا بروزرسانی موقتاً در دسترس نباشد. ما مسئولیتی در قبال خسارات ناشی از استفاده یا عدم امکان استفاده از وبسایت نداریم.
                </p>
              </section>
            </TabsContent>
            
            <TabsContent value="privacy" className="p-4">
              <h2 className="text-2xl font-bold mb-4">حریم خصوصی</h2>
              
              <section className="mb-6">
                <h3 className="text-lg font-semibold mb-2">1. اطلاعات جمع‌آوری شده</h3>
                <p className="text-muted-foreground mb-4">
                  Xraynama ممکن است اطلاعات زیر را از کاربران جمع‌آوری کند:
                </p>
                <ul className="list-disc list-inside mb-4 text-muted-foreground">
                  <li>اطلاعات شخصی مانند نام، ایمیل و اطلاعات تماس که به صورت داوطلبانه توسط کاربر ارائه می‌شود.</li>
                  <li>اطلاعات ورود مانند آدرس IP، مرورگر، سیستم عامل و صفحات بازدید شده.</li>
                  <li>تاریخچه تماشا و ترجیحات محتوایی برای بهبود تجربه کاربری.</li>
                  <li>کوکی‌ها و فناوری‌های مشابه برای بهبود عملکرد وبسایت.</li>
                </ul>
              </section>
              
              <section className="mb-6">
                <h3 className="text-lg font-semibold mb-2">2. استفاده از اطلاعات</h3>
                <p className="text-muted-foreground mb-2">
                  ما از اطلاعات جمع‌آوری شده برای اهداف زیر استفاده می‌کنیم:
                </p>
                <ul className="list-disc list-inside mb-4 text-muted-foreground">
                  <li>ارائه، نگهداری و بهبود خدمات وبسایت.</li>
                  <li>شخصی‌سازی تجربه کاربری و توصیه محتوا بر اساس ترجیحات کاربر.</li>
                  <li>ارتباط با کاربران درباره به‌روزرسانی‌ها، تغییرات یا محتوای جدید.</li>
                  <li>تحلیل الگوهای استفاده برای بهبود عملکرد وبسایت.</li>
                  <li>شناسایی و جلوگیری از فعالیت‌های تقلب‌آمیز یا غیرمجاز.</li>
                </ul>
              </section>
              
              <section className="mb-6">
                <h3 className="text-lg font-semibold mb-2">3. اشتراک‌گذاری اطلاعات</h3>
                <p className="text-muted-foreground mb-4">
                  Xraynama اطلاعات شخصی کاربران را با اشخاص ثالث به اشتراک نمی‌گذارد، مگر در موارد زیر:
                </p>
                <ul className="list-disc list-inside mb-4 text-muted-foreground">
                  <li>با رضایت صریح کاربر.</li>
                  <li>با ارائه‌دهندگان خدمات که برای عملکرد وبسایت ضروری هستند.</li>
                  <li>در صورت الزام قانونی یا درخواست مراجع قضایی.</li>
                  <li>برای محافظت از حقوق، مالکیت یا امنیت Xraynama، کاربران یا عموم مردم.</li>
                </ul>
              </section>
              
              <section>
                <h3 className="text-lg font-semibold mb-2">4. حقوق کاربران</h3>
                <p className="text-muted-foreground mb-4">
                  کاربران حق دارند به اطلاعات شخصی خود دسترسی داشته باشند، آن‌ها را اصلاح کنند، یا درخواست حذف کنند. برای اعمال این حقوق، لطفاً از طریق صفحه تماس با ما ارتباط برقرار کنید.
                </p>
              </section>
            </TabsContent>
            
            <TabsContent value="copyright" className="p-4">
              <h2 className="text-2xl font-bold mb-4">حق نشر و مالکیت معنوی</h2>
              
              <section className="mb-6">
                <h3 className="text-lg font-semibold mb-2">1. مالکیت محتوا</h3>
                <p className="text-muted-foreground mb-4">
                  تمامی محتوای ارائه شده در Xraynama شامل فیلم‌ها، سریال‌ها، تصاویر، لوگوها، طراحی وبسایت و سایر عناصر تحت حمایت قوانین حق نشر و مالکیت معنوی قرار دارند. استفاده غیرمجاز از این محتوا بدون کسب اجازه کتبی ممنوع است.
                </p>
              </section>
              
              <section className="mb-6">
                <h3 className="text-lg font-semibold mb-2">2. استفاده مجاز</h3>
                <p className="text-muted-foreground mb-4">
                  کاربران مجاز به استفاده از محتوای Xraynama فقط برای مصرف شخصی و غیرتجاری هستند. هرگونه بازتولید، توزیع، نمایش عمومی، اجرای عمومی، تغییر یا ایجاد آثار مشتق شده بدون اجازه کتبی ممنوع است.
                </p>
              </section>
              
              <section className="mb-6">
                <h3 className="text-lg font-semibold mb-2">3. محتوای کاربران</h3>
                <p className="text-muted-foreground mb-4">
                  با ارسال نظرات، نقدها یا سایر محتوا به Xraynama، شما به ما اجازه می‌دهید تا از این محتوا برای اهداف مرتبط با وبسایت استفاده کنیم. همچنین تضمین می‌کنید که محتوای ارسالی شما حقوق اشخاص ثالث را نقض نمی‌کند.
                </p>
              </section>
              
              <section>
                <h3 className="text-lg font-semibold mb-2">4. گزارش نقض حق نشر</h3>
                <p className="text-muted-foreground mb-4">
                  اگر معتقدید محتوایی در Xraynama حقوق مالکیت معنوی شما را نقض می‌کند، لطفاً از طریق صفحه تماس با ما، گزارش دهید. گزارش باید شامل توضیح دقیق محتوای مورد نظر، مدارک مالکیت شما و اطلاعات تماس باشد.
                </p>
              </section>
            </TabsContent>
            
            <TabsContent value="notifications" className="p-4">
              <h2 className="text-2xl font-bold mb-4">اعلانات و ارتباطات</h2>
              
              <section className="mb-6">
                <h3 className="text-lg font-semibold mb-2">1. انواع اعلانات</h3>
                <p className="text-muted-foreground mb-4">
                  Xraynama ممکن است انواع مختلف اعلانات را برای کاربران ارسال کند، از جمله:
                </p>
                <ul className="list-disc list-inside mb-4 text-muted-foreground">
                  <li>اعلانات سیستمی مربوط به حساب کاربری و امنیت.</li>
                  <li>اطلاعیه‌های به‌روزرسانی سرویس و تغییرات در قوانین.</li>
                  <li>اعلانات مربوط به محتوای جدید یا محتوای درخواستی.</li>
                  <li>خبرنامه‌ها و پیشنهادات ویژه (در صورت عضویت).</li>
                </ul>
              </section>
              
              <section className="mb-6">
                <h3 className="text-lg font-semibold mb-2">2. تنظیمات اعلانات</h3>
                <p className="text-muted-foreground mb-4">
                  کاربران می‌توانند تنظیمات اعلانات خود را از طریق پنل کاربری مدیریت کنند. شما می‌توانید انواع خاصی از اعلانات را فعال یا غیرفعال کنید، اما برخی اعلانات مهم سیستمی قابل غیرفعال‌سازی نیستند.
                </p>
              </section>
              
              <section className="mb-6">
                <h3 className="text-lg font-semibold mb-2">3. ایمیل‌های تبلیغاتی</h3>
                <p className="text-muted-foreground mb-4">
                  در صورت عضویت در خبرنامه، شما ایمیل‌های تبلیغاتی و اطلاعات مربوط به محتوای جدید را دریافت خواهید کرد. در هر ایمیل ارسالی، لینک لغو عضویت وجود دارد که می‌توانید از طریق آن از دریافت ایمیل‌های آینده انصراف دهید.
                </p>
              </section>
              
              <section>
                <h3 className="text-lg font-semibold mb-2">4. ارتباطات مهم</h3>
                <p className="text-muted-foreground mb-4">
                  حتی اگر از دریافت ایمیل‌های تبلیغاتی انصراف دهید، ما همچنان ممکن است اعلانات مهم مربوط به حساب کاربری شما یا تغییرات در شرایط خدمات را ارسال کنیم. این ارتباطات بخشی از رابطه کاربری ما با شماست و برای استفاده از خدمات ضروری هستند.
                </p>
              </section>
            </TabsContent>
          </Tabs>
          
          <Card className="glass-effect mt-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="mr-2 h-5 w-5 text-primary" />
                تعهد ما به کاربران
              </CardTitle>
              <CardDescription>
                ما متعهد هستیم به حفظ حقوق کاربران و ارائه خدمات با کیفیت
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                تیم Xraynama به طور مداوم در تلاش است تا:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex">
                  <span className="text-primary ml-2">•</span>
                  امنیت اطلاعات کاربران را با استفاده از استانداردهای بالای امنیتی تضمین کند.
                </li>
                <li className="flex">
                  <span className="text-primary ml-2">•</span>
                  محتوای با کیفیت و متنوع را برای سلیقه‌های مختلف فراهم آورد.
                </li>
                <li className="flex">
                  <span className="text-primary ml-2">•</span>
                  به بازخوردها و پیشنهادات کاربران توجه کرده و در جهت بهبود سرویس تلاش کند.
                </li>
                <li className="flex">
                  <span className="text-primary ml-2">•</span>
                  شفافیت در سیاست‌ها و تصمیمات را حفظ کند.
                </li>
              </ul>
              <p className="mt-4 text-sm text-muted-foreground">
                آخرین بروزرسانی: فروردین ۱۴۰۴
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </>
  );
}