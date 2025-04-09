import { SectionLayout } from '@/components/layout/SectionLayout';
import { 
  Smartphone, Download, Monitor, Tv, Laptop, 
  Globe, Phone, Shield, CheckCircle, Star, Zap, 
  UserPlus, HdmiPort, Cloud, Award, Video, Wifi, Play,
  Clock, MonitorSmartphone, Fingerprint, RotateCcw, Languages, 
  Sparkles, CircleSlash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";
import React, { useRef, useState, useEffect } from 'react';

// Enhanced app features with more extensive descriptions
const features = [
  {
    icon: <Zap className="h-6 w-6 text-[#00BFFF]" />,
    title: 'Blazing Fast Streaming',
    description: 'Our advanced streaming technology ensures immediate playback with no buffering, even on low-bandwidth connections.',
    color: 'from-blue-500 to-cyan-400'
  },
  {
    icon: <Video className="h-6 w-6 text-[#00BFFF]" />,
    title: '4K Ultra HD Quality',
    description: 'Enjoy crystal-clear video quality with support for 4K HDR, Dolby Vision and theater-quality surround sound.',
    color: 'from-purple-500 to-blue-400'
  },
  {
    icon: <Download className="h-6 w-6 text-[#00BFFF]" />,
    title: 'Download & Watch Offline',
    description: 'Download your favorite content and enjoy watching without internet connection during travel or commute.',
    color: 'from-emerald-500 to-teal-400'
  },
  {
    icon: <Shield className="h-6 w-6 text-[#00BFFF]" />,
    title: 'Military-Grade Security',
    description: 'Your data is protected with end-to-end encryption and secure authentication protocols for worry-free streaming.',
    color: 'from-red-500 to-orange-400'
  },
  {
    icon: <MonitorSmartphone className="h-6 w-6 text-[#00BFFF]" />,
    title: 'Multi-Device Sync',
    description: 'Seamlessly switch between devices and continue watching from exactly where you left off.',
    color: 'from-amber-500 to-yellow-400'
  },
  {
    icon: <Languages className="h-6 w-6 text-[#00BFFF]" />,
    title: 'Multiple Audio & Subtitles',
    description: 'Choose from various audio tracks and subtitle options to enjoy content in your preferred language.',
    color: 'from-pink-500 to-rose-400'
  }
];

// Enhanced platform information
const platforms = [
  {
    id: 'android',
    icon: <Smartphone className="h-10 w-10" />,
    title: 'Android',
    subtitle: 'Version 7.0+ | 25MB',
    version: '2.5.0',
    released: 'Last updated: April 2, 2025',
    rating: 4.8,
    ratingCount: '105K+',
    size: '25 MB',
    compatibility: 'Android 7.0 and above',
    features: [
      'Background playback',
      'Picture-in-picture mode',
      'Downloads manager',
      'Chromecast support',
      'Custom video playback speed'
    ],
    requirements: 'Requires access to storage and camera for QR login',
    downloadLink: '#',
    qrCode: '/assets/fake_qr_android.png',
    screenshot: '/placeholder-app.png',
    color: 'from-green-500 to-emerald-400'
  },
  {
    id: 'ios',
    icon: <Phone className="h-10 w-10" />,
    title: 'iOS',
    subtitle: 'Version 13.0+ | 30MB',
    version: '2.5.0',
    released: 'Last updated: April 5, 2025',
    rating: 4.7,
    ratingCount: '82K+',
    size: '30 MB',
    compatibility: 'iOS 13.0 and above',
    features: [
      'SharePlay integration',
      'Picture-in-picture mode',
      'Siri shortcuts',
      'AirPlay support',
      'Spatial audio with Dolby Atmos'
    ],
    requirements: 'Requires Face ID for enhanced security',
    downloadLink: '#',
    qrCode: '/assets/fake_qr_ios.png',
    screenshot: '/placeholder-app.png',
    color: 'from-blue-500 to-indigo-400'
  },
  {
    id: 'tv',
    icon: <Tv className="h-10 w-10" />,
    title: 'Smart TV',
    subtitle: 'Android TV & Samsung TV',
    version: '1.8.0',
    released: 'Last updated: March 25, 2025',
    rating: 4.6,
    ratingCount: '45K+',
    size: '15 MB',
    compatibility: 'Android TV 9.0+, Samsung TV 2019+',
    features: [
      'Voice search integration',
      'Custom layouts for big screens',
      'Auto-play next episode',
      'Remote control shortcuts',
      'Family profile switching'
    ],
    requirements: 'Smart TV with internet connection',
    downloadLink: '#',
    qrCode: '/assets/fake_qr_tv.png',
    screenshot: '/placeholder-app.png',
    color: 'from-purple-500 to-violet-400'
  },
  {
    id: 'windows',
    icon: <Laptop className="h-10 w-10" />,
    title: 'Windows',
    subtitle: 'Windows 10 & 11 | 45MB',
    version: '2.2.0',
    released: 'Last updated: March 30, 2025',
    rating: 4.9,
    ratingCount: '62K+',
    size: '45 MB',
    compatibility: 'Windows 10 and 11',
    features: [
      'Mini player mode',
      'Keyboard shortcuts',
      'Multi-window support',
      'Automated updates',
      'Hardware acceleration'
    ],
    requirements: 'Windows 10/11 with 4GB RAM minimum',
    downloadLink: '#',
    qrCode: '/assets/fake_qr_windows.png',
    screenshot: '/placeholder-app.png',
    color: 'from-cyan-500 to-blue-400'
  }
];

// Enhanced user reviews
const reviews = [
  { 
    name: 'Alex Johnson', 
    rating: 5, 
    text: 'The interface is incredibly intuitive and the streaming quality is outstanding. Best streaming app I\'ve ever used!',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    date: 'March 28, 2025',
    platform: 'Windows'
  },
  { 
    name: 'Sarah Williams', 
    rating: 5, 
    text: 'Love the download feature for offline viewing. Perfect companion for my daily commute.',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    date: 'April 3, 2025',
    platform: 'iOS'
  },
  { 
    name: 'Michael Chen', 
    rating: 4, 
    text: 'Great content library and the 4K streaming works perfectly on my TV. Would be 5 stars if they added more international shows.',
    avatar: 'https://randomuser.me/api/portraits/men/11.jpg',
    date: 'April 1, 2025',
    platform: 'Android'
  },
];

// FAQ items
const faqItems = [
  {
    question: 'Is the app free to download and use?',
    answer: 'Yes, downloading and installing the app is completely free. Basic content is available without subscription, while premium content requires a subscription plan. We offer multiple subscription tiers to suit different needs and budgets.'
  },
  {
    question: 'Can I download content for offline viewing?',
    answer: 'Yes, the app allows you to download your favorite movies and shows for offline viewing. Premium subscribers can download in higher quality and have more storage space for downloaded content.'
  },
  {
    question: 'How many devices can I use with one account?',
    answer: 'Basic accounts can stream on one device at a time, while Premium subscribers can enjoy simultaneous streaming on up to 4 devices. All accounts can be installed on unlimited devices, but streaming limits apply.'
  },
  {
    question: 'What video quality is supported?',
    answer: 'The app supports various quality levels from SD (480p) to Ultra HD (4K). The maximum quality you can stream depends on your subscription plan, device capabilities, and internet connection speed.'
  },
  {
    question: 'How do I cancel my subscription?',
    answer: 'You can easily cancel your subscription through the app\'s settings menu. Go to Account > Subscription > Cancel Subscription. Your access will continue until the end of your current billing period.'
  }
];

// Glassmorphic platform card with enhanced design and animation
const PlatformCard = ({ platform }: { platform: typeof platforms[0] }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="relative glassmorphism-card overflow-hidden rounded-xl border border-white/5 backdrop-blur-xl transition-all duration-500"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background gradient effects */}
      <div className={`absolute inset-0 bg-gradient-to-r ${platform.color} opacity-5 transition-opacity duration-500 ${isHovered ? 'opacity-10' : 'opacity-5'}`}></div>
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full opacity-10 blur-[100px] z-0"></div>
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full opacity-10 blur-[100px] z-0"></div>
      
      <div className="relative z-10 p-6 md:p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Platform Logo & Info */}
          <div className="flex flex-col md:col-span-1">
            <div className="flex items-center gap-4 mb-6">
              <div className={`p-4 rounded-xl bg-gradient-to-br ${platform.color} shadow-lg`}>
                {platform.icon}
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-1">{platform.title}</h3>
                <p className="text-sm text-white/70">{platform.subtitle}</p>
              </div>
            </div>
            
            <div className="space-y-4 mb-6">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 mr-1" />
                    <span className="font-medium">{platform.rating}/5</span>
                  </div>
                  <span className="text-sm text-white/60">{platform.ratingCount} ratings</span>
                </div>
                <Progress value={platform.rating * 20} className="h-1.5 bg-white/10" />
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/60">Version:</span>
                  <span className="font-medium">{platform.version}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/60">Size:</span>
                  <span className="font-medium">{platform.size}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/60">Updated:</span>
                  <span className="font-medium">{platform.released.replace('Last updated: ', '')}</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col space-y-3 mt-auto">
              <Button className={`w-full bg-gradient-to-r ${platform.color} hover:opacity-90 text-white font-medium border-0`}>
                <Download className="mr-2 h-4 w-4" />
                <span>Download Now</span>
              </Button>
              
              <div className="text-center">
                <span className="text-xs text-white/60">Scan to download</span>
                <div className="mt-2 w-24 h-24 mx-auto bg-white rounded-lg p-2 shadow-glow shadow-white/10">
                  <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center">
                    <span className="text-xs text-gray-500">QR Code</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Features & Requirements */}
          <div className="md:col-span-2 flex flex-col">
            <div className="glassmorphism-inner p-5 rounded-xl mb-6">
              <h4 className="text-lg font-medium text-white mb-4 flex items-center">
                <Sparkles className="w-5 h-5 mr-2 text-blue-400" />
                Key Features
              </h4>
              <ul className="space-y-2">
                {platform.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center text-white/80">
                    <CheckCircle className="h-4 w-4 text-emerald-400 mr-2 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="glassmorphism-inner p-5 rounded-xl mb-6">
              <h4 className="text-lg font-medium text-white mb-3 flex items-center">
                <CircleSlash2 className="w-5 h-5 mr-2 text-red-400" />
                System Requirements
              </h4>
              <p className="text-white/70">{platform.requirements}</p>
            </div>
            
            {/* Screenshot placeholder */}
            <div className="h-40 bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-xl overflow-hidden flex items-center justify-center relative mt-auto">
              <Play className="h-10 w-10 text-white/80" />
              <span className="absolute bottom-3 left-3 text-sm text-white/60 bg-black/30 px-2 py-1 rounded">App Preview</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced Features Section with animation and better visual hierarchy
const FeaturesSection = () => {
  return (
    <div className="mb-16">
      <div className="text-center mb-10">
        <Badge variant="outline" className="mb-3 px-4 py-1.5 border-blue-500/20 bg-blue-500/10 text-blue-400">
          Powerful Features
        </Badge>
        <h2 className="text-3xl md:text-4xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200">
          Everything You Need For Perfect Streaming
        </h2>
        <p className="text-lg text-white/70 max-w-3xl mx-auto">
          Our app brings together cutting-edge technology and a user-friendly interface to deliver the ultimate entertainment experience.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => {
          // Calculate delay based on index for staggered animation
          const delay = index * 0.1;
          
          return (
            <div 
              key={index} 
              className="feature-card glassmorphism-card overflow-hidden transition-all duration-500 hover:translate-y-[-5px]"
              style={{ animationDelay: `${delay}s` }}
            >
              <div className="absolute -inset-1 rounded-xl bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"></div>
              <div className="relative h-full p-8 border border-white/10 rounded-xl backdrop-blur-lg">
                <div className={`h-12 w-12 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-5 shadow-glow`}>
                  {feature.icon}
                </div>
                
                <h3 className="text-xl font-bold mb-3 text-white">{feature.title}</h3>
                <p className="text-white/70">{feature.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Enhanced Reviews Section
const ReviewsSection = () => {
  return (
    <div className="mb-16">
      <div className="text-center mb-10">
        <Badge variant="outline" className="mb-3 px-4 py-1.5 border-yellow-500/20 bg-yellow-500/10 text-yellow-400">
          <Star className="w-4 h-4 mr-2 fill-yellow-400" /> 4.8 Average Rating
        </Badge>
        <h2 className="text-3xl md:text-4xl font-bold mb-3">What Our Users Say</h2>
        <p className="text-lg text-white/70 max-w-3xl mx-auto">
          Join millions of satisfied users who've made Xraynama their go-to entertainment app
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {reviews.map((review, index) => (
          <div 
            key={index} 
            className="glassmorphism-card relative p-6 rounded-xl border border-white/5 transition-all duration-300 hover:border-white/20"
          >
            {/* Avatar */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/20">
                <img 
                  src={review.avatar} 
                  alt={review.name} 
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h4 className="font-medium text-white">{review.name}</h4>
                <div className="flex items-center text-xs text-white/60">
                  <span className="mr-2">{review.platform}</span>
                  <span>•</span>
                  <span className="ml-2">{review.date}</span>
                </div>
              </div>
            </div>
            
            {/* Rating */}
            <div className="flex items-center mb-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star 
                  key={i} 
                  className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-600'}`}
                  fill={i < review.rating ? 'currentColor' : 'none'}
                />
              ))}
            </div>
            
            {/* Review text */}
            <p className="text-white/80">"{review.text}"</p>
            
            {/* Badge */}
            <div className="absolute top-6 right-6">
              <Badge className="bg-white/10 hover:bg-white/20 border-white/5 text-white/70">
                Verified User
              </Badge>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-8 text-center">
        <Button variant="outline" className="border-white/20 hover:border-white/30 hover:bg-white/5">
          <Star className="mr-2 h-4 w-4" />
          Read More Reviews
        </Button>
      </div>
    </div>
  );
};

// Enhanced FAQ Section
const FAQSection = () => {
  return (
    <div className="mb-16 glassmorphism-card p-8 rounded-xl border border-white/5">
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold mb-3">Frequently Asked Questions</h2>
        <p className="text-white/70">Everything you need to know about our app</p>
      </div>
      
      <Accordion type="single" collapsible className="w-full">
        {faqItems.map((item, index) => (
          <AccordionItem key={index} value={`item-${index}`} className="border-white/10">
            <AccordionTrigger className="text-white hover:text-blue-400 text-left">
              {item.question}
            </AccordionTrigger>
            <AccordionContent className="text-white/70">
              {item.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

// Enhanced Stats section
const StatsSection = () => {
  return (
    <div className="mb-16 grid grid-cols-2 md:grid-cols-4 gap-6">
      {[
        { icon: <UserPlus className="h-8 w-8 text-blue-400" />, value: '5M+', label: 'Active Users' },
        { icon: <HdmiPort className="h-8 w-8 text-purple-400" />, value: '1080p+', label: 'HD Quality' },
        { icon: <Clock className="h-8 w-8 text-emerald-400" />, value: '24/7', label: 'Support' },
        { icon: <Award className="h-8 w-8 text-amber-400" />, value: '#1', label: 'Streaming App' },
      ].map((stat, index) => (
        <div key={index} className="glassmorphism-card p-6 rounded-xl border border-white/5 text-center">
          <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center bg-white/5 mb-4">
            {stat.icon}
          </div>
          <div className="text-3xl font-bold mb-1 text-white">{stat.value}</div>
          <div className="text-white/70">{stat.label}</div>
        </div>
      ))}
    </div>
  );
};

// Main App Page
export default function AppPage() {
  const [currentTab, setCurrentTab] = useState('android');
  const [scrollProgress, setScrollProgress] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);
  
  // Handle scroll progress for parallax effects
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const heroHeight = heroRef.current?.offsetHeight || 0;
      const progress = Math.min(scrollY / heroHeight, 1);
      setScrollProgress(progress);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Find the current platform based on tab
  const currentPlatform = platforms.find(p => p.id === currentTab) || platforms[0];
  
  return (
    <SectionLayout 
      title="Xraynama App"
      description="Experience unlimited entertainment on any device, anywhere, anytime"
      icon={<Smartphone className="h-8 w-8" />}
    >
      {/* Hero Section with Glassmorphism */}
      <div 
        ref={heroRef}
        className="relative mb-20 overflow-hidden rounded-2xl glassmorphism-hero"
        style={{ minHeight: '600px' }}
      >
        {/* Background Gradients */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80 z-10"></div>
        <div 
          className="absolute -top-60 -right-60 w-[500px] h-[500px] rounded-full bg-blue-500/20 blur-[100px]"
          style={{ transform: `translateY(${scrollProgress * 50}px)` }}
        ></div>
        <div 
          className="absolute -bottom-60 -left-60 w-[500px] h-[500px] rounded-full bg-purple-500/20 blur-[100px]"
          style={{ transform: `translateY(${-scrollProgress * 50}px)` }}
        ></div>
        
        {/* Content */}
        <div className="relative z-20 p-8 md:p-16 flex flex-col md:flex-row items-center h-full">
          <div className="md:w-1/2 md:pr-10 mb-10 md:mb-0">
            <Badge variant="outline" className="mb-5 px-4 py-1.5 border-blue-500/20 bg-blue-500/10 text-blue-400">
              <Wifi className="w-4 h-4 mr-2" /> Online & Offline Streaming
            </Badge>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              <span className="text-white">Your Entertainment,</span>
              <span className="block bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300">
                Anywhere, Anytime
              </span>
            </h1>
            
            <p className="text-xl text-white/80 mb-8 leading-relaxed">
              Download the Xraynama app and transform any device into your personal cinema. 
              Stream in 4K, download for offline viewing, and synchronize across all your devices.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="bg-gradient-to-r from-blue-500 to-cyan-400 hover:opacity-90 text-white border-0 shadow-glow shadow-blue-500/20">
                <Download className="mr-2 h-5 w-5" />
                <span>Download Now</span>
              </Button>
              
              <Button size="lg" variant="outline" className="border-white/20 hover:border-white/40 hover:bg-white/5">
                <Play className="mr-2 h-5 w-5" />
                <span>Watch Demo</span>
              </Button>
            </div>
            
            <div className="mt-8 flex items-center">
              <div className="flex -space-x-3 mr-4">
                {[1, 2, 3, 4].map(num => (
                  <div key={num} className="w-10 h-10 rounded-full border-2 border-blue-900 overflow-hidden">
                    <img 
                      src={`https://randomuser.me/api/portraits/${num % 2 === 0 ? 'women' : 'men'}/${num * 10}.jpg`} 
                      alt="User Avatar" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-xs text-white border-2 border-blue-900">
                  +2M
                </div>
              </div>
              <div>
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star key={star} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-sm text-white/60">
                  Rated 4.8 by 2M+ users
                </p>
              </div>
            </div>
          </div>
          
          {/* App Mockup */}
          <div 
            className="md:w-1/2 flex justify-center items-center relative"
            style={{ transform: `translateY(${-scrollProgress * 30}px)` }}
          >
            <div className="relative">
              {/* Phone mockup */}
              <div className="w-64 h-[500px] bg-gradient-to-b from-blue-900 to-[#00142c] rounded-[40px] p-4 border-[12px] border-[#00142c] shadow-xl shadow-blue-500/20 relative">
                <div className="h-full w-full bg-[#00142c] rounded-[32px] overflow-hidden flex flex-col">
                  {/* App header */}
                  <div className="p-4 bg-gradient-to-r from-blue-800 to-blue-900 flex items-center justify-between">
                    <div className="text-white text-lg font-bold">X<span className="text-blue-400">raynama</span></div>
                    <div className="flex gap-2">
                      <div className="w-2 h-2 rounded-full bg-white/30"></div>
                      <div className="w-2 h-2 rounded-full bg-white/30"></div>
                      <div className="w-2 h-2 rounded-full bg-white/30"></div>
                    </div>
                  </div>
                  
                  {/* App content */}
                  <div className="flex-1 p-4 flex flex-col gap-3">
                    <div className="h-32 bg-gradient-to-r from-blue-700/30 to-purple-700/30 rounded-lg"></div>
                    <div className="flex gap-2">
                      <div className="flex-1 h-8 bg-blue-700/30 rounded"></div>
                      <div className="flex-1 h-8 bg-blue-700/30 rounded"></div>
                    </div>
                    <div className="h-40 bg-gradient-to-r from-blue-700/30 to-purple-700/30 rounded-lg"></div>
                    <div className="h-6 w-3/4 bg-blue-700/30 rounded"></div>
                    <div className="h-6 w-1/2 bg-blue-700/30 rounded"></div>
                    <div className="h-20 bg-gradient-to-r from-blue-700/30 to-purple-700/30 rounded-lg"></div>
                  </div>
                  
                  {/* App navigation */}
                  <div className="h-16 bg-blue-900/60 backdrop-blur-md flex items-center justify-around px-4">
                    {['home', 'search', 'library', 'profile'].map(item => (
                      <div key={item} className="w-10 h-10 rounded-full bg-blue-700/30 flex items-center justify-center"></div>
                    ))}
                  </div>
                </div>
                
                {/* Phone elements */}
                <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-24 h-4 bg-[#00142c] rounded-b-xl"></div>
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-10 h-1 bg-blue-800/60 rounded-full"></div>
              </div>
              
              {/* Notification badges */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-glow shadow-blue-500/30">
                4K HDR
              </div>
              <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-400 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-glow shadow-purple-500/30">
                Dolby<br/>Atmos
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Stats Section */}
      <StatsSection />
      
      {/* Features Section */}
      <FeaturesSection />
      
      {/* Download Section for Different Platforms */}
      <div className="mb-20">
        <div className="text-center mb-10">
          <Badge variant="outline" className="mb-3 px-4 py-1.5 border-blue-500/20 bg-blue-500/10 text-blue-400">
            <Download className="w-4 h-4 mr-2" />
            Multi-Platform
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-3">Download For Your Device</h2>
          <p className="text-lg text-white/70 max-w-3xl mx-auto">
            Our app is available on all major platforms to ensure you always have access to your favorite content
          </p>
        </div>
        
        <Tabs 
          defaultValue="android" 
          value={currentTab}
          onValueChange={setCurrentTab}
          className="mb-8"
        >
          <TabsList className="grid grid-cols-4 w-full max-w-3xl mx-auto bg-white/5 p-1 backdrop-blur-md border border-white/10 rounded-xl">
            {platforms.map(platform => (
              <TabsTrigger 
                key={platform.id}
                value={platform.id}
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white rounded-lg"
              >
                <div className="flex items-center">
                  {React.cloneElement(platform.icon as React.ReactElement, { className: 'h-4 w-4 mr-2' })}
                  <span>{platform.title}</span>
                </div>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        
        <PlatformCard platform={currentPlatform} />
      </div>
      
      {/* Reviews Section */}
      <ReviewsSection />
      
      {/* FAQ Section */}
      <FAQSection />
      
      {/* Call to Action */}
      <div className="text-center mb-16 glassmorphism-cta p-10 md:p-16 rounded-2xl overflow-hidden relative">
        {/* Background effects */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full opacity-20 blur-[100px] z-0"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full opacity-20 blur-[100px] z-0"></div>
        
        <div className="relative z-10">
          <Badge variant="outline" className="mb-5 px-4 py-1.5 border-blue-500/20 bg-blue-500/10 text-blue-400">
            Join 5M+ Users
          </Badge>
          
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready for the Ultimate Streaming Experience?
          </h2>
          
          <p className="text-xl text-white/80 mb-8 max-w-3xl mx-auto">
            Download Xraynama now and enjoy unlimited access to thousands of movies, TV shows, and exclusive content
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" className="bg-gradient-to-r from-blue-500 to-cyan-400 hover:opacity-90 text-white border-0 shadow-glow shadow-blue-500/20">
              <Download className="mr-2 h-5 w-5" />
              <span>Get Started Now</span>
            </Button>
            
            <Button size="lg" variant="outline" className="border-white/20 hover:border-white/40 hover:bg-white/5">
              <span>Learn More</span>
            </Button>
          </div>
        </div>
      </div>
    </SectionLayout>
  );
}