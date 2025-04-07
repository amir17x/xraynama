import { ReactNode } from 'react';
import { Link } from 'wouter';
import { X } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

type NavItem = {
  label: string;
  href: string;
  icon: ReactNode;
};

type MobileMenuProps = {
  isOpen: boolean;
  onClose: () => void;
  navItems: NavItem[];
};

export function MobileMenu({ isOpen, onClose, navItems }: MobileMenuProps) {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-72 p-0 overflow-y-auto max-h-screen">
        <SheetHeader className="p-4 text-right border-b border-border">
          <div className="flex items-center justify-between">
            <SheetClose asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <X className="h-5 w-5" />
              </Button>
            </SheetClose>
            <SheetTitle className="text-xl font-bold text-primary">Xraynama</SheetTitle>
          </div>
        </SheetHeader>
        
        <div className="py-4">
          <div className="px-4 space-y-1">
            {navItems.map((item) => (
              <Link 
                key={item.href} 
                href={item.href}
                onClick={onClose}
              >
                <a className="flex items-center py-3 px-4 rounded-md hover:bg-muted text-foreground transition duration-200">
                  {item.icon}
                  <span>{item.label}</span>
                </a>
              </Link>
            ))}
          </div>
          
          <Separator className="my-4" />
          
          <div className="px-4 space-y-1">
            <Link href="/top-imdb" onClick={onClose}>
              <a className="flex items-center py-3 px-4 rounded-md hover:bg-muted text-foreground transition duration-200">
                <span>برترین‌های IMDb</span>
              </a>
            </Link>
            <Link href="/watch-party" onClick={onClose}>
              <a className="flex items-center py-3 px-4 rounded-md hover:bg-muted text-foreground transition duration-200">
                <span>تماشای گروهی</span>
              </a>
            </Link>
          </div>
          
          <Separator className="my-4" />
          
          <div className="px-4 space-y-1">
            <Link href="/contact" onClick={onClose}>
              <a className="py-3 px-4 rounded-md hover:bg-muted text-foreground transition duration-200 block">
                تماس با ما
              </a>
            </Link>
            <Link href="/report" onClick={onClose}>
              <a className="py-3 px-4 rounded-md hover:bg-muted text-foreground transition duration-200 block">
                گزارش خطا
              </a>
            </Link>
            <Link href="/request" onClick={onClose}>
              <a className="py-3 px-4 rounded-md hover:bg-muted text-foreground transition duration-200 block">
                درخواست محتوا
              </a>
            </Link>
            <Link href="/faq" onClick={onClose}>
              <a className="py-3 px-4 rounded-md hover:bg-muted text-foreground transition duration-200 block">
                سوالات متداول
              </a>
            </Link>
            <Link href="/terms" onClick={onClose}>
              <a className="py-3 px-4 rounded-md hover:bg-muted text-foreground transition duration-200 block">
                قوانین و مقررات
              </a>
            </Link>
          </div>
        </div>
        
        <div className="p-4 border-t border-border mt-auto">
          <Link href="/auth">
            <a className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-2 px-4 rounded-md text-center block">
              ورود / ثبت نام
            </a>
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  );
}