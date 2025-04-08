import React from 'react';
import logoPath from '@assets/642d2226-9362-4f5b-aba0-b7097b6083bc.png';

/**
 * کامپوننت پس‌زمینه کره آبی با لوگو در مرکز
 * قابل استفاده در تمام صفحات سایت
 * با انیمیشن‌های پیشرفته و بهینه‌سازی برای مرورگرهای مدرن
 */
const BlueSphereBackground: React.FC = () => {
  return (
    <div className="blue-sphere-bg">
      <div className="blue-sphere">
        {/* حلقه شیشه‌ای اطراف لوگو */}
        <div 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-blue-900/10 backdrop-blur-sm border border-blue-500/20"
          style={{
            boxShadow: '0 0 60px 10px rgba(0, 123, 255, 0.15), inset 0 0 20px rgba(0, 123, 255, 0.2)',
            animation: 'breathing 8s ease-in-out infinite',
            willChange: 'transform'
          }}
        />
        
        {/* لوگوی اصلی */}
        <div className="blue-sphere-logo" aria-hidden="true">
          <img 
            src={logoPath} 
            alt="Xraynama logo" 
            className="blue-sphere-logo-img" 
            loading="eager"
            // Note: fetchPriority is not supported in all browsers yet
          />
        </div>
      </div>
    </div>
  );
};

export default BlueSphereBackground;