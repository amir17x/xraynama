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
        ref.current.style.position = 'fixed';
        ref.current.style.top = `${rect.bottom}px`;
        ref.current.style.right = '1rem';
        ref.current.style.left = 'auto';
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