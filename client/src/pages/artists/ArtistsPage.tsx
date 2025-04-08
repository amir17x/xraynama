import { useState } from 'react';
import { SectionLayout } from '@/components/layout/SectionLayout';
import { Users, Search, Star } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

// نوع داده برای هنرمندان
interface Artist {
  id: string;
  name: string;
  englishName: string;
  role: string;
  popularity: number;
  image?: string;
  featured?: boolean;
}

// هنرمندان نمونه - در پروژه واقعی از API دریافت می‌شوند
const sampleArtists: Artist[] = [
  {
    id: '1',
    name: 'رابرت داونی جونیور',
    englishName: 'Robert Downey Jr.',
    role: 'بازیگر',
    popularity: 95,
    image: 'https://randomuser.me/api/portraits/men/1.jpg',
    featured: true
  },
  {
    id: '2',
    name: 'اسکارلت جوهانسون',
    englishName: 'Scarlett Johansson',
    role: 'بازیگر',
    popularity: 92,
    image: 'https://randomuser.me/api/portraits/women/1.jpg',
    featured: true
  },
  {
    id: '3',
    name: 'کریستوفر نولان',
    englishName: 'Christopher Nolan',
    role: 'کارگردان',
    popularity: 90,
    image: 'https://randomuser.me/api/portraits/men/2.jpg',
    featured: true
  },
  {
    id: '4',
    name: 'استیون اسپیلبرگ',
    englishName: 'Steven Spielberg',
    role: 'کارگردان',
    popularity: 94,
    image: 'https://randomuser.me/api/portraits/men/3.jpg'
  },
  {
    id: '5',
    name: 'ناتالی پورتمن',
    englishName: 'Natalie Portman',
    role: 'بازیگر',
    popularity: 88,
    image: 'https://randomuser.me/api/portraits/women/2.jpg'
  },
  {
    id: '6',
    name: 'هانس زیمر',
    englishName: 'Hans Zimmer',
    role: 'آهنگساز',
    popularity: 91,
    image: 'https://randomuser.me/api/portraits/men/4.jpg',
    featured: true
  },
  {
    id: '7',
    name: 'مریل استریپ',
    englishName: 'Meryl Streep',
    role: 'بازیگر',
    popularity: 96,
    image: 'https://randomuser.me/api/portraits/women/3.jpg'
  },
  {
    id: '8',
    name: 'کوئنتین تارانتینو',
    englishName: 'Quentin Tarantino',
    role: 'کارگردان',
    popularity: 89,
    image: 'https://randomuser.me/api/portraits/men/5.jpg'
  },
  {
    id: '9',
    name: 'چارلیز ترون',
    englishName: 'Charlize Theron',
    role: 'بازیگر',
    popularity: 87,
    image: 'https://randomuser.me/api/portraits/women/4.jpg'
  },
  {
    id: '10',
    name: 'تام هنکس',
    englishName: 'Tom Hanks',
    role: 'بازیگر',
    popularity: 97,
    image: 'https://randomuser.me/api/portraits/men/6.jpg',
    featured: true
  },
  {
    id: '11',
    name: 'جیمز کامرون',
    englishName: 'James Cameron',
    role: 'کارگردان',
    popularity: 93,
    image: 'https://randomuser.me/api/portraits/men/7.jpg'
  },
  {
    id: '12',
    name: 'آنجلینا جولی',
    englishName: 'Angelina Jolie',
    role: 'بازیگر',
    popularity: 90,
    image: 'https://randomuser.me/api/portraits/women/5.jpg'
  }
];

// کارت هنرمند با استایل گلاسمورفیسم
const ArtistCard = ({ artist }: { artist: Artist }) => {
  return (
    <div className="glass-effect rounded-xl p-4 transition-all duration-300 hover:scale-105 group cursor-pointer">
      <div className="flex flex-col items-center">
        <Avatar className="w-24 h-24 mb-4 border-2 border-[#00BFFF]/30 group-hover:border-[#00BFFF]/60 transition-all duration-300 shadow-md">
          <AvatarImage src={artist.image} alt={artist.name} />
          <AvatarFallback className="bg-[#00142c] text-[#00BFFF] font-semibold text-xl">
            {artist.name.charAt(0)}
          </AvatarFallback>
        </Avatar>
        
        <h3 className="text-lg font-medium text-center mb-1 group-hover:text-[#00BFFF] transition-colors duration-300">
          {artist.name}
        </h3>
        <p className="text-sm text-muted-foreground text-center mb-2">{artist.englishName}</p>
        
        <div className="flex items-center mb-3">
          <span className="text-xs bg-[#00BFFF]/10 text-[#00BFFF] px-2 py-1 rounded">{artist.role}</span>
        </div>
        
        <div className="flex items-center">
          <Star className="h-4 w-4 text-yellow-500 ml-1" />
          <span className="text-sm">{artist.popularity}%</span>
        </div>
      </div>
      
      {artist.featured && (
        <div className="absolute top-2 left-2 bg-gradient-to-r from-yellow-500 to-amber-500 text-white text-xs px-2 py-0.5 rounded">
          ویژه
        </div>
      )}
    </div>
  );
};

// کارت هنرمند برجسته با استایل ویژه
const FeaturedArtistCard = ({ artist }: { artist: Artist }) => {
  return (
    <div className="relative overflow-hidden rounded-xl glass-effect">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#00142c]/90"></div>
      <div className="absolute -top-20 -left-20 w-40 h-40 rounded-full bg-[#00BFFF]/20 blur-3xl"></div>
      <div className="absolute -bottom-20 -right-20 w-40 h-40 rounded-full bg-[#00BFFF]/20 blur-3xl"></div>
      
      <div className="relative p-6 flex flex-col md:flex-row items-center gap-6">
        <Avatar className="w-28 h-28 border-4 border-[#00BFFF]/30 shadow-lg shadow-[#00BFFF]/10">
          <AvatarImage src={artist.image} alt={artist.name} />
          <AvatarFallback className="bg-[#00142c] text-[#00BFFF] font-semibold text-2xl">
            {artist.name.charAt(0)}
          </AvatarFallback>
        </Avatar>
        
        <div className="text-center md:text-right">
          <div className="flex items-center justify-center md:justify-start mb-2">
            <h2 className="text-2xl font-bold">{artist.name}</h2>
            <div className="mr-3 bg-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded-full text-xs flex items-center">
              <Star className="h-3 w-3 ml-1" />
              <span>{artist.popularity}%</span>
            </div>
          </div>
          
          <p className="text-[#00BFFF] mb-2">{artist.englishName}</p>
          <p className="text-muted-foreground mb-4">{artist.role}</p>
          
          <div className="flex flex-wrap gap-2 justify-center md:justify-start">
            <Button size="sm" variant="outline" className="border-[#00BFFF]/20 hover:border-[#00BFFF]/60 hover:bg-[#00BFFF]/10">
              مشاهده فیلم‌ها
            </Button>
            <Button size="sm" variant="outline" className="border-[#00BFFF]/20 hover:border-[#00BFFF]/60 hover:bg-[#00BFFF]/10">
              مشاهده پروفایل
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// صفحه اصلی هنرمندان
export default function ArtistsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentTab, setCurrentTab] = useState('all');
  
  // فیلتر هنرمندان
  const filteredArtists = sampleArtists.filter(artist => {
    // فیلتر بر اساس جستجو
    const matchesSearch = 
      artist.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      artist.englishName.toLowerCase().includes(searchTerm.toLowerCase());
    
    // فیلتر بر اساس نقش
    if (currentTab !== 'all' && artist.role !== currentTab) {
      return false;
    }
    
    return matchesSearch;
  });
  
  // هنرمندان برجسته
  const featuredArtists = sampleArtists.filter(artist => artist.featured);
  const randomFeaturedArtist = featuredArtists[Math.floor(Math.random() * featuredArtists.length)];
  
  return (
    <SectionLayout 
      title="هنرمندان"
      description="مجموعه‌ای از بازیگران، کارگردانان، فیلمنامه‌نویسان و سایر هنرمندان سینما و تلویزیون"
      icon={<Users className="h-8 w-8" />}
    >
      {randomFeaturedArtist && (
        <div className="mb-8">
          <FeaturedArtistCard artist={randomFeaturedArtist} />
        </div>
      )}
      
      {/* جستجو و فیلترها */}
      <div className="mb-8 glass-effect p-4 rounded-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="h-4 w-4 absolute top-3 right-3 text-[#00BFFF]" />
            <Input
              type="text"
              placeholder="جستجوی هنرمند..."
              className="pl-3 pr-10 py-2 bg-card/30 border-[#00BFFF]/20 focus:border-[#00BFFF]/60"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Tabs 
            defaultValue="all" 
            value={currentTab}
            onValueChange={setCurrentTab}
            className="w-full md:w-auto"
          >
            <TabsList className="grid grid-cols-4 w-full md:w-auto bg-card/30">
              <TabsTrigger value="all">همه</TabsTrigger>
              <TabsTrigger value="بازیگر">بازیگران</TabsTrigger>
              <TabsTrigger value="کارگردان">کارگردانان</TabsTrigger>
              <TabsTrigger value="آهنگساز">آهنگسازان</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
      
      {/* نمایش لیست هنرمندان */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
        {filteredArtists.map(artist => (
          <div key={artist.id} className="content-enter">
            <ArtistCard artist={artist} />
          </div>
        ))}
      </div>
      
      {filteredArtists.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">هنرمندی با این مشخصات یافت نشد.</p>
        </div>
      )}
      
      <div className="flex justify-center mt-8">
        <Button variant="outline" className="glass-effect border-[#00BFFF]/20 hover:border-[#00BFFF]/40">
          مشاهده بیشتر
        </Button>
      </div>
    </SectionLayout>
  );
}