import { Link } from 'wouter';
import CinemaNewsSlider from '@/components/news/CinemaNewsSlider';

export function Footer() {
  return (
    <footer className="glass-effect py-8 mt-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">
              <span className="text-primary">X</span><span className="text-foreground">raynama</span>
            </h3>
            <p className="text-muted-foreground mb-4">
              پلتفرم رایگان پخش و دانلود انیمیشن، فیلم، سریال و مستند
            </p>
            <div className="flex space-x-4 rtl:space-x-reverse">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <i className="fab fa-telegram"></i>
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <i className="fab fa-youtube"></i>
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">دسترسی سریع</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li><Link href="/movies" className="hover:text-primary transition-colors">فیلم‌های جدید</Link></li>
              <li><Link href="/series" className="hover:text-primary transition-colors">سریال‌های محبوب</Link></li>
              <li><Link href="/animations" className="hover:text-primary transition-colors">انیمیشن‌ها</Link></li>
              <li><Link href="/documentaries" className="hover:text-primary transition-colors">مستندها</Link></li>
              <li><Link href="/top-imdb" className="hover:text-primary transition-colors">برترین‌های IMDB</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">دسته‌بندی‌ها</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li><Link href="/genres/action" className="hover:text-primary transition-colors">اکشن</Link></li>
              <li><Link href="/genres/comedy" className="hover:text-primary transition-colors">کمدی</Link></li>
              <li><Link href="/genres/drama" className="hover:text-primary transition-colors">درام</Link></li>
              <li><Link href="/genres/sci-fi" className="hover:text-primary transition-colors">علمی-تخیلی</Link></li>
              <li><Link href="/genres/horror" className="hover:text-primary transition-colors">ترسناک</Link></li>
              <li><Link href="/genres" className="hover:text-primary text-primary flex items-center"><span className="ml-1">همه دسته‌بندی‌ها</span> <span className="text-xs">&#10148;</span></Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">پشتیبانی</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li><Link href="/support/contact" className="hover:text-primary transition-colors">تماس با ما</Link></li>
              <li><Link href="/support/report" className="hover:text-primary transition-colors">گزارش خطا</Link></li>
              <li><Link href="/support/request" className="hover:text-primary transition-colors">درخواست محتوا</Link></li>
              <li><Link href="/legal/terms" className="hover:text-primary transition-colors">قوانین و مقررات</Link></li>
              <li><Link href="/support/faq" className="hover:text-primary transition-colors">سوالات متداول</Link></li>
            </ul>
          </div>
        </div>
        
        {/* Cinema News Slider */}
        <div className="mt-8">
          <CinemaNewsSlider />
        </div>
        
        <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground">
          <p>تمامی حقوق این وبسایت متعلق به <span className="text-primary">X</span>raynama می‌باشد. &copy; ۱۴۰۲</p>
        </div>
      </div>
    </footer>
  );
}
