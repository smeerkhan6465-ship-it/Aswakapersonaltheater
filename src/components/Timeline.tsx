import React, { useRef, useState, useCallback, useEffect } from 'react';
import { BufferedRange } from '../types/player';
import { formatTime } from '../utils/formatTime';

interface TimelineProps {
  currentTime: number;
  duration: number;
  bufferedRanges: BufferedRange[];
  onSeek: (time: number) => void;
  disabled?: boolean;
}

export const Timeline: React.FC<TimelineProps> = ({
  currentTime,
  duration,
  bufferedRanges,
  onSeek,
  disabled = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [hoverPosition, setHoverPosition] = useState(0); // 0 to 1
  const [isDragging, setIsDragging] = useState(false);

  const calculateTimeFromEvent = useCallback(
    (e: MouseEvent | TouchEvent | React.MouseEvent | React.TouchEvent): number => {
      if (!containerRef.current || duration <= 0) return 0;
      const rect = containerRef.current.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
      const pos = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      return pos * duration;
    },
    [duration]
  );

  const calculateRatioFromEvent = useCallback(
    (e: React.MouseEvent<HTMLDivElement> | MouseEvent): number => {
      if (!containerRef.current) return 0;
      const rect = containerRef.current.getBoundingClientRect();
      return Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    },
    []
  );

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled || duration <= 0) return;
    const ratio = calculateRatioFromEvent(e);
    setHoverPosition(ratio);
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    if (!isDragging) {
      setIsHovering(false);
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled || duration <= 0) return;
    e.preventDefault();
    setIsDragging(true);
    const targetTime = calculateTimeFromEvent(e);
    onSeek(targetTime);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (disabled || duration <= 0) return;
    setIsDragging(true);
    const targetTime = calculateTimeFromEvent(e);
    onSeek(targetTime);
  };

  useEffect(() => {
    if (!isDragging) return;

    const onPointerMove = (e: MouseEvent | TouchEvent) => {
      const targetTime = calculateTimeFromEvent(e);
      onSeek(targetTime);

      if (containerRef.current && 'clientX' in e) {
        const rect = containerRef.current.getBoundingClientRect();
        setHoverPosition(Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)));
      }
    };

    const onPointerUp = () => {
      setIsDragging(false);
      setIsHovering(false);
    };

    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);
    window.addEventListener('touchmove', onPointerMove, { passive: false });
    window.addEventListener('touchend', onPointerUp);

    return () => {
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);
      window.removeEventListener('touchmove', onPointerMove);
      window.removeEventListener('touchend', onPointerUp);
    };
  }, [isDragging, calculateTimeFromEvent, onSeek]);

  const playedPercent = duration > 0 ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : 0;
  const hoverTime = duration > 0 ? hoverPosition * duration : 0;

  return (
    <div
      ref={containerRef}
      role="slider"
      aria-label="Video playback timeline"
      aria-valuemin={0}
      aria-valuemax={Math.floor(duration)}
      aria-valuenow={Math.floor(currentTime)}
      aria-valuetext={`${formatTime(currentTime)} of ${formatTime(duration)}`}
      tabIndex={0}
      onKeyDown={(e) => {
        if (disabled || duration <= 0) return;
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          onSeek(Math.max(0, currentTime - 5));
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          onSeek(Math.min(duration, currentTime + 5));
        }
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      className={`group relative w-full h-7 flex items-center cursor-pointer select-none ${
        disabled ? 'opacity-40 cursor-not-allowed' : ''
      }`}
    >
      {/* Background Track */}
      <div className="relative w-full h-1 group-hover:h-2 transition-all duration-150 rounded-full bg-white/20 overflow-hidden">
        {/* Buffered Ranges (Real HTML5 Video buffered chunks) */}
        {duration > 0 &&
          bufferedRanges.map((range, index) => {
            const startPercent = (range.start / duration) * 100;
            const endPercent = (range.end / duration) * 100;
            const width = Math.max(0, endPercent - startPercent);

            return (
              <div
                key={index}
                className="absolute top-0 bottom-0 bg-white/35 rounded-full transition-all duration-200"
                style={{
                  left: `${startPercent}%`,
                  width: `${width}%`,
                }}
              />
            );
          })}

        {/* Played Progress Bar */}
        <div
          className="absolute top-0 bottom-0 left-0 bg-white rounded-full transition-[width] duration-75"
          style={{ width: `${playedPercent}%` }}
        />
      </div>

      {/* Hover Scrubber Line */}
      {isHovering && !disabled && (
        <div
          className="absolute top-1 bottom-1 w-[2px] bg-white/60 pointer-events-none -translate-x-1/2"
          style={{ left: `${hoverPosition * 100}%` }}
        />
      )}

      {/* Playhead Scrubber Handle */}
      <div
        className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-white shadow-md shadow-black/60 pointer-events-none transition-transform duration-100 ${
          isHovering || isDragging ? 'scale-125' : 'scale-0 group-hover:scale-100'
        }`}
        style={{ left: `${playedPercent}%` }}
      />

      {/* Hover Timestamp Tooltip */}
      {isHovering && duration > 0 && !disabled && (
        <div
          className="absolute -top-7 -translate-x-1/2 pointer-events-none px-2 py-0.5 rounded bg-black/90 border border-white/20 text-[11px] font-mono font-medium text-white shadow-lg backdrop-blur-sm whitespace-nowrap"
          style={{
            left: `${Math.max(4, Math.min(96, hoverPosition * 100))}%`,
          }}
        >
          {formatTime(hoverTime)}
        </div>
      )}
    </div>
  );
};
