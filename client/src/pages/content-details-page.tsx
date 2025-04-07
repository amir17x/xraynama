import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Content, QualitySource, Episode } from "@shared/schema";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
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
  Info
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

interface ContentDetailsPageProps {}

const ContentDetailsPage: React.FC<ContentDetailsPageProps> = () => {
  const { id } = useParams();
  const [location, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedSeason, setSelectedSeason] = useState<number>(1);
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);
  const [showPlayer, setShowPlayer] = useState(false);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [reviewText, setReviewText] = useState("");
  const [commentText, setCommentText] = useState("");
  
  // Parse the content ID from URL
  const contentId = parseInt(id);
  
  // Check if URL has action parameter
  const searchParams = new URLSearchParams(window.location.search);
  const action = searchParams.get("action");
  
  // Fetch content details
  const { 
    data: content, 
    isLoading: contentLoading,
    error: contentError
  } = useQuery<Content>({
    queryKey: [`/api/contents/${contentId}`],
    queryFn: async () => {
      const res = await fetch(`/api/contents/${contentId}`);
      if (!res.ok) throw new Error("Failed to fetch content details");
      return await res.json();
    }
  });
  
  // Fetch quality sources
  const { 
    data: sources = [],
    isLoading: sourcesLoading
  } = useQuery<QualitySource[]>({
    queryKey: [`/api/contents/${contentId}/sources`],
    queryFn: async () => {
      const res = await fetch(`/api/contents/${contentId}/sources`);
      if (!res.ok) throw new Error("Failed to fetch sources");
      return await res.json();
    }
  });
  
  // Fetch episodes if it's a series
  const { 
    data: episodes = [],
    isLoading: episodesLoading
  } = useQuery<Episode[]>({
    queryKey: [`/api/contents/${contentId}/episodes`],
    queryFn: async () => {
      const res = await fetch(`/api/contents/${contentId}/episodes`);
      if (!res.ok) throw new Error("Failed to fetch episodes");
      return await res.json();
    },
    enabled: content?.type === "series"
  });
  
  // Fetch ratings
  const { 
    data: ratingsData,
    isLoading: ratingsLoading
  } = useQuery({
    queryKey: [`/api/contents/${contentId}/ratings`],
    queryFn: async () => {
      const res = await fetch(`/api/contents/${contentId}/ratings`);
      if (!res.ok) throw new Error("Failed to fetch ratings");
      return await res.json();
    }
  });
  
  // Fetch reviews
  const { 
    data: reviews = [],
    isLoading: reviewsLoading
  } = useQuery({
    queryKey: [`/api/contents/${contentId}/reviews`],
    queryFn: async () => {
      const res = await fetch(`/api/contents/${contentId}/reviews`);
      if (!res.ok) throw new Error("Failed to fetch reviews");
      return await res.json();
    }
  });
  
  // Fetch comments
  const { 
    data: comments = [],
    isLoading: commentsLoading
  } = useQuery({
    queryKey: [`/api/contents/${contentId}/comments`],
    queryFn: async () => {
      const res = await fetch(`/api/contents/${contentId}/comments`);
      if (!res.ok) throw new Error("Failed to fetch comments");
      return await res.json();
    }
  });
  
  // Check if content is in favorites
  const { 
    data: favorites = [],
    isLoading: favoritesLoading
  } = useQuery({
    queryKey: ["/api/favorites"],
    queryFn: async () => {
      if (!user) return [];
      const res = await fetch("/api/favorites");
      if (!res.ok) throw new Error("Failed to fetch favorites");
      return await res.json();
    },
    enabled: !!user
  });
  
  const isFavorite = favorites.some((fav: any) => fav.contentId === contentId);
  
  // Add/remove favorite mutation
  const toggleFavoriteMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Please login first");
      
      if (isFavorite) {
        await apiRequest("DELETE", `/api/favorites/${contentId}`);
        return { action: "removed" };
      } else {
        await apiRequest("POST", `/api/favorites/${contentId}`);
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
      if (error.message.includes("login")) {
        navigate("/auth");
      }
    }
  });
  
  // Submit rating mutation
  const submitRatingMutation = useMutation({
    mutationFn: async (rating: number) => {
      if (!user) throw new Error("Please login first");
      
      await apiRequest("POST", `/api/contents/${contentId}/ratings`, {
        rating
      });
      return { rating };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/contents/${contentId}/ratings`] });
      
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
      
      if (error.message.includes("login")) {
        navigate("/auth");
      }
    }
  });
  
  // Submit review mutation
  const submitReviewMutation = useMutation({
    mutationFn: async (text: string) => {
      if (!user) throw new Error("Please login first");
      if (!text.trim()) throw new Error("Review text cannot be empty");
      
      await apiRequest("POST", `/api/contents/${contentId}/reviews`, {
        text
      });
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/contents/${contentId}/reviews`] });
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
      
      if (error.message.includes("login")) {
        navigate("/auth");
      }
    }
  });
  
  // Submit comment mutation
  const submitCommentMutation = useMutation({
    mutationFn: async (text: string) => {
      if (!user) throw new Error("Please login first");
      if (!text.trim()) throw new Error("Comment text cannot be empty");
      
      await apiRequest("POST", `/api/contents/${contentId}/comments`, {
        text
      });
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/contents/${contentId}/comments`] });
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
      
      if (error.message.includes("login")) {
        navigate("/auth");
      }
    }
  });
  
  // Watch Progress mutation
  const updateWatchProgressMutation = useMutation({
    mutationFn: async (data: { progress: number, completed: boolean }) => {
      if (!user) return; // Silently fail
      
      await apiRequest("POST", "/api/watch-progress", {
        contentId,
        episodeId: selectedEpisode?.id || null,
        progress: data.progress,
        completed: data.completed
      });
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
      const res = await apiRequest("POST", "/api/watch-parties", {
        contentId,
        episodeId: selectedEpisode?.id || null
      });
      const data = await res.json();
      navigate(`/watch-party/${data.partyCode}`);
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
      await apiRequest("POST", `/api/reviews/${reviewId}/${isLike ? 'like' : 'dislike'}`);
      queryClient.invalidateQueries({ queryKey: [`/api/contents/${contentId}/reviews`] });
    } catch (error) {
      toast({
        title: "خطا",
        description: "مشکلی در ثبت نظر به وجود آمد",
        variant: "destructive",
      });
    }
  };
  
  // Handle like/dislike comment
  const handleCommentLike = async (commentId: number, isLike: boolean) => {
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
      await apiRequest("POST", `/api/comments/${commentId}/${isLike ? 'like' : 'dislike'}`);
      queryClient.invalidateQueries({ queryKey: [`/api/contents/${contentId}/comments`] });
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
        <div className="bg-destructive/20 p-8 rounded-lg text-center">
          <h2 className="text-xl font-bold mb-2">خطا در بارگذاری اطلاعات</h2>
          <p className="text-text-secondary mb-4">محتوای مورد نظر یافت نشد یا مشکلی در بارگذاری اطلاعات به وجود آمده است.</p>
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
            <div className="bg-dark-card rounded-lg aspect-[2/3]"></div>
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
  
  // Get unique seasons from episodes
  const seasons = Array.from(new Set(episodes.map(ep => ep.season))).sort();
  
  // Filter episodes by selected season
  const seasonEpisodes = episodes.filter(ep => ep.season === selectedSeason);
  
  // Get sources for selected episode or content
  const currentSources = selectedEpisode
    ? sources.filter(s => s.episodeId === selectedEpisode.id)
    : sources.filter(s => !s.episodeId);
  
  // Get download links
  const downloadSources = currentSources.filter(s => s.type === "download");
  
  // Get stream sources
  const streamSources = currentSources.filter(s => s.type === "stream");
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Content Header Section */}
      <div className="flex flex-col md:flex-row gap-8 mb-8">
        {/* Poster */}
        <div className="w-full md:w-1/3 lg:w-1/4">
          <div className="bg-dark-card rounded-lg overflow-hidden">
            <img 
              src={content.poster} 
              alt={content.title}
              className="w-full h-auto"
            />
          </div>
          
          {/* Rating Section */}
          <div className="mt-4 bg-dark-card rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Star className="h-5 w-5 text-accent-orange fill-current" />
                <span className="text-lg font-bold ml-2">
                  {ratingsData?.average?.toFixed(1) || "بدون امتیاز"}
                </span>
                <span className="text-text-secondary text-sm mr-1">
                  ({ratingsData?.count || 0} رأی)
                </span>
              </div>
              {user && (
                <div className="text-sm text-text-secondary">
                  امتیاز شما
                </div>
              )}
            </div>
            
            {/* Star Rating Buttons */}
            <div className="flex justify-between">
              {[10, 8, 6, 4, 2].map((num) => (
                <button
                  key={num}
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    userRating === num ? "bg-primary text-white" : "bg-dark text-text-secondary hover:bg-dark-border"
                  }`}
                  onClick={() => {
                    setUserRating(num);
                    submitRatingMutation.mutate(num);
                  }}
                  disabled={submitRatingMutation.isPending}
                >
                  {num/2}
                </button>
              ))}
            </div>
          </div>
          
          {/* Info Box */}
          <div className="mt-4 bg-dark-card rounded-lg p-4">
            <h3 className="font-bold text-lg mb-3 flex items-center">
              <Info className="h-5 w-5 ml-2" />
              اطلاعات
            </h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start">
                <span className="text-text-secondary ml-2">نوع:</span>
                <span>{contentType}</span>
              </li>
              {content.director && (
                <li className="flex items-start">
                  <span className="text-text-secondary ml-2">کارگردان:</span>
                  <span>{content.director}</span>
                </li>
              )}
              {content.actors && (
                <li className="flex items-start">
                  <span className="text-text-secondary ml-2">بازیگران:</span>
                  <span>{content.actors}</span>
                </li>
              )}
              <li className="flex items-start">
                <span className="text-text-secondary ml-2">سال انتشار:</span>
                <span>{content.year}</span>
              </li>
              {content.duration && (
                <li className="flex items-start">
                  <span className="text-text-secondary ml-2">مدت زمان:</span>
                  <span>{content.duration} دقیقه</span>
                </li>
              )}
            </ul>
          </div>
        </div>
        
        {/* Content Details */}
        <div className="w-full md:w-2/3 lg:w-3/4">
          <h1 className="text-3xl font-bold mb-2">{content.title}</h1>
          <h2 className="text-xl text-text-secondary mb-4">{content.englishTitle}</h2>
          
          {/* Tags/Genres */}
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="bg-primary px-3 py-1 text-sm rounded-md">{content.year}</span>
            {content.genres?.map((genre) => (
              <span key={genre} className="bg-dark-card px-3 py-1 text-sm rounded-md">
                {genre}
              </span>
            ))}
            {content.imdbRating && (
              <span className="flex items-center bg-dark-card px-3 py-1 text-sm rounded-md">
                <Star className="h-4 w-4 text-accent-orange fill-current ml-1" />
                <span>{content.imdbRating} IMDB</span>
              </span>
            )}
            {content.duration && (
              <span className="bg-dark-card px-3 py-1 text-sm rounded-md">
                {content.duration} دقیقه
              </span>
            )}
          </div>
          
          {/* Synopsis */}
          <div className="mb-6">
            <h3 className="font-bold text-lg mb-2">خلاصه داستان</h3>
            <p className="text-text-secondary">{content.synopsis}</p>
            {content.englishSynopsis && (
              <p className="text-text-secondary mt-4 border-t border-dark-border pt-4 text-sm">
                {content.englishSynopsis}
              </p>
            )}
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 mb-6">
            <Button 
              className="btn-primary rounded-lg px-6 py-3 flex items-center font-medium"
              onClick={() => setShowPlayer(true)}
              disabled={streamSources.length === 0}
            >
              <Play className="h-5 w-5 ml-2" />
              پخش آنلاین
            </Button>
            
            {downloadSources.length > 0 && (
              <div className="relative group">
                <Button 
                  variant="outline" 
                  className="bg-dark-card hover:bg-dark-border transition-colors duration-200 rounded-lg px-6 py-3 flex items-center font-medium"
                >
                  <Download className="h-5 w-5 ml-2" />
                  دانلود
                </Button>
                
                <div className="absolute z-10 left-0 mt-2 w-48 rounded-md shadow-lg bg-dark-card border border-dark-border hidden group-hover:block">
                  <div className="py-1">
                    {downloadSources.map((source) => (
                      <a
                        key={source.id}
                        href={source.sourceUrl}
                        className="block px-4 py-2 text-sm hover:bg-dark-lighter"
                        download
                      >
                        دانلود با کیفیت {source.quality}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            <Button
              variant="outline"
              className="bg-dark-card hover:bg-dark-border transition-colors duration-200 rounded-lg px-4 py-3"
              onClick={() => toggleFavoriteMutation.mutate()}
              disabled={toggleFavoriteMutation.isPending}
              aria-label={isFavorite ? "حذف از علاقه‌مندی‌ها" : "افزودن به علاقه‌مندی‌ها"}
            >
              <Heart className={`h-5 w-5 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
            </Button>
            
            <Button
              variant="outline"
              className="bg-dark-card hover:bg-dark-border transition-colors duration-200 rounded-lg px-4 py-3"
              onClick={handleCreateWatchParty}
              aria-label="تماشای گروهی"
              title="تماشای گروهی"
            >
              <Users className="h-5 w-5" />
            </Button>
          </div>
          
          {/* Video Player */}
          {showPlayer && streamSources.length > 0 && (
            <div className="mb-6">
              <VideoPlayer
                sources={streamSources}
                title={selectedEpisode ? `${content.title} - ${selectedEpisode.title}` : content.title}
                poster={content.poster}
                onProgress={handleVideoProgress}
                onComplete={handleVideoComplete}
              />
            </div>
          )}
          
          {/* Episode Selection for Series */}
          {content.type === "series" && episodes.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-4 mb-4">
                <h3 className="font-bold">انتخاب قسمت:</h3>
                <Select
                  value={selectedSeason.toString()}
                  onValueChange={(value) => setSelectedSeason(parseInt(value))}
                >
                  <SelectTrigger className="w-40 bg-dark-card">
                    <SelectValue placeholder="فصل" />
                  </SelectTrigger>
                  <SelectContent className="bg-dark-card border-dark-border">
                    {seasons.map((season) => (
                      <SelectItem key={season} value={season.toString()}>
                        فصل {season}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {seasonEpisodes.map((episode) => (
                  <Button
                    key={episode.id}
                    variant={selectedEpisode?.id === episode.id ? "default" : "outline"}
                    className="bg-dark-card hover:bg-dark-border"
                    onClick={() => setSelectedEpisode(episode)}
                  >
                    <div className="flex flex-col items-center justify-center p-1">
                      <span className="text-sm font-bold mb-1">قسمت {episode.episode}</span>
                      <span className="text-xs text-text-secondary truncate w-full text-center">
                        {episode.title}
                      </span>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          )}
          
          {/* Tabs for Reviews and Comments */}
          <Tabs defaultValue="reviews" className="mt-8">
            <TabsList className="grid grid-cols-2 bg-dark-lighter">
              <TabsTrigger value="reviews" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                <Star className="ml-2 h-4 w-4" />
                نقد و بررسی
              </TabsTrigger>
              <TabsTrigger value="comments" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                <MessageSquare className="ml-2 h-4 w-4" />
                دیدگاه‌ها
              </TabsTrigger>
            </TabsList>
            
            {/* Reviews Tab */}
            <TabsContent value="reviews" className="pt-4">
              <Card className="bg-dark-card border-dark-border mb-4">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">نقد خود را بنویسید</CardTitle>
                  <CardDescription>
                    نظر و تجربه خود در مورد این محتوا را با دیگران به اشتراک بگذارید
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="نقد خود را اینجا بنویسید..."
                    className="mb-3 bg-dark resize-none"
                    rows={4}
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                  />
                  <Button 
                    onClick={() => submitReviewMutation.mutate(reviewText)}
                    disabled={!reviewText.trim() || submitReviewMutation.isPending}
                  >
                    {submitReviewMutation.isPending ? "در حال ارسال..." : "ارسال نقد"}
                  </Button>
                </CardContent>
              </Card>
              
              {reviewsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <Card key={i} className="bg-dark-card border-dark-border animate-pulse">
                      <CardContent className="pt-4">
                        <div className="flex items-center mb-3">
                          <Skeleton className="h-10 w-10 rounded-full" />
                          <div className="ml-3">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-3 w-16 mt-1" />
                          </div>
                        </div>
                        <Skeleton className="h-20 w-full" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review: any) => (
                    <Card key={review.id} className="bg-dark-card border-dark-border">
                      <CardContent className="pt-4">
                        <div className="flex items-center mb-3">
                          <Avatar className="mr-2">
                            <AvatarFallback>
                              {review.user?.displayName?.[0] || review.user?.username?.[0] || "?"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{review.user?.displayName || review.user?.username}</div>
                            <div className="text-xs text-text-secondary flex items-center">
                              <Calendar className="h-3 w-3 ml-1" />
                              {formatDate(review.createdAt)}
                            </div>
                          </div>
                        </div>
                        <p className="text-text-secondary text-sm mb-3">{review.text}</p>
                        <div className="flex items-center text-xs text-text-secondary">
                          <button 
                            className="flex items-center hover:text-primary transition-colors mr-4"
                            onClick={() => handleReviewLike(review.id, true)}
                          >
                            <ThumbsUp className="h-4 w-4 ml-1" />
                            {review.likes}
                          </button>
                          <button 
                            className="flex items-center hover:text-destructive transition-colors"
                            onClick={() => handleReviewLike(review.id, false)}
                          >
                            <ThumbsDown className="h-4 w-4 ml-1" />
                            {review.dislikes}
                          </button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-text-secondary">
                  هنوز نقدی برای این محتوا ثبت نشده است.
                </div>
              )}
            </TabsContent>
            
            {/* Comments Tab */}
            <TabsContent value="comments" className="pt-4">
              <Card className="bg-dark-card border-dark-border mb-4">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">دیدگاه خود را بنویسید</CardTitle>
                  <CardDescription>
                    سوالات، نظرات و دیدگاه‌های خود را با دیگران در میان بگذارید
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="دیدگاه خود را اینجا بنویسید..."
                    className="mb-3 bg-dark resize-none"
                    rows={3}
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                  />
                  <Button 
                    onClick={() => submitCommentMutation.mutate(commentText)}
                    disabled={!commentText.trim() || submitCommentMutation.isPending}
                  >
                    {submitCommentMutation.isPending ? "در حال ارسال..." : "ارسال دیدگاه"}
                  </Button>
                </CardContent>
              </Card>
              
              {commentsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <Card key={i} className="bg-dark-card border-dark-border animate-pulse">
                      <CardContent className="pt-4">
                        <div className="flex items-center mb-3">
                          <Skeleton className="h-10 w-10 rounded-full" />
                          <div className="ml-3">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-3 w-16 mt-1" />
                          </div>
                        </div>
                        <Skeleton className="h-12 w-full" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : comments.length > 0 ? (
                <div className="space-y-4">
                  {comments.map((comment: any) => (
                    <Card key={comment.id} className="bg-dark-card border-dark-border">
                      <CardContent className="pt-4">
                        <div className="flex items-center mb-3">
                          <Avatar className="mr-2">
                            <AvatarFallback>
                              {comment.user?.displayName?.[0] || comment.user?.username?.[0] || "?"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{comment.user?.displayName || comment.user?.username}</div>
                            <div className="text-xs text-text-secondary flex items-center">
                              <Calendar className="h-3 w-3 ml-1" />
                              {formatDate(comment.createdAt)}
                            </div>
                          </div>
                        </div>
                        <p className="text-text-secondary text-sm mb-3">{comment.text}</p>
                        <div className="flex items-center text-xs text-text-secondary">
                          <button 
                            className="flex items-center hover:text-primary transition-colors mr-4"
                            onClick={() => handleCommentLike(comment.id, true)}
                          >
                            <ThumbsUp className="h-4 w-4 ml-1" />
                            {comment.likes}
                          </button>
                          <button 
                            className="flex items-center hover:text-destructive transition-colors"
                            onClick={() => handleCommentLike(comment.id, false)}
                          >
                            <ThumbsDown className="h-4 w-4 ml-1" />
                            {comment.dislikes}
                          </button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-text-secondary">
                  هنوز دیدگاهی برای این محتوا ثبت نشده است.
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ContentDetailsPage;
