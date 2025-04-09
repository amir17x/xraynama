import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';

interface PortalContextMenuProps {
  children: React.ReactNode;
  open: boolean;
  onClose: () => void;
  anchorElement: HTMLElement | null;
  width?: number | string;
  maxHeight?: number | string;
  placement?: 'bottom' | 'top' | 'left' | 'right';
  offset?: number;
  className?: string;
}

/**
 * کامپوننت منوی کانتکست پرتال برای نمایش منوهای بازشونده
 * به‌صورت پویا موقعیت منو را نسبت به عنصر مرجع تنظیم می‌کند
 * 
 * مدیریت z-index:
 * - هدر سایت: z-index: 100
 * - پرتال‌ها و منوهای کشویی: z-index: 150
 * 
 * این مقادیر باید همواره با هم هماهنگ باشند تا منوهای کشویی بالاتر از سایر عناصر قرار گیرند
 */
export function PortalContextMenu({
  children,
  open,
  onClose,
  anchorElement,
  width = 'auto',
  maxHeight = '80vh',
  placement = 'bottom',
  offset = 8,
  className,
}: PortalContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [opacity, setOpacity] = useState(0);

  // محاسبه موقعیت منو نسبت به عنصر مرجع
  useEffect(() => {
    if (!open || !anchorElement) return;

    const updatePosition = () => {
      if (!anchorElement) return;

      const anchorRect = anchorElement.getBoundingClientRect();
      const menuNode = menuRef.current;
      if (!menuNode) return;

      const menuWidth = typeof width === 'number' ? width : menuNode.offsetWidth;
      const menuHeight = menuNode.offsetHeight;

      let top = 0;
      let left = 0;

      // تنظیم موقعیت براساس جهت قرارگیری
      switch (placement) {
        case 'bottom':
          top = anchorRect.bottom + offset;
          left = anchorRect.left + (anchorRect.width / 2) - (menuWidth / 2);
          break;
        case 'top':
          top = anchorRect.top - menuHeight - offset;
          left = anchorRect.left + (anchorRect.width / 2) - (menuWidth / 2);
          break;
        case 'left':
          top = anchorRect.top + (anchorRect.height / 2) - (menuHeight / 2);
          left = anchorRect.left - menuWidth - offset;
          break;
        case 'right':
          top = anchorRect.top + (anchorRect.height / 2) - (menuHeight / 2);
          left = anchorRect.right + offset;
          break;
      }

      // اطمینان از اینکه منو از لبه‌های صفحه خارج نشود
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;

      // تصحیح برای افست‌های RTL
      const rtl = document.dir === 'rtl';
      if (rtl && (placement === 'bottom' || placement === 'top')) {
        left = anchorRect.right - (anchorRect.width / 2) - (menuWidth / 2);
      }

      // تصحیح موقعیت افقی
      if (left < 10) {
        left = 10;
      } else if (left + menuWidth > windowWidth - 10) {
        left = windowWidth - menuWidth - 10;
      }

      // تصحیح موقعیت عمودی
      if (top < 10) {
        // اگر بالای صفحه باشد، به پایین منتقل می‌شود
        if (placement === 'top') {
          top = anchorRect.bottom + offset;
        } else {
          top = 10;
        }
      } else if (top + menuHeight > windowHeight - 10) {
        // اگر پایین صفحه باشد، به بالا منتقل می‌شود
        if (placement === 'bottom') {
          top = anchorRect.top - menuHeight - offset;
        } else {
          top = windowHeight - menuHeight - 10;
        }
      }

      setPosition({ top, left });
      setOpacity(1);
    };

    // اجرای بعد از رندر برای محاسبه دقیق ابعاد
    setTimeout(updatePosition, 0);

    // دریافت مجدد موقعیت در هنگام تغییر اندازه پنجره
    window.addEventListener('resize', updatePosition);
    return () => {
      window.removeEventListener('resize', updatePosition);
    };
  }, [open, anchorElement, placement, offset, width]);

  // بستن منو با کلیک خارج از آن
  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current && 
        !menuRef.current.contains(event.target as Node) &&
        anchorElement && 
        !anchorElement.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open, onClose, anchorElement]);

  // بستن منو با فشردن Escape
  useEffect(() => {
    if (!open) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      ref={menuRef}
      className={cn(
        'fixed z-[150] rounded-lg shadow-lg transition-opacity duration-200',
        'bg-[#00142c]/95 backdrop-blur-xl border border-[#00BFFF]/20',
        className
      )}
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        opacity,
        width: typeof width === 'number' ? `${width}px` : width,
        maxHeight,
        overflowY: 'auto'
      }}
    >
      {children}
    </div>,
    document.body
  );
}