import React, { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface PortalOverrideProps {
  children: React.ReactNode;
  triggerRef: React.RefObject<HTMLElement>;
  isOpen: boolean;
  onClose: () => void;
  alignRight?: boolean;
  offsetY?: number;
}

/**
 * کامپوننت PortalOverride بهبود یافته برای نمایش محتوا به صورت popup
 * این کامپوننت با ایجاد پورتال در body صفحه، از مشکلات overflow و z-index جلوگیری می‌کند
 */
export function PortalOverride({ 
  children, 
  triggerRef, 
  isOpen, 
  onClose, 
  alignRight = false,
  offsetY = 8
}: PortalOverrideProps) {
  const [mounted, setMounted] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  
  // فقط زمانی که منو باز است، آن را mount می‌کنیم
  useEffect(() => {
    setMounted(isOpen);
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
            ref.current.style.right = `${window.innerWidth - rect.left}px`;
            ref.current.style.left = 'auto';
          } else {
            ref.current.style.left = `${rect.left}px`;
            ref.current.style.right = 'auto';
          }
        }
        
        // بررسی و اصلاح وضعیت در صورتی که منو از صفحه خارج شود
        const menuRect = ref.current.getBoundingClientRect();
        if (menuRect.right > window.innerWidth) {
          ref.current.style.right = '10px';
          ref.current.style.left = 'auto';
        }
        if (menuRect.left < 0) {
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
  }, [triggerRef, isOpen, onClose, alignRight, offsetY]);
  
  // اگر منو بسته است یا هنوز mount نشده، چیزی نمایش نمی‌دهیم
  if (!mounted || !isOpen) return null;
  
  return createPortal(
    <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm" onClick={onClose}>
      <div 
        ref={ref} 
        className="portal-overlay-content"
        onClick={(e) => e.stopPropagation()}
        style={{animation: 'dropdown-fade-in 0.2s ease-out'}}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}