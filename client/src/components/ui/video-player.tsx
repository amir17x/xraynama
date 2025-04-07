import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Settings, SkipForward, SkipBack } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { QualitySource } from '@shared/schema';

interface VideoPlayerProps {
  sources: QualitySource[];
  title: string;
  autoPlay?: boolean;
  onProgress?: (progress: number) => void;
  onComplete?: () => void;
  poster?: string;
  watchParty?: boolean;
  onStateChange?: (state: {
    isPlaying: boolean;
    currentTime: number;
    volume: number;
  }) => void;
  remoteState?: {
    isPlaying: boolean;
    currentTime: number;
    isRemoteAction: boolean;
  };
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  sources,
  title,
  autoPlay = false,
  onProgress,
  onComplete,
  poster,
  watchParty = false,
  onStateChange,
  remoteState
}) => {
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [selectedQuality, setSelectedQuality] = useState<string>('720p');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isControlsVisible, setIsControlsVisible] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);
  const [hideControlsTimeout, setHideControlsTimeout] = useState<NodeJS.Timeout | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  
  // Find the matching quality source
  const currentSource = sources.find(
    (source) => source.quality === selectedQuality && source.type === 'stream'
  ) || sources[0];

  // Handle play/pause
  const togglePlay = () => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    
    setIsPlaying(!isPlaying);
    
    // Notify if in watch party mode
    if (watchParty && onStateChange) {
      onStateChange({
        isPlaying: !isPlaying,
        currentTime: videoRef.current.currentTime,
        volume
      });
    }
  };
  
  // Handle volume change
  const handleVolumeChange = (newVolume: number[]) => {
    if (!videoRef.current) return;
    
    const volumeValue = newVolume[0];
    setVolume(volumeValue);
    videoRef.current.volume = volumeValue;
    
    if (volumeValue === 0) {
      setIsMuted(true);
    } else if (isMuted) {
      setIsMuted(false);
    }
  };
  
  // Toggle mute
  const toggleMute = () => {
    if (!videoRef.current) return;
    
    if (isMuted) {
      videoRef.current.volume = volume;
    } else {
      videoRef.current.volume = 0;
    }
    
    setIsMuted(!isMuted);
  };
  
  // Handle seeking
  const handleSeek = (newTime: number[]) => {
    if (!videoRef.current) return;
    
    const seekTime = newTime[0];
    videoRef.current.currentTime = seekTime;
    setCurrentTime(seekTime);
    
    // Notify if in watch party mode
    if (watchParty && onStateChange) {
      onStateChange({
        isPlaying,
        currentTime: seekTime,
        volume
      });
    }
  };
  
  // Handle quality change
  const handleQualityChange = (quality: string) => {
    if (!videoRef.current) return;
    
    // Save current time before changing source
    const currentVideoTime = videoRef.current.currentTime;
    const wasPlaying = !videoRef.current.paused;
    
    setSelectedQuality(quality);
    
    // Restore time and play state after source change
    // This happens via useEffect that watches selectedQuality
    videoRef.current.addEventListener('loadeddata', function onLoaded() {
      if (videoRef.current) {
        videoRef.current.currentTime = currentVideoTime;
        if (wasPlaying) {
          videoRef.current.play().catch(() => {});
        }
        videoRef.current.removeEventListener('loadeddata', onLoaded);
      }
    });
  };
  
  // Handle fullscreen toggle
  const toggleFullscreen = () => {
    if (!playerRef.current) return;
    
    if (!document.fullscreenElement) {
      playerRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };
  
  // Handle fullscreen change event
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
  const formatTime = (timeInSeconds: number): string => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  // Handle video events
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    
    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      
      if (onProgress) {
        onProgress(video.currentTime);
      }
      
      // Check if video is complete
      if (video.currentTime >= video.duration - 1 && onComplete) {
        onComplete();
      }
    };
    
    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };
    
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleWaiting = () => setIsBuffering(true);
    const handlePlaying = () => setIsBuffering(false);
    
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('playing', handlePlaying);
    
    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('playing', handlePlaying);
    };
  }, [onProgress, onComplete]);
  
  // Handle watch party sync
  useEffect(() => {
    if (!watchParty || !remoteState || !videoRef.current || !remoteState.isRemoteAction) return;
    
    // Sync play/pause state
    if (remoteState.isPlaying !== isPlaying) {
      if (remoteState.isPlaying) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
      setIsPlaying(remoteState.isPlaying);
    }
    
    // Sync current time if difference is more than 2 seconds
    if (Math.abs(remoteState.currentTime - currentTime) > 2) {
      videoRef.current.currentTime = remoteState.currentTime;
      setCurrentTime(remoteState.currentTime);
    }
  }, [remoteState, watchParty, isPlaying, currentTime]);
  
  // Auto-hide controls
  useEffect(() => {
    const handleMouseMove = () => {
      setIsControlsVisible(true);
      
      if (hideControlsTimeout) {
        clearTimeout(hideControlsTimeout);
      }
      
      // Hide controls after 3 seconds of inactivity
      const timeout = setTimeout(() => {
        if (isPlaying) {
          setIsControlsVisible(false);
        }
      }, 3000);
      
      setHideControlsTimeout(timeout);
    };
    
    const playerElement = playerRef.current;
    if (playerElement) {
      playerElement.addEventListener('mousemove', handleMouseMove);
      playerElement.addEventListener('mouseenter', handleMouseMove);
      playerElement.addEventListener('mouseleave', () => {
        if (isPlaying) {
          setIsControlsVisible(false);
        }
      });
    }
    
    return () => {
      if (playerElement) {
        playerElement.removeEventListener('mousemove', handleMouseMove);
        playerElement.removeEventListener('mouseenter', handleMouseMove);
        playerElement.removeEventListener('mouseleave', () => {});
      }
      
      if (hideControlsTimeout) {
        clearTimeout(hideControlsTimeout);
      }
    };
  }, [isPlaying, hideControlsTimeout]);
  
  // Skip forward/backward
  const skipForward = () => {
    if (!videoRef.current) return;
    videoRef.current.currentTime += 10;
    setCurrentTime(videoRef.current.currentTime);
    
    if (watchParty && onStateChange) {
      onStateChange({
        isPlaying,
        currentTime: videoRef.current.currentTime,
        volume
      });
    }
  };
  
  const skipBackward = () => {
    if (!videoRef.current) return;
    videoRef.current.currentTime -= 10;
    setCurrentTime(videoRef.current.currentTime);
    
    if (watchParty && onStateChange) {
      onStateChange({
        isPlaying,
        currentTime: videoRef.current.currentTime,
        volume
      });
    }
  };
  
  return (
    <div 
      ref={playerRef} 
      className="relative w-full bg-black rounded-lg overflow-hidden"
      style={{ aspectRatio: '16/9' }}
    >
      <video
        ref={videoRef}
        src={currentSource?.sourceUrl}
        poster={poster}
        className="w-full h-full"
        autoPlay={autoPlay}
        muted={isMuted}
        onClick={togglePlay}
        controlsList="nodownload"
      />
      
      {/* Play/Pause Large Overlay Button */}
      {(!isPlaying || isControlsVisible) && (
        <button
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/40 backdrop-blur-sm rounded-full p-4 text-white transition-opacity duration-300"
          onClick={togglePlay}
          aria-label={isPlaying ? 'مکث' : 'پخش'}
        >
          {isPlaying ? (
            <Pause className="h-10 w-10" />
          ) : (
            <Play className="h-10 w-10" />
          )}
        </button>
      )}
      
      {/* Buffering Indicator */}
      {isBuffering && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
        </div>
      )}
      
      {/* Controls Overlay */}
      <div 
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4 transition-opacity duration-200 ${
          isControlsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Title */}
        <div className="text-white text-sm font-medium mb-2">{title}</div>
        
        {/* Timeline */}
        <div className="mb-2">
          <Slider
            value={[currentTime]}
            min={0}
            max={duration || 100}
            step={0.1}
            onValueChange={handleSeek}
            className="h-1.5"
          />
        </div>
        
        {/* Controls Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 space-x-reverse">
            {/* Play/Pause */}
            <Button
              size="icon"
              variant="ghost"
              onClick={togglePlay}
              className="text-white h-8 w-8 hover:bg-white/10"
              aria-label={isPlaying ? 'مکث' : 'پخش'}
            >
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </Button>
            
            {/* Skip Backward */}
            <Button
              size="icon"
              variant="ghost"
              onClick={skipBackward}
              className="text-white h-8 w-8 hover:bg-white/10"
              aria-label="10 ثانیه به عقب"
            >
              <SkipBack className="h-5 w-5" />
            </Button>
            
            {/* Skip Forward */}
            <Button
              size="icon"
              variant="ghost"
              onClick={skipForward}
              className="text-white h-8 w-8 hover:bg-white/10"
              aria-label="10 ثانیه به جلو"
            >
              <SkipForward className="h-5 w-5" />
            </Button>
            
            {/* Volume Control */}
            <div className="flex items-center space-x-2 space-x-reverse">
              <Button
                size="icon"
                variant="ghost"
                onClick={toggleMute}
                className="text-white h-8 w-8 hover:bg-white/10"
                aria-label={isMuted ? 'صدا روشن' : 'بی صدا'}
              >
                {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
              </Button>
              <div className="w-20">
                <Slider
                  value={[isMuted ? 0 : volume]}
                  min={0}
                  max={1}
                  step={0.01}
                  onValueChange={handleVolumeChange}
                  className="h-1.5"
                />
              </div>
            </div>
            
            {/* Time Display */}
            <div className="text-white/80 text-xs">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>
          
          <div className="flex items-center space-x-2 space-x-reverse">
            {/* Quality Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-white h-8 w-8 hover:bg-white/10"
                  aria-label="تنظیمات کیفیت"
                >
                  <Settings className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="min-w-[8rem] bg-dark-card border-dark-border">
                {[...new Set(sources.filter(s => s.type === 'stream').map(s => s.quality))].map((quality) => (
                  <DropdownMenuItem
                    key={quality}
                    onClick={() => handleQualityChange(quality)}
                    className={`${selectedQuality === quality ? 'bg-primary/20' : ''}`}
                  >
                    {quality}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* Fullscreen Toggle */}
            <Button
              size="icon"
              variant="ghost"
              onClick={toggleFullscreen}
              className="text-white h-8 w-8 hover:bg-white/10"
              aria-label={isFullscreen ? 'خروج از تمام‌صفحه' : 'تمام‌صفحه'}
            >
              <Maximize className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
