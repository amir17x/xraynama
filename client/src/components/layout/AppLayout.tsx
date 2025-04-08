import React from 'react';
import { Footer } from './Footer';
import { Header } from './Header';
import BlueSphereBackground from '../common/BlueSphereBackground';

interface AppLayoutProps {
  children: React.ReactNode;
}

// کامپوننت لایوت اصلی برنامه که در همه صفحات استفاده می‌شود
const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <>
      <Header />
      <BlueSphereBackground />
      <main className="min-h-screen pb-12 relative z-1">
        {children}
      </main>
      <Footer />
    </>
  );
};

export default AppLayout;