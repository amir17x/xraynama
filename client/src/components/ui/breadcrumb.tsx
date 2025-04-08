import React from 'react';
import { Link } from 'wouter';
import { ChevronLeft } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

/**
 * کامپوننت مسیریابی breadcrumb برای نمایش مسیر فعلی کاربر
 * با پشتیبانی از RTL برای زبان فارسی
 */
export function Breadcrumb({ items, className = '' }: BreadcrumbProps) {
  if (!items || items.length === 0) return null;
  
  return (
    <nav 
      className={`bg-gradient-to-r from-black/90 to-black/70 text-white px-4 py-2.5 text-sm border-b border-white/10 backdrop-blur-sm ${className}`}
      aria-label="مسیریابی"
    >
      <ol className="flex items-center gap-1 rtl:flex-row-reverse animate-fade-in">
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-1 transition-opacity duration-300" style={{ animationDelay: `${index * 100}ms` }}>
            {index > 0 && (
              <span className="text-gray-400 text-xs flex items-center mx-1">
                <ChevronLeft size={14} className="rtl:rotate-180" />
              </span>
            )}
            
            {item.href && index !== items.length - 1 ? (
              <Link 
                href={item.href}
                className="text-white/80 hover:text-white transition-colors duration-200 hover:underline underline-offset-4 decoration-orange-400/50"
              >
                {item.label}
              </Link>
            ) : (
              <span className={index === items.length - 1 
                ? "text-orange-400 font-medium" 
                : "text-white/80"
              }>
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export default Breadcrumb;