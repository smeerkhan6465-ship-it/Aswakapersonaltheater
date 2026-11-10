import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  Play,
  Pause,
  Loader2,
  Volume2,
  VolumeX,
  RotateCcw,
  RotateCw,
} from 'lucide-react';
import { Controls } from './Controls';
import { ErrorOverlay } from './ErrorOverlay';
import { ShortcutsModal } from './ShortcutsModal';
import { VideoSourceConfig } from '../config/video';
import {
  BufferedRange,
  PlaybackRate,
  PlayerError,
} from '../types/player';
import { diagnosePlaybackError } from '../utils/streamDiagnostics';

interface VideoPlayerProps {
  config: VideoSourceConfig;
  className?: string;
  onChangeUrl?: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  config,
  className = '',
  onChangeUrl,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hideControlsTimerRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutGuardRef = useRef<NodeJS.Timeout | null>(null);

  // Player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [bufferedRanges, setBufferedRanges] = useState<BufferedRange[]>([]);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState<PlaybackRate>(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPiP, setIsPiP] = useState(false);
  const [isPiPAvailable, setIsPiPAvailable] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [error, setError] = useState<PlayerError | null>(null);

  // Transient UI
  const [areControlsVisible, setAreControlsVisible] = useState(true);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [actionOverlay, setActionOverlay] = useState<{
    icon: 'play' | 'pause' | 'seek-forward' | 'seek-backward' | 'volume-up' | 'volume-down' | 'mute';
    text?: string;
  } | null>(null);
  const actionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Show quick transient feedback icon in center of player
  const triggerActionOverlay = useCallback(
    (
      icon: 'play' | 'pause' | 'seek-forward' | 'seek-backward' | 'volume-up' | 'volume-down' | 'mute',
      text?: string
    ) => {
      if (actionTimeoutRef.current) clearTimeout(actionTimeoutRef.current);
      setActionOverlay({ icon, text });
      actionTimeoutRef.current = setTimeout(() => {
        setActionOverlay(null);
      }, 650);
    },
    []
  );

  // Check Picture-in-Picture availability
  useEffect(() => {
    if (typeof document !== 'undefined') {
      setIsPiPAvailable(
        Boolean('pictureInPictureEnabled' in document && document.pictureInPictureEnabled)
      );
    }
  }, []);

  // Sync buffered ranges from actual HTMLVideoElement.buffered
  const updateBufferedRanges = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    const ranges: BufferedRange[] = [];
    const buf = video.buffered;
    for (let i = 0; i < buf.length; i++) {
      ranges.push({
        start: buf.start(i),
        end: buf.end(i),
      });
    }
    setBufferedRanges(ranges);
  }, []);

  // Controls auto-hide timer
  const scheduleControlsHide = useCallback(() => {
    if (hideControlsTimerRef.current) {
      clearTimeout(hideControlsTimerRef.current);
    }
    setAreControlsVisible(true);

    // Only hide if playing and mouse hasn't moved
    hideControlsTimerRef.current = setTimeout(() => {
      if (videoRef.current && !videoRef.current.paused && !videoRef.current.ended) {
        setAreControlsVisible(false);
      }
    }, 3000);
  }, []);

  const handleUserActivity = useCallback(() => {
    scheduleControlsHide();
  }, [scheduleControlsHide]);

  // Reset player and attempt playback when source config changes
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !config.src) return;

    setError(null);
    setIsLoading(true);
    setIsBuffering(false);
    setIsPlaying(false);
    setCurrentTime(0);
    setBufferedRanges([]);
    setDuration(config.durationEstimate || 0);

    // Set src and reload
    video.src = config.src;
    video.load();

    // Attempt automatic playback once ready
    const handleCanPlayAuto = () => {
      video.play().then(() => {
        setIsPlaying(true);
        setHasStarted(true);
      }).catch(() => {
        // Autoplay may be restricted by browser until user interaction
        setIsPlaying(false);
      });
      video.removeEventListener('canplay', handleCanPlayAuto);
    };
    video.addEventListener('canplay', handleCanPlayAuto);

    // Guard timeout: if video doesn't emit loadeddata/canplay within 12 seconds
    if (timeoutGuardRef.current) clearTimeout(timeoutGuardRef.current);
    timeoutGuardRef.current = setTimeout(() => {
      if (video.readyState < 2 && !video.error) {
        setIsLoading(false);
        const err = diagnosePlaybackError(null, config.src, true);
        setError(err);
      }
    }, 12000);

    return () => {
      video.removeEventListener('canplay', handleCanPlayAuto);
      if (timeoutGuardRef.current) clearTimeout(timeoutGuardRef.current);
      if (actionTimeoutRef.current) clearTimeout(actionTimeoutRef.current);
      if (hideControlsTimerRef.current) clearTimeout(hideControlsTimerRef.current);
    };
  }, [config.src, config.durationEstimate]);

  // Video event listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onLoadedMetadata = () => {
      if (timeoutGuardRef.current) clearTimeout(timeoutGuardRef.current);
      setDuration(video.duration || config.durationEstimate || 0);
      setIsLoading(false);
      updateBufferedRanges();
    };

    const onCanPlay = () => {
      if (timeoutGuardRef.current) clearTimeout(timeoutGuardRef.current);
      setIsLoading(false);
      setIsBuffering(false);
    };

    const onTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      updateBufferedRanges();
    };

    const onProgress = () => {
      updateBufferedRanges();
    };

    const onPlay = () => {
      setIsPlaying(true);
      setHasStarted(true);
      scheduleControlsHide();
    };

    const onPause = () => {
      setIsPlaying(false);
      setAreControlsVisible(true);
    };

    const onWaiting = () => {
      setIsBuffering(true);
    };

    const onPlaying = () => {
      setIsBuffering(false);
      setIsLoading(false);
    };

    const onSeeked = () => {
      setIsBuffering(false);
      updateBufferedRanges();
    };

    const onError = () => {
      if (timeoutGuardRef.current) clearTimeout(timeoutGuardRef.current);
      setIsLoading(false);
      setIsBuffering(false);
      setIsPlaying(false);
      const diagnosed = diagnosePlaybackError(video.error, config.src, false);
      setError(diagnosed);
    };

    const onRateChange = () => {
      setPlaybackRate(video.playbackRate as PlaybackRate);
    };

    const onVolumeChange = () => {
      setVolume(video.volume);
      setIsMuted(video.muted);
    };

    const onEnterPiP = () => setIsPiP(true);
    const onLeavePiP = () => setIsPiP(false);

    video.addEventListener('loadedmetadata', onLoadedMetadata);
    video.addEventListener('canplay', onCanPlay);
    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('progress', onProgress);
    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('waiting', onWaiting);
    video.addEventListener('playing', onPlaying);
    video.addEventListener('seeked', onSeeked);
    video.addEventListener('error', onError);
    video.addEventListener('ratechange', onRateChange);
    video.addEventListener('volumechange', onVolumeChange);
    video.addEventListener('enterpictureinpicture', onEnterPiP);
    video.addEventListener('leavepictureinpicture', onLeavePiP);

    return () => {
      video.removeEventListener('loadedmetadata', onLoadedMetadata);
      video.removeEventListener('canplay', onCanPlay);
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('progress', onProgress);
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('waiting', onWaiting);
      video.removeEventListener('playing', onPlaying);
      video.removeEventListener('seeked', onSeeked);
      video.removeEventListener('error', onError);
      video.removeEventListener('ratechange', onRateChange);
      video.removeEventListener('volumechange', onVolumeChange);
      video.removeEventListener('enterpictureinpicture', onEnterPiP);
      video.removeEventListener('leavepictureinpicture', onLeavePiP);
    };
  }, [config.src, config.durationEstimate, scheduleControlsHide, updateBufferedRanges]);

  // Track Fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isDocFullscreen = Boolean(
        document.fullscreenElement ||
          (document as any).webkitFullscreenElement ||
          (document as any).mozFullScreenElement ||
          (document as any).msFullscreenElement
      );
      setIsFullscreen(isDocFullscreen);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  // Primary playback actions
  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video || error) return;

    if (video.paused || video.ended) {
      video.play().catch((err) => {
        console.warn('Playback play() prevented:', err);
      });
      triggerActionOverlay('play');
    } else {
      video.pause();
      triggerActionOverlay('pause');
    }
  }, [error, triggerActionOverlay]);

  const seekTo = useCallback(
    (time: number) => {
      const video = videoRef.current;
      if (!video) return;

      const safeTime = Math.max(0, Math.min(duration || 0, time));
      video.currentTime = safeTime;
      setCurrentTime(safeTime);
    },
    [duration]
  );

  const seekDelta = useCallback(
    (seconds: number) => {
      const video = videoRef.current;
      if (!video) return;

      const target = Math.max(0, Math.min(duration || 0, video.currentTime + seconds));
      video.currentTime = target;
      setCurrentTime(target);
      triggerActionOverlay(seconds > 0 ? 'seek-forward' : 'seek-backward', `${seconds > 0 ? '+' : ''}${seconds}s`);
    },
    [duration, triggerActionOverlay]
  );

  const handleVolumeChange = useCallback(
    (newVolume: number) => {
      const video = videoRef.current;
      if (!video) return;

      const clamped = Math.max(0, Math.min(1, newVolume));
      video.volume = clamped;
      video.muted = clamped === 0;
      setVolume(clamped);
      setIsMuted(clamped === 0);
      triggerActionOverlay(clamped === 0 ? 'mute' : 'volume-up', `${Math.round(clamped * 100)}%`);
    },
    [triggerActionOverlay]
  );

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    setIsMuted(video.muted);
    triggerActionOverlay(video.muted ? 'mute' : 'volume-up', video.muted ? 'Muted' : `${Math.round(volume * 100)}%`);
  }, [volume, triggerActionOverlay]);

  const handleRateChange = useCallback((rate: PlaybackRate) => {
    const video = videoRef.current;
    if (!video) return;

    video.playbackRate = rate;
    setPlaybackRate(rate);
  }, []);

  const toggleFullscreen = useCallback(async () => {
    const container = containerRef.current;
    const video = videoRef.current;
    if (!container) return;

    try {
      if (!isFullscreen) {
        if (container.requestFullscreen) {
          await container.requestFullscreen();
        } else if ((container as any).webkitRequestFullscreen) {
          (container as any).webkitRequestFullscreen();
        } else if ((video as any)?.webkitEnterFullscreen) {
          (video as any).webkitEnterFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          (document as any).webkitExitFullscreen();
        }
      }
    } catch (err) {
      console.warn('Fullscreen request failed:', err);
    }
  }, [isFullscreen]);

  const togglePiP = useCallback(async () => {
    const video = videoRef.current;
    if (!video || !('pictureInPictureEnabled' in document)) return;

    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await video.requestPictureInPicture();
      }
    } catch (err) {
      console.warn('PiP toggle failed:', err);
    }
  }, []);

  // Keyboard shortcuts (VLC Standard)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in inputs or textareas
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }

      // Ignore modifier combinations
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          seekDelta(-5);
          break;
        case 'ArrowRight':
          e.preventDefault();
          seekDelta(5);
          break;
        case 'ArrowUp':
          e.preventDefault();
          handleVolumeChange(Math.min(1, volume + 0.1));
          break;
        case 'ArrowDown':
          e.preventDefault();
          handleVolumeChange(Math.max(0, volume - 0.1));
          break;
        case 'KeyM':
          e.preventDefault();
          toggleMute();
          break;
        case 'KeyF':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'KeyP':
          e.preventDefault();
          togglePiP();
          break;
        case 'Escape':
          if (isFullscreen) {
            e.preventDefault();
            toggleFullscreen();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    togglePlay,
    seekDelta,
    handleVolumeChange,
    toggleMute,
    toggleFullscreen,
    togglePiP,
    volume,
    isFullscreen,
  ]);

  const handleRetry = () => {
    setError(null);
    setIsLoading(true);
    if (videoRef.current) {
      videoRef.current.src = config.src;
      videoRef.current.load();
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleUserActivity}
      onTouchStart={handleUserActivity}
      className={`relative w-full aspect-video bg-black rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl border border-[#292929] group select-none ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none border-none aspect-auto h-screen' : ''
      } ${className}`}
    >
      {/* HTML5 Video Element */}
      <video
        ref={videoRef}
        playsInline
        preload="metadata"
        poster={config.poster}
        onClick={togglePlay}
        onDoubleClick={toggleFullscreen}
        className="w-full h-full object-contain cursor-pointer"
        tabIndex={-1}
      >
        {config.subtitles?.map((sub) => (
          <track
            key={sub.id}
            kind="subtitles"
            label={sub.label}
            srcLang={sub.srcLang}
            src={sub.src}
            default={sub.default}
          />
        ))}
      </video>

      {/* Loading Spinner & Buffering Indicator */}
      {(isLoading || isBuffering) && !error && (
        <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center bg-black/40 backdrop-blur-[2px] transition-all">
          <div className="p-3.5 rounded-xl bg-black/80 border border-[#292929] shadow-2xl flex flex-col items-center gap-2">
            <Loader2 className="w-7 h-7 text-white animate-spin" />
            <span className="text-[11px] font-mono text-zinc-400">
              {isLoading ? 'Loading video...' : 'Buffering...'}
            </span>
          </div>
        </div>
      )}

      {/* Transient Action Feedback Icon */}
      {actionOverlay && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-20">
          <div className="p-4 rounded-xl bg-black/80 backdrop-blur-md border border-[#292929] shadow-2xl flex flex-col items-center gap-1.5 animate-in fade-in zoom-in-75 duration-150">
            {actionOverlay.icon === 'play' && <Play className="w-8 h-8 fill-current text-white" />}
            {actionOverlay.icon === 'pause' && <Pause className="w-8 h-8 fill-current text-white" />}
            {actionOverlay.icon === 'seek-backward' && <RotateCcw className="w-8 h-8 text-white" />}
            {actionOverlay.icon === 'seek-forward' && <RotateCw className="w-8 h-8 text-white" />}
            {actionOverlay.icon === 'volume-up' && <Volume2 className="w-8 h-8 text-white" />}
            {actionOverlay.icon === 'volume-down' && <Volume2 className="w-8 h-8 text-white" />}
            {actionOverlay.icon === 'mute' && <VolumeX className="w-8 h-8 text-white" />}
            {actionOverlay.text && (
              <span className="text-xs font-mono font-semibold text-white tracking-wide">
                {actionOverlay.text}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Center Big Play Button (shown when paused, no error, and not currently loading) */}
      {!isPlaying && !isLoading && !error && (
        <div
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center cursor-pointer pointer-events-auto z-10 transition-opacity"
        >
          <button
            type="button"
            aria-label="Play video"
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-2xl transition-all duration-200 group/btn"
          >
            <Play className="w-7 h-7 sm:w-8 sm:h-8 fill-white text-white ml-1 group-hover/btn:scale-110 transition-transform" />
          </button>
        </div>
      )}

      {/* Bottom Floating Controls Bar */}
      <Controls
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={duration}
        bufferedRanges={bufferedRanges}
        volume={volume}
        isMuted={isMuted}
        playbackRate={playbackRate}
        isFullscreen={isFullscreen}
        isPiPAvailable={isPiPAvailable}
        isPiP={isPiP}
        isVisible={areControlsVisible || !isPlaying || error !== null}
        disabled={Boolean(error)}
        onTogglePlay={togglePlay}
        onSeek={seekTo}
        onSeekDelta={seekDelta}
        onVolumeChange={handleVolumeChange}
        onToggleMute={toggleMute}
        onRateChange={handleRateChange}
        onToggleFullscreen={toggleFullscreen}
        onTogglePiP={togglePiP}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
      />

      {/* Error Overlay */}
      {error && (
        <ErrorOverlay
          error={error}
          onRetry={handleRetry}
          sourceUrl={config.src}
          onChangeUrl={onChangeUrl}
        />
      )}

      {/* Shortcuts Modal */}
      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />
    </div>
  );
};
