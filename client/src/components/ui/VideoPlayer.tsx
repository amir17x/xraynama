import { useState, useRef, useEffect } from 'react';
import { Play, Pause, VolumeX, Volume2, Maximize, SkipForward, SkipBack, Settings } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface VideoPlayerProps {
  src: string;
  poster?: string;
  autoPlay?: boolean;
  qualityOptions?: { label: string; src: string }[];
  onTimeUpdate?: (currentTime: number) => void;
  onEnded?: () => void;
  className?: string;
}

export function VideoPlayer({
  src,
  poster,
  autoPlay = false,
  qualityOptions = [],
  onTimeUpdate,
  onEnded,
  className
}: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [selectedQuality, setSelectedQuality] = useState(
    qualityOptions.length > 0 ? qualityOptions[0] : { label: 'Default', src }
  );
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const controlsTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.play().catch(err => {
        console.error('Error playing video:', err);
        setIsPlaying(false);
      });
    } else {
      videoRef.current.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    if (!videoRef.current) return;
    
    videoRef.current.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  useEffect(() => {
    if (!videoRef.current) return;
    
    // Update to selected quality
    const currentTime = videoRef.current.currentTime;
    videoRef.current.src = selectedQuality.src;
    videoRef.current.currentTime = currentTime;
    
    if (isPlaying) {
      videoRef.current.play().catch(console.error);
    }
  }, [selectedQuality]);

  useEffect(() => {
    // Auto-hide controls after 3 seconds of inactivity
    const handleMouseMove = () => {
      setShowControls(true);
      
      if (controlsTimeout.current) {
        clearTimeout(controlsTimeout.current);
      }
      
      controlsTimeout.current = setTimeout(() => {
        if (isPlaying) {
          setShowControls(false);
        }
      }, 3000);
    };
    
    const playerElement = playerRef.current;
    if (playerElement) {
      playerElement.addEventListener('mousemove', handleMouseMove);
      playerElement.addEventListener('mouseleave', () => {
        if (isPlaying) {
          setShowControls(false);
        }
      });
      playerElement.addEventListener('mouseenter', () => {
        setShowControls(true);
      });
    }
    
    return () => {
      if (controlsTimeout.current) {
        clearTimeout(controlsTimeout.current);
      }
      
      if (playerElement) {
        playerElement.removeEventListener('mousemove', handleMouseMove);
      }
    };
  }, [isPlaying]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    
    return [
      h > 0 ? h.toString().padStart(2, '0') : null,
      m.toString().padStart(2, '0'),
      s.toString().padStart(2, '0')
    ].filter(Boolean).join(':');
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    
    const current = videoRef.current.currentTime;
    setCurrentTime(current);
    
    if (onTimeUpdate) {
      onTimeUpdate(current);
    }
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    
    setDuration(videoRef.current.duration);
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
    setIsMuted(value[0] === 0);
  };

  const handleToggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleSeek = (value: number[]) => {
    if (!videoRef.current) return;
    
    videoRef.current.currentTime = value[0];
    setCurrentTime(value[0]);
  };

  const handleToggleFullscreen = () => {
    if (!playerRef.current) return;
    
    if (!document.fullscreenElement) {
      playerRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const handleFullscreenChange = () => {
    setIsFullscreen(!!document.fullscreenElement);
  };

  useEffect(() => {
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const handleSkipForward = () => {
    if (!videoRef.current) return;
    
    videoRef.current.currentTime = Math.min(videoRef.current.duration, currentTime + 10);
  };

  const handleSkipBackward = () => {
    if (!videoRef.current) return;
    
    videoRef.current.currentTime = Math.max(0, currentTime - 10);
  };

  const handleSelectQuality = (quality: { label: string; src: string }) => {
    setSelectedQuality(quality);
  };

  return (
    <div 
      ref={playerRef}
      className={cn(
        "relative group overflow-hidden bg-black rounded-lg",
        isFullscreen ? "w-screen h-screen" : className
      )}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="w-full h-full object-contain"
        onClick={() => setIsPlaying(!isPlaying)}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => {
          setIsPlaying(false);
          if (onEnded) onEnded();
        }}
      />
      
      {/* Overlay for play/pause click handling */}
      <div 
        className="absolute inset-0 z-10 cursor-pointer"
        onClick={() => setIsPlaying(!isPlaying)}
      />
      
      {/* Center play/pause button (shows only when paused) */}
      {!isPlaying && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
          <Button 
            variant="default" 
            size="icon" 
            className="w-16 h-16 rounded-full bg-primary/70 hover:bg-primary backdrop-blur-sm"
            onClick={() => setIsPlaying(true)}
          >
            <Play className="h-8 w-8" />
          </Button>
        </div>
      )}
      
      {/* Controls bar */}
      <div 
        className={cn(
          "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-4 pt-16 pb-4 transition-opacity duration-300 z-30",
          !showControls && "opacity-0"
        )}
      >
        {/* Progress bar */}
        <div className="w-full mb-4">
          <Slider
            value={[currentTime]}
            min={0}
            max={duration || 100}
            step={0.1}
            onValueChange={handleSeek}
            className="cursor-pointer"
          />
          
          <div className="flex justify-between text-xs text-gray-300 mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
        
        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white hover:bg-white/20"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white hover:bg-white/20"
              onClick={handleSkipBackward}
            >
              <SkipBack className="h-5 w-5" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white hover:bg-white/20"
              onClick={handleSkipForward}
            >
              <SkipForward className="h-5 w-5" />
            </Button>
            
            <div className="flex items-center space-x-2 w-32">
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-white hover:bg-white/20"
                onClick={handleToggleMute}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="h-5 w-5" />
                ) : (
                  <Volume2 className="h-5 w-5" />
                )}
              </Button>
              
              <Slider
                value={[isMuted ? 0 : volume]}
                min={0}
                max={1}
                step={0.01}
                onValueChange={handleVolumeChange}
                className="cursor-pointer"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {qualityOptions.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-white hover:bg-white/20"
                  >
                    <Settings className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {qualityOptions.map((quality) => (
                    <DropdownMenuItem 
                      key={quality.label}
                      onClick={() => handleSelectQuality(quality)}
                      className={selectedQuality.label === quality.label ? "bg-primary/20" : ""}
                    >
                      {quality.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white hover:bg-white/20"
              onClick={handleToggleFullscreen}
            >
              <Maximize className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
