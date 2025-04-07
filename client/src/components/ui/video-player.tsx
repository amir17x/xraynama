import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, ChevronDown, RotateCcw, Clock, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { insertWatchHistorySchema } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';

interface VideoPlayerProps {
  videoId: number;
  contentId: number;
  videoUrls: {
    '480p': string;
    '720p': string;
    '1080p': string;
  };
  onClose?: () => void;
}

export function VideoPlayer({ videoId, contentId, videoUrls, onClose }: VideoPlayerProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [quality, setQuality] = useState<'480p' | '720p' | '1080p'>('720p');
  const [showControls, setShowControls] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Timer to hide controls
  const controlsTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    
    // Set video source based on quality
    video.src = videoUrls[quality];
    
    // Update progress while playing
    const updateProgress = () => {
      setCurrentTime(video.currentTime);
      setDuration(video.duration);
    };
    
    // Event listeners
    video.addEventListener('timeupdate', updateProgress);
    video.addEventListener('durationchange', updateProgress);
    video.addEventListener('play', () => setIsPlaying(true));
    video.addEventListener('pause', () => setIsPlaying(false));
    
    // Save progress every 5 seconds if user is logged in
    const progressInterval = setInterval(() => {
      if (user && video.currentTime > 0) {
        saveProgress(video.currentTime);
      }
    }, 5000);
    
    return () => {
      video.removeEventListener('timeupdate', updateProgress);
      video.removeEventListener('durationchange', updateProgress);
      video.removeEventListener('play', () => setIsPlaying(true));
      video.removeEventListener('pause', () => setIsPlaying(false));
      clearInterval(progressInterval);
      
      // Save progress on unmount
      if (user && video.currentTime > 0) {
        saveProgress(video.currentTime);
      }
    };
  }, [quality, videoUrls, user, videoId, contentId]);
  
  // Save watching progress to server
  const saveProgress = async (progress: number) => {
    if (!user) return;
    
    try {
      const watchData = insertWatchHistorySchema.parse({
        userId: user.id,
        contentId,
        videoId,
        progress: Math.floor(progress)
      });
      
      await apiRequest('POST', '/api/watch-history', watchData);
    } catch (error) {
      console.error('Error saving watch progress:', error);
    }
  };
  
  // Handle controls visibility
  useEffect(() => {
    const handleMouseMove = () => {
      setShowControls(true);
      
      // Reset timer
      if (controlsTimerRef.current) {
        clearTimeout(controlsTimerRef.current);
      }
      
      // Hide controls after 3 seconds of inactivity
      controlsTimerRef.current = setTimeout(() => {
        if (isPlaying) {
          setShowControls(false);
        }
      }, 3000);
    };
    
    const player = playerRef.current;
    if (player) {
      player.addEventListener('mousemove', handleMouseMove);
    }
    
    return () => {
      if (player) {
        player.removeEventListener('mousemove', handleMouseMove);
      }
      
      if (controlsTimerRef.current) {
        clearTimeout(controlsTimerRef.current);
      }
    };
  }, [isPlaying]);
  
  // Toggle play/pause
  const togglePlay = () => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch(error => {
        toast({
          title: "خطا در پخش ویدیو",
          description: "لطفاً دوباره تلاش کنید.",
          variant: "destructive"
        });
        console.error('Error playing video:', error);
      });
    }
  };
  
  // Toggle mute
  const toggleMute = () => {
    if (!videoRef.current) return;
    
    if (isMuted) {
      videoRef.current.muted = false;
      setIsMuted(false);
      setVolume(videoRef.current.volume);
    } else {
      videoRef.current.muted = true;
      setIsMuted(true);
    }
  };
  
  // Handle volume change
  const handleVolumeChange = (value: number[]) => {
    if (!videoRef.current) return;
    
    const newVolume = value[0];
    videoRef.current.volume = newVolume;
    setVolume(newVolume);
    
    if (newVolume === 0) {
      setIsMuted(true);
      videoRef.current.muted = true;
    } else if (isMuted) {
      setIsMuted(false);
      videoRef.current.muted = false;
    }
  };
  
  // Handle seek
  const handleSeek = (value: number[]) => {
    if (!videoRef.current) return;
    
    const newTime = value[0];
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };
  
  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!playerRef.current) return;
    
    if (!isFullscreen) {
      if (playerRef.current.requestFullscreen) {
        playerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };
  
  // Monitor fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);
  
  // Format time (seconds to MM:SS)
  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '00:00';
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  // Rewind 10 seconds
  const rewind = () => {
    if (!videoRef.current) return;
    
    videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 10);
  };
  
  // Forward 10 seconds
  const forward = () => {
    if (!videoRef.current) return;
    
    videoRef.current.currentTime = Math.min(videoRef.current.duration, videoRef.current.currentTime + 10);
  };
  
  // Change video quality
  const changeQuality = (newQuality: '480p' | '720p' | '1080p') => {
    if (quality === newQuality) return;
    
    // Remember current time and playing state
    const currentProgress = videoRef.current?.currentTime || 0;
    const wasPlaying = isPlaying;
    
    // Change quality
    setQuality(newQuality);
    setIsSettingsOpen(false);
    
    // After source change, restore position and play state
    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.currentTime = currentProgress;
        
        if (wasPlaying) {
          videoRef.current.play().catch(error => {
            console.error('Error resuming video after quality change:', error);
          });
        }
      }
    }, 100);
  };

  return (
    <div 
      ref={playerRef} 
      className="relative w-full h-full bg-black aspect-video overflow-hidden rounded-lg"
      onDoubleClick={toggleFullscreen}
      onClick={togglePlay}
    >
      <video
        ref={videoRef}
        className="w-full h-full"
        playsInline
        onClick={(e) => e.stopPropagation()}
      />
      
      {/* Video Controls Overlay */}
      <div 
        className={`absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/10 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top controls - Title and close button */}
        <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between">
          {onClose && (
            <Button
              onClick={onClose}
              variant="ghost"
              className="text-white hover:bg-black/30 rounded-full p-2 h-auto"
            >
              <ChevronDown className="h-6 w-6" />
            </Button>
          )}
        </div>
        
        {/* Center controls - Play/Pause */}
        <div className="absolute inset-0 flex items-center justify-center">
          {!isPlaying && (
            <Button
              onClick={togglePlay}
              variant="ghost"
              className="text-white bg-primary/80 hover:bg-primary rounded-full p-8"
            >
              <Play className="h-16 w-16 fill-white" />
            </Button>
          )}
        </div>
        
        {/* Bottom controls - Progress bar, play/pause, volume, quality, fullscreen */}
        <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2">
          {/* Progress bar */}
          <div className="flex items-center gap-2">
            <span className="text-white text-sm">{formatTime(currentTime)}</span>
            <Slider
              value={[currentTime]}
              min={0}
              max={duration || 100}
              step={1}
              onValueChange={handleSeek}
              className="flex-1"
            />
            <span className="text-white text-sm">{formatTime(duration)}</span>
          </div>
          
          {/* Control buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                onClick={togglePlay}
                variant="ghost"
                className="text-white hover:bg-black/30 rounded-full p-2 h-auto"
              >
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              </Button>
              
              <Button
                onClick={rewind}
                variant="ghost"
                className="text-white hover:bg-black/30 rounded-full p-2 h-auto"
              >
                <RotateCcw className="h-4 w-4" />
                <span className="ml-1 text-xs">10</span>
              </Button>
              
              <div className="flex items-center gap-1">
                <Button
                  onClick={toggleMute}
                  variant="ghost"
                  className="text-white hover:bg-black/30 rounded-full p-2 h-auto"
                >
                  {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                </Button>
                <Slider
                  value={[isMuted ? 0 : volume]}
                  min={0}
                  max={1}
                  step={0.1}
                  onValueChange={handleVolumeChange}
                  className="w-20"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Settings/Quality */}
              <div className="relative">
                <Button
                  onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                  variant="ghost"
                  className="text-white hover:bg-black/30 rounded-full p-2 h-auto"
                >
                  <Settings className="h-5 w-5" />
                </Button>
                
                {isSettingsOpen && (
                  <div className="absolute bottom-12 right-0 bg-black/90 rounded-lg p-3 w-48 backdrop-blur-sm border border-gray-700">
                    <p className="text-gray-400 text-sm mb-2">کیفیت پخش</p>
                    <div className="space-y-1">
                      {(['1080p', '720p', '480p'] as const).map((q) => (
                        <Button
                          key={q}
                          onClick={() => changeQuality(q)}
                          variant={quality === q ? "secondary" : "ghost"}
                          className={`w-full justify-start ${quality === q ? 'bg-primary/50' : ''}`}
                          size="sm"
                        >
                          {q}
                          {quality === q && " (انتخاب شده)"}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <Button
                onClick={toggleFullscreen}
                variant="ghost"
                className="text-white hover:bg-black/30 rounded-full p-2 h-auto"
              >
                <Maximize className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
