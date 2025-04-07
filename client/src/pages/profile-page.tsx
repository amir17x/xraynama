import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import ContentCard from "@/components/ui/content-card";
import { Content, Playlist } from "@shared/schema";
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
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  User as UserIcon,
  Heart,
  Clock,
  List,
  Award,
  Plus,
  Pencil,
  Trash2,
  LogOut,
  Settings,
  CheckCircle,
  PlaySquare,
  CalendarDays,
  Gift
} from "lucide-react";

interface ProfilePageProps {}

interface WatchHistoryItem {
  id: number;
  contentId: number;
  episodeId: number | null;
  progress: number;
  completed: boolean;
  updatedAt: string;
  content?: Content;
  episode?: {
    id: number;
    title: string;
    season: number;
    episode: number;
  };
}

interface FavoriteItem {
  id: number;
  contentId: number;
  createdAt: string;
  content?: Content;
}

interface PlaylistWithItems extends Playlist {
  items?: Array<{
    id: number;
    contentId: number;
    order: number;
    content?: Content;
  }>;
}

const ProfilePage: React.FC<ProfilePageProps> = () => {
  const [location, setLocation] = useLocation();
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  
  // Get active tab from URL
  const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const initialTab = searchParams.get('tab') || 'profile';
  const [activeTab, setActiveTab] = useState(initialTab);
  
  // State for playlist management
  const [isCreatePlaylistOpen, setIsCreatePlaylistOpen] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState<PlaylistWithItems | null>(null);
  const [isDeletePlaylistOpen, setIsDeletePlaylistOpen] = useState(false);
  const [playlistName, setPlaylistName] = useState("");
  const [playlistDescription, setPlaylistDescription] = useState("");
  const [playlistIsPublic, setPlaylistIsPublic] = useState(false);
  
  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setLocation(`/profile?tab=${value}`, { replace: true });
  };
  
  // Check if user is authenticated
  if (!user) {
    return null; // ProtectedRoute component will handle redirection
  }
  
  // Fetch watch history
  const { 
    data: watchHistory = [], 
    isLoading: historyLoading 
  } = useQuery<WatchHistoryItem[]>({
    queryKey: ['/api/watch-history'],
    queryFn: async () => {
      const res = await fetch('/api/watch-history');
      if (!res.ok) throw new Error('Failed to fetch watch history');
      return res.json();
    },
    enabled: activeTab === 'history'
  });
  
  // Fetch favorites
  const { 
    data: favorites = [], 
    isLoading: favoritesLoading 
  } = useQuery<FavoriteItem[]>({
    queryKey: ['/api/favorites'],
    queryFn: async () => {
      const res = await fetch('/api/favorites');
      if (!res.ok) throw new Error('Failed to fetch favorites');
      return res.json();
    },
    enabled: activeTab === 'favorites'
  });
  
  // Fetch playlists
  const { 
    data: playlists = [], 
    isLoading: playlistsLoading 
  } = useQuery<PlaylistWithItems[]>({
    queryKey: ['/api/playlists'],
    queryFn: async () => {
      const res = await fetch('/api/playlists');
      if (!res.ok) throw new Error('Failed to fetch playlists');
      return res.json();
    },
    enabled: activeTab === 'playlists'
  });
  
  // Create playlist mutation
  const createPlaylistMutation = useMutation({
    mutationFn: async (data: { name: string; description: string; isPublic: boolean }) => {
      const res = await apiRequest('POST', '/api/playlists', data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/playlists'] });
      setIsCreatePlaylistOpen(false);
      setPlaylistName("");
      setPlaylistDescription("");
      setPlaylistIsPublic(false);
      
      toast({
        title: "پلی‌لیست ایجاد شد",
        description: "پلی‌لیست جدید با موفقیت ایجاد شد",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "خطا در ایجاد پلی‌لیست",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Delete playlist mutation
  const deletePlaylistMutation = useMutation({
    mutationFn: async (playlistId: number) => {
      await apiRequest('DELETE', `/api/playlists/${playlistId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/playlists'] });
      setIsDeletePlaylistOpen(false);
      setSelectedPlaylist(null);
      
      toast({
        title: "پلی‌لیست حذف شد",
        description: "پلی‌لیست با موفقیت حذف شد",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "خطا در حذف پلی‌لیست",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Remove from favorites mutation
  const removeFromFavoritesMutation = useMutation({
    mutationFn: async (contentId: number) => {
      await apiRequest('DELETE', `/api/favorites/${contentId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/favorites'] });
      
      toast({
        title: "از علاقه‌مندی‌ها حذف شد",
        description: "محتوا از لیست علاقه‌مندی‌های شما حذف شد",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "خطا در حذف از علاقه‌مندی‌ها",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Handle create playlist
  const handleCreatePlaylist = () => {
    if (!playlistName.trim()) {
      toast({
        title: "نام پلی‌لیست وارد نشده",
        description: "لطفاً نام پلی‌لیست را وارد کنید",
        variant: "destructive",
      });
      return;
    }
    
    createPlaylistMutation.mutate({
      name: playlistName,
      description: playlistDescription,
      isPublic: playlistIsPublic
    });
  };
  
  // Handle delete playlist
  const handleDeletePlaylist = () => {
    if (!selectedPlaylist) return;
    
    deletePlaylistMutation.mutate(selectedPlaylist.id);
  };
  
  // Open edit playlist dialog
  const openEditPlaylist = (playlist: PlaylistWithItems) => {
    setSelectedPlaylist(playlist);
    setPlaylistName(playlist.name);
    setPlaylistDescription(playlist.description || "");
    setPlaylistIsPublic(playlist.isPublic);
    setIsCreatePlaylistOpen(true);
  };
  
  // Open delete playlist dialog
  const openDeletePlaylistDialog = (playlist: PlaylistWithItems) => {
    setSelectedPlaylist(playlist);
    setIsDeletePlaylistOpen(true);
  };
  
  // Format duration
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours} ساعت و ${minutes} دقیقه`;
    }
    return `${minutes} دقیقه`;
  };
  
  // Calculate progress percentage
  const calculateProgress = (progress: number, totalDuration: number) => {
    if (!totalDuration) return 0;
    const percentage = (progress / (totalDuration * 60)) * 100;
    return Math.min(percentage, 100);
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fa-IR');
  };
  
  // Check if action is create playlist
  useEffect(() => {
    const action = searchParams.get('action');
    if (action === 'create' && activeTab === 'playlists') {
      setIsCreatePlaylistOpen(true);
    }
  }, [activeTab, searchParams]);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* User Profile Card */}
        <div className="md:col-span-1">
          <Card className="bg-dark-card border-dark-border">
            <CardHeader className="text-center pb-4">
              <Avatar className="h-24 w-24 mx-auto mb-2">
                {user.avatar ? (
                  <AvatarImage src={user.avatar} alt={user.displayName || user.username} />
                ) : null}
                <AvatarFallback className="text-2xl">
                  {(user.displayName || user.username)[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <CardTitle className="text-xl">{user.displayName || user.username}</CardTitle>
              <CardDescription>
                <span className="text-text-secondary">@{user.username}</span>
              </CardDescription>
            </CardHeader>
            
            <CardContent className="pb-6">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="text-center">
                  <div className="text-xl font-bold">{user.points || 0}</div>
                  <div className="text-xs text-text-secondary">امتیاز</div>
                </div>
                <Separator orientation="vertical" className="h-8" />
                <div className="text-center">
                  <div className="text-xl font-bold">{favorites.length}</div>
                  <div className="text-xs text-text-secondary">علاقه‌مندی‌ها</div>
                </div>
                <Separator orientation="vertical" className="h-8" />
                <div className="text-center">
                  <div className="text-xl font-bold">{playlists.length}</div>
                  <div className="text-xs text-text-secondary">پلی‌لیست‌ها</div>
                </div>
              </div>
              
              {user.badges && user.badges.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium mb-2 flex items-center">
                    <Award className="h-4 w-4 ml-1 text-accent-orange" />
                    مدال‌ها
                  </h3>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {user.badges.map((badge, index) => {
                      const badgeInfo = getBadgeInfo(badge);
                      return (
                        <div 
                          key={index}
                          className={`w-8 h-8 rounded-full ${badgeInfo.color} flex items-center justify-center text-white text-xs`}
                          title={badgeInfo.title}
                        >
                          {badgeInfo.icon}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              
              <div className="flex flex-col space-y-1">
                <Button
                  variant={activeTab === 'profile' ? 'default' : 'ghost'}
                  className="justify-start"
                  onClick={() => handleTabChange('profile')}
                >
                  <UserIcon className="h-4 w-4 ml-2" />
                  پروفایل
                </Button>
                <Button
                  variant={activeTab === 'history' ? 'default' : 'ghost'}
                  className="justify-start"
                  onClick={() => handleTabChange('history')}
                >
                  <Clock className="h-4 w-4 ml-2" />
                  تاریخچه تماشا
                </Button>
                <Button
                  variant={activeTab === 'favorites' ? 'default' : 'ghost'}
                  className="justify-start"
                  onClick={() => handleTabChange('favorites')}
                >
                  <Heart className="h-4 w-4 ml-2" />
                  علاقه‌مندی‌ها
                </Button>
                <Button
                  variant={activeTab === 'playlists' ? 'default' : 'ghost'}
                  className="justify-start"
                  onClick={() => handleTabChange('playlists')}
                >
                  <List className="h-4 w-4 ml-2" />
                  پلی‌لیست‌ها
                </Button>
              </div>
            </CardContent>
            
            <CardFooter className="border-t border-dark-border pt-4 flex-col gap-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => {/* Future implementation */}}
              >
                <Settings className="h-4 w-4 ml-2" />
                تنظیمات
              </Button>
              <Button
                variant="destructive"
                className="w-full justify-start"
                onClick={() => logoutMutation.mutate()}
              >
                <LogOut className="h-4 w-4 ml-2" />
                خروج از حساب
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        {/* Main Content */}
        <div className="md:col-span-3">
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="bg-dark-lighter mb-6 grid grid-cols-4 h-auto">
              <TabsTrigger
                value="profile"
                className="data-[state=active]:bg-primary data-[state=active]:text-white py-3"
              >
                <UserIcon className="h-4 w-4 ml-1 md:hidden" />
                <span className="hidden md:inline ml-1">پروفایل</span>
                <span className="md:hidden">پروفایل</span>
              </TabsTrigger>
              <TabsTrigger
                value="history"
                className="data-[state=active]:bg-primary data-[state=active]:text-white py-3"
              >
                <Clock className="h-4 w-4 ml-1 md:hidden" />
                <span className="hidden md:inline ml-1">تاریخچه تماشا</span>
                <span className="md:hidden">تاریخچه</span>
              </TabsTrigger>
              <TabsTrigger
                value="favorites"
                className="data-[state=active]:bg-primary data-[state=active]:text-white py-3"
              >
                <Heart className="h-4 w-4 ml-1 md:hidden" />
                <span className="hidden md:inline ml-1">علاقه‌مندی‌ها</span>
                <span className="md:hidden">علاقه‌مندی</span>
              </TabsTrigger>
              <TabsTrigger
                value="playlists"
                className="data-[state=active]:bg-primary data-[state=active]:text-white py-3"
              >
                <List className="h-4 w-4 ml-1 md:hidden" />
                <span className="hidden md:inline ml-1">پلی‌لیست‌ها</span>
                <span className="md:hidden">پلی‌لیست</span>
              </TabsTrigger>
            </TabsList>
            
            {/* Profile Tab */}
            <TabsContent value="profile">
              <Card className="bg-dark-card border-dark-border">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <UserIcon className="h-5 w-5 text-primary" />
                    اطلاعات پروفایل
                  </CardTitle>
                  <CardDescription>
                    اطلاعات حساب کاربری و فعالیت‌های شما
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-text-secondary text-sm">نام کاربری</Label>
                        <div className="bg-dark p-2 rounded-md mt-1">{user.username}</div>
                      </div>
                      <div>
                        <Label className="text-text-secondary text-sm">نام نمایشی</Label>
                        <div className="bg-dark p-2 rounded-md mt-1">{user.displayName || user.username}</div>
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-text-secondary text-sm">ایمیل</Label>
                      <div className="bg-dark p-2 rounded-md mt-1">{user.email}</div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="font-medium mb-3 flex items-center gap-2">
                      <Gift className="h-5 w-5 text-primary" />
                      امتیازات و مدال‌ها
                    </h3>
                    
                    <div className="bg-dark-lighter rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-medium">امتیاز کلی:</span>
                        <span className="text-primary-light font-bold">{user.points || 0}</span>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>تماشای محتوا</span>
                          <span>10 امتیاز</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>نوشتن نقد</span>
                          <span>20 امتیاز</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>نوشتن کامنت</span>
                          <span>5 امتیاز</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>شرکت در تماشای گروهی</span>
                          <span>15 امتیاز</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Badges Info */}
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                      {/* Badge Progress Cards */}
                      <Card className="bg-dark-lighter border-dark-border">
                        <CardContent className="p-3 flex items-center">
                          <div className="w-12 h-12 rounded-full bg-accent-purple/20 flex items-center justify-center ml-3">
                            <UserIcon className="h-6 w-6 text-accent-purple" />
                          </div>
                          <div>
                            <div className="font-medium">کاربر فعال</div>
                            <div className="text-xs text-text-secondary">
                              امتیاز: {user.points || 0}/100
                            </div>
                            <div className="w-full bg-dark-card rounded-full h-1.5 mt-1">
                              <div 
                                className="bg-accent-purple h-1.5 rounded-full" 
                                style={{ width: `${Math.min(100, (user.points || 0) / 100 * 100)}%` }}
                              ></div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="bg-dark-lighter border-dark-border">
                        <CardContent className="p-3 flex items-center">
                          <div className="w-12 h-12 rounded-full bg-accent-orange/20 flex items-center justify-center ml-3">
                            <Award className="h-6 w-6 text-accent-orange" />
                          </div>
                          <div>
                            <div className="font-medium">منتقد حرفه‌ای</div>
                            <div className="text-xs text-text-secondary">
                              نقدهای تأیید شده: 0/5
                            </div>
                            <div className="w-full bg-dark-card rounded-full h-1.5 mt-1">
                              <div 
                                className="bg-accent-orange h-1.5 rounded-full" 
                                style={{ width: '0%' }}
                              ></div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Watch History Tab */}
            <TabsContent value="history">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  تاریخچه تماشا
                </h2>
              </div>
              
              {historyLoading ? (
                <div className="grid grid-cols-1 gap-4">
                  {[1, 2, 3].map(i => (
                    <Skeleton key={i} className="h-24 w-full" />
                  ))}
                </div>
              ) : watchHistory.length > 0 ? (
                <div className="space-y-4">
                  {watchHistory.map((item) => (
                    <Card key={item.id} className="bg-dark-card border-dark-border overflow-hidden">
                      <CardContent className="p-0">
                        <div className="flex flex-col sm:flex-row">
                          {/* Content thumbnail */}
                          <div className="w-full sm:w-1/4 md:w-1/5 aspect-video sm:aspect-auto">
                            <img 
                              src={item.content?.poster || ''}
                              alt={item.content?.title || ''}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          
                          {/* Content info */}
                          <div className="flex-1 p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-medium mb-1">{item.content?.title}</h3>
                                {item.episode && (
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="text-xs bg-primary px-1.5 py-0.5 rounded">
                                      S{item.episode.season.toString().padStart(2, '0')}E{item.episode.episode.toString().padStart(2, '0')}
                                    </span>
                                    <span className="text-sm">{item.episode.title}</span>
                                  </div>
                                )}
                                <div className="text-xs text-text-secondary flex items-center">
                                  <CalendarDays className="h-3 w-3 ml-1" />
                                  {formatDate(item.updatedAt)}
                                </div>
                              </div>
                              
                              <div className="text-right">
                                <div className="flex items-center gap-2 text-xs text-text-secondary">
                                  <span>{formatDuration(item.progress)}</span>
                                  {item.completed && (
                                    <span className="flex items-center text-accent-green">
                                      <CheckCircle className="h-3 w-3 ml-1" />
                                      تکمیل شده
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            {/* Progress bar */}
                            <div className="mt-3">
                              <div className="w-full bg-dark rounded-full h-1.5">
                                <div 
                                  className={`h-1.5 rounded-full ${item.completed ? 'bg-accent-green' : 'bg-primary'}`}
                                  style={{ width: `${calculateProgress(item.progress, item.content?.duration || 0)}%` }}
                                ></div>
                              </div>
                            </div>
                            
                            {/* Action buttons */}
                            <div className="mt-3 flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-xs h-8"
                                onClick={() => setLocation(`/content/${item.contentId}?action=play`)}
                              >
                                <PlaySquare className="h-3 w-3 ml-1" />
                                ادامه تماشا
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-xs h-8"
                                onClick={() => setLocation(`/content/${item.contentId}`)}
                              >
                                اطلاعات محتوا
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="bg-dark-card border-dark-border text-center py-12">
                  <CardContent>
                    <Clock className="h-16 w-16 mx-auto mb-4 text-text-secondary opacity-20" />
                    <h3 className="text-lg font-medium mb-2">تاریخچه تماشای خالی</h3>
                    <p className="text-text-secondary mb-4">شما هنوز هیچ محتوایی تماشا نکرده‌اید</p>
                    <Button onClick={() => setLocation('/')}>
                      مشاهده محتواها
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            {/* Favorites Tab */}
            <TabsContent value="favorites">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Heart className="h-5 w-5 text-primary" />
                  علاقه‌مندی‌ها
                </h2>
              </div>
              
              {favoritesLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {[1, 2, 3, 4, 5].map(i => (
                    <Skeleton key={i} className="aspect-[2/3] rounded-lg" />
                  ))}
                </div>
              ) : favorites.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {favorites.map((favorite) => (
                    <div key={favorite.id} className="relative group">
                      {favorite.content && (
                        <ContentCard content={favorite.content} />
                      )}
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <Button
                          variant="destructive"
                          size="icon"
                          className="h-8 w-8 rounded-full"
                          onClick={() => removeFromFavoritesMutation.mutate(favorite.contentId)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <Card className="bg-dark-card border-dark-border text-center py-12">
                  <CardContent>
                    <Heart className="h-16 w-16 mx-auto mb-4 text-text-secondary opacity-20" />
                    <h3 className="text-lg font-medium mb-2">علاقه‌مندی‌های خالی</h3>
                    <p className="text-text-secondary mb-4">شما هنوز محتوایی به علاقه‌مندی‌ها اضافه نکرده‌اید</p>
                    <Button onClick={() => setLocation('/')}>
                      مشاهده محتواها
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            {/* Playlists Tab */}
            <TabsContent value="playlists">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <List className="h-5 w-5 text-primary" />
                  پلی‌لیست‌های من
                </h2>
                
                <Dialog open={isCreatePlaylistOpen} onOpenChange={setIsCreatePlaylistOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 ml-1" />
                      ساخت پلی‌لیست جدید
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-dark-card border-dark-border">
                    <DialogHeader>
                      <DialogTitle>
                        {selectedPlaylist ? 'ویرایش پلی‌لیست' : 'ساخت پلی‌لیست جدید'}
                      </DialogTitle>
                      <DialogDescription>
                        محتواهای مورد علاقه خود را دسته‌بندی کنید
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="name">نام پلی‌لیست</Label>
                        <Input
                          id="name"
                          value={playlistName}
                          onChange={(e) => setPlaylistName(e.target.value)}
                          placeholder="نام پلی‌لیست را وارد کنید"
                          className="bg-dark mt-1.5"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="description">توضیحات (اختیاری)</Label>
                        <Textarea
                          id="description"
                          value={playlistDescription}
                          onChange={(e) => setPlaylistDescription(e.target.value)}
                          placeholder="توضیحات پلی‌لیست را وارد کنید"
                          className="bg-dark mt-1.5 resize-none"
                        />
                      </div>
                      
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <Switch
                          id="public"
                          checked={playlistIsPublic}
                          onCheckedChange={setPlaylistIsPublic}
                        />
                        <Label htmlFor="public">پلی‌لیست عمومی (قابل مشاهده برای همه)</Label>
                      </div>
                    </div>
                    
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsCreatePlaylistOpen(false);
                          setSelectedPlaylist(null);
                          setPlaylistName("");
                          setPlaylistDescription("");
                          setPlaylistIsPublic(false);
                        }}
                      >
                        انصراف
                      </Button>
                      <Button
                        onClick={handleCreatePlaylist}
                        disabled={!playlistName.trim() || createPlaylistMutation.isPending}
                      >
                        {createPlaylistMutation.isPending ? (
                          <div className="flex items-center">
                            <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin ml-2"></div>
                            در حال پردازش...
                          </div>
                        ) : (
                          selectedPlaylist ? 'ویرایش پلی‌لیست' : 'ساخت پلی‌لیست'
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                
                {/* Delete Playlist Dialog */}
                <Dialog open={isDeletePlaylistOpen} onOpenChange={setIsDeletePlaylistOpen}>
                  <DialogContent className="bg-dark-card border-dark-border">
                    <DialogHeader>
                      <DialogTitle className="text-destructive">حذف پلی‌لیست</DialogTitle>
                      <DialogDescription>
                        آیا از حذف پلی‌لیست "{selectedPlaylist?.name}" اطمینان دارید؟
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="text-text-secondary mb-2">
                      این عملیات غیرقابل بازگشت است و تمامی محتوای پلی‌لیست حذف خواهد شد.
                    </div>
                    
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsDeletePlaylistOpen(false);
                          setSelectedPlaylist(null);
                        }}
                      >
                        انصراف
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={handleDeletePlaylist}
                        disabled={deletePlaylistMutation.isPending}
                      >
                        {deletePlaylistMutation.isPending ? (
                          <div className="flex items-center">
                            <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin ml-2"></div>
                            در حال حذف...
                          </div>
                        ) : (
                          <>
                            <Trash2 className="h-4 w-4 ml-1" />
                            حذف پلی‌لیست
                          </>
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              
              {playlistsLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3].map(i => (
                    <Skeleton key={i} className="h-48 rounded-lg" />
                  ))}
                </div>
              ) : playlists.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {playlists.map((playlist) => (
                    <Card key={playlist.id} className="bg-dark-card border-dark-border h-full">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg">{playlist.name}</CardTitle>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => openEditPlaylist(playlist)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive"
                              onClick={() => openDeletePlaylistDialog(playlist)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <CardDescription className="line-clamp-1">
                          {playlist.description || "بدون توضیحات"}
                        </CardDescription>
                      </CardHeader>
                      
                      <CardContent className="pb-2">
                        <div className="flex items-center justify-between text-xs text-text-secondary mb-3">
                          <div className="flex items-center gap-1">
                            <CalendarDays className="h-3 w-3" />
                            <span>{formatDate(playlist.createdAt)}</span>
                          </div>
                          <div>
                            {playlist.isPublic ? (
                              <span className="flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                عمومی
                              </span>
                            ) : (
                              <span className="flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                خصوصی
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="h-28 overflow-hidden relative rounded-md">
                          {playlist.items && playlist.items.length > 0 ? (
                            <div className="grid grid-cols-3 gap-1 h-full">
                              {playlist.items.slice(0, 3).map((item, index) => (
                                <div key={index} className="h-full overflow-hidden">
                                  <img
                                    src={item.content?.poster || ''}
                                    alt={item.content?.title || ''}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              ))}
                              {playlist.items.length > 3 && (
                                <div className="absolute inset-0 bg-dark/60 flex items-center justify-center">
                                  <div className="text-lg font-bold">+{playlist.items.length - 3}</div>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="flex items-center justify-center h-full bg-dark text-text-secondary">
                              <span>بدون محتوا</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                      
                      <CardFooter>
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => setLocation(`/playlist/${playlist.id}`)}
                        >
                          مشاهده پلی‌لیست
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="bg-dark-card border-dark-border text-center py-12">
                  <CardContent>
                    <List className="h-16 w-16 mx-auto mb-4 text-text-secondary opacity-20" />
                    <h3 className="text-lg font-medium mb-2">هنوز پلی‌لیستی نساخته‌اید</h3>
                    <p className="text-text-secondary mb-4">با ساخت پلی‌لیست، محتواهای مورد علاقه‌تان را دسته‌بندی کنید</p>
                    <Button onClick={() => setIsCreatePlaylistOpen(true)}>
                      <Plus className="h-4 w-4 ml-1" />
                      ساخت پلی‌لیست جدید
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

// Helper function to get badge info
function getBadgeInfo(badgeName: string) {
  const badgeData: Record<string, { title: string, color: string, icon: React.ReactNode }> = {
    'active_user': { 
      title: 'کاربر فعال', 
      color: 'bg-accent-purple',
      icon: 'ف'
    },
    'critic': { 
      title: 'منتقد حرفه‌ای', 
      color: 'bg-accent-orange',
      icon: 'م'
    },
    'animation_fan': { 
      title: 'فن انیمیشن', 
      color: 'bg-accent-green',
      icon: 'ا'
    },
    'series_fan': { 
      title: 'فن سریال', 
      color: 'bg-accent-blue',
      icon: 'س'
    }
  };
  
  return badgeData[badgeName] || { title: badgeName, color: 'bg-primary', icon: badgeName[0] };
}
