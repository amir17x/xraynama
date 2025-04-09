import { useState, useRef } from 'react';
import { SectionLayout } from '@/components/layout/SectionLayout';
import { Users, Search, Star, Info, List, Film, Award } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useInView } from '@/hooks/use-in-view';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// نوع داده برای هنرمندان
interface Artist {
  id: string;
  name: string;
  englishName: string;
  role: string;
  popularity: number;
  bio?: string;
  movies?: string[];
  image?: string;
  featured?: boolean;
}

// هنرمندان نمونه با اطلاعات بیشتر - در پروژه واقعی از API دریافت می‌شوند
const sampleArtists: Artist[] = [
  {
    id: '1',
    name: 'رابرت داونی جونیور',
    englishName: 'Robert Downey Jr.',
    role: 'بازیگر',
    popularity: 95,
    image: 'https://randomuser.me/api/portraits/men/1.jpg',
    bio: 'Robert Downey Jr. is an American actor known for his role as Iron Man in the Marvel Cinematic Universe.',
    movies: ['Iron Man', 'Avengers: Endgame', 'Sherlock Holmes'],
    featured: true
  },
  {
    id: '2',
    name: 'اسکارلت جوهانسون',
    englishName: 'Scarlett Johansson',
    role: 'بازیگر',
    popularity: 92,
    image: 'https://randomuser.me/api/portraits/women/1.jpg',
    bio: 'Scarlett Johansson is an American actress and singer who has starred in films such as Lost in Translation, The Avengers, and Marriage Story.',
    movies: ['Black Widow', 'Marriage Story', 'Lucy'],
    featured: true
  },
  {
    id: '3',
    name: 'کریستوفر نولان',
    englishName: 'Christopher Nolan',
    role: 'کارگردان',
    popularity: 90,
    image: 'https://randomuser.me/api/portraits/men/2.jpg',
    bio: 'Christopher Nolan is a British-American filmmaker known for his science fiction and psychological thrillers including Inception and Interstellar.',
    movies: ['Inception', 'The Dark Knight', 'Interstellar'],
    featured: true
  },
  {
    id: '4',
    name: 'استیون اسپیلبرگ',
    englishName: 'Steven Spielberg',
    role: 'کارگردان',
    popularity: 94,
    image: 'https://randomuser.me/api/portraits/men/3.jpg',
    bio: 'Steven Spielberg is an American filmmaker and one of the founding pioneers of the New Hollywood era.',
    movies: ['Jurassic Park', 'E.T.', 'Saving Private Ryan']
  },
  {
    id: '5',
    name: 'ناتالی پورتمن',
    englishName: 'Natalie Portman',
    role: 'بازیگر',
    popularity: 88,
    image: 'https://randomuser.me/api/portraits/women/2.jpg',
    bio: 'Natalie Portman is an Israeli-American actress, director, and producer who has appeared in various blockbusters and independent films.',
    movies: ['Black Swan', 'Thor', 'V for Vendetta']
  },
  {
    id: '6',
    name: 'هانس زیمر',
    englishName: 'Hans Zimmer',
    role: 'آهنگساز',
    popularity: 91,
    image: 'https://randomuser.me/api/portraits/men/4.jpg',
    bio: 'Hans Zimmer is a German film score composer and record producer who has composed music for over 150 films.',
    movies: ['Inception', 'Interstellar', 'The Lion King'],
    featured: true
  },
  {
    id: '7',
    name: 'مریل استریپ',
    englishName: 'Meryl Streep',
    role: 'بازیگر',
    popularity: 96,
    image: 'https://randomuser.me/api/portraits/women/3.jpg',
    bio: 'Meryl Streep is an American actress who has been described as the "best actress of her generation".',
    movies: ['The Devil Wears Prada', 'Mamma Mia!', 'The Iron Lady']
  },
  {
    id: '8',
    name: 'کوئنتین تارانتینو',
    englishName: 'Quentin Tarantino',
    role: 'کارگردان',
    popularity: 89,
    image: 'https://randomuser.me/api/portraits/men/5.jpg',
    bio: 'Quentin Tarantino is an American filmmaker, actor, film programmer, and cinema owner known for his nonlinear storylines.',
    movies: ['Pulp Fiction', 'Kill Bill', 'Django Unchained']
  },
  {
    id: '9',
    name: 'چارلیز ترون',
    englishName: 'Charlize Theron',
    role: 'بازیگر',
    popularity: 87,
    image: 'https://randomuser.me/api/portraits/women/4.jpg',
    bio: 'Charlize Theron is a South African and American actress and producer who has starred in numerous Hollywood films.',
    movies: ['Mad Max: Fury Road', 'Monster', 'Atomic Blonde']
  },
  {
    id: '10',
    name: 'تام هنکس',
    englishName: 'Tom Hanks',
    role: 'بازیگر',
    popularity: 97,
    image: 'https://randomuser.me/api/portraits/men/6.jpg',
    bio: 'Tom Hanks is an American actor and filmmaker, known for both his comedic and dramatic roles.',
    movies: ['Forrest Gump', 'Saving Private Ryan', 'Cast Away'],
    featured: true
  },
  {
    id: '11',
    name: 'جیمز کامرون',
    englishName: 'James Cameron',
    role: 'کارگردان',
    popularity: 93,
    image: 'https://randomuser.me/api/portraits/men/7.jpg',
    bio: 'James Cameron is a Canadian filmmaker known for making science fiction and epic films, particularly for his work on The Terminator and Avatar.',
    movies: ['Avatar', 'Titanic', 'The Terminator']
  },
  {
    id: '12',
    name: 'آنجلینا جولی',
    englishName: 'Angelina Jolie',
    role: 'بازیگر',
    popularity: 90,
    image: 'https://randomuser.me/api/portraits/women/5.jpg',
    bio: 'Angelina Jolie is an American actress, filmmaker, and humanitarian who has received numerous accolades for her work.',
    movies: ['Maleficent', 'Salt', 'Mr. & Mrs. Smith']
  }
];

// تابع برای بریدن متن توضیحات به طول مشخص
const truncateBio = (bio: string, maxLength: number = 120) => {
  if (bio.length <= maxLength) return bio;
  return bio.substring(0, maxLength) + '...';
};

// کارت هنرمند با استایل گلاسمورفیسم پیشرفته
const ArtistCard = ({ artist }: { artist: Artist }) => {
  // استفاده از افکت in-view برای لود تدریجی
  const [cardRef, isVisible] = useInView<HTMLDivElement>({ 
    threshold: 0.1, 
    triggerOnce: true,
    rootMargin: '50px 0px' 
  });

  const [isHovering, setIsHovering] = useState(false);

  return (
    <div 
      ref={cardRef}
      className={`relative glass-card transition-all duration-500 rounded-xl overflow-hidden ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div className="relative aspect-[3/4] overflow-hidden">
        {/* تصویر هنرمند */}
        <div className="h-full w-full bg-gradient-to-b from-black/10 to-black/30 absolute top-0 left-0 z-10"></div>
        
        {isVisible && (
          <img 
            src={artist.image || `/placeholder-user.jpg`} 
            alt={artist.englishName}
            className={`absolute inset-0 h-full w-full object-cover object-center transition-transform duration-700 ${isHovering ? 'scale-110 filter brightness-110' : 'scale-100'}`}
          />
        )}
        
        {/* افکت گلاسمورفیسم */}
        <div className={`absolute inset-0 bg-gradient-to-t from-[#000a23]/90 via-transparent to-transparent z-20 transition-opacity duration-300 ${isHovering ? 'opacity-100' : 'opacity-80'}`}></div>
        
        {/* نشانگر ویژه */}
        {artist.featured && (
          <div className="absolute top-3 left-3 bg-gradient-to-r from-yellow-500 to-amber-500 text-white text-xs px-2 py-1 rounded z-30 shadow-glow-sm shadow-amber-500/20">
            <Award className="inline-block w-3 h-3 mr-1" />
            <span>Featured</span>
          </div>
        )}

        {/* نمایش نام انگلیسی */}
        <div className={`absolute bottom-0 left-0 right-0 text-center z-30 p-3 transition-all duration-300 ${isHovering ? 'translate-y-0' : 'translate-y-4'}`}>
          <h3 className="text-xl font-bold text-white leading-tight">
            {artist.englishName}
          </h3>
          
          {/* شغل هنرمند */}
          <div className={`mt-1 inline-block px-2 py-0.5 text-xs rounded-full ${
            artist.role === 'بازیگر' ? 'bg-purple-500/30 text-purple-100' : 
            artist.role === 'کارگردان' ? 'bg-teal-500/30 text-teal-100' : 
            'bg-amber-500/30 text-amber-100'
          } transition-opacity duration-300 ${isHovering ? 'opacity-100' : 'opacity-70'}`}>
            {artist.role === 'بازیگر' ? 'Actor' : 
             artist.role === 'کارگردان' ? 'Director' : 
             'Composer'}
          </div>
        </div>
      </div>
      
      {/* پاپ‌آپ اطلاعات بیشتر */}
      <div className={`absolute inset-0 z-40 bg-black/85 backdrop-blur-sm flex flex-col items-center justify-center p-5 transition-all duration-500 ${
        isHovering ? 'opacity-100 visible' : 'opacity-0 invisible'
      }`}>
        <h3 className="text-xl font-bold text-white mb-2">{artist.englishName}</h3>
        
        {artist.bio && (
          <p className="text-gray-300 text-sm text-center mb-3">{truncateBio(artist.bio)}</p>
        )}
        
        {artist.movies && artist.movies.length > 0 && (
          <div className="mt-2 w-full">
            <h4 className="text-[#00BFFF] text-xs font-medium mb-1 flex items-center">
              <Film className="w-3 h-3 mr-1" /> 
              <span>KNOWN FOR</span>
            </h4>
            <ul className="text-white text-xs space-y-1">
              {artist.movies.slice(0, 3).map((movie, idx) => (
                <li key={idx} className="opacity-70 hover:opacity-100 transition-opacity">
                  • {movie}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        <div className="mt-auto pt-4 w-full">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Star className="h-3 w-3 text-yellow-500 mr-1" fill="currentColor" />
              <span className="text-xs text-white">{artist.popularity}%</span>
            </div>
            <Button size="sm" variant="ghost" className="text-xs text-[#00BFFF] hover:bg-[#00BFFF]/10 p-1 h-auto">
              <Info className="h-3 w-3 mr-1" />
              <span>Details</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// کارت هنرمند برجسته با استایل گلاس‌مورفیسم ارتقا یافته
const FeaturedArtistCard = ({ artist }: { artist: Artist }) => {
  return (
    <div className="relative overflow-hidden rounded-xl glass-effect">
      {/* افکت‌های پس‌زمینه پیشرفته */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#000a23]/80 via-[#00142c]/50 to-[#000a23]/80"></div>
      <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full bg-[#00BFFF]/10 blur-3xl"></div>
      <div className="absolute top-20 right-20 w-32 h-32 rounded-full bg-purple-500/10 blur-3xl"></div>
      <div className="absolute -bottom-20 -right-20 w-40 h-40 rounded-full bg-[#00BFFF]/10 blur-3xl"></div>
      
      <div className="relative p-6 md:p-8 flex flex-col md:flex-row items-center gap-8">
        {/* تصویر هنرمند */}
        <div className="relative group">
          <div className="w-36 h-36 md:w-44 md:h-44 rounded-full overflow-hidden border-4 border-[#00BFFF]/30 shadow-lg shadow-[#00BFFF]/10 transition-all duration-500 group-hover:border-[#00BFFF]/60">
            <img 
              src={artist.image} 
              alt={artist.englishName} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:filter group-hover:brightness-110"
            />
          </div>
          <div className="absolute -bottom-2 right-0 bg-gradient-to-r from-yellow-500 to-amber-500 text-white text-xs px-3 py-1 rounded-full shadow-lg">
            <Star className="inline-block w-3 h-3 mr-1" fill="currentColor" />
            <span>{artist.popularity}%</span>
          </div>
        </div>
        
        <div className="text-center md:text-right flex-1">
          {/* نام هنرمند */}
          <div className="mb-3">
            <h2 className="text-3xl font-bold text-white mb-1">{artist.englishName}</h2>
            <p className="text-[#00BFFF]">
              {artist.role === 'بازیگر' ? 'Actor' : 
               artist.role === 'کارگردان' ? 'Director' : 
               'Composer'}
            </p>
          </div>
          
          {/* بیوگرافی */}
          {artist.bio && (
            <p className="text-gray-300 mb-5 max-w-xl">{truncateBio(artist.bio, 180)}</p>
          )}
          
          {/* فیلم‌های معروف */}
          {artist.movies && artist.movies.length > 0 && (
            <div className="mb-5">
              <h3 className="text-sm font-medium text-[#00BFFF] mb-2 flex items-center">
                <Film className="w-4 h-4 ml-1" /> 
                <span>KNOWN FOR</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {artist.movies.map((movie, idx) => (
                  <span key={idx} className="bg-[#00BFFF]/10 hover:bg-[#00BFFF]/20 px-3 py-1 rounded-full text-white text-sm transition-colors duration-300">
                    {movie}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {/* دکمه‌ها */}
          <div className="flex flex-wrap gap-3 justify-center md:justify-start">
            <Button className="bg-[#00BFFF] hover:bg-[#00BFFF]/90 text-white">
              <Film className="mr-2 h-4 w-4" />
              <span>Filmography</span>
            </Button>
            <Button variant="outline" className="border-[#00BFFF]/30 hover:border-[#00BFFF]/60 hover:bg-[#00BFFF]/10">
              <List className="mr-2 h-4 w-4" />
              <span>Biography</span>
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
    let roleFilter = true;
    if (currentTab === 'actor') {
      roleFilter = artist.role === 'بازیگر';
    } else if (currentTab === 'director') {
      roleFilter = artist.role === 'کارگردان';
    } else if (currentTab === 'composer') {
      roleFilter = artist.role === 'آهنگساز';
    }
    
    return matchesSearch && roleFilter;
  });
  
  // هنرمندان برجسته
  const featuredArtists = sampleArtists.filter(artist => artist.featured);
  const randomFeaturedArtist = featuredArtists[Math.floor(Math.random() * featuredArtists.length)];
  
  return (
    <SectionLayout 
      title="هنرمندان"
      description="دنیای سینما را از طریق بازیگران، کارگردانان و آهنگسازان با استعداد آن کشف کنید"
      icon={<Users className="h-8 w-8" />}
    >
      {/* هنرمند برجسته */}
      {randomFeaturedArtist && (
        <div className="mb-10">
          <FeaturedArtistCard artist={randomFeaturedArtist} />
        </div>
      )}
      
      {/* جستجو و فیلترها */}
      <div className="mb-10 glass-effect p-5 rounded-xl border border-[#00BFFF]/10">
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
              <TabsTrigger value="actor">بازیگران</TabsTrigger>
              <TabsTrigger value="director">کارگردانان</TabsTrigger>
              <TabsTrigger value="composer">آهنگسازان</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
      
      {/* نمایش لیست هنرمندان */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
        {filteredArtists.map(artist => (
          <div key={artist.id}>
            <ArtistCard artist={artist} />
          </div>
        ))}
      </div>
      
      {filteredArtists.length === 0 && (
        <div className="text-center py-12 glass-effect rounded-xl p-10">
          <div className="text-[#00BFFF] mb-3">
            <Search className="h-16 w-16 mx-auto opacity-40" />
          </div>
          <h3 className="text-xl font-bold mb-2">هنرمندی یافت نشد</h3>
          <p className="text-muted-foreground">
            جستجو یا فیلترهای خود را تغییر دهید
          </p>
        </div>
      )}
      
      {filteredArtists.length > 0 && (
        <div className="flex justify-center mt-10">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="default" 
                  className="bg-gradient-to-r from-[#00BFFF] to-[#0077ff] hover:from-[#00a6ff] hover:to-[#005ed9] text-white shadow-lg shadow-blue-500/20"
                >
                  هنرمندان بیشتر
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>کشف بازیگران، کارگردانان و آهنگسازان بیشتر</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}
    </SectionLayout>
  );
}