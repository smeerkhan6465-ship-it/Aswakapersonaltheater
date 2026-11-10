import React, { useState } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  Volume1,
  VolumeX,
  Maximize,
  Minimize,
  PictureInPicture2,
  Gauge,
  Keyboard,
} from 'lucide-react';
import { Timeline } from './Timeline';
import { SpeedMenu } from './SpeedMenu';
import { BufferedRange, PlaybackRate } from '../types/player';
import { formatTime } from '../utils/formatTime';

interface ControlsProps {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  bufferedRanges: BufferedRange[];
  volume: number;
  isMuted: boolean;
  playbackRate: PlaybackRate;
  isFullscreen: boolean;
  isPiPAvailable: boolean;
  isPiP: boolean;
  isVisible: boolean;
  disabled?: boolean;
  onTogglePlay: () => void;
  onSeek: (time: number) => void;
  onSeekDelta: (seconds: number) => void;
  onVolumeChange: (volume: number) => void;
  onToggleMute: () => void;
  onRateChange: (rate: PlaybackRate) => void;
  onToggleFullscreen: () => void;
  onTogglePiP: () => void;
  onOpenShortcuts?: () => void;
}

export const Controls: React.FC<ControlsProps> = ({
  isPlaying,
  currentTime,
  duration,
  bufferedRanges,
  volume,
  isMuted,
  playbackRate,
  isFullscreen,
  isPiPAvailable,
  isPiP,
  isVisible,
  disabled = false,
  onTogglePlay,
  onSeek,
  onSeekDelta,
  onVolumeChange,
  onToggleMute,
  onRateChange,
  onToggleFullscreen,
  onTogglePiP,
  onOpenShortcuts,
}) => {
  const [isSpeedOpen, setIsSpeedOpen] = useState(false);
  const [isVolumeHovered, setIsVolumeHovered] = useState(false);

  // Volume icon logic
  const renderVolumeIcon = () => {
    if (isMuted || volume === 0) {
      return <VolumeX className="w-4 h-4 text-zinc-300 group-hover:text-white" />;
    }
    if (volume < 0.5) {
      return <Volume1 className="w-4 h-4 text-zinc-300 group-hover:text-white" />;
    }
    return <Volume2 className="w-4 h-4 text-zinc-300 group-hover:text-white" />;
  };

  return (
    <div
      className={`absolute inset-x-0 bottom-0 z-20 px-3 sm:px-6 pb-3 sm:pb-4 pt-12 bg-gradient-to-t from-black/95 via-black/60 to-transparent transition-opacity duration-300 ${
        isVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
      onClick={(e) => e.stopPropagation()}
    >
      {/* 1. Timeline */}
      <div className="mb-2">
        <Timeline
          currentTime={currentTime}
          duration={duration}
          bufferedRanges={bufferedRanges}
          onSeek={onSeek}
          disabled={disabled}
        />
      </div>

      {/* 2. Control Row */}
      <div className="flex items-center justify-between gap-2 text-white">
        {/* Left Side: Playback & Volume */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Play / Pause */}
          <button
            type="button"
            onClick={onTogglePlay}
            disabled={disabled}
            aria-label={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
            className="p-1.5 sm:p-2 rounded-md hover:bg-white/10 active:scale-95 transition text-white disabled:opacity-40 disabled:pointer-events-none focus-visible:ring-1 focus-visible:ring-white"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current ml-0.5" />
            )}
          </button>

          {/* Quick Seek -5s */}
          <button
            type="button"
            onClick={() => onSeekDelta(-5)}
            disabled={disabled}
            aria-label="Seek back 5 seconds (Left Arrow)"
            title="Rewind 5s (←)"
            className="p-1.5 sm:p-2 rounded-md hover:bg-white/10 active:scale-95 transition text-zinc-300 hover:text-white disabled:opacity-40 disabled:pointer-events-none"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Quick Seek +5s */}
          <button
            type="button"
            onClick={() => onSeekDelta(5)}
            disabled={disabled}
            aria-label="Seek forward 5 seconds (Right Arrow)"
            title="Forward 5s (→)"
            className="p-1.5 sm:p-2 rounded-md hover:bg-white/10 active:scale-95 transition text-zinc-300 hover:text-white disabled:opacity-40 disabled:pointer-events-none"
          >
            <RotateCw className="w-4 h-4" />
          </button>

          {/* Volume Control */}
          <div
            className="relative flex items-center group"
            onMouseEnter={() => setIsVolumeHovered(true)}
            onMouseLeave={() => setIsVolumeHovered(false)}
          >
            <button
              type="button"
              onClick={onToggleMute}
              aria-label={isMuted ? 'Unmute (M)' : 'Mute (M)'}
              title="Mute / Unmute (M)"
              className="p-1.5 sm:p-2 rounded-md hover:bg-white/10 transition"
            >
              {renderVolumeIcon()}
            </button>

            {/* Volume Slider Drawer */}
            <div
              className={`flex items-center overflow-hidden transition-all duration-200 ${
                isVolumeHovered ? 'w-20 sm:w-24 px-1 opacity-100' : 'w-0 px-0 opacity-0'
              }`}
            >
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                aria-label="Volume slider"
                className="w-full h-1 bg-white/20 accent-white rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* Time Display */}
          <div className="flex items-center text-xs font-mono text-zinc-300 ml-1 select-none">
            <span className="text-white font-medium">{formatTime(currentTime)}</span>
            <span className="mx-1 text-zinc-500">/</span>
            <span className="text-zinc-400">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Right Side: Speed, PIP, Shortcuts, Fullscreen */}
        <div className="flex items-center gap-1 sm:gap-1.5 relative">
          {/* Keyboard Shortcuts Trigger */}
          {onOpenShortcuts && (
            <button
              type="button"
              onClick={onOpenShortcuts}
              title="VLC Keyboard Shortcuts"
              aria-label="Keyboard Shortcuts"
              className="hidden sm:inline-flex p-1.5 sm:p-2 rounded-md text-zinc-400 hover:text-white hover:bg-white/10 active:scale-95 transition"
            >
              <Keyboard className="w-4 h-4" />
            </button>
          )}

          {/* Speed Selector */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsSpeedOpen(!isSpeedOpen)}
              title="Playback Speed"
              aria-label={`Playback speed, current is ${playbackRate}x`}
              aria-haspopup="true"
              aria-expanded={isSpeedOpen}
              className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/10 transition"
            >
              <Gauge className="w-3.5 h-3.5" />
              <span className="font-mono">{playbackRate}x</span>
            </button>

            <SpeedMenu
              currentRate={playbackRate}
              onSelectRate={onRateChange}
              isOpen={isSpeedOpen}
              onClose={() => setIsSpeedOpen(false)}
            />
          </div>

          {/* Picture-in-Picture */}
          {isPiPAvailable && (
            <button
              type="button"
              onClick={onTogglePiP}
              title="Picture in Picture (P)"
              aria-label={isPiP ? 'Exit Picture in Picture' : 'Picture in Picture (P)'}
              className={`p-1.5 sm:p-2 rounded-md transition ${
                isPiP
                  ? 'text-white bg-white/20'
                  : 'text-zinc-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <PictureInPicture2 className="w-4 h-4" />
            </button>
          )}

          {/* Fullscreen */}
          <button
            type="button"
            onClick={onToggleFullscreen}
            title={isFullscreen ? 'Exit Fullscreen (F / Esc)' : 'Fullscreen (F)'}
            aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            className="p-1.5 sm:p-2 rounded-md text-zinc-300 hover:text-white hover:bg-white/10 active:scale-95 transition"
          >
            {isFullscreen ? (
              <Minimize className="w-4 h-4" />
            ) : (
              <Maximize className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
