import React from 'react';
import logoPath from '@assets/642d2226-9362-4f5b-aba0-b7097b6083bc.png';

/**
 * کامپوننت پس‌زمینه کره آبی با لوگو در مرکز
 * قابل استفاده در تمام صفحات سایت
 */
const BlueSphereBackground: React.FC = () => {
  return (
    <div className="blue-sphere-bg">
      <div className="blue-sphere">
        <div className="blue-sphere-logo">
          <img 
            src={logoPath} 
            alt="X-logo" 
            className="blue-sphere-logo-img" 
          />
        </div>
      </div>
    </div>
  );
};

export default BlueSphereBackground;