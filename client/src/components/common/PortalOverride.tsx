import React, { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface PortalOverrideProps {
  children: React.ReactNode;
  triggerRef: React.RefObject<HTMLElement>;
}

/**
 * کامپوننت PortalOverride برای نمایش محتوا درست در کنار عنصر trigger
 */
export function PortalOverride({ children, triggerRef }: PortalOverrideProps) {
  const [mounted, setMounted] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  
  useEffect(() => {
    setMounted(true);
    
    const handlePosition = () => {
      if (triggerRef.current && ref.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        const isRTL = document.dir === 'rtl' || document.documentElement.dir === 'rtl';
        
        ref.current.style.position = 'fixed';
        ref.current.style.top = `${rect.bottom}px`;
        
        // اگر المان اصلی در هدر باشد (کاربر)، تنظیم موقعیت متناسب با RTL/LTR
        const isProfileMenu = ref.current.querySelector('.right-aligned');
        
        if (isProfileMenu) {
          if (isRTL) {
            // منوی پروفایل در RTL باید سمت راست المان قرار بگیرد
            ref.current.style.right = `1rem`;
            ref.current.style.left = 'auto';
          } else {
            // منوی پروفایل در LTR باید سمت چپ المان قرار بگیرد
            ref.current.style.left = `0px`;
            ref.current.style.right = 'auto';
          }
        } else {
          // برای بقیه منوها، طبق منطق RTL/LTR
          if (isRTL) {
            ref.current.style.right = `${window.innerWidth - rect.right}px`;
            ref.current.style.left = 'auto';
          } else {
            ref.current.style.left = `${rect.left}px`;
            ref.current.style.right = 'auto';
          }
        }
        
        ref.current.style.zIndex = '9999';
      }
    };
    
    handlePosition();
    window.addEventListener('resize', handlePosition);
    window.addEventListener('scroll', handlePosition);
    
    return () => {
      window.removeEventListener('resize', handlePosition);
      window.removeEventListener('scroll', handlePosition);
    };
  }, [triggerRef, mounted]);
  
  if (!mounted) return null;
  
  return createPortal(
    <div ref={ref} className="portal-override">
      {children}
    </div>,
    document.body
  );
}