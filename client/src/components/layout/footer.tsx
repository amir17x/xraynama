import { Link } from "wouter";
import { 
  Twitter, 
  Instagram, 
  Youtube, 
  Facebook, 
  Github,
  Mail,
  HelpCircle,
  AlertTriangle,
  Shield,
  Lock
} from "lucide-react";
import CinemaNewsSlider from "../cinema-news/CinemaNewsSlider";

const Footer = () => {
  return (
    <footer className="bg-dark-card mt-8 pt-8 pb-4">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center space-x-2 space-x-reverse mb-4">
              <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center text-white font-bold text-lg">
                X
              </div>
              <h3 className="text-lg font-bold text-white">Xraynama</h3>
            </div>
            <p className="text-text-secondary text-sm mb-4">
              Xraynama یک پلتفرم رایگان برای پخش آنلاین و دانلود انیمیشن، فیلم، سریال و مستندهای خارجی با کیفیت بالا است.
            </p>
            <div className="flex space-x-2 space-x-reverse mb-4">
              <a 
                href="#" 
                className="bg-dark hover:bg-dark-border transition-colors duration-200 w-8 h-8 flex items-center justify-center rounded-full"
                aria-label="Twitter"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a 
                href="#" 
                className="bg-dark hover:bg-dark-border transition-colors duration-200 w-8 h-8 flex items-center justify-center rounded-full"
                aria-label="Instagram"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a 
                href="#" 
                className="bg-dark hover:bg-dark-border transition-colors duration-200 w-8 h-8 flex items-center justify-center rounded-full"
                aria-label="Youtube"
              >
                <Youtube className="h-4 w-4" />
              </a>
              <a 
                href="#" 
                className="bg-dark hover:bg-dark-border transition-colors duration-200 w-8 h-8 flex items-center justify-center rounded-full"
                aria-label="Facebook"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a 
                href="#" 
                className="bg-dark hover:bg-dark-border transition-colors duration-200 w-8 h-8 flex items-center justify-center rounded-full"
                aria-label="Github"
              >
                <Github className="h-4 w-4" />
              </a>
            </div>
            {/* اخبار سینما */}
            <CinemaNewsSlider />
          </div>
          
          <div>
            <h4 className="text-white font-medium mb-4">دسترسی سریع</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/">
                  <a className="text-text-secondary hover:text-white transition-colors duration-200">
                    صفحه اصلی
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/category/movie">
                  <a className="text-text-secondary hover:text-white transition-colors duration-200">
                    فیلم‌ها
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/category/series">
                  <a className="text-text-secondary hover:text-white transition-colors duration-200">
                    سریال‌ها
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/category/animation">
                  <a className="text-text-secondary hover:text-white transition-colors duration-200">
                    انیمیشن‌ها
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/category/documentary">
                  <a className="text-text-secondary hover:text-white transition-colors duration-200">
                    مستندها
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/watch-party">
                  <a className="text-text-secondary hover:text-white transition-colors duration-200">
                    تماشای گروهی
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/leaderboard">
                  <a className="text-text-secondary hover:text-white transition-colors duration-200">
                    لیدربورد
                  </a>
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-medium mb-4">ژانرها</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/search?genres=action">
                  <a className="text-text-secondary hover:text-white transition-colors duration-200">
                    اکشن
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/search?genres=comedy">
                  <a className="text-text-secondary hover:text-white transition-colors duration-200">
                    کمدی
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/search?genres=drama">
                  <a className="text-text-secondary hover:text-white transition-colors duration-200">
                    درام
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/search?genres=scifi">
                  <a className="text-text-secondary hover:text-white transition-colors duration-200">
                    علمی-تخیلی
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/search?genres=horror">
                  <a className="text-text-secondary hover:text-white transition-colors duration-200">
                    ترسناک
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/search?genres=adventure">
                  <a className="text-text-secondary hover:text-white transition-colors duration-200">
                    ماجراجویی
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/search?genres=fantasy">
                  <a className="text-text-secondary hover:text-white transition-colors duration-200">
                    فانتزی
                  </a>
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-medium mb-4">پشتیبانی و راهنما</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/contact">
                  <a className="text-text-secondary hover:text-white transition-colors duration-200 flex items-center">
                    <Mail className="ml-1 h-4 w-4" />
                    <span>تماس با ما</span>
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/faq">
                  <a className="text-text-secondary hover:text-white transition-colors duration-200 flex items-center">
                    <HelpCircle className="ml-1 h-4 w-4" />
                    <span>سوالات متداول</span>
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/report">
                  <a className="text-text-secondary hover:text-white transition-colors duration-200 flex items-center">
                    <AlertTriangle className="ml-1 h-4 w-4" />
                    <span>گزارش مشکل</span>
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/terms">
                  <a className="text-text-secondary hover:text-white transition-colors duration-200 flex items-center">
                    <Shield className="ml-1 h-4 w-4" />
                    <span>قوانین و مقررات</span>
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/privacy">
                  <a className="text-text-secondary hover:text-white transition-colors duration-200 flex items-center">
                    <Lock className="ml-1 h-4 w-4" />
                    <span>حریم خصوصی</span>
                  </a>
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-dark-border pt-4 mt-4 text-center text-text-secondary text-sm">
          <p>تمامی حقوق این وبسایت متعلق به Xraynama می‌باشد © ۱۴۰۲</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
