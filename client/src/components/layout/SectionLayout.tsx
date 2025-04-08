import { ReactNode } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';

interface SectionLayoutProps {
  children: ReactNode;
  title: string;
  description?: string;
  icon?: ReactNode;
  animated?: boolean;
}

export function SectionLayout({
  children,
  title,
  description,
  icon,
  animated = true
}: SectionLayoutProps) {
  const [isScrolled, setIsScrolled] = useState(false);

  // Back to top functionality
  useEffect(() => {
    const handleScroll = () => {
      const backToTopButton = document.getElementById('backToTop');
      if (backToTopButton) {
        if (window.scrollY > 300) {
          backToTopButton.classList.remove('opacity-0', 'invisible');
          backToTopButton.classList.add('opacity-100', 'visible');
        } else {
          backToTopButton.classList.remove('opacity-100', 'visible');
          backToTopButton.classList.add('opacity-0', 'invisible');
        }
      }
      
      setIsScrolled(window.scrollY > 50);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <>
      <Header />
      
      <main className="min-h-screen">
        {/* Hero section with glassmorphism effect */}
        <div className={`
          relative py-16 mb-8 overflow-hidden
          glass-effect backdrop-blur-lg
          ${isScrolled ? 'pt-24' : 'pt-32'} 
          transition-all duration-500 ease-in-out
        `}>
          <div className="container mx-auto px-4">
            <div className={`
              flex flex-col items-center text-center
              ${animated ? 'content-details-animate' : ''}
            `}>
              {icon && (
                <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-[#00BFFF]/10 text-[#00BFFF]">
                  {icon}
                </div>
              )}
              <h1 className="text-3xl md:text-4xl font-bold mb-4 text-white">{title}</h1>
              {description && (
                <p className="text-lg text-[#00BFFF]/80 max-w-2xl">{description}</p>
              )}
            </div>
          </div>
          
          {/* Glassmorphism effect enhancements */}
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute -top-[400px] -left-[300px] w-[800px] h-[800px] rounded-full bg-[#00BFFF]/5 blur-[100px]"></div>
            <div className="absolute -bottom-[400px] -right-[300px] w-[800px] h-[800px] rounded-full bg-[#00BFFF]/5 blur-[100px]"></div>
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-[#00BFFF]/0 via-[#00BFFF]/30 to-[#00BFFF]/0"></div>
          </div>
        </div>
        
        {/* Page content */}
        <div className={`
          container mx-auto px-4 py-8 pb-20
          ${animated ? 'content-info-animate' : ''}
        `}>
          {children}
        </div>
      </main>
      
      <Footer />
      
      {/* Back to top button */}
      <Button
        id="backToTop"
        className="fixed bottom-8 left-8 bg-primary hover:bg-primary/90 text-white p-3 rounded-full shadow-lg transition-all duration-300 opacity-0 invisible z-50"
        size="icon"
        onClick={scrollToTop}
        aria-label="Back to top"
      >
        <ChevronUp className="h-5 w-5" />
      </Button>
    </>
  );
}