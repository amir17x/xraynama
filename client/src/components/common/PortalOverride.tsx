import React, { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface PortalOverrideProps {
  children: React.ReactNode;
  triggerRef: React.RefObject<HTMLElement>;
  isOpen: boolean;
  onClose: () => void;
  alignRight?: boolean;
  offsetY?: number;
  maxHeight?: number;
  minWidth?: number;
  forceMaxHeight?: boolean; // اجبار به استفاده از حداکثر ارتفاع
  stickyHeader?: React.ReactNode; // هدر ثابت در بالای منوی کشویی
  stickyFooter?: React.ReactNode; // فوتر ثابت در پایین منوی کشویی
}

/**
 * کامپوننت PortalOverride بهبود یافته برای نمایش محتوا به صورت popup
 * این کامپوننت با ایجاد پورتال در body صفحه، از مشکلات overflow و z-index جلوگیری می‌کند
 * نسخه بهبود یافته با پشتیبانی از اسکرول و سربرگ/پانویس چسبان
 */
export function PortalOverride({ 
  children, 
  triggerRef, 
  isOpen, 
  onClose, 
  alignRight = false,
  offsetY = 8,
  maxHeight = 400,
  minWidth,
  forceMaxHeight = false,
  stickyHeader,
  stickyFooter
}: PortalOverrideProps) {
  const [mounted, setMounted] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  
  // فقط زمانی که منو باز است، آن را mount می‌کنیم
  useEffect(() => {
    setMounted(isOpen);
    if (isOpen) {
      // ایجاد تأخیر کوتاه برای بهبود انیمیشن
      setTimeout(() => {
        if (ref.current) {
          ref.current.style.opacity = '1';
        }
      }, 10);
    }
  }, [isOpen]);
  
  useEffect(() => {
    if (!isOpen) return;
    
    const handlePosition = () => {
      if (triggerRef.current && ref.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        const isRTL = document.dir === 'rtl' || document.documentElement.dir === 'rtl';
        
        // تنظیم موقعیت عمودی (همیشه زیر عنصر trigger)
        ref.current.style.position = 'fixed';
        ref.current.style.top = `${rect.bottom + offsetY}px`;
        
        // تنظیم حداقل عرض منو
        if (minWidth) {
          ref.current.style.minWidth = `${minWidth}px`;
        } else {
          // حداقل عرض منو برابر با عرض دکمه
          ref.current.style.minWidth = `${rect.width}px`;
        }
        
        // تنظیم موقعیت افقی بر اساس RTL و alignRight
        if (alignRight) {
          // منو از سمت راست تراز می‌شود (برای پروفایل)
          if (isRTL) {
            ref.current.style.right = `${window.innerWidth - rect.right}px`;
            ref.current.style.left = 'auto';
          } else {
            ref.current.style.right = `${window.innerWidth - rect.right}px`;
            ref.current.style.left = 'auto';
          }
        } else {
          // منو از سمت چپ تراز می‌شود (برای اعلان‌ها)
          if (isRTL) {
            // در RTL، منو از سمت راست المنت تراز می‌شود
            ref.current.style.right = `${window.innerWidth - rect.left - (minWidth || rect.width)}px`;
            ref.current.style.left = 'auto';
          } else {
            ref.current.style.left = `${rect.left}px`;
            ref.current.style.right = 'auto';
          }
        }
        
        // محاسبه حداکثر ارتفاع با توجه به فضای خالی پایین صفحه
        const availableHeight = window.innerHeight - rect.bottom - offsetY - 20; // 20px برای حاشیه امن
        const calculatedMaxHeight = Math.min(maxHeight, availableHeight);
        
        // تنظیم حداکثر ارتفاع برای منو
        if (forceMaxHeight) {
          ref.current.style.height = `${calculatedMaxHeight}px`;
        } else {
          ref.current.style.maxHeight = `${calculatedMaxHeight}px`;
        }
        
        // بررسی و اصلاح وضعیت در صورتی که منو از صفحه خارج شود
        const menuRect = ref.current.getBoundingClientRect();
        if (menuRect.right > window.innerWidth - 10) {
          ref.current.style.right = '10px';
          ref.current.style.left = 'auto';
        }
        if (menuRect.left < 10) {
          ref.current.style.left = '10px';
          ref.current.style.right = 'auto';
        }
        
        // اطمینان از z-index بالا
        ref.current.style.zIndex = '9999';
      }
    };
    
    // تنظیم موقعیت اولیه و مجدد در هنگام تغییر اندازه/اسکرول
    handlePosition();
    window.addEventListener('resize', handlePosition);
    window.addEventListener('scroll', handlePosition);
    
    // بستن منو در صورت کلیک خارج از آن
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node) &&
          triggerRef.current && !triggerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      window.removeEventListener('resize', handlePosition);
      window.removeEventListener('scroll', handlePosition);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [triggerRef, isOpen, onClose, alignRight, offsetY, maxHeight, minWidth, forceMaxHeight]);
  
  // اگر منو بسته است یا هنوز mount نشده، چیزی نمایش نمی‌دهیم
  if (!mounted || !isOpen) return null;
  
  return createPortal(
    <div className="fixed inset-0 z-40 pointer-events-none" onClick={onClose}>
      <div 
        ref={ref} 
        className="pointer-events-auto shadow-lg transition-opacity duration-200 opacity-0"
        onClick={(e) => e.stopPropagation()}
        style={{
          overflow: 'hidden',
          display: 'flex', 
          flexDirection: 'column',
          borderRadius: '0.5rem',
          animation: 'dropdown-fade-in 0.3s ease-out'
        }}
      >
        {/* هدر چسبان (در صورت وجود) */}
        {stickyHeader && (
          <div className="sticky top-0 z-10 backdrop-blur-sm">
            {stickyHeader}
          </div>
        )}
        
        {/* محتوای اصلی با قابلیت اسکرول */}
        <div 
          ref={contentRef}
          className="scrollbar-thin flex-1 overflow-y-auto"
          style={{ 
            scrollbarGutter: 'stable', 
          }}
        >
          {children}
        </div>
        
        {/* فوتر چسبان (در صورت وجود) */}
        {stickyFooter && (
          <div className="sticky bottom-0 z-10 backdrop-blur-sm">
            {stickyFooter}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}