import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Content } from "@shared/schema";
import { ContentType } from "@/types";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { 
  Textarea 
} from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import VideoPlayer from "@/components/ui/video-player";
import {
  Film,
  Download,
  Play,
  Heart,
  Users,
  Star,
  MessageSquare,
  User,
  Calendar,
  Clock,
  ThumbsUp,
  ThumbsDown,
  Info,
  FilmIcon,
  Mic,
  Languages,
  MapPin,
  Award,
  Tags,
  FileText,
  Eye,
  Settings
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Breadcrumb } from "@/components/ui/breadcrumb";

interface ContentDetailsPageProps {}

const ContentDetailsPage: React.FC<ContentDetailsPageProps> = () => {
  const { id } = useParams();
  const [location, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedSeason, setSelectedSeason] = useState<number>(1);
  const [selectedEpisode, setSelectedEpisode] = useState<any | null>(null);
  const [showPlayer, setShowPlayer] = useState(false);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [reviewText, setReviewText] = useState("");
  const [commentText, setCommentText] = useState("");
  
  // Parse the content ID from URL (support both number and string IDs)
  const contentId = id;
  
  // Check if URL has action parameter
  const searchParams = new URLSearchParams(window.location.search);
  const action = searchParams.get("action");
  
  // Fetch content details
  const { 
    data: content, 
    isLoading: contentLoading,
    error: contentError
  } = useQuery<ContentType>({
    queryKey: [`/api/content/${contentId}`],
  });
  
  // Fetch quality sources
  const { 
    data: sources = [],
    isLoading: sourcesLoading
  } = useQuery<any[]>({
    queryKey: [`/api/content/${contentId}/sources`],
    enabled: !!content
  });
  
  // Fetch episodes if it's a series
  const { 
    data: episodes = [],
    isLoading: episodesLoading
  } = useQuery<any[]>({
    queryKey: [`/api/content/${contentId}/episodes`],
    enabled: !!content && content.type === "series"
  });
  
  // Fetch ratings
  const { 
    data: ratingsData,
    isLoading: ratingsLoading
  } = useQuery({
    queryKey: [`/api/content/${contentId}/ratings`],
    enabled: !!content
  });
  
  // Fetch reviews
  const { 
    data: reviews = [],
    isLoading: reviewsLoading
  } = useQuery({
    queryKey: [`/api/content/${contentId}/reviews`],
    enabled: !!content
  });
  
  // Fetch comments
  const { 
    data: comments = [],
    isLoading: commentsLoading
  } = useQuery({
    queryKey: [`/api/content/${contentId}/comments`],
    enabled: !!content
  });
  
  // Check if content is in favorites
  const { 
    data: favorites = [],
    isLoading: favoritesLoading
  } = useQuery({
    queryKey: ["/api/favorites"],
    enabled: !!user && !!content
  });
  
  const isFavorite = favorites.some((fav: any) => fav.contentId === contentId);
  
  // Add/remove favorite mutation
  const toggleFavoriteMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("لطفا ابتدا وارد شوید");
      
      if (isFavorite) {
        await apiRequest({ method: "DELETE", url: `/api/content/${contentId}/favorites` });
        return { action: "removed" };
      } else {
        await apiRequest({ method: "POST", url: `/api/content/${contentId}/favorites` });
        return { action: "added" };
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
      
      toast({
        title: data.action === "added" ? "به علاقه‌مندی‌ها اضافه شد" : "از علاقه‌مندی‌ها حذف شد",
        description: data.action === "added" 
          ? "محتوا به لیست علاقه‌مندی‌های شما اضافه شد" 
          : "محتوا از لیست علاقه‌مندی‌های شما حذف شد",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "خطا",
        description: error.message,
        variant: "destructive",
      });
      
      // If not logged in, redirect to auth page
      if (error.message.includes("وارد شوید")) {
        navigate("/auth");
      }
    }
  });
  
  // Submit rating mutation
  const submitRatingMutation = useMutation({
    mutationFn: async (rating: number) => {
      if (!user) throw new Error("لطفا ابتدا وارد شوید");
      
      await apiRequest({ method: "POST", url: `/api/content/${contentId}/ratings`, data: { rating } });
      return { rating };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/content/${contentId}/ratings`] });
      
      toast({
        title: "امتیاز ثبت شد",
        description: "با تشکر از ثبت امتیاز شما",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "خطا در ثبت امتیاز",
        description: error.message,
        variant: "destructive",
      });
      
      if (error.message.includes("وارد شوید")) {
        navigate("/auth");
      }
    }
  });
  
  // Submit review mutation
  const submitReviewMutation = useMutation({
    mutationFn: async (text: string) => {
      if (!user) throw new Error("لطفا ابتدا وارد شوید");
      if (!text.trim()) throw new Error("متن نقد نمی‌تواند خالی باشد");
      
      await apiRequest({ method: "POST", url: `/api/content/${contentId}/reviews`, data: { text } });
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/content/${contentId}/reviews`] });
      setReviewText("");
      
      toast({
        title: "نقد ثبت شد",
        description: "نقد شما پس از تایید نمایش داده خواهد شد",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "خطا در ثبت نقد",
        description: error.message,
        variant: "destructive",
      });
      
      if (error.message.includes("وارد شوید")) {
        navigate("/auth");
      }
    }
  });
  
  // Submit comment mutation
  const submitCommentMutation = useMutation({
    mutationFn: async (text: string) => {
      if (!user) throw new Error("لطفا ابتدا وارد شوید");
      if (!text.trim()) throw new Error("متن کامنت نمی‌تواند خالی باشد");
      
      await apiRequest({ method: "POST", url: `/api/content/${contentId}/comments`, data: { text } });
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/content/${contentId}/comments`] });
      setCommentText("");
      
      toast({
        title: "کامنت ثبت شد",
        description: "کامنت شما پس از تایید نمایش داده خواهد شد",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "خطا در ثبت کامنت",
        description: error.message,
        variant: "destructive",
      });
      
      if (error.message.includes("وارد شوید")) {
        navigate("/auth");
      }
    }
  });
  
  // Watch Progress mutation
  const updateWatchProgressMutation = useMutation({
    mutationFn: async (data: { progress: number, completed: boolean }) => {
      if (!user) return; // Silently fail
      
      await apiRequest({ method: "POST", url: "/api/watch-progress", data: {
        contentId,
        episodeId: selectedEpisode?.id || null,
        progress: data.progress,
        completed: data.completed
      }});
    }
  });
  
  // Handle episode selection
  useEffect(() => {
    if (episodes.length > 0 && content?.type === "series") {
      // Find episodes for selected season
      const seasonEpisodes = episodes.filter(ep => ep.season === selectedSeason);
      if (seasonEpisodes.length > 0) {
        setSelectedEpisode(seasonEpisodes[0]);
      }
    }
  }, [episodes, selectedSeason, content]);
  
  // Handle play action from URL
  useEffect(() => {
    if (action === "play" && content) {
      setShowPlayer(true);
    }
  }, [action, content]);
  
  // Create watch party
  const handleCreateWatchParty = async () => {
    if (!user) {
      toast({
        title: "ابتدا وارد شوید",
        description: "برای ایجاد تماشای گروهی نیاز به حساب کاربری است",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }
    
    try {
      const res = await apiRequest({ method: "POST", url: "/api/watch-parties", data: {
        contentId,
        episodeId: selectedEpisode?.id || null
      }});
      navigate(`/watch-party/${res.partyCode}`);
    } catch (error) {
      toast({
        title: "خطا در ایجاد تماشای گروهی",
        description: "لطفاً دوباره تلاش کنید",
        variant: "destructive",
      });
    }
  };
  
  // Handle video progress
  const handleVideoProgress = (progress: number) => {
    // Update progress every 30 seconds or when progress is significant
    updateWatchProgressMutation.mutate({
      progress,
      completed: false
    });
  };
  
  // Handle video complete
  const handleVideoComplete = () => {
    updateWatchProgressMutation.mutate({
      progress: content?.duration || 0,
      completed: true
    });
    
    toast({
      title: "تماشای محتوا به پایان رسید",
      description: "امتیاز تماشا به حساب شما اضافه شد"
    });
  };
  
  // Format timestamp
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fa-IR').format(date);
  };
  
  // Handle like/dislike review
  const handleReviewLike = async (reviewId: number, isLike: boolean) => {
    if (!user) {
      toast({
        title: "ابتدا وارد شوید",
        description: "برای ثبت نظر نیاز به حساب کاربری است",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }
    
    try {
      await apiRequest({ method: "POST", url: `/api/reviews/${reviewId}/${isLike ? 'like' : 'dislike'}` });
      queryClient.invalidateQueries({ queryKey: [`/api/content/${contentId}/reviews`] });
    } catch (error) {
      toast({
        title: "خطا",
        description: "مشکلی در ثبت نظر به وجود آمد",
        variant: "destructive",
      });
    }
  };
  
  // Error state
  if (contentError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="error-container">
          <h2 className="heading-2">خطا در بارگذاری اطلاعات</h2>
          <p className="body-text-sm mb-4">محتوای مورد نظر یافت نشد یا مشکلی در بارگذاری اطلاعات به وجود آمده است.</p>
          <Button onClick={() => navigate("/")}>بازگشت به صفحه اصلی</Button>
        </div>
      </div>
    );
  }
  
  // Loading state
  if (contentLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8 animate-pulse">
          <div className="w-full md:w-1/3 lg:w-1/4">
            <div className="bg-card/30 rounded-lg aspect-[2/3]"></div>
          </div>
          <div className="w-full md:w-2/3 lg:w-3/4 space-y-4">
            <Skeleton className="h-10 w-2/3" />
            <Skeleton className="h-6 w-1/2" />
            <div className="flex gap-2 flex-wrap">
              {[1, 2, 3, 4].map(i => (
                <Skeleton key={i} className="h-6 w-20 rounded-md" />
              ))}
            </div>
            <Skeleton className="h-32 w-full" />
            <div className="flex gap-2">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-10 w-28 rounded-md" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!content) {
    return null;
  }
  
  const contentType = {
    movie: "فیلم",
    series: "سریال",
    animation: "انیمیشن",
    documentary: "مستند"
  }[content.type] || content.type;
  
  // Format IMDB rating with proper styling
  const getRatingColorClass = (rating: string | number): string => {
    const numRating = typeof rating === 'string' ? parseFloat(rating) : rating;
    if (numRating >= 8) return 'text-green-500';
    if (numRating >= 6) return 'text-yellow-500';
    return 'text-red-500';
  };
  
  // Get unique seasons from episodes
  const seasons = Array.from(new Set(episodes.map((ep: any) => ep.season))).sort();
  
  // Filter episodes by selected season
  const seasonEpisodes = episodes.filter((ep: any) => ep.season === selectedSeason);
  
  // Get sources for selected episode or content
  const currentSources = selectedEpisode
    ? sources.filter((s: any) => s.episodeId === selectedEpisode.id)
    : sources.filter((s: any) => !s.episodeId);
  
  // Get download links
  const downloadSources = currentSources.filter((s: any) => s.type === "download") || [];
  
  // Get stream sources
  const streamSources = currentSources.filter((s: any) => s.type === "stream") || [];
  
  // Format genres with pill badges
  const genres = content.genres ? (
    Array.isArray(content.genres) ? content.genres : []
  ) : [];
  
  // Prepare breadcrumb items based on content type
  const breadcrumbItems = [
    { label: "خانه", href: "/" },
    { label: contentType, href: `/browse/${content.type}` },
    { label: content.title }
  ];

  return (
    <div className="relative">
      <div className="container mx-auto px-4 py-2">
        <Breadcrumb items={breadcrumbItems} />
      </div>
      
      <div className="container mx-auto px-4 py-6">
      {/* Backdrop image with gradient overlay */}
      {content.backdrop && (
        <div 
          className="content-backdrop-animate fixed inset-0 w-full h-full bg-cover bg-center -z-10 opacity-25"
          style={{ backgroundImage: `url(${content.backdrop})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/95 to-background/80"></div>
        </div>
      )}
      
      {/* Content Header Section - Main content layout */}
      <div className="flex flex-col lg:flex-row gap-8 mb-8">
        {/* Left Column - Poster and Actions */}
        <div className="w-full lg:w-1/3 xl:w-1/4 space-y-6">
          {/* Poster with effects */}
          <div className="content-poster-animate relative group rounded-xl overflow-hidden shadow-xl border border-border/40 bg-gradient-to-b from-black/5 to-black/20">
            <img 
              src={content.poster} 
              alt={content.title}
              className="w-full h-auto object-cover transform transition-all duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/70 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
            
            {/* Watch/Trailer buttons on hover */}
            <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 gap-4">
              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary/90 text-white px-8 shadow-lg hover:shadow-primary/25 hover:scale-105 transition-all duration-300"
                onClick={() => setShowPlayer(true)}
              >
                <Play className="mr-2 h-5 w-5 fill-current" /> 
                پخش
              </Button>
              
              {content.trailer && (
                <Button 
                  variant="outline" 
                  className="bg-black/50 hover:bg-black/70 backdrop-blur-md border-white/10 text-white px-6"
                >
                  <Eye className="mr-2 h-5 w-5" /> 
                  تریلر
                </Button>
              )}
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            <Button 
              className="bg-primary hover:bg-primary/90 text-white font-medium h-12 hover:shadow-lg hover:shadow-primary/25"
              onClick={() => setShowPlayer(true)}
            >
              <Play className="mr-2 h-5 w-5 fill-current" /> 
              پخش آنلاین
            </Button>
            
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1 border-border hover:border-[#006bd6]/30 hover:text-[#006bd6] hover:bg-[#006bd6]/10"
                onClick={handleCreateWatchParty}
              >
                <Users className="mr-2 h-4 w-4" /> 
                تماشای گروهی
              </Button>
              
              <Button 
                variant="outline"
                className={cn(
                  "w-12 flex-shrink-0 border-border",
                  isFavorite 
                    ? "bg-[#006bd6]/10 border-[#006bd6]/30 text-[#006bd6]" 
                    : "hover:border-[#006bd6]/30 hover:text-[#006bd6] hover:bg-[#006bd6]/10"
                )}
                onClick={() => toggleFavoriteMutation.mutate()}
                disabled={toggleFavoriteMutation.isPending}
              >
                <Heart className={cn("h-5 w-5", isFavorite && "fill-[#006bd6]")} />
              </Button>
            </div>
          </div>
          
          {/* IMDb Rating Card */}
          <div className="card-container-glass flex items-center justify-between p-4">
            <div className="flex items-center">
              <div className="bg-[#F5C518] text-black font-bold py-1 px-2 rounded flex items-center">
                <Star className="h-4 w-4 fill-black mr-1" />
                <span>{content.imdbRating || "N/A"}</span>
              </div>
              <span className="text-sm text-muted-foreground mr-2">
                IMDb
              </span>
            </div>
            
            {ratingsData?.count > 0 && (
              <div className="flex items-center">
                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                <span className="mr-1 font-medium">{ratingsData?.average?.toFixed(1)}</span>
                <span className="text-xs text-muted-foreground">
                  ({ratingsData?.count} رأی)
                </span>
              </div>
            )}
          </div>
          
          {/* Download Section */}
          {downloadSources.length > 0 && (
            <div className="card-container-glass">
              <h3 className="text-lg font-bold mb-4 flex items-center">
                <Download className="h-5 w-5 ml-2 text-[#006bd6]" />
                دانلود {contentType}
              </h3>
              
              <Accordion type="single" collapsible className="border-none">
                {downloadSources.map((source: any, idx: number) => (
                  <AccordionItem key={idx} value={`download-${idx}`} className="border-b border-border/50">
                    <AccordionTrigger className="py-3 hover:text-[#006bd6]">
                      <div className="flex items-center gap-2">
                        <span className="bg-[#006bd6]/10 text-[#006bd6] text-xs rounded-md px-2 py-0.5">
                          {source.quality}
                        </span>
                        <span>{source.hasPersianDubbing ? 'دوبله فارسی' : 'زبان اصلی'}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3 py-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">حجم فایل:</span>
                          <span className="font-medium">{source.size ? `${source.size} مگابایت` : '—'}</span>
                        </div>
                        
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">زیرنویس:</span>
                          <span className="font-medium">{source.hasPersianSubtitle ? 'فارسی' : 'ندارد'}</span>
                        </div>
                        
                        <Button className="w-full mt-2" asChild>
                          <a href={source.downloadUrl} target="_blank" rel="noopener noreferrer">
                            <Download className="h-4 w-4 ml-2" />
                            دانلود مستقیم
                          </a>
                        </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          )}
        </div>
        
        {/* Right Column - Content Details */}
        <div className="content-details-animate w-full lg:w-2/3 xl:w-3/4 space-y-6">
          {/* Content Title and Badges */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Badge variant="secondary" className={cn(
                "font-medium",
                content.type === "movie" ? "bg-primary/20 text-primary border-primary/30" :
                content.type === "series" ? "bg-accent/20 text-accent border-accent/30" :
                content.type === "animation" ? "bg-purple-500/20 text-purple-500 border-purple-500/30" :
                "bg-green-600/20 text-green-600 border-green-600/30"
              )}>
                {contentType}
              </Badge>
              
              <Badge variant="outline" className="border-yellow-500/30 text-yellow-500">
                {content.year}
              </Badge>
              
              {content.duration && (
                <Badge variant="outline" className="border-blue-400/30 text-blue-400">
                  <Clock className="h-3 w-3 ml-1" />
                  {content.duration} دقیقه
                </Badge>
              )}
              
              {content.hasPersianDubbing && (
                <Badge variant="outline" className="border-green-500/30 text-green-500">
                  <Mic className="h-3 w-3 ml-1" />
                  دوبله فارسی
                </Badge>
              )}
              
              {content.hasPersianSubtitle && (
                <Badge variant="outline" className="border-blue-500/30 text-blue-500">
                  <FileText className="h-3 w-3 ml-1" />
                  زیرنویس فارسی
                </Badge>
              )}
            </div>
            
            <h1 className="heading-1 mb-1">{content.title}</h1>
            <h2 className="subtitle text-muted-foreground">{content.englishTitle}</h2>
            
            {/* Genres pills */}
            {genres.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {genres.map((genre: any, index: number) => (
                  <span key={index} className="bg-muted px-3 py-1 text-sm rounded-full text-foreground hover:bg-[#006bd6]/10 hover:text-[#006bd6] cursor-pointer transition-colors duration-300">
                    {typeof genre === 'string' ? genre : genre.name}
                  </span>
                ))}
              </div>
            )}
          </div>
          
          {/* Content Description */}
          <div className="content-info-animate">
            <p className="body-text">{content.description}</p>
            {content.fullDescription && (
              <p className="mt-4 body-text">{content.fullDescription}</p>
            )}
          </div>
          
          {/* Technical Information */}
          <div className="content-info-animate delay-100 grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6 card-container-glass">
            {content.director && (
              <div className="flex">
                <div className="w-10 flex-shrink-0 flex items-start justify-center">
                  <FilmIcon className="h-5 w-5 text-[#006bd6]" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">کارگردان</h4>
                  <p className="text-foreground">{content.director}</p>
                </div>
              </div>
            )}
            
            {content.actors && content.actors.length > 0 && (
              <div className="flex">
                <div className="w-10 flex-shrink-0 flex items-start justify-center">
                  <User className="h-5 w-5 text-[#006bd6]" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">بازیگران</h4>
                  <p className="text-foreground">{Array.isArray(content.actors) ? content.actors.join('، ') : content.actors}</p>
                </div>
              </div>
            )}
            
            {content.languages && (
              <div className="flex">
                <div className="w-10 flex-shrink-0 flex items-start justify-center">
                  <Languages className="h-5 w-5 text-[#006bd6]" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">زبان</h4>
                  <p className="text-foreground">{content.languages}</p>
                </div>
              </div>
            )}
            
            {content.country && (
              <div className="flex">
                <div className="w-10 flex-shrink-0 flex items-start justify-center">
                  <MapPin className="h-5 w-5 text-[#006bd6]" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">کشور</h4>
                  <p className="text-foreground">{content.country}</p>
                </div>
              </div>
            )}
            
            {content.awards && (
              <div className="flex">
                <div className="w-10 flex-shrink-0 flex items-start justify-center">
                  <Award className="h-5 w-5 text-[#006bd6]" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">جوایز</h4>
                  <p className="text-foreground">{content.awards}</p>
                </div>
              </div>
            )}
            
            {content.tags && content.tags.length > 0 && (
              <div className="flex">
                <div className="w-10 flex-shrink-0 flex items-start justify-center">
                  <Tags className="h-5 w-5 text-[#006bd6]" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">برچسب‌ها</h4>
                  <p className="text-foreground">{Array.isArray(content.tags) ? content.tags.join('، ') : content.tags}</p>
                </div>
              </div>
            )}
          </div>
          
          {/* Streaming and Episodes Section */}
          <div className="content-info-animate delay-200">
            <Tabs defaultValue="stream" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="stream">پخش آنلاین</TabsTrigger>
                {content.type === "series" && (
                  <TabsTrigger value="episodes">قسمت‌ها</TabsTrigger>
                )}
                <TabsTrigger value="reviews">نقد و بررسی</TabsTrigger>
                <TabsTrigger value="comments">نظرات کاربران</TabsTrigger>
              </TabsList>
              
              {/* Stream Tab */}
              <TabsContent value="stream" className="mt-0">
                {showPlayer ? (
                  <div className="aspect-video bg-black/50 rounded-lg overflow-hidden">
                    {streamSources.length > 0 ? (
                      <VideoPlayer 
                        url={streamSources[0].streamUrl} 
                        poster={content.backdrop || content.poster}
                        onProgress={handleVideoProgress}
                        onComplete={handleVideoComplete}
                        title={content.title}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full">
                        <p className="text-lg font-medium mb-4">منبع پخش در دسترس نیست</p>
                        <Button 
                          variant="outline" 
                          onClick={() => setShowPlayer(false)}
                        >
                          بازگشت
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="aspect-video bg-card/30 rounded-lg overflow-hidden relative group">
                    <img 
                      src={content.backdrop || content.poster} 
                      alt={content.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex items-center justify-center">
                      <Button 
                        size="lg" 
                        className="bg-primary/90 hover:bg-primary text-white hover:scale-110 transition-all duration-300 shadow-xl"
                        onClick={() => setShowPlayer(true)}
                      >
                        <Play className="h-6 w-6 mr-2 fill-current" />
                        پخش آنلاین
                      </Button>
                    </div>
                  </div>
                )}
                
                {streamSources.length > 1 && (
                  <div className="mt-4 card-container-glass">
                    <h3 className="text-lg font-bold mb-3 flex items-center">
                      <Settings className="h-5 w-5 ml-2 text-[#006bd6]" />
                      کیفیت پخش
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {streamSources.map((source: any, idx: number) => (
                        <Button
                          key={idx}
                          variant="outline"
                          className={`bg-card/60 hover:bg-card border-border ${idx === 0 ? 'border-[#006bd6] text-[#006bd6]' : ''}`}
                          size="sm"
                        >
                          {source.quality}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>
              
              {/* Episodes Tab */}
              {content.type === "series" && (
                <TabsContent value="episodes" className="mt-0">
                  <div className="card-container-glass">
                    {/* Season Selector */}
                    {seasons.length > 0 && (
                      <div className="mb-4">
                        <h3 className="text-lg font-bold mb-3">انتخاب فصل</h3>
                        <div className="flex flex-wrap gap-2">
                          {seasons.map(season => (
                            <Button
                              key={season}
                              variant="outline"
                              className={`${selectedSeason === season ? 'bg-primary/10 border-primary text-primary' : 'bg-card/60'}`}
                              onClick={() => setSelectedSeason(season)}
                            >
                              فصل {season}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Episodes List */}
                    {seasonEpisodes.length > 0 ? (
                      <div className="space-y-4">
                        <h3 className="text-lg font-bold">قسمت‌ها</h3>
                        <div className="grid grid-cols-1 gap-4">
                          {seasonEpisodes.map((episode: any) => (
                            <div 
                              key={episode.id} 
                              className={`flex flex-col md:flex-row gap-4 p-3 rounded-lg transition-all duration-300 hover:bg-[#006bd6]/5 cursor-pointer border border-border/50 ${selectedEpisode?.id === episode.id ? 'bg-[#006bd6]/10 border-[#006bd6]/30' : ''}`}
                              onClick={() => setSelectedEpisode(episode)}
                            >
                              <div className="flex-shrink-0 w-full md:w-44 aspect-video rounded-md overflow-hidden bg-card/30">
                                <img 
                                  src={episode.thumbnail || content.backdrop || content.poster} 
                                  alt={episode.title}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              
                              <div className="flex flex-col flex-1">
                                <div className="flex justify-between items-start">
                                  <h4 className="font-bold">{episode.title}</h4>
                                  <Badge variant="outline">
                                    قسمت {episode.episodeNumber}
                                  </Badge>
                                </div>
                                
                                {episode.description && (
                                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                    {episode.description}
                                  </p>
                                )}
                                
                                <div className="mt-auto pt-2 flex items-center gap-4 text-sm">
                                  <div className="flex items-center text-muted-foreground">
                                    <Clock className="h-4 w-4 ml-1" />
                                    {episode.duration} دقیقه
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center p-8 text-muted-foreground">
                        هیچ قسمتی برای این فصل وجود ندارد.
                      </div>
                    )}
                  </div>
                </TabsContent>
              )}
              
              {/* Reviews Tab */}
              <TabsContent value="reviews" className="mt-0">
                <div className="card-container-glass">
                  <h3 className="text-lg font-bold mb-4">نقد و بررسی</h3>
                  
                  {/* Submit Review Form */}
                  {user && (
                    <div className="mb-6">
                      <Textarea
                        placeholder="نقد خود را بنویسید..."
                        className="w-full mb-2"
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                      />
                      <Button 
                        className="w-full md:w-auto"
                        onClick={() => submitReviewMutation.mutate(reviewText)}
                        disabled={submitReviewMutation.isPending || !reviewText.trim()}
                      >
                        {submitReviewMutation.isPending ? 'در حال ارسال...' : 'ارسال نقد'}
                      </Button>
                    </div>
                  )}
                  
                  {/* Reviews List */}
                  {reviewsLoading ? (
                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex gap-4 animate-pulse">
                          <Skeleton className="h-10 w-10 rounded-full" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-1/4" />
                            <Skeleton className="h-16 w-full" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : reviews.length > 0 ? (
                    <div className="space-y-6">
                      {reviews.map((review: any) => (
                        <div key={review.id} className="border-b border-border pb-6 last:border-0">
                          <div className="flex items-start gap-3 mb-2">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={review.user?.avatar} />
                              <AvatarFallback>{review.user?.name?.charAt(0) || review.user?.username?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            
                            <div className="flex-1">
                              <div className="flex justify-between items-center">
                                <h4 className="font-bold">{review.user?.name || review.user?.username || 'کاربر'}</h4>
                                <span className="text-xs text-muted-foreground">
                                  {formatDate(review.createdAt)}
                                </span>
                              </div>
                              
                              <p className="mt-2 text-foreground">{review.text}</p>
                              
                              <div className="flex items-center gap-4 mt-3">
                                <button 
                                  className="flex items-center text-sm text-muted-foreground hover:text-[#006bd6]"
                                  onClick={() => handleReviewLike(review.id, true)}
                                >
                                  <ThumbsUp className="h-4 w-4 ml-1" />
                                  {review.likes || 0}
                                </button>
                                
                                <button 
                                  className="flex items-center text-sm text-muted-foreground hover:text-[#006bd6]"
                                  onClick={() => handleReviewLike(review.id, false)}
                                >
                                  <ThumbsDown className="h-4 w-4 ml-1" />
                                  {review.dislikes || 0}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-4 text-muted-foreground">
                      هنوز نقدی برای این محتوا ثبت نشده است.
                    </div>
                  )}
                </div>
              </TabsContent>
              
              {/* Comments Tab */}
              <TabsContent value="comments" className="mt-0">
                <div className="card-container-glass">
                  <h3 className="text-lg font-bold mb-4">نظرات کاربران</h3>
                  
                  {/* Submit Comment Form */}
                  {user && (
                    <div className="mb-6">
                      <Textarea
                        placeholder="نظر خود را بنویسید..."
                        className="w-full mb-2"
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                      />
                      <Button 
                        className="w-full md:w-auto"
                        onClick={() => submitCommentMutation.mutate(commentText)}
                        disabled={submitCommentMutation.isPending || !commentText.trim()}
                      >
                        {submitCommentMutation.isPending ? 'در حال ارسال...' : 'ارسال نظر'}
                      </Button>
                    </div>
                  )}
                  
                  {/* Comments List */}
                  {commentsLoading ? (
                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex gap-4 animate-pulse">
                          <Skeleton className="h-10 w-10 rounded-full" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-1/4" />
                            <Skeleton className="h-10 w-full" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : comments.length > 0 ? (
                    <div className="space-y-6">
                      {comments.map((comment: any) => (
                        <div key={comment.id} className="border-b border-border pb-6 last:border-0">
                          <div className="flex items-start gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={comment.user?.avatar} />
                              <AvatarFallback>{comment.user?.name?.charAt(0) || comment.user?.username?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            
                            <div className="flex-1">
                              <div className="flex justify-between items-center">
                                <h4 className="font-bold">{comment.user?.name || comment.user?.username || 'کاربر'}</h4>
                                <span className="text-xs text-muted-foreground">
                                  {formatDate(comment.createdAt)}
                                </span>
                              </div>
                              
                              <p className="mt-2 text-foreground">{comment.text}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-4 text-muted-foreground">
                      هنوز نظری برای این محتوا ثبت نشده است.
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentDetailsPage;