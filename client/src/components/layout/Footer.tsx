import { Link } from 'wouter';
import { 
  Film, Tv, Video, FileVideo, TrendingUp, 
  Twitter, Instagram, Youtube, MessageCircle 
} from 'lucide-react';

export function Footer() {
  return (
    <footer className="glass-effect py-8 mt-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center text-white font-bold text-lg mr-2">
                X
              </div>
              <h3 className="text-xl font-bold text-foreground">Xraynama</h3>
            </div>
            <p className="text-muted-foreground mb-4">
              پلتفرم رایگان پخش و دانلود انیمیشن، فیلم، سریال و مستند با کیفیت بالا
            </p>
            <div className="flex space-x-4 rtl:space-x-reverse">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <MessageCircle className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">دسترسی سریع</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <Link href="/category/movie" className="hover:text-primary transition-colors flex items-center">
                  <Film className="ml-2 h-4 w-4" />
                  <span>فیلم‌های جدید</span>
                </Link>
              </li>
              <li>
                <Link href="/category/series" className="hover:text-primary transition-colors flex items-center">
                  <Tv className="ml-2 h-4 w-4" />
                  <span>سریال‌های محبوب</span>
                </Link>
              </li>
              <li>
                <Link href="/category/animation" className="hover:text-primary transition-colors flex items-center">
                  <Video className="ml-2 h-4 w-4" />
                  <span>انیمیشن‌ها</span>
                </Link>
              </li>
              <li>
                <Link href="/category/documentary" className="hover:text-primary transition-colors flex items-center">
                  <FileVideo className="ml-2 h-4 w-4" />
                  <span>مستندها</span>
                </Link>
              </li>
              <li>
                <Link href="/top-imdb" className="hover:text-primary transition-colors flex items-center">
                  <TrendingUp className="ml-2 h-4 w-4" />
                  <span>برترین‌های IMDB</span>
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">دسته‌بندی‌ها</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li><Link href="/search?genre=action" className="hover:text-primary transition-colors">اکشن</Link></li>
              <li><Link href="/search?genre=comedy" className="hover:text-primary transition-colors">کمدی</Link></li>
              <li><Link href="/search?genre=drama" className="hover:text-primary transition-colors">درام</Link></li>
              <li><Link href="/search?genre=sci-fi" className="hover:text-primary transition-colors">علمی-تخیلی</Link></li>
              <li><Link href="/search?genre=horror" className="hover:text-primary transition-colors">ترسناک</Link></li>
              <li><Link href="/search" className="hover:text-primary transition-colors text-primary">مشاهده همه</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">پشتیبانی</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li><Link href="/contact" className="hover:text-primary transition-colors">تماس با ما</Link></li>
              <li><Link href="/report" className="hover:text-primary transition-colors">گزارش خطا</Link></li>
              <li><Link href="/request" className="hover:text-primary transition-colors">درخواست محتوا</Link></li>
              <li><Link href="/terms" className="hover:text-primary transition-colors">قوانین و مقررات</Link></li>
              <li><Link href="/faq" className="hover:text-primary transition-colors">سوالات متداول</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground">
          <p>تمامی حقوق این وبسایت متعلق به Xraynama می‌باشد. &copy; ۱۴۰۲</p>
        </div>
      </div>
    </footer>
  );
}
