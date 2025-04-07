import { useState, useEffect } from 'react';
import { useLocation, useRoute } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { ContentType, PlaylistType, WatchHistoryType } from '@/types';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ContentCard } from '@/components/common/ContentCard';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Loader2,
  Heart,
  ListVideo,
  Clock,
  Settings,
  Plus,
  Edit,
  Trash2,
  Eye,
  Calendar,
  Film,
  Layers,
  Star,
  Trophy,
  Eye as EyeIcon,
  User,
  Lock,
  AtSign,
  AlertCircle
} from 'lucide-react';

export default function ProfilePage() {
  const [match, params] = useRoute('/profile');
  const [, setLocation] = useLocation();
  const { user, isLoading: isAuthLoading, logoutMutation } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('favorites');
  const [isCreatingPlaylist, setIsCreatingPlaylist] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistDescription, setNewPlaylistDescription] = useState('');
  const [newPlaylistPublic, setNewPlaylistPublic] = useState(false);
  const [editProfile, setEditProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Parse tab from URL
  useEffect(() => {
    const searchParams = new URLSearchParams(params);
    const tabParam = searchParams.get('tab');
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [params]);

  // Update URL when tab changes
  useEffect(() => {
    setLocation(`/profile?tab=${activeTab}`, { replace: true });
  }, [activeTab, setLocation]);

  // Prefill profile data when user is loaded
  useEffect(() => {
    if (user) {
      setProfileData({
        ...profileData,
        name: user.name || '',
        email: user.email || ''
      });
    }
  }, [user]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthLoading && !user) {
      setLocation('/auth', { replace: true });
    }
  }, [isAuthLoading, user, setLocation]);

  // Fetch favorites
  const { 
    data: favorites, 
    isLoading: isFavoritesLoading 
  } = useQuery<ContentType[]>({
    queryKey: ['/api/user/favorites'],
    enabled: !!user && activeTab === 'favorites',
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Fetch watchlist
  const { 
    data: watchlist, 
    isLoading: isWatchlistLoading 
  } = useQuery<ContentType[]>({
    queryKey: ['/api/user/watchlist'],
    enabled: !!user && activeTab === 'watchlist',
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Fetch watch history
  const { 
    data: watchHistory, 
    isLoading: isHistoryLoading 
  } = useQuery<WatchHistoryType[]>({
    queryKey: ['/api/user/history'],
    enabled: !!user && activeTab === 'history',
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Fetch playlists
  const { 
    data: playlists, 
    isLoading: isPlaylistsLoading 
  } = useQuery<PlaylistType[]>({
    queryKey: ['/api/user/playlists'],
    enabled: !!user && activeTab === 'playlists',
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Create playlist mutation
  const createPlaylistMutation = useMutation({
    mutationFn: async (data: { name: string; description: string; isPublic: boolean }) => {
      return apiRequest('POST', '/api/playlists', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/playlists'] });
      setNewPlaylistName('');
      setNewPlaylistDescription('');
      setNewPlaylistPublic(false);
      setIsCreatingPlaylist(false);
      toast({
        title: 'پلی‌لیست جدید',
        description: 'پلی‌لیست با موفقیت ایجاد شد',
      });
    },
    onError: (error) => {
      toast({
        title: 'خطا',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Delete playlist mutation
  const deletePlaylistMutation = useMutation({
    mutationFn: async (playlistId: number) => {
      return apiRequest('DELETE', `/api/playlists/${playlistId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/playlists'] });
      toast({
        title: 'حذف پلی‌لیست',
        description: 'پلی‌لیست با موفقیت حذف شد',
      });
    },
    onError: (error) => {
      toast({
        title: 'خطا',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('PATCH', '/api/user', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      toast({
        title: 'پروفایل به‌روزرسانی شد',
        description: 'اطلاعات پروفایل شما با موفقیت به‌روزرسانی شد',
      });
      setEditProfile(false);
      setProfileData({
        ...profileData,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    },
    onError: (error) => {
      toast({
        title: 'خطا',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  // Handle create playlist
  const handleCreatePlaylist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) {
      toast({
        title: 'خطا',
        description: 'نام پلی‌لیست نمی‌تواند خالی باشد',
        variant: 'destructive',
      });
      return;
    }
    
    createPlaylistMutation.mutate({
      name: newPlaylistName,
      description: newPlaylistDescription,
      isPublic: newPlaylistPublic,
    });
  };

  // Handle delete playlist
  const handleDeletePlaylist = (playlistId: number) => {
    if (confirm('آیا از حذف این پلی‌لیست اطمینان دارید؟')) {
      deletePlaylistMutation.mutate(playlistId);
    }
  };

  // Handle profile update
  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    let updateData: any = {};
    
    if (profileData.name !== user?.name) {
      updateData.name = profileData.name;
    }
    
    if (profileData.email !== user?.email) {
      updateData.email = profileData.email;
    }
    
    if (profileData.newPassword) {
      if (!profileData.currentPassword) {
        toast({
          title: 'خطا',
          description: 'برای تغییر رمز عبور، ابتدا رمز عبور فعلی را وارد کنید',
          variant: 'destructive',
        });
        return;
      }
      
      if (profileData.newPassword !== profileData.confirmPassword) {
        toast({
          title: 'خطا',
          description: 'رمز عبور جدید و تکرار آن باید یکسان باشند',
          variant: 'destructive',
        });
        return;
      }
      
      updateData.currentPassword = profileData.currentPassword;
      updateData.newPassword = profileData.newPassword;
    }
    
    if (Object.keys(updateData).length === 0) {
      toast({
        title: 'هشدار',
        description: 'تغییری در اطلاعات ایجاد نشده است',
      });
      return;
    }
    
    updateProfileMutation.mutate(updateData);
  };

  // Handle profile field change
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fa-IR').format(date);
  };

  // Loading state
  if (isAuthLoading) {
    return (
      <>
        <Header />
        <main className="container mx-auto px-4 py-8 min-h-[70vh] flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </main>
        <Footer />
      </>
    );
  }

  // Not authenticated
  if (!user) {
    return null; // Redirecting to auth page
  }

  return (
    <>
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="glass-effect rounded-lg p-6 mb-8">
            <div className="flex flex-col md:flex-row items-center md:items-start justify-between">
              <div className="flex flex-col md:flex-row items-center mb-4 md:mb-0">
                <Avatar className="w-24 h-24 md:w-32 md:h-32 border-2 border-primary">
                  <AvatarImage src={user.avatar || undefined} />
                  <AvatarFallback className="text-2xl md:text-4xl bg-muted text-primary font-semibold">
                    {user.name?.charAt(0) || user.username.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="mt-4 md:mt-0 md:mr-6 text-center md:text-right">
                  <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1">
                    {user.name || user.username}
                  </h1>
                  <p className="text-muted-foreground mb-2">@{user.username}</p>
                  <div className="flex items-center justify-center md:justify-start mt-2">
                    <span className="inline-flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-1" />
                      عضویت از {formatDate(user.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-2 rtl:space-x-reverse">
                <Button 
                  variant="outline" 
                  onClick={() => setActiveTab('settings')}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  تنظیمات
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => logoutMutation.mutate()}
                  disabled={logoutMutation.isPending}
                >
                  {logoutMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'خروج'
                  )}
                </Button>
              </div>
            </div>
          </div>
          
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="w-full sm:w-auto mb-6">
              <TabsTrigger value="favorites" className="flex-1 sm:flex-none">
                <Heart className="h-4 w-4 mr-2" />
                علاقه‌مندی‌ها
              </TabsTrigger>
              <TabsTrigger value="watchlist" className="flex-1 sm:flex-none">
                <ListVideo className="h-4 w-4 mr-2" />
                لیست تماشا
              </TabsTrigger>
              <TabsTrigger value="playlists" className="flex-1 sm:flex-none">
                <Layers className="h-4 w-4 mr-2" />
                پلی‌لیست‌ها
              </TabsTrigger>
              <TabsTrigger value="history" className="flex-1 sm:flex-none">
                <Clock className="h-4 w-4 mr-2" />
                تاریخچه
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex-1 sm:flex-none">
                <Settings className="h-4 w-4 mr-2" />
                تنظیمات
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="favorites">
              <Card>
                <CardHeader>
                  <CardTitle>علاقه‌مندی‌های من</CardTitle>
                  <CardDescription>محتواهایی که به لیست علاقه‌مندی‌های خود اضافه کرده‌اید</CardDescription>
                </CardHeader>
                <CardContent>
                  {isFavoritesLoading ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : favorites && favorites.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                      {favorites.map(item => (
                        <ContentCard 
                          key={item.id} 
                          content={item} 
                          isInFavorites={true}
                          className="w-full"
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-xl font-medium text-foreground mb-2">لیست علاقه‌مندی‌های شما خالی است</h3>
                      <p className="text-muted-foreground mb-6">محتواهایی که به لیست علاقه‌مندی‌های خود اضافه می‌کنید، اینجا نمایش داده می‌شوند</p>
                      <Button onClick={() => setLocation('/')}>مشاهده محتواها</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="watchlist">
              <Card>
                <CardHeader>
                  <CardTitle>لیست تماشای من</CardTitle>
                  <CardDescription>محتواهایی که برای تماشا در آینده ذخیره کرده‌اید</CardDescription>
                </CardHeader>
                <CardContent>
                  {isWatchlistLoading ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : watchlist && watchlist.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                      {watchlist.map(item => (
                        <ContentCard 
                          key={item.id} 
                          content={item} 
                          isInWatchlist={true}
                          className="w-full"
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <ListVideo className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-xl font-medium text-foreground mb-2">لیست تماشای شما خالی است</h3>
                      <p className="text-muted-foreground mb-6">محتواهایی که به لیست تماشای خود اضافه می‌کنید، اینجا نمایش داده می‌شوند</p>
                      <Button onClick={() => setLocation('/')}>مشاهده محتواها</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="playlists">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>پلی‌لیست‌های من</CardTitle>
                    <CardDescription>لیست‌های شخصی محتواهای مورد علاقه شما</CardDescription>
                  </div>
                  
                  <Dialog open={isCreatingPlaylist} onOpenChange={setIsCreatingPlaylist}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        پلی‌لیست جدید
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>ایجاد پلی‌لیست جدید</DialogTitle>
                        <DialogDescription>
                          یک پلی‌لیست جدید با محتواهای مورد علاقه خود بسازید
                        </DialogDescription>
                      </DialogHeader>
                      
                      <form onSubmit={handleCreatePlaylist}>
                        <div className="grid gap-4 py-4">
                          <div className="grid gap-2">
                            <Label htmlFor="name">نام پلی‌لیست</Label>
                            <Input 
                              id="name" 
                              value={newPlaylistName}
                              onChange={(e) => setNewPlaylistName(e.target.value)}
                              placeholder="نام پلی‌لیست را وارد کنید"
                              className="col-span-3" 
                            />
                          </div>
                          
                          <div className="grid gap-2">
                            <Label htmlFor="description">توضیحات (اختیاری)</Label>
                            <Textarea 
                              id="description" 
                              value={newPlaylistDescription}
                              onChange={(e) => setNewPlaylistDescription(e.target.value)}
                              placeholder="توضیحات پلی‌لیست را وارد کنید"
                              className="col-span-3 min-h-[100px]" 
                            />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <Label htmlFor="public">نمایش عمومی</Label>
                            <Switch 
                              id="public" 
                              checked={newPlaylistPublic}
                              onCheckedChange={setNewPlaylistPublic}
                            />
                          </div>
                        </div>
                        
                        <DialogFooter>
                          <Button 
                            type="submit"
                            disabled={!newPlaylistName.trim() || createPlaylistMutation.isPending}
                          >
                            {createPlaylistMutation.isPending ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                در حال ایجاد...
                              </>
                            ) : 'ایجاد پلی‌لیست'}
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                
                <CardContent>
                  {isPlaylistsLoading ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : playlists && playlists.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {playlists.map(playlist => (
                        <div 
                          key={playlist.id} 
                          className="border border-border rounded-lg overflow-hidden hover:border-primary transition-colors duration-300"
                        >
                          <div className="bg-card p-6">
                            <div className="flex justify-between items-start mb-4">
                              <h3 className="text-lg font-medium text-foreground">{playlist.name}</h3>
                              <div className="flex space-x-1 rtl:space-x-reverse">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8"
                                  onClick={() => handleDeletePlaylist(playlist.id)}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8"
                                  onClick={() => setLocation(`/playlist/${playlist.id}`)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            
                            {playlist.description && (
                              <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{playlist.description}</p>
                            )}
                            
                            <div className="flex justify-between items-center text-sm text-muted-foreground">
                              <div className="flex items-center">
                                <Film className="h-4 w-4 mr-1" />
                                <span>{playlist.items?.length || 0} مورد</span>
                              </div>
                              
                              <div className="flex items-center">
                                {playlist.isPublic ? (
                                  <span className="inline-flex items-center text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                                    <Eye className="h-3 w-3 mr-1" />
                                    عمومی
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                                    <Lock className="h-3 w-3 mr-1" />
                                    خصوصی
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            <div className="mt-4">
                              <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => setLocation(`/playlist/${playlist.id}`)}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                مشاهده پلی‌لیست
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Layers className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-xl font-medium text-foreground mb-2">شما هنوز پلی‌لیستی نساخته‌اید</h3>
                      <p className="text-muted-foreground mb-6">با ایجاد پلی‌لیست، محتواهای مورد علاقه خود را دسته‌بندی کنید</p>
                      <Button onClick={() => setIsCreatingPlaylist(true)}>ایجاد پلی‌لیست</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="history">
              <Card>
                <CardHeader>
                  <CardTitle>تاریخچه تماشا</CardTitle>
                  <CardDescription>محتواهایی که اخیراً تماشا کرده‌اید</CardDescription>
                </CardHeader>
                <CardContent>
                  {isHistoryLoading ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : watchHistory && watchHistory.length > 0 ? (
                    <div className="space-y-4">
                      {watchHistory.map(item => (
                        <div key={item.id} className="flex border-b border-border pb-4 last:border-0">
                          <div className="flex-shrink-0 w-32 md:w-40">
                            <img 
                              src={item.content?.poster} 
                              alt={item.content?.title} 
                              className="w-full h-auto rounded-md"
                            />
                          </div>
                          
                          <div className="mr-4 flex-grow">
                            <h3 className="font-medium text-foreground mb-1">{item.content?.title}</h3>
                            <p className="text-sm text-muted-foreground mb-2">{item.content?.englishTitle}</p>
                            
                            {item.episode ? (
                              <div className="inline-flex items-center text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded mb-2">
                                فصل {item.episode.seasonId} - قسمت {item.episode.episodeNumber}
                              </div>
                            ) : null}
                            
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Clock className="h-4 w-4 mr-1" />
                              <span>تماشا شده در {formatDate(item.updatedAt)}</span>
                            </div>
                            
                            <div className="mt-3 flex justify-between items-center">
                              <div className="flex items-center">
                                {item.completed ? (
                                  <span className="inline-flex items-center text-xs bg-green-200 text-green-800 dark:bg-green-900 dark:text-green-200 px-2 py-0.5 rounded-full">
                                    <Check className="h-3 w-3 mr-1" />
                                    تماشا شده
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center text-xs bg-yellow-200 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 px-2 py-0.5 rounded-full">
                                    <Play className="h-3 w-3 mr-1" />
                                    ناتمام ({Math.floor(item.position / 60)}:{(item.position % 60).toString().padStart(2, '0')})
                                  </span>
                                )}
                              </div>
                              
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setLocation(`/content/${item.contentId}`)}
                              >
                                <Play className="h-4 w-4 mr-2" />
                                ادامه تماشا
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Clock className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-xl font-medium text-foreground mb-2">تاریخچه تماشای شما خالی است</h3>
                      <p className="text-muted-foreground mb-6">محتواهایی که تماشا می‌کنید، اینجا نمایش داده می‌شوند</p>
                      <Button onClick={() => setLocation('/')}>مشاهده محتواها</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle>تنظیمات حساب کاربری</CardTitle>
                  <CardDescription>
                    اطلاعات پروفایل و تنظیمات حساب کاربری خود را مدیریت کنید
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <h3 className="text-lg font-medium text-foreground">اطلاعات شخصی</h3>
                      <p className="text-sm text-muted-foreground">
                        اطلاعات اصلی حساب کاربری خود را ویرایش کنید
                      </p>
                    </div>
                    
                    <Separator className="my-4" />
                    
                    <form onSubmit={handleProfileUpdate} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="name">نام و نام خانوادگی</Label>
                          <Input 
                            id="name"
                            name="name"
                            placeholder="نام و نام خانوادگی خود را وارد کنید"
                            value={profileData.name}
                            onChange={handleProfileChange}
                            disabled={!editProfile || updateProfileMutation.isPending}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="email">آدرس ایمیل</Label>
                          <Input 
                            id="email"
                            name="email"
                            type="email"
                            placeholder="آدرس ایمیل خود را وارد کنید"
                            value={profileData.email}
                            onChange={handleProfileChange}
                            disabled={!editProfile || updateProfileMutation.isPending}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="username">نام کاربری</Label>
                          <Input 
                            id="username"
                            value={user.username}
                            disabled
                            className="bg-muted"
                          />
                          <p className="text-xs text-muted-foreground">
                            نام کاربری قابل تغییر نیست
                          </p>
                        </div>
                      </div>
                      
                      {editProfile && (
                        <>
                          <div className="mt-8 space-y-2">
                            <h3 className="text-lg font-medium text-foreground">تغییر رمز عبور</h3>
                            <p className="text-sm text-muted-foreground">
                              برای تغییر رمز عبور، ابتدا رمز عبور فعلی را وارد کنید
                            </p>
                          </div>
                          
                          <Separator className="my-4" />
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <Label htmlFor="currentPassword">رمز عبور فعلی</Label>
                              <Input 
                                id="currentPassword"
                                name="currentPassword"
                                type="password"
                                placeholder="رمز عبور فعلی خود را وارد کنید"
                                value={profileData.currentPassword}
                                onChange={handleProfileChange}
                                disabled={updateProfileMutation.isPending}
                              />
                            </div>
                            
                            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-2">
                                <Label htmlFor="newPassword">رمز عبور جدید</Label>
                                <Input 
                                  id="newPassword"
                                  name="newPassword"
                                  type="password"
                                  placeholder="رمز عبور جدید را وارد کنید"
                                  value={profileData.newPassword}
                                  onChange={handleProfileChange}
                                  disabled={updateProfileMutation.isPending}
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor="confirmPassword">تکرار رمز عبور جدید</Label>
                                <Input 
                                  id="confirmPassword"
                                  name="confirmPassword"
                                  type="password"
                                  placeholder="رمز عبور جدید را مجدداً وارد کنید"
                                  value={profileData.confirmPassword}
                                  onChange={handleProfileChange}
                                  disabled={updateProfileMutation.isPending}
                                />
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                      
                      <div className="flex justify-end mt-6 space-x-2 rtl:space-x-reverse">
                        {editProfile ? (
                          <>
                            <Button 
                              type="button" 
                              variant="outline"
                              onClick={() => {
                                setEditProfile(false);
                                setProfileData({
                                  ...profileData,
                                  name: user.name || '',
                                  email: user.email || '',
                                  currentPassword: '',
                                  newPassword: '',
                                  confirmPassword: '',
                                });
                              }}
                              disabled={updateProfileMutation.isPending}
                            >
                              انصراف
                            </Button>
                            
                            <Button 
                              type="submit"
                              disabled={updateProfileMutation.isPending}
                            >
                              {updateProfileMutation.isPending ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  در حال ذخیره...
                                </>
                              ) : 'ذخیره تغییرات'}
                            </Button>
                          </>
                        ) : (
                          <Button 
                            type="button"
                            onClick={() => setEditProfile(true)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            ویرایش اطلاعات
                          </Button>
                        )}
                      </div>
                    </form>
                    
                    <div className="mt-12 space-y-2">
                      <h3 className="text-lg font-medium text-foreground">اقدامات حساب کاربری</h3>
                      <p className="text-sm text-muted-foreground">
                        اقدامات مربوط به مدیریت حساب کاربری
                      </p>
                    </div>
                    
                    <Separator className="my-4" />
                    
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-4 border border-border rounded-lg hover:border-destructive/50 transition-colors">
                        <div>
                          <h4 className="font-medium text-foreground">حذف حساب کاربری</h4>
                          <p className="text-sm text-muted-foreground">
                            حساب کاربری شما و تمام اطلاعات مرتبط با آن حذف خواهد شد
                          </p>
                        </div>
                        
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="destructive">حذف حساب</Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>حذف حساب کاربری</DialogTitle>
                              <DialogDescription>
                                آیا از حذف حساب کاربری خود اطمینان دارید؟ این عمل غیرقابل بازگشت است و تمام اطلاعات شما حذف خواهد شد.
                              </DialogDescription>
                            </DialogHeader>
                            
                            <div className="flex items-center p-3 rounded-lg bg-destructive/10 text-destructive">
                              <AlertCircle className="h-6 w-6 mr-2 flex-shrink-0" />
                              <p className="text-sm">
                                با حذف حساب کاربری، تمامی علاقه‌مندی‌ها، لیست تماشا، پلی‌لیست‌ها، نظرات و تاریخچه تماشای شما پاک خواهد شد.
                              </p>
                            </div>
                            
                            <DialogFooter>
                              <Button variant="outline">انصراف</Button>
                              <Button variant="destructive">
                                تأیید و حذف حساب
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </>
  );
}

// Import missing icons
import { Check } from 'lucide-react';
