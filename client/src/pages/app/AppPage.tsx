import { SectionLayout } from '@/components/layout/SectionLayout';
import { Smartphone, Download, Monitor, Tablet, Laptop, Globe, Phone, Shield, CheckCircle, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';

// اطلاعات قابلیت‌ها
const features = [
  {
    icon: <Globe className="h-6 w-6 text-[#00BFFF]" />,
    title: 'دسترسی آنلاین و آفلاین',
    description: 'محتوای مورد علاقه خود را دانلود کنید و بدون اینترنت تماشا کنید'
  },
  {
    icon: <Shield className="h-6 w-6 text-[#00BFFF]" />,
    title: 'امنیت بالا',
    description: 'سیستم امنیتی پیشرفته برای حفاظت از اطلاعات کاربران'
  },
  {
    icon: <CheckCircle className="h-6 w-6 text-[#00BFFF]" />,
    title: 'کیفیت بالا',
    description: 'پخش محتوا با کیفیت بالا و بدون افت سرعت'
  }
];

// اطلاعات پلتفرم‌ها
const platforms = [
  {
    icon: <Smartphone className="h-8 w-8" />,
    title: 'اندروید',
    subtitle: 'نسخه 7.0 و بالاتر',
    downloadLink: '#',
    qrCode: '/assets/fake_qr_android.png'
  },
  {
    icon: <Phone className="h-8 w-8" />,
    title: 'iOS',
    subtitle: 'نسخه 13.0 و بالاتر',
    downloadLink: '#',
    qrCode: '/assets/fake_qr_ios.png'
  },
  {
    icon: <Monitor className="h-8 w-8" />,
    title: 'تلویزیون هوشمند',
    subtitle: 'Android TV و Samsung TV',
    downloadLink: '#',
    qrCode: '/assets/fake_qr_tv.png'
  },
  {
    icon: <Laptop className="h-8 w-8" />,
    title: 'ویندوز',
    subtitle: 'ویندوز 10 و 11',
    downloadLink: '#',
    qrCode: '/assets/fake_qr_windows.png'
  }
];

// کارت پلتفرم
const PlatformCard = ({ platform }: { platform: typeof platforms[0] }) => {
  return (
    <div className="glass-effect p-6 rounded-xl border border-[#00BFFF]/10 hover:border-[#00BFFF]/30 transition-all duration-300 group cursor-pointer">
      <div className="flex flex-col items-center text-center md:text-right md:flex-row md:items-start">
        <div className="bg-[#00BFFF]/10 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4 md:mb-0 md:ml-4 group-hover:bg-[#00BFFF]/20 transition-all duration-300">
          {platform.icon}
        </div>
        
        <div className="flex-1">
          <h3 className="text-xl font-medium mb-2 group-hover:text-[#00BFFF] transition-colors duration-300">
            {platform.title}
          </h3>
          <p className="text-muted-foreground mb-4">{platform.subtitle}</p>
          
          <Button className="w-full md:w-auto flex items-center gap-2">
            <Download className="h-4 w-4" />
            <span>دانلود</span>
          </Button>
        </div>
        
        {/* QR Code - این بخش در پروژه واقعی تصاویر QR واقعی را استفاده می‌کند */}
        <div className="mt-4 md:mt-0 md:mr-4 w-24 h-24 bg-white p-2 rounded-lg shadow-md hidden md:block">
          <div className="w-full h-full bg-gray-200 rounded-md flex items-center justify-center">
            <span className="text-xs text-gray-500">QR Code</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// بخش قابلیت‌ها و ویژگی‌ها
const FeaturesSection = () => {
  return (
    <div className="mb-16">
      <h2 className="text-2xl font-bold mb-8 text-center">قابلیت‌ها و ویژگی‌ها</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <div 
            key={index} 
            className="glass-effect p-6 rounded-xl text-center border border-[#00BFFF]/10 hover:border-[#00BFFF]/30 transition-all duration-300 hover:transform hover:scale-105"
          >
            <div className="bg-[#00BFFF]/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              {feature.icon}
            </div>
            <h3 className="text-lg font-medium mb-2">{feature.title}</h3>
            <p className="text-muted-foreground">{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// بخش امتیازات و نظرات
const ReviewsSection = () => {
  const reviews = [
    { name: 'علی محمدی', rating: 5, text: 'کیفیت عالی و رابط کاربری بسیار روان' },
    { name: 'مریم حسینی', rating: 4, text: 'بهترین اپلیکیشن پخش فیلم و سریال' },
    { name: 'محمد رضایی', rating: 5, text: 'امکان دانلود و تماشای آفلاین عالیه' },
  ];
  
  return (
    <div className="mb-16 glass-effect p-6 rounded-xl">
      <h2 className="text-2xl font-bold mb-8 text-center">نظرات کاربران</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {reviews.map((review, index) => (
          <div 
            key={index} 
            className="bg-[#00BFFF]/5 p-4 rounded-lg backdrop-blur-md"
          >
            <div className="flex items-center mb-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star 
                  key={i} 
                  className={`h-4 w-4 ${i < review.rating ? 'text-yellow-500' : 'text-gray-500'}`}
                  fill={i < review.rating ? 'currentColor' : 'none'}
                />
              ))}
            </div>
            <p className="text-sm text-muted-foreground mb-3">"{review.text}"</p>
            <p className="text-sm font-medium">{review.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// صفحه اصلی اپلیکیشن
export default function AppPage() {
  const [currentTab, setCurrentTab] = useState('android');
  
  return (
    <SectionLayout 
      title="اپلیکیشن اکس‌رینما"
      description="دسترسی به فیلم‌ها و سریال‌های محبوب در هر زمان و هر مکان با اپلیکیشن اختصاصی ما"
      icon={<Smartphone className="h-8 w-8" />}
    >
      {/* قسمت اصلی معرفی اپلیکیشن */}
      <div className="mb-16 overflow-hidden rounded-xl glass-effect">
        <div className="relative p-8 md:p-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                پخش فیلم و سریال در همه دستگاه‌ها
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                با اپلیکیشن اکس‌رینما، کل کتابخانه محتوای ما را در گوشی، تبلت، کامپیوتر و تلویزیون هوشمند خود داشته باشید.
                امکان دانلود، تماشای آفلاین و سینک کردن لیست‌های پخش بین دستگاه‌های مختلف.
              </p>
              
              <div className="flex flex-wrap gap-3">
                <Button size="lg" className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  <span>دانلود مستقیم</span>
                </Button>
                
                <Button size="lg" variant="outline" className="border-[#00BFFF]/30 hover:border-[#00BFFF]/60 hover:bg-[#00BFFF]/10">
                  <span>اطلاعات بیشتر</span>
                </Button>
              </div>
            </div>
            
            {/* تصویر اپلیکیشن - این قسمت در پروژه واقعی از تصاویر واقعی استفاده می‌کند */}
            <div className="flex justify-center">
              <div className="w-60 h-[400px] bg-[#00BFFF]/10 rounded-[40px] p-4 border-8 border-[#00142c] shadow-lg shadow-[#00BFFF]/20 relative">
                <div className="h-full w-full bg-[#00142c] rounded-[24px] flex flex-col items-center justify-center">
                  <div className="text-[#00BFFF] text-2xl font-bold">X<span className="text-white">raynama</span></div>
                  <p className="text-gray-400 text-sm mt-2">App UI</p>
                </div>
                <div className="absolute top-2 right-1/2 transform translate-x-1/2 w-16 h-2 bg-[#00142c] rounded-full"></div>
              </div>
            </div>
          </div>
          
          {/* افکت گلاسمورفیسم بهبود یافته */}
          <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
            <div className="absolute -top-[400px] -left-[300px] w-[800px] h-[800px] rounded-full bg-[#00BFFF]/5 blur-[100px]"></div>
            <div className="absolute -bottom-[400px] -right-[300px] w-[800px] h-[800px] rounded-full bg-[#00BFFF]/5 blur-[100px]"></div>
          </div>
        </div>
      </div>
      
      {/* قابلیت‌ها و ویژگی‌ها */}
      <FeaturesSection />
      
      {/* دانلود برای پلتفرم‌های مختلف */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold mb-6 text-center">دانلود برای پلتفرم‌های مختلف</h2>
        
        <Tabs 
          defaultValue="android" 
          value={currentTab}
          onValueChange={setCurrentTab}
          className="mb-8"
        >
          <TabsList className="grid grid-cols-4 w-full max-w-xl mx-auto bg-card/30">
            <TabsTrigger value="android">اندروید</TabsTrigger>
            <TabsTrigger value="ios">iOS</TabsTrigger>
            <TabsTrigger value="tv">تلویزیون</TabsTrigger>
            <TabsTrigger value="windows">ویندوز</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="grid grid-cols-1 gap-6">
          {platforms.map((platform, index) => (
            <div key={index} className={platform.title.toLowerCase().includes(currentTab) ? 'block' : 'hidden'}>
              <PlatformCard platform={platform} />
            </div>
          ))}
        </div>
      </div>
      
      {/* نظرات کاربران */}
      <ReviewsSection />
      
      {/* راهنمای نصب */}
      <div className="mb-8 bg-[#00BFFF]/5 backdrop-blur-md p-6 rounded-xl border border-[#00BFFF]/10">
        <h2 className="text-xl font-bold mb-4">راهنمای نصب</h2>
        <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
          <li>فایل مورد نظر را برای سیستم عامل خود دانلود کنید</li>
          <li>در اندروید، اجازه نصب از منابع ناشناس را فعال کنید</li>
          <li>فایل نصبی را اجرا کنید</li>
          <li>مراحل نصب را دنبال کنید</li>
          <li>پس از نصب، وارد حساب کاربری خود شوید یا یک حساب جدید بسازید</li>
        </ol>
      </div>
      
      {/* سوالات متداول */}
      <div className="mb-16 glass-effect p-6 rounded-xl">
        <h2 className="text-2xl font-bold mb-6 text-center">سوالات متداول</h2>
        
        <div className="space-y-4">
          <div className="bg-[#00BFFF]/5 p-4 rounded-lg">
            <h3 className="font-medium mb-2">آیا استفاده از اپلیکیشن رایگان است؟</h3>
            <p className="text-sm text-muted-foreground">بله، دانلود و استفاده از اپلیکیشن رایگان است اما برخی از محتواها نیاز به اشتراک ویژه دارند.</p>
          </div>
          
          <div className="bg-[#00BFFF]/5 p-4 rounded-lg">
            <h3 className="font-medium mb-2">آیا می‌توانم محتوا را دانلود کنم؟</h3>
            <p className="text-sm text-muted-foreground">بله، امکان دانلود محتوا برای تماشای آفلاین وجود دارد. کاربران اشتراک ویژه می‌توانند همه محتواها را دانلود کنند.</p>
          </div>
          
          <div className="bg-[#00BFFF]/5 p-4 rounded-lg">
            <h3 className="font-medium mb-2">آیا می‌توانم در چند دستگاه همزمان استفاده کنم؟</h3>
            <p className="text-sm text-muted-foreground">بستگی به نوع اشتراک شما دارد. اشتراک پایه امکان استفاده همزمان در یک دستگاه و اشتراک ویژه در سه دستگاه را فراهم می‌کند.</p>
          </div>
        </div>
      </div>
      
      {/* دعوت به دانلود */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-4">همین حالا دانلود کنید</h2>
        <p className="text-muted-foreground mb-6">تجربه لذت تماشای فیلم و سریال با کیفیت بالا را از دست ندهید</p>
        
        <Button size="lg" className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          <span>دانلود اپلیکیشن</span>
        </Button>
      </div>
    </SectionLayout>
  );
}