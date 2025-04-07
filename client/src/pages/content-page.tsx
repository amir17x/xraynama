import { useState, useEffect, useRef } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Heart,
  Download,
  Play,
  Share2,
  Star,
  Calendar,
  Clock,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  User,
  Info,
  Film,
  Monitor
} from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

export default function ContentPage() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // State
  const [selectedTab, setSelectedTab] = useState<"info" | "comments">("info");
  const [showPlayer, setShowPlayer] = useState(false);
  const [selectedQuality, setSelectedQuality] = useState<string>("1080p");
  const [commentText, setCommentText] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);
  
  // Fake data for demonstration
  const mockContent = {
    id: id,
    title: "پرستیژ",
    englishTitle: "The Prestige",
    description: "دو شعبده‌باز رقیب در لندن اواخر قرن نوزدهم تلاش می‌کنند تا بهترین ترفند را ارائه دهند و در این راه به مبارزه خطرناکی کشیده می‌شوند.",
    year: 2006,
    duration: 130,
    type: "movie",
    imdbRating: "8.5",
    director: "کریستوفر نولان",
    actors: ["کریستین بیل", "هیو جکمن", "اسکارلت جوهانسون", "مایکل کین"],
    genres: ["درام", "معمایی", "علمی تخیلی"],
    poster: "https://image.tmdb.org/t/p/w500/5i02FP2ljLlOfhYYvfuVQCQTrO8.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/cD9b7DzVbwsiMUDIzARCQRnGYYL.jpg",
    trailer: "https://www.youtube.com/watch?v=ijXruSzfGEc"
  };
  
  const mockComments = [
    {
      id: 1,
      user: {
        id: 1,
        name: "محمد احمدی",
        avatar: null
      },
      text: "یکی از بهترین فیلم‌های کریستوفر نولان! پیچیدگی داستان و پایان غیرمنتظره‌اش واقعاً من رو غافلگیر کرد.",
      date: "۱۴۰۲/۱۲/۱۵",
      likes: 24,
      dislikes: 2
    },
    {
      id: 2,
      user: {
        id: 2,
        name: "سارا محمدی",
        avatar: null
      },
      text: "بازی کریستین بیل و هیو جکمن فوق‌العاده بود. تم موسیقی فیلم هم کاملاً با فضای داستان هماهنگی داشت.",
      date: "۱۴۰۲/۱۲/۰۵",
      likes: 15,
      dislikes: 1
    },
    {
      id: 3,
      user: {
        id: 3,
        name: "علی رضایی",
        avatar: null
      },
      text: "فیلمی که هر بار تماشا می‌کنی، نکته جدیدی ازش متوجه میشی. من سه بار دیدمش و هر بار لذت بیشتری بردم.",
      date: "۱۴۰۲/۱۱/۲۸",
      likes: 19,
      dislikes: 0
    }
  ];
  
  const mockQualities = [
    { label: "1080p", value: "1080p", size: "2.1 GB", url: "#download-1080" },
    { label: "720p", value: "720p", size: "1.4 GB", url: "#download-720" },
    { label: "480p", value: "480p", size: "750 MB", url: "#download-480" },
  ];
  
  // Toggle Favorite
  const handleToggleFavorite = () => {
    if (!user) {
      toast({
        title: "ابتدا وارد شوید",
        description: "برای افزودن به علاقه‌مندی‌ها ابتدا وارد حساب کاربری خود شوید",
        variant: "destructive"
      });
      return;
    }
    
    setIsFavorite(!isFavorite);
    toast({
      title: !isFavorite ? "به علاقه‌مندی‌ها اضافه شد" : "از علاقه‌مندی‌ها حذف شد",
      description: !isFavorite 
        ? "این محتوا به لیست علاقه‌مندی‌های شما اضافه شد" 
        : "این محتوا از لیست علاقه‌مندی‌های شما حذف شد"
    });
  };
  
  // Handle play button click
  const handlePlay = () => {
    setShowPlayer(true);
    // Auto-scroll to player
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 100);
  };
  
  // Handle download button click
  const handleDownload = (quality: string) => {
    toast({
      title: "دانلود آغاز شد",
      description: `دانلود نسخه ${quality} با موفقیت آغاز شد`
    });
  };
  
  // Handle comment submission
  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "ابتدا وارد شوید",
        description: "برای ارسال دیدگاه ابتدا وارد حساب کاربری خود شوید",
        variant: "destructive"
      });
      return;
    }
    
    if (!commentText.trim()) {
      toast({
        title: "متن دیدگاه خالی است",
        description: "لطفاً متن دیدگاه خود را وارد کنید",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "دیدگاه ثبت شد",
      description: "دیدگاه شما با موفقیت ثبت شد و پس از تایید نمایش داده خواهد شد"
    });
    
    setCommentText("");
  };
  
  // Handle comment reaction
  const handleCommentReaction = (commentId: number, isLike: boolean) => {
    if (!user) {
      toast({
        title: "ابتدا وارد شوید",
        description: "برای ثبت واکنش ابتدا وارد حساب کاربری خود شوید",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "واکنش ثبت شد",
      description: `رأی شما با موفقیت ثبت شد`
    });
  };
  
  return (
    <>
      <Header />
      
      <main>
        {/* Hero Banner */}
        <div 
          className="relative h-[500px] bg-cover bg-center"
          style={{ 
            backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.9)), url(${mockContent.backdrop})` 
          }}
        >
          <div className="container mx-auto px-4 h-full flex flex-col justify-end pb-8">
            <div className="flex flex-col md:flex-row md:items-end gap-6">
              <div className="w-full max-w-[200px] -mb-20 z-10">
                <img 
                  src={mockContent.poster} 
                  alt={mockContent.title} 
                  className="w-full rounded-lg shadow-lg"
                />
              </div>
              
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-2">
                  <span className="bg-primary/20 text-primary text-xs px-2 py-1 rounded">
                    {mockContent.type === "movie" ? "فیلم" : 
                     mockContent.type === "series" ? "سریال" : 
                     mockContent.type === "animation" ? "انیمیشن" : "مستند"}
                  </span>
                  
                  <span className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="text-yellow-500 font-bold mx-1">{mockContent.imdbRating}</span>
                    <span className="text-xs text-muted-foreground">IMDB</span>
                  </span>
                  
                  <span className="flex items-center text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>{mockContent.year}</span>
                  </span>
                  
                  <span className="flex items-center text-muted-foreground">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{mockContent.duration} دقیقه</span>
                  </span>
                </div>
                
                <h1 className="text-3xl font-bold mb-1">{mockContent.title}</h1>
                <h2 className="text-lg text-muted-foreground mb-4">{mockContent.englishTitle}</h2>
                
                <p className="text-sm text-muted-foreground mb-6 max-w-2xl">
                  {mockContent.description}
                </p>
                
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={handlePlay}
                    className="flex items-center"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    پخش آنلاین
                  </Button>
                  
                  <Select
                    value={selectedQuality}
                    onValueChange={(value) => handleDownload(value)}
                  >
                    <SelectTrigger className="w-[140px] bg-black/40">
                      <Download className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="دانلود" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockQualities.map((quality) => (
                        <SelectItem key={quality.value} value={quality.value}>
                          <span className="flex justify-between w-full">
                            <span>{quality.label}</span>
                            <span className="text-muted-foreground text-xs">{quality.size}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleToggleFavorite}
                    className={isFavorite ? "text-red-500" : ""}
                  >
                    <Heart className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
                  </Button>
                  
                  <Button variant="outline" size="icon">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="container mx-auto px-4 mt-24 mb-12">
          {/* Media Player */}
          {showPlayer && (
            <div className="mb-8 rounded-lg overflow-hidden shadow-lg glass-effect">
              <div className="aspect-video bg-black relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <Film className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="text-xl font-medium mb-2">پخش فیلم پرستیژ</h3>
                    <p className="text-muted-foreground mb-4">در نسخه دمو، ویدیو واقعی بارگذاری نشده است</p>
                    <div className="flex justify-center gap-4">
                      <Button 
                        variant="outline"
                        onClick={() => setShowPlayer(false)}
                      >
                        بستن پلیر
                      </Button>
                      <Button>
                        <Monitor className="h-4 w-4 mr-2" />
                        تماشای تریلر
                      </Button>
                    </div>
                  </div>
                </div>
                
                {/* Uncomment to use actual video player
                <video
                  ref={videoRef}
                  className="w-full h-full object-contain"
                  controls
                  autoPlay
                  poster={mockContent.backdrop}
                >
                  <source src="YOUR_VIDEO_URL" type="video/mp4" />
                  مرورگر شما از پخش ویدیو پشتیبانی نمی‌کند
                </video> */}
              </div>
              
              <div className="p-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold">
                    {mockContent.title} ({mockContent.year})
                  </h3>
                  
                  <div className="flex gap-2">
                    <Select
                      value={selectedQuality}
                      onValueChange={setSelectedQuality}
                    >
                      <SelectTrigger className="w-[100px]">
                        <SelectValue placeholder="کیفیت" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1080p">1080p</SelectItem>
                        <SelectItem value="720p">720p</SelectItem>
                        <SelectItem value="480p">480p</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Button variant="outline" size="sm">
                      <Share2 className="h-4 w-4 mr-2" />
                      اشتراک‌گذاری
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Content Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <Tabs value={selectedTab} onValueChange={(v) => setSelectedTab(v as "info" | "comments")}>
                <TabsList className="w-full mb-6">
                  <TabsTrigger value="info" className="flex-1">
                    <Info className="h-4 w-4 mr-2" />
                    اطلاعات و جزئیات
                  </TabsTrigger>
                  <TabsTrigger value="comments" className="flex-1">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    دیدگاه‌ها
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="info" className="space-y-6">
                  <div className="glass-effect rounded-lg p-6">
                    <h3 className="text-xl font-bold mb-4">درباره فیلم</h3>
                    <p className="text-muted-foreground leading-7">
                      در سال ۱۸۹۰ میلادی در لندن، دو شعبده‌باز حرفه‌ای و رقیب به نام‌های روبرت آنجیر (هیو جکمن) و آلفرد بوردن (کریستین بیل) سعی می‌کنند با ارائه بهترین و خیره‌کننده‌ترین شعبده یکدیگر را شکست دهند. این رقابت حرفه‌ای رفته رفته به دشمنی شخصی و وسواس‌گونه تبدیل می‌شود و هر دو حاضرند برای پیروزی دست به هر کاری بزنند. با ورود نیکولا تسلا (دیوید بووی) و ماشین عجیبش، این رقابت ابعاد خطرناک‌تری به خود می‌گیرد...
                      <br/><br/>
                      پرستیژ یکی از آثار درخشان کریستوفر نولان است که با روایت غیرخطی و پایان غافلگیرکننده، به یکی از محبوب‌ترین فیلم‌های ژانر معمایی تبدیل شده است. فیلم به موضوعات عمیقی همچون وسواس، فداکاری برای هنر و هزینه‌های موفقیت می‌پردازد.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="glass-effect rounded-lg p-6">
                      <h3 className="text-lg font-bold mb-4">مشخصات فیلم</h3>
                      <ul className="space-y-3">
                        <li className="flex justify-between">
                          <span className="text-muted-foreground">کارگردان:</span>
                          <span className="font-medium">{mockContent.director}</span>
                        </li>
                        <li className="flex justify-between">
                          <span className="text-muted-foreground">سال انتشار:</span>
                          <span className="font-medium">{mockContent.year}</span>
                        </li>
                        <li className="flex justify-between">
                          <span className="text-muted-foreground">مدت زمان:</span>
                          <span className="font-medium">{mockContent.duration} دقیقه</span>
                        </li>
                        <li className="flex justify-between">
                          <span className="text-muted-foreground">امتیاز IMDB:</span>
                          <span className="font-medium flex items-center">
                            <Star className="h-4 w-4 text-yellow-500 fill-current mr-1" />
                            {mockContent.imdbRating}
                          </span>
                        </li>
                        <li className="flex justify-between">
                          <span className="text-muted-foreground">ژانر:</span>
                          <span className="font-medium">{mockContent.genres.join('، ')}</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div className="glass-effect rounded-lg p-6">
                      <h3 className="text-lg font-bold mb-4">بازیگران اصلی</h3>
                      <ul className="space-y-3">
                        {mockContent.actors.map((actor, index) => (
                          <li key={index} className="flex items-center">
                            <Avatar className="h-8 w-8 mr-3">
                              <AvatarFallback>{actor.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span>{actor}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  <div className="glass-effect rounded-lg p-6">
                    <h3 className="text-xl font-bold mb-4">تصاویر فیلم</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="aspect-video rounded-lg overflow-hidden">
                        <img 
                          src="https://m.media-amazon.com/images/M/MV5BMjA4NDI0MTIxNF5BMl5BanBnXkFtZTYwNTM0MzY2._V1_.jpg" 
                          alt="تصویر فیلم" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="aspect-video rounded-lg overflow-hidden">
                        <img 
                          src="https://m.media-amazon.com/images/M/MV5BMTY4MzQ3NzQzOV5BMl5BanBnXkFtZTcwNjYwMzc1MQ@@._V1_.jpg" 
                          alt="تصویر فیلم" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="aspect-video rounded-lg overflow-hidden">
                        <img 
                          src="https://m.media-amazon.com/images/M/MV5BMTA4OTczNDExNDNeQTJeQWpwZ15BbWU3MDUyMzM4MzA@._V1_.jpg" 
                          alt="تصویر فیلم" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="comments" className="space-y-6">
                  <div className="glass-effect rounded-lg p-6">
                    <h3 className="text-xl font-bold mb-4">دیدگاه‌ها</h3>
                    
                    {/* Comment Form */}
                    <form onSubmit={handleSubmitComment} className="mb-8">
                      <div className="mb-4">
                        <Textarea
                          placeholder="دیدگاه خود را بنویسید..."
                          className="min-h-[100px]"
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                        />
                      </div>
                      <Button type="submit">ارسال دیدگاه</Button>
                    </form>
                    
                    {/* Comments List */}
                    <div className="space-y-6">
                      {mockComments.map((comment) => (
                        <div key={comment.id} className="border-b border-border pb-6 last:border-0 last:pb-0">
                          <div className="flex items-start gap-3">
                            <Avatar>
                              <AvatarFallback className="bg-primary/20 text-primary">
                                {comment.user.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex justify-between mb-1">
                                <h4 className="font-medium">{comment.user.name}</h4>
                                <span className="text-xs text-muted-foreground">{comment.date}</span>
                              </div>
                              <p className="text-sm text-muted-foreground mb-3">{comment.text}</p>
                              <div className="flex items-center gap-4">
                                <button 
                                  className="flex items-center text-xs text-muted-foreground hover:text-primary"
                                  onClick={() => handleCommentReaction(comment.id, true)}
                                >
                                  <ThumbsUp className="h-4 w-4 mr-1" />
                                  <span>{comment.likes}</span>
                                </button>
                                <button 
                                  className="flex items-center text-xs text-muted-foreground hover:text-primary"
                                  onClick={() => handleCommentReaction(comment.id, false)}
                                >
                                  <ThumbsDown className="h-4 w-4 mr-1" />
                                  <span>{comment.dislikes}</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
            
            <div>
              {/* Sidebar */}
              <div className="space-y-6">
                <div className="glass-effect rounded-lg p-6">
                  <h3 className="text-lg font-bold mb-4">لینک‌های دانلود</h3>
                  <div className="space-y-3">
                    {mockQualities.map((quality) => (
                      <div key={quality.value} className="flex justify-between items-center p-3 bg-black/20 rounded-lg">
                        <div>
                          <span className="text-sm font-medium">{quality.label}</span>
                          <span className="text-xs text-muted-foreground block">{quality.size}</span>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDownload(quality.value)}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          دانلود
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="glass-effect rounded-lg p-6">
                  <h3 className="text-lg font-bold mb-4">فیلم‌های مشابه</h3>
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <img 
                        src="https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_.jpg" 
                        alt="Inception" 
                        className="w-16 h-24 object-cover rounded"
                      />
                      <div>
                        <h4 className="font-medium">تلقین</h4>
                        <p className="text-xs text-muted-foreground">Inception (2010)</p>
                        <div className="flex items-center mt-1">
                          <Star className="h-3 w-3 text-yellow-500 fill-current" />
                          <span className="text-xs mx-1">8.8</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <img 
                        src="https://m.media-amazon.com/images/M/MV5BMTk0MDQ3MzAzOV5BMl5BanBnXkFtZTgwNzU1NzE3MjE@._V1_.jpg" 
                        alt="Interstellar" 
                        className="w-16 h-24 object-cover rounded"
                      />
                      <div>
                        <h4 className="font-medium">در میان ستارگان</h4>
                        <p className="text-xs text-muted-foreground">Interstellar (2014)</p>
                        <div className="flex items-center mt-1">
                          <Star className="h-3 w-3 text-yellow-500 fill-current" />
                          <span className="text-xs mx-1">8.6</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <img 
                        src="https://m.media-amazon.com/images/M/MV5BMTY3OTI5NDczN15BMl5BanBnXkFtZTcwNDA0NDY3Mw@@._V1_.jpg" 
                        alt="Shutter Island" 
                        className="w-16 h-24 object-cover rounded"
                      />
                      <div>
                        <h4 className="font-medium">جزیره شاتر</h4>
                        <p className="text-xs text-muted-foreground">Shutter Island (2010)</p>
                        <div className="flex items-center mt-1">
                          <Star className="h-3 w-3 text-yellow-500 fill-current" />
                          <span className="text-xs mx-1">8.2</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </>
  );
}