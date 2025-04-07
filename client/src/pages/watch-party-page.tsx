import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import VideoPlayer from "@/components/ui/video-player";
import { Content, Episode, QualitySource, User, WatchParty } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Card, 
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Users, 
  Link as LinkIcon, 
  Copy, 
  Loader2, 
  Send,
  AlertTriangle,
  ArrowLeft,
  Info,
  Clock
} from "lucide-react";

interface WatchPartyPageProps {}

interface WatchPartyMember {
  id: number;
  userId: number;
  partyId: number;
  joinedAt: string;
  user?: User;
}

interface WatchPartyChatMessage {
  id: number;
  partyId: number;
  userId: number;
  message: string;
  createdAt: string;
  user?: User;
}

interface PlayerState {
  isPlaying: boolean;
  currentTime: number;
  volume: number;
  isRemoteAction: boolean;
}

// WebSocket message types
type WebSocketMessage = 
  | { type: 'join-party', partyCode: string, clientId?: string }
  | { type: 'joined', clientId: string, clients: string[] }
  | { type: 'user-joined', clientId: string, clients: string[] }
  | { type: 'user-left', clientId: string, clients: string[] }
  | { type: 'chat', clientId: string, message: string, timestamp: Date }
  | { type: 'player-state', clientId: string, isPlaying: boolean, currentTime: number };

const WatchPartyPage: React.FC<WatchPartyPageProps> = () => {
  const { code } = useParams();
  const [location, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [connectedUsers, setConnectedUsers] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [playerState, setPlayerState] = useState<PlayerState>({
    isPlaying: false,
    currentTime: 0,
    volume: 0.8,
    isRemoteAction: false
  });
  
  // WebSocket connection
  const wsRef = useRef<WebSocket | null>(null);
  const clientIdRef = useRef<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Fetch watch party data
  const { 
    data: watchPartyData,
    isLoading,
    error
  } = useQuery({
    queryKey: [`/api/watch-parties/${code}`],
    queryFn: async () => {
      const res = await fetch(`/api/watch-parties/${code}`);
      if (!res.ok) throw new Error("Watch party not found or expired");
      return res.json();
    }
  });
  
  // Join watch party mutation
  const joinWatchPartyMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/watch-parties/${code}/join`);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "با موفقیت به تماشای گروهی پیوستید",
        description: "اکنون می‌توانید با دوستان خود فیلم تماشا کنید"
      });
    },
    onError: (error) => {
      toast({
        title: "خطا در پیوستن به تماشای گروهی",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  // Send chat message mutation
  const sendChatMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      const res = await apiRequest("POST", `/api/watch-parties/${code}/chat`, { message });
      return res.json();
    }
  });
  
  // Initialize WebSocket connection
  useEffect(() => {
    if (!code || !user) return;
    
    // Create client ID if not already set
    if (!clientIdRef.current) {
      clientIdRef.current = `user_${user.id}_${Date.now()}`;
    }
    
    // Create WebSocket connection
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      setIsConnected(true);
      // Join party
      ws.send(JSON.stringify({
        type: 'join-party',
        partyCode: code,
        clientId: clientIdRef.current
      }));
    };
    
    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data) as WebSocketMessage;
        
        switch (message.type) {
          case 'joined':
          case 'user-joined':
          case 'user-left':
            // Update connected users list
            setConnectedUsers(message.clients);
            
            // Show toast for user joined/left
            if (message.type === 'user-joined' && message.clientId !== clientIdRef.current) {
              toast({
                title: "کاربر جدید",
                description: "یک کاربر به تماشای گروهی پیوست"
              });
            } else if (message.type === 'user-left') {
              toast({
                title: "کاربر خارج شد",
                description: "یک کاربر از تماشای گروهی خارج شد"
              });
            }
            break;
            
          case 'chat':
            // Add message to chat
            if (message.clientId !== clientIdRef.current) {
              setMessages(prev => [...prev, {
                id: Date.now(),
                userId: 0, // We don't know the actual user ID from WS
                message: message.message,
                timestamp: message.timestamp,
                isRemote: true,
                clientId: message.clientId
              }]);
            }
            break;
            
          case 'player-state':
            // Update player state if message is from another user
            if (message.clientId !== clientIdRef.current) {
              setPlayerState({
                isPlaying: message.isPlaying,
                currentTime: message.currentTime,
                volume: playerState.volume, // Keep current volume
                isRemoteAction: true
              });
            }
            break;
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
    
    ws.onclose = () => {
      setIsConnected(false);
      toast({
        title: "اتصال قطع شد",
        description: "اتصال به سرور تماشای گروهی قطع شد. در حال تلاش برای اتصال مجدد...",
        variant: "destructive"
      });
      
      // Try to reconnect after 5 seconds
      setTimeout(() => {
        if (wsRef.current === ws) {
          wsRef.current = null;
        }
      }, 5000);
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      toast({
        title: "خطا در اتصال",
        description: "مشکلی در برقراری ارتباط با سرور تماشای گروهی به وجود آمد",
        variant: "destructive"
      });
    };
    
    wsRef.current = ws;
    
    // Clean up on unmount
    return () => {
      ws.close();
    };
  }, [code, user, toast]);
  
  // Handle player state changes
  const handlePlayerStateChange = (state: { isPlaying: boolean, currentTime: number, volume: number }) => {
    // Update local state
    setPlayerState({
      ...state,
      isRemoteAction: false
    });
    
    // Send state to server
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'player-state',
        clientId: clientIdRef.current,
        isPlaying: state.isPlaying,
        currentTime: state.currentTime
      }));
    }
  };
  
  // Handle chat submission
  const handleSendChat = () => {
    if (!chatInput.trim() || !code || !user) return;
    
    // Add message to local chat
    const newMessage = {
      id: Date.now(),
      userId: user.id,
      message: chatInput,
      timestamp: new Date(),
      isLocal: true
    };
    setMessages(prev => [...prev, newMessage]);
    
    // Save to database
    sendChatMessageMutation.mutate(chatInput);
    
    // Send via WebSocket
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'chat',
        clientId: clientIdRef.current,
        message: chatInput,
        timestamp: new Date()
      }));
    }
    
    // Clear input
    setChatInput("");
  };
  
  // Scroll to bottom of chat on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  // Copy watch party link to clipboard
  const copyLinkToClipboard = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      toast({
        title: "لینک کپی شد",
        description: "لینک تماشای گروهی در کلیپ‌بورد کپی شد"
      });
    });
  };
  
  // Format timestamp
  const formatTime = (dateStr: string | Date) => {
    const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
    return date.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
  };
  
  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <h2 className="text-xl font-bold mb-2">در حال بارگذاری تماشای گروهی</h2>
          <p className="text-text-secondary">لطفاً منتظر بمانید...</p>
        </div>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="bg-dark-card border-dark-border max-w-xl mx-auto">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl flex items-center gap-2">
              <AlertTriangle className="h-6 w-6 text-destructive" />
              خطا در بارگذاری تماشای گروهی
            </CardTitle>
            <CardDescription>
              تماشای گروهی مورد نظر یافت نشد یا منقضی شده است
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-4">
            <p className="text-text-secondary mb-6">
              ممکن است لینک تماشای گروهی نامعتبر باشد یا زمان آن منقضی شده باشد. می‌توانید یک تماشای گروهی جدید ایجاد کنید.
            </p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => navigate("/")} className="w-full">
              <ArrowLeft className="ml-2 h-5 w-5" />
              بازگشت به صفحه اصلی
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  if (!watchPartyData) return null;
  
  const { content, episode, sources, members = [], messages: serverMessages = [] } = watchPartyData;
  
  // Combine server messages with local WebSocket messages
  const allMessages = [
    ...serverMessages.map((msg: WatchPartyChatMessage) => ({
      id: msg.id,
      userId: msg.userId,
      message: msg.message,
      timestamp: msg.createdAt,
      user: msg.user
    })),
    ...messages
  ].sort((a, b) => {
    const timeA = new Date(a.timestamp).getTime();
    const timeB = new Date(b.timestamp).getTime();
    return timeA - timeB;
  });
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-4 flex justify-between items-center flex-wrap gap-2">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Users className="h-6 w-6 text-primary" />
          تماشای گروهی - {content?.title || "محتوا"}
        </h1>
        
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
          <span className="text-sm text-text-secondary">
            {isConnected ? 'متصل' : 'قطع ارتباط'}
          </span>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="ml-2"
                  onClick={copyLinkToClipboard}
                >
                  <Copy className="h-4 w-4 ml-1" />
                  <span className="hidden sm:inline">کپی لینک</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>اشتراک‌گذاری با دوستان</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <Button
            variant="default"
            size="sm"
            onClick={() => navigate(`/content/${content.id}`)}
          >
            <Info className="h-4 w-4 ml-1" />
            <span className="hidden sm:inline">اطلاعات محتوا</span>
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Video Player */}
        <div className="lg:col-span-2">
          {sources && sources.length > 0 ? (
            <VideoPlayer
              sources={sources.filter(s => s.type === 'stream')}
              title={episode ? `${content.title} - ${episode.title}` : content.title}
              poster={content.poster}
              autoPlay={true}
              watchParty={true}
              onStateChange={handlePlayerStateChange}
              remoteState={playerState}
            />
          ) : (
            <div className="aspect-video bg-dark-card rounded-lg flex items-center justify-center">
              <div className="text-center p-4">
                <AlertTriangle className="h-12 w-12 text-accent-orange mx-auto mb-2" />
                <h3 className="font-bold text-lg mb-1">منبع پخش یافت نشد</h3>
                <p className="text-text-secondary">
                  متأسفانه منبع پخش برای این محتوا در دسترس نیست
                </p>
              </div>
            </div>
          )}
          
          {/* Content Info */}
          <div className="mt-4 p-4 bg-dark-card rounded-lg">
            <h2 className="text-lg font-bold mb-2">{content.title}</h2>
            <p className="text-text-secondary text-sm line-clamp-2">{content.synopsis}</p>
            
            {episode && (
              <div className="mt-2 pt-2 border-t border-dark-border">
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-primary px-2 py-0.5 rounded-md">
                    S{episode.season.toString().padStart(2, '0')}E{episode.episode.toString().padStart(2, '0')}
                  </span>
                  <h3 className="font-medium text-sm">{episode.title}</h3>
                </div>
              </div>
            )}
            
            <div className="mt-4 flex items-center justify-between">
              <div className="text-xs text-text-secondary flex items-center">
                <Clock className="h-4 w-4 ml-1" />
                کد تماشای گروهی: <span className="font-mono font-bold text-white px-1">{code}</span>
              </div>
              <div className="text-xs text-text-secondary">
                {connectedUsers.length} کاربر آنلاین
              </div>
            </div>
          </div>
        </div>
        
        {/* Chat Panel */}
        <div className="lg:col-span-1">
          <Card className="bg-dark-card border-dark-border h-full flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                گفتگوی زنده
                <span className="bg-primary/20 text-primary-light text-xs rounded-full px-2 py-0.5 mr-2">
                  {connectedUsers.length}
                </span>
              </CardTitle>
              <CardDescription>
                با دوستان خود در حین تماشا گفتگو کنید
              </CardDescription>
            </CardHeader>
            
            <CardContent className="flex-1 overflow-hidden">
              <ScrollArea className="h-[calc(70vh-13rem)] pr-4">
                <div className="space-y-4">
                  {allMessages.length === 0 ? (
                    <div className="text-center py-8 text-text-secondary">
                      <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-20" />
                      <p>هنوز پیامی ارسال نشده است</p>
                      <p className="text-xs mt-1">اولین نفری باشید که پیام می‌فرستد!</p>
                    </div>
                  ) : (
                    allMessages.map((msg) => {
                      const isCurrentUser = msg.userId === user?.id || msg.isLocal;
                      
                      return (
                        <div 
                          key={msg.id} 
                          className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`flex items-start max-w-[85%] ${isCurrentUser ? 'flex-row-reverse' : ''}`}>
                            <Avatar className={`${isCurrentUser ? 'mr-2' : 'ml-2'} mt-0.5`}>
                              {msg.user?.avatar ? (
                                <AvatarImage src={msg.user.avatar} />
                              ) : null}
                              <AvatarFallback>
                                {(msg.user?.displayName || msg.user?.username || "?").charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs text-text-secondary">
                                  {formatTime(msg.timestamp)}
                                </span>
                                <span className={`text-sm font-medium ${isCurrentUser ? 'text-primary-light' : 'text-white'}`}>
                                  {msg.user?.displayName || msg.user?.username || "کاربر ناشناس"}
                                </span>
                              </div>
                              
                              <div className={`rounded-lg px-3 py-2 text-sm ${
                                isCurrentUser 
                                  ? 'bg-primary-dark text-white' 
                                  : 'bg-dark-lighter text-white'
                              }`}>
                                {msg.message}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
            </CardContent>
            
            <CardFooter className="border-t border-dark-border pt-3">
              <form 
                className="flex w-full gap-2" 
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendChat();
                }}
              >
                <Input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="پیام خود را بنویسید..."
                  className="flex-1 bg-dark"
                  maxLength={200}
                  disabled={!isConnected || sendChatMessageMutation.isPending}
                />
                <Button 
                  type="submit" 
                  disabled={!chatInput.trim() || !isConnected || sendChatMessageMutation.isPending}
                >
                  {sendChatMessageMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </form>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default WatchPartyPage;

// Helper component for message icons
const MessageSquare = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);
