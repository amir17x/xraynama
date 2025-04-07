import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useRoute, useLocation } from 'wouter';
import { ContentWithDetails, VideoType, CommentType, ReviewType } from '@/types';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { VideoPlayer } from '@/components/ui/VideoPlayer';
import { StarRating } from '@/components/ui/StarRating';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Heart, 
  Download, 
  MessageSquare, 
  Star, 
  Clock, 
  Calendar, 
  Video, 
  Play,
  Plus,
  Share2,
  Loader2,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ContentPage() {
  const [match, params] = useRoute<{ id: string }>('/content/:id');
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedVideo, setSelectedVideo] = useState<VideoType | null>(null);
  const [selectedEpisode, setSelectedEpisode] = useState<{ seasonId: number, episodeId: number } | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [userRating, setUserRating] = useState<number>(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isInWatchlist, setIsInWatchlist] = useState(false);

  // Redirect if no match
  if (!match) {
    navigate('/not-found');
    return null;
  }

  const contentId = parseInt(params.id);

  // Fetch content details
  const { data: content, isLoading, error } = useQuery<ContentWithDetails>({
    queryKey: [`/api/content/${contentId}`],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Fetch comments
  const { data: comments, isLoading: isCommentsLoading } = useQuery<CommentType[]>({
    queryKey: [`/api/content/${contentId}/comments`],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Fetch reviews
  const { data: reviews, isLoading: isReviewsLoading } = useQuery<ReviewType[]>({
    queryKey: [`/api/content/${contentId}/reviews`],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Add to watch history mutation
  const addToHistoryMutation = useMutation({
    mutationFn: (data: { position: number, completed?: boolean }) => {
      return apiRequest('POST', `/api/content/${contentId}/history`, {
        ...data,
        episodeId: selectedEpisode?.episodeId
      });
    }
  });

  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: (text: string) => {
      return apiRequest('POST', `/api/content/${contentId}/comments`, { text });
    },
    onSuccess: () => {
      setCommentText('');
      toast({
        title: "نظر ثبت شد",
        description: "نظر شما با موفقیت ثبت شد و پس از تایید نمایش داده خواهد شد.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/content/${contentId}/comments`] });
    },
    onError: (error) => {
      toast({
        title: "خطا در ثبت نظر",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Add review mutation
  const addReviewMutation = useMutation({
    mutationFn: (text: string) => {
      return apiRequest('POST', `/api/content/${contentId}/reviews`, { text });
    },
    onSuccess: () => {
      setReviewText('');
      toast({
        title: "نقد ثبت شد",
        description: "نقد شما با موفقیت ثبت شد و پس از تایید نمایش داده خواهد شد.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/content/${contentId}/reviews`] });
    },
    onError: (error) => {
      toast({
        title: "خطا در ثبت نقد",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Rate content mutation
  const rateContentMutation = useMutation({
    mutationFn: (score: number) => {
      return apiRequest('POST', `/api/content/${contentId}/rate`, { score });
    },
    onSuccess: () => {
      toast({
        title: "امتیاز ثبت شد",
        description: "امتیاز شما با موفقیت ثبت شد.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/content/${contentId}`] });
    },
    onError: (error) => {
      toast({
        title: "خطا در ثبت امتیاز",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Toggle favorite mutation
  const toggleFavoriteMutation = useMutation({
    mutationFn: () => {
      if (isFavorite) {
        return apiRequest('DELETE', `/api/content/${contentId}/favorites`);
      } else {
        return apiRequest('POST', `/api/content/${contentId}/favorites`);
      }
    },
    onSuccess: () => {
      setIsFavorite(!isFavorite);
      toast({
        title: isFavorite ? "از علاقه‌مندی‌ها حذف شد" : "به علاقه‌مندی‌ها اضافه شد",
        description: isFavorite 
          ? `${content?.title} از لیست علاقه‌مندی‌های شما حذف شد.`
          : `${content?.title} به لیست علاقه‌مندی‌های شما اضافه شد.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/user/favorites'] });
    },
    onError: (error) => {
      toast({
        title: "خطا",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Toggle watchlist mutation
  const toggleWatchlistMutation = useMutation({
    mutationFn: () => {
      if (isInWatchlist) {
        return apiRequest('DELETE', `/api/content/${contentId}/watchlist`);
      } else {
        return apiRequest('POST', `/api/content/${contentId}/watchlist`);
      }
    },
    onSuccess: () => {
      setIsInWatchlist(!isInWatchlist);
      toast({
        title: isInWatchlist ? "از لیست تماشا حذف شد" : "به لیست تماشا اضافه شد",
        description: isInWatchlist 
          ? `${content?.title} از لیست تماشای شما حذف شد.`
          : `${content?.title} به لیست تماشای شما اضافه شد.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/user/watchlist'] });
    },
    onError: (error) => {
      toast({
        title: "خطا",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Share content
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: content?.title || '',
        text: content?.description || '',
        url: window.location.href,
      })
      .catch((error) => {
        console.log('Error sharing:', error);
      });
    } else {
      // Fallback for browsers that don't support the Web Share API
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "لینک کپی شد",
        description: "لینک صفحه در کلیپ‌بورد کپی شد.",
      });
    }
  };

  // Format date string
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fa-IR').format(date);
  };

  // Select first video when content loads
  useEffect(() => {
    if (content) {
      // Set favorite and watchlist state
      setIsFavorite(content.isInFavorites);
      setIsInWatchlist(content.isInWatchlist);
      
      // Set user rating if exists
      if (content.ratings.userRating) {
        setUserRating(content.ratings.userRating.score);
      }
      
      // Select first video for movies/documentaries/animations or first episode for series
      if (content.type === 'series' && content.seasons && content.seasons.length > 0) {
        const firstSeason = content.seasons[0];
        if (firstSeason.episodes && firstSeason.episodes.length > 0) {
          const firstEpisode = firstSeason.episodes[0];
          if (firstEpisode.videos && firstEpisode.videos.length > 0) {
            setSelectedVideo(firstEpisode.videos[0]);
            setSelectedEpisode({
              seasonId: firstSeason.id,
              episodeId: firstEpisode.id
            });
          }
        }
      } else if (content.videos && content.videos.length > 0) {
        setSelectedVideo(content.videos[0]);
      }
    }
  }, [content]);

  // Handle video time update
  const handleTimeUpdate = (currentTime: number) => {
    if (!user) return;
    
    // Add to watch history every 10 seconds
    if (Math.floor(currentTime) % 10 === 0) {
      addToHistoryMutation.mutate({
        position: currentTime,
      });
    }
  };

  // Handle video ended
  const handleVideoEnded = () => {
    if (!user) return;
    
    // Mark as completed
    addToHistoryMutation.mutate({
      position: selectedVideo?.quality === '1080p' ? 0 : selectedVideo?.quality === '720p' ? 1 : 2,
      completed: true,
    });
    
    setIsPlaying(false);
  };

  // Handle rating change
  const handleRatingChange = (value: number) => {
    if (!user) {
      toast({
        title: "لطفا وارد شوید",
        description: "برای امتیاز دادن ابتدا باید وارد حساب کاربری خود شوید.",
        variant: "destructive",
      });
      return;
    }
    
    setUserRating(value);
    rateContentMutation.mutate(value);
  };

  // Handle comment submit
  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "لطفا وارد شوید",
        description: "برای ثبت نظر ابتدا باید وارد حساب کاربری خود شوید.",
        variant: "destructive",
      });
      return;
    }
    
    if (!commentText.trim()) {
      toast({
        title: "خطا",
        description: "متن نظر نمی‌تواند خالی باشد.",
        variant: "destructive",
      });
      return;
    }
    
    addCommentMutation.mutate(commentText);
  };

  // Handle review submit
  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "لطفا وارد شوید",
        description: "برای ثبت نقد ابتدا باید وارد حساب کاربری خود شوید.",
        variant: "destructive",
      });
      return;
    }
    
    if (!reviewText.trim()) {
      toast({
        title: "خطا",
        description: "متن نقد نمی‌تواند خالی باشد.",
        variant: "destructive",
      });
      return;
    }
    
    addReviewMutation.mutate(reviewText);
  };

  // Handle season/episode selection for series
  const handleEpisodeSelect = (seasonId: number, episodeId: number) => {
    if (!content) return;
    
    const season = content.seasons?.find(s => s.id === seasonId);
    if (!season) return;
    
    const episode = season.episodes.find(e => e.id === episodeId);
    if (!episode || !episode.videos || episode.videos.length === 0) return;
    
    setSelectedVideo(episode.videos[0]);
    setSelectedEpisode({ seasonId, episodeId });
    setIsPlaying(true);
    
    // Scroll to player
    document.getElementById('video-player')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Handle video quality change
  const handleQualityChange = (quality: string) => {
    if (!content) return;
    
    if (content.type === 'series' && selectedEpisode) {
      const season = content.seasons?.find(s => s.id === selectedEpisode.seasonId);
      if (!season) return;
      
      const episode = season.episodes.find(e => e.id === selectedEpisode.episodeId);
      if (!episode) return;
      
      const video = episode.videos.find(v => v.quality === quality);
      if (video) {
        setSelectedVideo(video);
      }
    } else {
      const video = content.videos.find(v => v.quality === quality);
      if (video) {
        setSelectedVideo(video);
      }
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <>
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="flex justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // Error state
  if (error || !content) {
    return (
      <>
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-foreground mb-4">خطا در بارگذاری محتوا</h1>
            <p className="text-muted-foreground mb-6">متأسفانه مشکلی در بارگذاری اطلاعات به وجود آمد.</p>
            <Button onClick={() => navigate('/')}>بازگشت به صفحه اصلی</Button>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // Get video quality options
  const getQualityOptions = () => {
    if (content.type === 'series' && selectedEpisode) {
      const season = content.seasons?.find(s => s.id === selectedEpisode.seasonId);
      if (!season) return [];
      
      const episode = season.episodes.find(e => e.id === selectedEpisode.episodeId);
      if (!episode) return [];
      
      return episode.videos.map(video => ({
        label: video.quality,
        src: video.streamUrl
      }));
    } else {
      return content.videos.map(video => ({
        label: video.quality,
        src: video.streamUrl
      }));
    }
  };

  return (
    <>
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Content header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">{content.title}</h1>
              <h2 className="text-xl text-muted-foreground">{content.englishTitle}</h2>
            </div>
            
            <div className="flex items-center space-x-4 rtl:space-x-reverse mt-4 md:mt-0">
              {/* Average rating */}
              <div className="flex items-center">
                <Star className="text-yellow-400 h-5 w-5 mr-1" />
                <span className="text-foreground font-semibold">{content.ratings.averageScore.toFixed(1)}</span>
                <span className="text-muted-foreground text-sm mr-1">/10</span>
                <span className="text-muted-foreground text-sm mr-2">({content.ratings.count} رأی)</span>
              </div>
              
              {/* Action buttons */}
              <div className="flex space-x-2 rtl:space-x-reverse">
                <Button
                  variant={isInWatchlist ? "default" : "outline"}
                  size="sm"
                  className={isInWatchlist ? "bg-primary/80 hover:bg-primary" : ""}
                  onClick={() => toggleWatchlistMutation.mutate()}
                  disabled={toggleWatchlistMutation.isPending}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  {isInWatchlist ? "در لیست تماشا" : "افزودن به لیست تماشا"}
                </Button>
                
                <Button
                  variant={isFavorite ? "default" : "outline"}
                  size="sm"
                  className={isFavorite ? "bg-primary/80 hover:bg-primary" : ""}
                  onClick={() => toggleFavoriteMutation.mutate()}
                  disabled={toggleFavoriteMutation.isPending}
                >
                  <Heart className={cn("h-4 w-4 mr-1", isFavorite && "fill-white")} />
                  {isFavorite ? "علاقه‌مند شده" : "علاقه‌مندی"}
                </Button>
                
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleShare}
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          
          {/* Content meta info */}
          <div className="flex flex-wrap items-center mt-4 mb-6 text-sm text-muted-foreground">
            <div className="flex items-center mr-4 mb-2">
              <Calendar className="h-4 w-4 mr-1" />
              <span>{content.year}</span>
            </div>
            
            <div className="flex items-center mr-4 mb-2">
              <Clock className="h-4 w-4 mr-1" />
              <span>{content.duration} دقیقه</span>
            </div>
            
            {content.genres && content.genres.length > 0 && (
              <div className="flex items-center mr-4 mb-2">
                <span className="mr-1">ژانر:</span>
                {content.genres.map((genre, index) => (
                  <span key={genre.id}>
                    {genre.name}{index < content.genres.length - 1 ? '، ' : ''}
                  </span>
                ))}
              </div>
            )}
            
            {content.imdbRating && (
              <div className="flex items-center mr-4 mb-2">
                <span className="mr-1">IMDB:</span>
                <span>{content.imdbRating}</span>
              </div>
            )}
          </div>
          
          {/* Content tags */}
          {content.tags && content.tags.length > 0 && (
            <div className="flex flex-wrap mt-2 mb-6">
              {content.tags.map(tag => (
                <span 
                  key={tag.id}
                  className="px-3 py-1 rounded-full border border-border bg-card text-muted-foreground text-sm ml-2 mb-2 hover:bg-muted transition duration-200 cursor-pointer"
                  onClick={() => navigate(`/search?tag=${tag.slug}`)}
                >
                  {tag.name}
                </span>
              ))}
            </div>
          )}
        </div>
        
        {/* Video player */}
        <div id="video-player" className="mb-8 rounded-lg overflow-hidden">
          {selectedVideo ? (
            <VideoPlayer
              src={selectedVideo.streamUrl}
              poster={content.backdrop || content.poster}
              autoPlay={isPlaying}
              qualityOptions={getQualityOptions()}
              onTimeUpdate={handleTimeUpdate}
              onEnded={handleVideoEnded}
              className="w-full aspect-video"
            />
          ) : (
            <div className="w-full aspect-video bg-card flex items-center justify-center">
              <div className="text-center">
                <Video className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">ویدیویی برای پخش یافت نشد</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Download links */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-foreground mb-4">دانلود {content.type === 'series' ? 'قسمت' : ''}</h3>
          
          {content.type === 'series' && content.seasons ? (
            <div className="space-y-6">
              {content.seasons.map(season => (
                <div key={season.id} className="glass-effect rounded-lg p-4">
                  <h4 className="text-lg font-bold text-foreground mb-3">فصل {season.seasonNumber}: {season.title}</h4>
                  
                  <div className="space-y-4">
                    {season.episodes.map(episode => (
                      <div key={episode.id} className="border-t border-border pt-3 first:border-0 first:pt-0">
                        <div className="flex justify-between items-center mb-2">
                          <h5 className="font-medium text-foreground">
                            قسمت {episode.episodeNumber}: {episode.title}
                          </h5>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEpisodeSelect(season.id, episode.id)}
                            className="text-primary border-primary hover:bg-primary/10"
                          >
                            <Play className="h-4 w-4 mr-1" />
                            پخش
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2">
                          {episode.videos.map(video => (
                            <a
                              key={video.id}
                              href={video.downloadUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-between px-4 py-2 border border-border rounded-md hover:bg-card transition-colors"
                            >
                              <div className="flex items-center">
                                <Download className="h-4 w-4 mr-2 text-primary" />
                                <span className="text-foreground">کیفیت {video.quality}</span>
                              </div>
                              {video.size && <span className="text-muted-foreground text-sm">{video.size} MB</span>}
                            </a>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {content.videos.map(video => (
                <a
                  key={video.id}
                  href={video.downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between px-6 py-3 border border-border rounded-md hover:bg-card transition-colors"
                >
                  <div className="flex items-center">
                    <Download className="h-5 w-5 mr-2 text-primary" />
                    <span className="text-foreground">دانلود با کیفیت {video.quality}</span>
                  </div>
                  {video.size && <span className="text-muted-foreground">{video.size} MB</span>}
                </a>
              ))}
            </div>
          )}
        </div>
        
        {/* Description */}
        <div className="mb-12 glass-effect rounded-lg p-6">
          <h3 className="text-xl font-bold text-foreground mb-4">درباره {content.type === 'movie' ? 'فیلم' : content.type === 'series' ? 'سریال' : content.type === 'animation' ? 'انیمیشن' : 'مستند'}</h3>
          <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{content.description}</p>
        </div>
        
        {/* Tabs for reviews and comments */}
        <Tabs defaultValue="comments" className="mb-12">
          <TabsList className="mb-6 w-full sm:w-auto">
            <TabsTrigger value="comments" className="flex-1 sm:flex-none">
              <MessageSquare className="h-4 w-4 mr-2" />
              نظرات ({comments?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="reviews" className="flex-1 sm:flex-none">
              <Star className="h-4 w-4 mr-2" />
              نقدها ({reviews?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="rating" className="flex-1 sm:flex-none">
              امتیازدهی
            </TabsTrigger>
          </TabsList>
          
          {/* Comments tab */}
          <TabsContent value="comments">
            <Card>
              <CardHeader>
                <CardTitle>نظرات کاربران</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Comment form */}
                <form onSubmit={handleCommentSubmit} className="mb-6">
                  <Textarea
                    placeholder="نظر خود را بنویسید..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="mb-3 min-h-[100px]"
                    disabled={!user || addCommentMutation.isPending}
                  />
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-muted-foreground">
                      {!user && "برای ثبت نظر ابتدا وارد شوید"}
                    </p>
                    <Button 
                      type="submit" 
                      disabled={!user || !commentText.trim() || addCommentMutation.isPending}
                    >
                      {addCommentMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          در حال ارسال...
                        </>
                      ) : "ثبت نظر"}
                    </Button>
                  </div>
                </form>
                
                {/* Comments list */}
                {isCommentsLoading ? (
                  <div className="text-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">در حال بارگذاری نظرات...</p>
                  </div>
                ) : comments && comments.length > 0 ? (
                  <div className="space-y-6">
                    {comments.map(comment => (
                      <div key={comment.id} className="border-b border-border pb-6 last:border-0">
                        <div className="flex items-center mb-3">
                          <Avatar className="h-8 w-8 mr-2">
                            <AvatarImage src={comment.user?.avatar} />
                            <AvatarFallback>
                              {comment.user?.name?.charAt(0) || comment.user?.username.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-foreground">{comment.user?.name || comment.user?.username}</p>
                            <p className="text-xs text-muted-foreground">{formatDate(comment.createdAt)}</p>
                          </div>
                        </div>
                        <p className="text-foreground whitespace-pre-line">{comment.text}</p>
                        <div className="flex items-center mt-3">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <ThumbsUp className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <ThumbsDown className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">هنوز نظری ثبت نشده است</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Reviews tab */}
          <TabsContent value="reviews">
            <Card>
              <CardHeader>
                <CardTitle>نقد و بررسی</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Review form */}
                <form onSubmit={handleReviewSubmit} className="mb-6">
                  <Textarea
                    placeholder="نقد خود را بنویسید..."
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    className="mb-3 min-h-[150px]"
                    disabled={!user || addReviewMutation.isPending}
                  />
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-muted-foreground">
                      {!user && "برای ثبت نقد ابتدا وارد شوید"}
                    </p>
                    <Button 
                      type="submit" 
                      disabled={!user || !reviewText.trim() || addReviewMutation.isPending}
                    >
                      {addReviewMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          در حال ارسال...
                        </>
                      ) : "ثبت نقد"}
                    </Button>
                  </div>
                </form>
                
                {/* Reviews list */}
                {isReviewsLoading ? (
                  <div className="text-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">در حال بارگذاری نقدها...</p>
                  </div>
                ) : reviews && reviews.length > 0 ? (
                  <div className="space-y-8">
                    {reviews.map(review => (
                      <div key={review.id} className="border-b border-border pb-8 last:border-0">
                        <div className="flex items-center mb-4">
                          <Avatar className="h-10 w-10 mr-3">
                            <AvatarImage src={review.user?.avatar} />
                            <AvatarFallback>
                              {review.user?.name?.charAt(0) || review.user?.username.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-foreground">{review.user?.name || review.user?.username}</p>
                            <p className="text-xs text-muted-foreground">{formatDate(review.createdAt)}</p>
                          </div>
                        </div>
                        <p className="text-foreground whitespace-pre-line leading-relaxed">{review.text}</p>
                        <div className="flex items-center mt-4">
                          <Button variant="ghost" size="sm">
                            <ThumbsUp className="h-4 w-4 mr-1" />
                            مفید بود
                          </Button>
                          <Button variant="ghost" size="sm">
                            <ThumbsDown className="h-4 w-4 mr-1" />
                            مفید نبود
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Star className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">هنوز نقدی ثبت نشده است</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Rating tab */}
          <TabsContent value="rating">
            <Card>
              <CardHeader>
                <CardTitle>امتیازدهی</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-6">
                  <div className="flex flex-col items-center mb-8">
                    <div className="text-5xl font-bold text-foreground mb-2">
                      {content.ratings.averageScore.toFixed(1)}
                    </div>
                    <StarRating value={content.ratings.averageScore} max={5} size="lg" readOnly className="mb-2" />
                    <div className="text-muted-foreground">
                      از مجموع {content.ratings.count} رأی
                    </div>
                  </div>
                  
                  <div className="max-w-xs mx-auto">
                    <h4 className="font-medium text-foreground mb-3">
                      {user ? "امتیاز شما:" : "برای امتیازدهی وارد شوید"}
                    </h4>
                    
                    <div className="flex flex-col items-center">
                      <StarRating 
                        value={userRating} 
                        max={5} 
                        size="lg" 
                        onChange={handleRatingChange} 
                        readOnly={!user || rateContentMutation.isPending}
                        className="mb-2"
                      />
                      
                      <div className="text-foreground">
                        {userRating ? `${userRating.toFixed(1)} از 10` : "انتخاب نشده"}
                      </div>
                      
                      {rateContentMutation.isPending && (
                        <div className="mt-2 text-muted-foreground flex items-center">
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          در حال ثبت...
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        {/* Related content (if you implement this feature) */}
      </main>
      
      <Footer />
    </>
  );
}
