import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, HelpCircle } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'wouter';

// Define FAQ categories and items
const faqCategories = [
  {
    id: 'general',
    title: 'سوالات عمومی',
    items: [
      {
        question: 'Xraynama چیست؟',
        answer: 'Xraynama یک پلتفرم آنلاین برای پخش و دانلود انواع فیلم، سریال، انیمیشن و مستند است که با هدف ارائه محتوای با کیفیت و دسترسی آسان طراحی شده است.'
      },
      {
        question: 'آیا استفاده از Xraynama رایگان است؟',
        answer: 'بله، استفاده پایه از Xraynama کاملاً رایگان است. کاربران می‌توانند بدون پرداخت هزینه به تماشای محتوا بپردازند. البته ما نسخه اشتراک ویژه نیز داریم که امکانات بیشتری مانند کیفیت بالاتر، حذف تبلیغات و دانلود محتوا را ارائه می‌دهد.'
      },
      {
        question: 'چگونه می‌توانم در Xraynama ثبت‌نام کنم؟',
        answer: 'برای ثبت‌نام، روی گزینه "ورود/ثبت‌نام" در منوی اصلی کلیک کنید و فرم ثبت‌نام را تکمیل نمایید. شما فقط به یک ایمیل معتبر و انتخاب یک رمز عبور نیاز دارید.'
      },
      {
        question: 'آیا برای استفاده از Xraynama نیاز به نصب برنامه خاصی دارم؟',
        answer: 'خیر، Xraynama یک سرویس تحت وب است و در هر مرورگر اینترنتی به راحتی قابل استفاده است. نیازی به نصب هیچ برنامه یا افزونه خاصی ندارید.'
      },
      {
        question: 'آیا Xraynama روی تمام دستگاه‌ها قابل استفاده است؟',
        answer: 'بله، وبسایت Xraynama برای تمام دستگاه‌ها از جمله کامپیوتر، لپ‌تاپ، تبلت و گوشی‌های هوشمند بهینه‌سازی شده است و می‌توانید از هر دستگاهی به محتوای ما دسترسی داشته باشید.'
      }
    ]
  },
  {
    id: 'content',
    title: 'محتوا و پخش',
    items: [
      {
        question: 'چه نوع محتوایی در Xraynama ارائه می‌شود؟',
        answer: 'در Xraynama انواع مختلف محتوا شامل فیلم‌های سینمایی، سریال‌های تلویزیونی، انیمیشن‌ها و مستندها ارائه می‌شود. ما تلاش می‌کنیم تا محتوای متنوعی برای سلیقه‌های مختلف فراهم کنیم.'
      },
      {
        question: 'محتوای جدید چه زمانی به سایت اضافه می‌شود؟',
        answer: 'محتوای جدید به طور مرتب (معمولاً هفتگی) به سایت اضافه می‌شود. برای فیلم‌ها پس از انتشار رسمی و برای سریال‌ها معمولاً بلافاصله پس از پخش هر قسمت، محتوا به سایت اضافه می‌شود.'
      },
      {
        question: 'چرا گاهی اوقات ویدیوها بافر می‌شوند یا به درستی پخش نمی‌شوند؟',
        answer: 'کیفیت پخش ویدیو به سرعت اینترنت شما بستگی دارد. برای بهترین تجربه، سرعت اینترنت حداقل 5 مگابیت بر ثانیه برای محتوای HD توصیه می‌شود. همچنین می‌توانید کیفیت پخش را در تنظیمات پلیر کاهش دهید تا مشکل بافرینگ کمتر شود.'
      },
      {
        question: 'چرا برخی محتواها زیرنویس ندارند؟',
        answer: 'ما تلاش می‌کنیم برای تمام محتوا زیرنویس فارسی ارائه دهیم، اما گاهی اوقات برای محتوای جدید، تهیه زیرنویس زمان‌بر است. زیرنویس‌ها معمولاً طی چند روز پس از انتشار محتوا اضافه می‌شوند.'
      },
      {
        question: 'چگونه می‌توانم محتوای مورد علاقه‌ام را پیدا کنم؟',
        answer: 'شما می‌توانید از قسمت جستجو در بالای صفحه استفاده کنید، یا از فیلترهای دسته‌بندی و ژانرها برای یافتن محتوای مورد نظر خود کمک بگیرید. همچنین صفحه "محبوب‌ترین‌ها" و "تازه‌ها" می‌تواند به شما در یافتن محتوای جذاب کمک کند.'
      }
    ]
  },
  {
    id: 'account',
    title: 'حساب کاربری',
    items: [
      {
        question: 'چگونه رمز عبور خود را تغییر دهم؟',
        answer: 'برای تغییر رمز عبور، وارد حساب کاربری خود شوید، به صفحه پروفایل بروید و از بخش "تنظیمات"، گزینه "تغییر رمز عبور" را انتخاب کنید. سپس رمز فعلی و رمز جدید را وارد کرده و تغییرات را ذخیره کنید.'
      },
      {
        question: 'اگر رمز عبور خود را فراموش کردم، چه کار کنم؟',
        answer: 'در صفحه ورود، روی گزینه "فراموشی رمز عبور" کلیک کنید. سپس ایمیل خود را وارد کرده و دکمه "بازیابی رمز عبور" را بزنید. یک ایمیل حاوی لینک بازیابی رمز عبور برای شما ارسال خواهد شد.'
      },
      {
        question: 'چگونه می‌توانم تاریخچه تماشای خود را ببینم؟',
        answer: 'پس از ورود به حساب کاربری، به صفحه پروفایل خود بروید و گزینه "تاریخچه تماشا" را انتخاب کنید. در این بخش لیست همه محتواهایی که تماشا کرده‌اید به ترتیب زمان نمایش داده می‌شود.'
      },
      {
        question: 'چگونه می‌توانم لیست علاقه‌مندی‌ها ایجاد کنم؟',
        answer: 'برای افزودن محتوا به لیست علاقه‌مندی‌ها، کافی است روی آیکون قلب در صفحه اصلی محتوا یا در کارت‌های محتوا کلیک کنید. برای مشاهده لیست علاقه‌مندی‌ها به پروفایل خود مراجعه کنید.'
      },
      {
        question: 'چگونه می‌توانم حساب کاربری خود را حذف کنم؟',
        answer: 'برای حذف حساب کاربری، به صفحه پروفایل خود بروید و از بخش "تنظیمات" گزینه "حذف حساب کاربری" را انتخاب کنید. توجه داشته باشید که این عمل غیرقابل بازگشت است و تمام اطلاعات شما حذف خواهد شد.'
      }
    ]
  },
  {
    id: 'technical',
    title: 'مسائل فنی',
    items: [
      {
        question: 'چرا گاهی صفحات به درستی بارگذاری نمی‌شوند؟',
        answer: 'مشکلات بارگذاری صفحات می‌تواند به دلایل مختلفی مانند سرعت اینترنت پایین، مشکلات سرور، یا مشکلات مرورگر رخ دهد. توصیه می‌کنیم مرورگر خود را به‌روز نگه دارید، کوکی‌ها و کش را پاک کنید، و در صورت ادامه مشکل، از مرورگر دیگری استفاده کنید.'
      },
      {
        question: 'آیا می‌توانم محتوا را دانلود کنم؟',
        answer: 'بله، برای کاربران با اشتراک ویژه امکان دانلود محتوا برای تماشای آفلاین فراهم شده است. برای استفاده از این امکان، به اشتراک ویژه ارتقا دهید و سپس از دکمه دانلود در صفحه پخش استفاده کنید.'
      },
      {
        question: 'آیا می‌توانم از VPN برای دسترسی به Xraynama استفاده کنم؟',
        answer: 'بله، استفاده از VPN برای دسترسی به Xraynama مشکلی ندارد. با این حال، ممکن است سرعت پخش محتوا تحت تأثیر قرار گیرد. توصیه می‌کنیم از VPN‌های پرسرعت استفاده کنید.'
      },
      {
        question: 'چرا گاهی صدای ویدیو با تصویر هماهنگ نیست؟',
        answer: 'ناهماهنگی صدا و تصویر می‌تواند به دلیل مشکلات شبکه یا بافرینگ رخ دهد. توصیه می‌کنیم ویدیو را متوقف کرده و چند ثانیه صبر کنید تا بافر شود، سپس دوباره پخش کنید. همچنین می‌توانید صفحه را رفرش کنید یا کیفیت پخش را کاهش دهید.'
      },
      {
        question: 'چرا نمی‌توانم از تمام‌صفحه استفاده کنم؟',
        answer: 'اگر دکمه تمام‌صفحه کار نمی‌کند، ممکن است به دلیل مشکل مرورگر یا تداخل با افزونه‌ها باشد. ابتدا افزونه‌های مرورگر را غیرفعال کنید، کوکی‌ها را پاک کنید و دوباره امتحان کنید. همچنین می‌توانید از کلید F11 صفحه‌کلید برای تمام‌صفحه کردن مرورگر استفاده کنید.'
      }
    ]
  },
  {
    id: 'other',
    title: 'سایر سوالات',
    items: [
      {
        question: 'چگونه می‌توانم با پشتیبانی تماس بگیرم؟',
        answer: 'شما می‌توانید از طریق صفحه "تماس با ما" فرم ارتباطی را تکمیل کنید، یا به آدرس ایمیل support@xraynama.com پیام ارسال کنید. تیم پشتیبانی ما در اسرع وقت به شما پاسخ خواهد داد.'
      },
      {
        question: 'چگونه می‌توانم محتوای جدید درخواست دهم؟',
        answer: 'از طریق صفحه "درخواست محتوا" می‌توانید فیلم، سریال، انیمیشن یا مستند مورد نظر خود را درخواست دهید. تیم ما درخواست‌ها را بررسی کرده و براساس تعداد درخواست‌ها و امکان‌پذیری، به افزودن محتوای جدید اقدام می‌کند.'
      },
      {
        question: 'آیا می‌توانم محتوا را با دیگران به اشتراک بگذارم؟',
        answer: 'بله، در صفحه هر محتوا دکمه‌های اشتراک‌گذاری برای شبکه‌های اجتماعی وجود دارد. همچنین می‌توانید لینک مستقیم محتوا را کپی کرده و با دوستان خود به اشتراک بگذارید.'
      },
      {
        question: 'چگونه می‌توانم از فضای Watch Party استفاده کنم؟',
        answer: 'برای استفاده از قابلیت Watch Party، ابتدا وارد حساب کاربری خود شوید، سپس در صفحه پخش محتوا، روی دکمه "Watch Party" کلیک کنید. یک لینک اختصاصی برای شما ایجاد می‌شود که می‌توانید آن را با دوستان خود به اشتراک بگذارید تا همزمان به تماشای محتوا بپردازید.'
      },
      {
        question: 'آیا Xraynama برنامه موبایل دارد؟',
        answer: 'در حال حاضر Xraynama به صورت PWA (Progressive Web App) ارائه می‌شود که می‌توانید آن را به صفحه اصلی موبایل خود اضافه کنید. برنامه‌های اختصاصی برای اندروید و iOS در حال توسعه هستند و به زودی منتشر خواهند شد.'
      }
    ]
  }
];

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  
  // Filter FAQs based on search query and active category
  const filteredFAQs = faqCategories.flatMap(category => {
    return category.items.filter(item => {
      const matchesSearch = !searchQuery || 
        item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = activeCategory === 'all' || activeCategory === category.id;
      
      return matchesSearch && matchesCategory;
    }).map(item => ({ ...item, category: category.id, categoryTitle: category.title }));
  });
  
  // Group filtered FAQs by category if showing all categories
  const groupedFilteredFAQs = activeCategory === 'all'
    ? faqCategories.map(category => ({
        ...category,
        items: category.items.filter(item => 
          !searchQuery || 
          item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.answer.toLowerCase().includes(searchQuery.toLowerCase())
        )
      })).filter(category => category.items.length > 0)
    : [];
  
  return (
    <>
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-foreground mb-6">سوالات متداول</h1>
          <p className="text-muted-foreground mb-10">
            پاسخ سوالات رایج کاربران درباره سرویس Xraynama و نحوه استفاده از آن را اینجا بیابید. اگر پاسخ سوال خود را پیدا نکردید، می‌توانید از طریق صفحه تماس با ما با پشتیبانی ارتباط برقرار کنید.
          </p>
          
          {/* Search bar */}
          <div className="glass-effect rounded-lg p-6 mb-8">
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute right-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="جستجو در سوالات متداول..."
                className="pr-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex flex-wrap gap-2 justify-center mt-4">
              <Button 
                variant={activeCategory === 'all' ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveCategory('all')}
              >
                همه
              </Button>
              {faqCategories.map(category => (
                <Button
                  key={category.id}
                  variant={activeCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveCategory(category.id)}
                >
                  {category.title}
                </Button>
              ))}
            </div>
          </div>
          
          {/* FAQ content */}
          {searchQuery || activeCategory !== 'all' ? (
            <>
              {filteredFAQs.length > 0 ? (
                <Accordion type="single" collapsible className="space-y-4">
                  {filteredFAQs.map((faq, index) => (
                    <AccordionItem 
                      key={index} 
                      value={`item-${index}`}
                      className="glass-effect rounded-lg overflow-hidden"
                    >
                      <AccordionTrigger className="px-6 py-4 text-right">
                        <div>
                          <div className="font-medium text-foreground">{faq.question}</div>
                          {activeCategory === 'all' && (
                            <div className="text-xs text-muted-foreground mt-1">
                              {faq.categoryTitle}
                            </div>
                          )}
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-6 pb-4 text-muted-foreground">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              ) : (
                <div className="text-center py-12 glass-effect rounded-lg">
                  <HelpCircle className="h-12 w-12 mx-auto text-muted-foreground" />
                  <h2 className="text-xl font-semibold mt-4 mb-2">نتیجه‌ای یافت نشد</h2>
                  <p className="text-muted-foreground mb-6">
                    متأسفانه پاسخی برای جستجوی شما پیدا نشد. لطفاً عبارت دیگری را جستجو کنید یا با پشتیبانی تماس بگیرید.
                  </p>
                  <Button asChild>
                    <Link href="/contact">تماس با پشتیبانی</Link>
                  </Button>
                </div>
              )}
            </>
          ) : (
            <>
              {groupedFilteredFAQs.map(category => (
                <div key={category.id} className="mb-8">
                  <h2 className="text-2xl font-bold mb-4">{category.title}</h2>
                  <Accordion type="single" collapsible className="space-y-4">
                    {category.items.map((faq, index) => (
                      <AccordionItem 
                        key={index} 
                        value={`${category.id}-${index}`}
                        className="glass-effect rounded-lg overflow-hidden"
                      >
                        <AccordionTrigger className="px-6 py-4 text-right">
                          <div className="font-medium text-foreground">{faq.question}</div>
                        </AccordionTrigger>
                        <AccordionContent className="px-6 pb-4 text-muted-foreground">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              ))}
            </>
          )}
          
          {/* Contact CTAs */}
          <div className="mt-12 text-center">
            <h2 className="text-xl font-bold mb-4">هنوز سوال دارید؟</h2>
            <p className="text-muted-foreground mb-6">
              اگر پاسخ سوال خود را پیدا نکردید، می‌توانید با تیم پشتیبانی ما تماس بگیرید.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="outline" asChild>
                <Link href="/contact">تماس با ما</Link>
              </Button>
              <Button asChild>
                <Link href="/report">گزارش مشکل</Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </>
  );
}