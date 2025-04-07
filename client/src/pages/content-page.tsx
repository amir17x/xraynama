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
import { Badge } from "@/components/ui/badge";
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
  Languages,
  Hash,
  Users,
  Globe,
  Shield
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
  const [viewMode, setViewMode] = useState<"trailer" | "details">("details");
  
  // Mock data for demonstration
  const mockContent = {
    id: id,
    title: "پرستیژ",
    englishTitle: "The Prestige",
    description: "دو شعبده‌باز رقیب در لندن اواخر قرن نوزدهم تلاش می‌کنند تا بهترین ترفند را ارائه دهند و در این راه به مبارزه خطرناکی کشیده می‌شوند.",
    fullDescription: "در سال ۱۸۹۰ میلادی در لندن، دو شعبده‌باز حرفه‌ای و رقیب به نام‌های روبرت آنجیر (هیو جکمن) و آلفرد بوردن (کریستین بیل) سعی می‌کنند با ارائه بهترین و خیره‌کننده‌ترین شعبده یکدیگر را شکست دهند. این رقابت حرفه‌ای رفته رفته به دشمنی شخصی و وسواس‌گونه تبدیل می‌شود و هر دو حاضرند برای پیروزی دست به هر کاری بزنند. با ورود نیکولا تسلا (دیوید بووی) و ماشین عجیبش، این رقابت ابعاد خطرناک‌تری به خود می‌گیرد.",
    year: 2006,
    duration: 130,
    type: "movie",
    imdbRating: "8.5",
    director: "کریستوفر نولان",
    actors: ["کریستین بیل", "هیو جکمن", "اسکارلت جوهانسون", "مایکل کین"],
    genres: ["درام", "معمایی", "علمی تخیلی"],
    tags: ["جایزه اسکار", "جنایی", "شعبده‌بازی", "بهترین‌های IMDb"],
    country: "آمریکا، انگلستان",
    languages: "انگلیسی",
    subtitles: ["فارسی", "انگلیسی"],
    ageRating: "+13",
    poster: "https://m.media-amazon.com/images/M/MV5BMjA4NDI0MTIxNF5BMl5BanBnXkFtZTYwNTM0MzY2._V1_.jpg",
    backdrop: "https://m.media-amazon.com/images/M/MV5BMTY4MzQ3NzQzOV5BMl5BanBnXkFtZTcwNjYwMzc1MQ@@._V1_.jpg",
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
    setViewMode("trailer");
    // Auto-scroll to top
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
      
      <main className="bg-black/60 min-h-screen">
        {/* Content Header with Background */}
        <div 
          className="relative bg-cover bg-center"
          style={{ 
            backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.9) 90%), url(${mockContent.backdrop})`,
            backgroundPosition: "top center",
            backgroundSize: "cover"
          }}
        >
          <div className="container mx-auto px-4 pt-6 pb-10">
            {viewMode === "trailer" ? (
              // Video Player Section
              <div className="mt-6 mb-6">
                <div className="aspect-video bg-black/80 rounded-lg relative overflow-hidden shadow-2xl">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center p-6">
                      <Film className="h-16 w-16 mx-auto mb-4 text-primary/50 opacity-70" />
                      <h3 className="text-xl font-medium mb-3 text-white">پخش تریلر فیلم {mockContent.title}</h3>
                      <p className="text-gray-300 mb-6 max-w-md mx-auto">در نسخه دمو، ویدیو واقعی بارگذاری نشده است. این بخش نمایشی از محل قرارگیری پلیر است.</p>
                      <div className="flex justify-center gap-4">
                        <Button 
                          variant="outline"
                          onClick={() => setViewMode("details")}
                        >
                          بازگشت به جزئیات
                        </Button>
                        <Button onClick={() => window.open(mockContent.trailer, "_blank")}>
                          تماشا در یوتیوب
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Video Info Bar */}
                <div className="flex justify-between items-center mt-4 bg-black/30 p-3 rounded-lg">
                  <div className="flex items-center">
                    <img 
                      src={mockContent.poster} 
                      alt={mockContent.title} 
                      className="w-12 h-16 object-cover rounded mr-3"
                    />
                    <div>
                      <h3 className="font-bold text-white">
                        {mockContent.title}
                      </h3>
                      <p className="text-sm text-gray-300">{mockContent.englishTitle} ({mockContent.year})</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleToggleFavorite}
                      className={isFavorite ? "text-red-500" : ""}
                    >
                      <Heart className={`h-4 w-4 mr-1 ${isFavorite ? "fill-current" : ""}`} />
                      علاقه‌مندی‌ها
                    </Button>
                    
                    <Button variant="outline" size="sm">
                      <Share2 className="h-4 w-4 mr-1" />
                      اشتراک‌گذاری
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              // Content Details View
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 py-8">
                {/* Poster Column */}
                <div className="md:col-span-3 order-1 flex flex-col items-center md:items-start">
                  <div className="relative">
                    <img 
                      src={mockContent.poster} 
                      alt={mockContent.title} 
                      className="w-full max-w-[240px] md:max-w-full rounded-lg shadow-2xl"
                    />
                    {mockContent.ageRating && (
                      <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs font-bold flex items-center">
                        <Shield className="h-3 w-3 mr-1" />
                        {mockContent.ageRating}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col w-full max-w-[240px] md:max-w-full gap-3 mt-4">
                    <Button
                      onClick={handlePlay}
                      className="w-full"
                      size="lg"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      پخش تریلر
                    </Button>
                    
                    <Select
                      value={selectedQuality}
                      onValueChange={(value) => handleDownload(value)}
                    >
                      <SelectTrigger className="w-full bg-black/40">
                        <Download className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="دانلود" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockQualities.map((quality) => (
                          <SelectItem key={quality.value} value={quality.value}>
                            <div className="flex justify-between w-full">
                              <span>{quality.label}</span>
                              <span className="text-muted-foreground text-xs">{quality.size}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={handleToggleFavorite}
                      >
                        <Heart className={`h-4 w-4 mr-1 ${isFavorite ? "fill-current text-red-500" : ""}`} />
                        {isFavorite ? "حذف از علاقه‌مندی‌ها" : "افزودن به علاقه‌مندی‌ها"}
                      </Button>
                    </div>
                  </div>
                </div>
                
                {/* Content Details Column */}
                <div className="md:col-span-9 order-2">
                  <div className="flex flex-wrap gap-2 mb-3">
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                      {mockContent.type === "movie" ? "فیلم" : 
                      mockContent.type === "series" ? "سریال" : 
                      mockContent.type === "animation" ? "انیمیشن" : "مستند"}
                    </Badge>
                    
                    <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/30 flex items-center">
                      <Star className="h-3 w-3 fill-current mr-1" />
                      {mockContent.imdbRating} / 10
                    </Badge>
                    
                    <Badge variant="outline" className="bg-black/40">
                      {mockContent.year}
                    </Badge>
                    
                    <Badge variant="outline" className="bg-black/40 flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {mockContent.duration} دقیقه
                    </Badge>
                  </div>
                  
                  <h1 className="text-3xl md:text-4xl font-bold text-white mb-1">{mockContent.title}</h1>
                  <h2 className="text-lg text-gray-300 mb-6">{mockContent.englishTitle}</h2>
                  
                  <div className="prose prose-invert max-w-none mb-8">
                    <p className="text-gray-300 leading-relaxed text-base">
                      {mockContent.fullDescription}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 mb-8 text-sm">
                    <div className="flex">
                      <div className="w-28 text-gray-400">کارگردان:</div>
                      <div className="flex-1 text-white">{mockContent.director}</div>
                    </div>
                    
                    <div className="flex">
                      <div className="w-28 text-gray-400">بازیگران:</div>
                      <div className="flex-1 text-white">{mockContent.actors.join('، ')}</div>
                    </div>
                    
                    <div className="flex">
                      <div className="w-28 text-gray-400">ژانر:</div>
                      <div className="flex-1 text-white">{mockContent.genres.join('، ')}</div>
                    </div>
                    
                    <div className="flex">
                      <div className="w-28 text-gray-400">محصول:</div>
                      <div className="flex-1 text-white flex items-center">
                        <Globe className="h-3.5 w-3.5 mr-1 text-gray-500" />
                        {mockContent.country}
                      </div>
                    </div>
                    
                    <div className="flex">
                      <div className="w-28 text-gray-400">زبان:</div>
                      <div className="flex-1 text-white flex items-center">
                        <Languages className="h-3.5 w-3.5 mr-1 text-gray-500" />
                        {mockContent.languages}
                      </div>
                    </div>
                    
                    <div className="flex">
                      <div className="w-28 text-gray-400">زیرنویس:</div>
                      <div className="flex-1 text-white">{mockContent.subtitles.join('، ')}</div>
                    </div>
                  </div>
                  
                  {/* Tags */}
                  <div className="mb-8">
                    <h3 className="text-sm font-medium text-gray-400 mb-2 flex items-center">
                      <Hash className="h-4 w-4 mr-1" />
                      برچسب‌ها:
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {mockContent.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="bg-black/50 hover:bg-black/70 cursor-pointer">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  {/* Comments Section */}
                  <div className="mt-12 bg-black/50 p-6 rounded-lg">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center">
                      <MessageSquare className="h-5 w-5 mr-2 text-primary" />
                      دیدگاه‌های کاربران
                    </h3>
                    
                    {/* Comment Form */}
                    <form onSubmit={handleSubmitComment} className="mb-8">
                      <div className="mb-4">
                        <Textarea
                          placeholder="دیدگاه خود را درباره این فیلم بنویسید..."
                          className="min-h-[100px] bg-black/40 border-gray-700 focus:border-primary"
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                        />
                      </div>
                      <div className="flex justify-end">
                        <Button type="submit">ارسال دیدگاه</Button>
                      </div>
                    </form>
                    
                    {/* Comments List */}
                    <div className="space-y-6">
                      {mockComments.map((comment) => (
                        <div key={comment.id} className="border-b border-gray-800 pb-6 last:border-0 last:pb-0">
                          <div className="flex items-start gap-3">
                            <Avatar>
                              <AvatarFallback className="bg-primary/20 text-primary">
                                {comment.user.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex justify-between mb-1">
                                <h4 className="font-medium text-white">{comment.user.name}</h4>
                                <span className="text-xs text-gray-500">{comment.date}</span>
                              </div>
                              <p className="text-sm text-gray-300 mb-3">{comment.text}</p>
                              <div className="flex items-center gap-4">
                                <button 
                                  className="flex items-center text-xs text-gray-400 hover:text-primary transition-colors"
                                  onClick={() => handleCommentReaction(comment.id, true)}
                                >
                                  <ThumbsUp className="h-4 w-4 mr-1" />
                                  <span>{comment.likes}</span>
                                </button>
                                <button 
                                  className="flex items-center text-xs text-gray-400 hover:text-primary transition-colors"
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
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Recommended Content Section */}
        <div className="container mx-auto px-4 py-10">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center">
            <Users className="h-5 w-5 mr-2 text-primary" />
            فیلم‌های مشابه که ممکن است دوست داشته باشید
          </h2>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            <div className="group relative">
              <img 
                src="https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_.jpg" 
                alt="Inception" 
                className="w-full aspect-[2/3] object-cover rounded-lg transition-transform group-hover:scale-105 duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                <div className="p-3 w-full">
                  <h3 className="text-white font-medium text-sm">تلقین</h3>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-xs text-gray-300">2010</span>
                    <span className="flex items-center text-yellow-500 text-xs">
                      <Star className="h-3 w-3 fill-current mr-1" />
                      8.8
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="group relative">
              <img 
                src="https://m.media-amazon.com/images/M/MV5BMTk0MDQ3MzAzOV5BMl5BanBnXkFtZTgwNzU1NzE3MjE@._V1_.jpg" 
                alt="Interstellar" 
                className="w-full aspect-[2/3] object-cover rounded-lg transition-transform group-hover:scale-105 duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                <div className="p-3 w-full">
                  <h3 className="text-white font-medium text-sm">در میان ستارگان</h3>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-xs text-gray-300">2014</span>
                    <span className="flex items-center text-yellow-500 text-xs">
                      <Star className="h-3 w-3 fill-current mr-1" />
                      8.6
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="group relative">
              <img 
                src="https://m.media-amazon.com/images/M/MV5BMTY3OTI5NDczN15BMl5BanBnXkFtZTcwNDA0NDY3Mw@@._V1_.jpg" 
                alt="Shutter Island" 
                className="w-full aspect-[2/3] object-cover rounded-lg transition-transform group-hover:scale-105 duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                <div className="p-3 w-full">
                  <h3 className="text-white font-medium text-sm">جزیره شاتر</h3>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-xs text-gray-300">2010</span>
                    <span className="flex items-center text-yellow-500 text-xs">
                      <Star className="h-3 w-3 fill-current mr-1" />
                      8.2
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="group relative">
              <img 
                src="https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_.jpg" 
                alt="The Dark Knight" 
                className="w-full aspect-[2/3] object-cover rounded-lg transition-transform group-hover:scale-105 duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                <div className="p-3 w-full">
                  <h3 className="text-white font-medium text-sm">شوالیه تاریکی</h3>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-xs text-gray-300">2008</span>
                    <span className="flex items-center text-yellow-500 text-xs">
                      <Star className="h-3 w-3 fill-current mr-1" />
                      9.0
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="group relative">
              <img 
                src="https://m.media-amazon.com/images/M/MV5BMTQ2ODFlMDAtNzdhOC00ZDYzLWE3YTMtNDU4ZGFmZmJmYTczXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_.jpg" 
                alt="Memento" 
                className="w-full aspect-[2/3] object-cover rounded-lg transition-transform group-hover:scale-105 duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                <div className="p-3 w-full">
                  <h3 className="text-white font-medium text-sm">یادگاری</h3>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-xs text-gray-300">2000</span>
                    <span className="flex items-center text-yellow-500 text-xs">
                      <Star className="h-3 w-3 fill-current mr-1" />
                      8.4
                    </span>
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