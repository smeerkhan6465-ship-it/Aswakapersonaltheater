import React, { useRef, useEffect } from 'react';
import { PlaybackRate } from '../types/player';
import { Check } from 'lucide-react';

interface SpeedMenuProps {
  currentRate: PlaybackRate;
  onSelectRate: (rate: PlaybackRate) => void;
  isOpen: boolean;
  onClose: () => void;
}

const RATES: PlaybackRate[] = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

export const SpeedMenu: React.FC<SpeedMenuProps> = ({
  currentRate,
  onSelectRate,
  isOpen,
  onClose,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={menuRef}
      className="absolute bottom-12 right-0 bg-[#151515]/95 backdrop-blur-md border border-[#292929] rounded-lg py-1.5 shadow-2xl z-30 min-w-[130px] animate-in fade-in zoom-in-95 duration-100"
      role="menu"
      aria-orientation="vertical"
      aria-label="Playback speed"
    >
      <div className="px-3 py-1 text-[10px] font-semibold text-zinc-400 uppercase tracking-wider border-b border-[#292929] mb-1">
        Speed
      </div>
      {RATES.map((rate) => {
        const isSelected = currentRate === rate;
        return (
          <button
            key={rate}
            role="menuitem"
            onClick={() => {
              onSelectRate(rate);
              onClose();
            }}
            className={`w-full flex items-center justify-between px-3 py-1.5 text-xs text-left transition-colors ${
              isSelected
                ? 'bg-white/10 text-white font-medium'
                : 'text-zinc-300 hover:bg-white/5 hover:text-white'
            }`}
          >
            <span>{rate === 1 ? '1x (Normal)' : `${rate}x`}</span>
            {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
          </button>
        );
      })}
    </div>
  );
};
