import React from 'react';
import { X, Keyboard } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SHORTCUTS = [
  { key: 'Space', desc: 'Play / Pause stream' },
  { key: '←', desc: 'Seek backward 5 seconds' },
  { key: '→', desc: 'Seek forward 5 seconds' },
  { key: '↑', desc: 'Increase volume (+10%)' },
  { key: '↓', desc: 'Decrease volume (-10%)' },
  { key: 'M', desc: 'Mute / Unmute audio' },
  { key: 'F', desc: 'Toggle Fullscreen' },
  { key: 'P', desc: 'Toggle Picture-in-Picture' },
  { key: 'Esc', desc: 'Exit Fullscreen' },
];

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="max-w-md w-full bg-[#151515] border border-[#292929] rounded-xl p-6 shadow-2xl text-left"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-[#292929] mb-4">
          <div className="flex items-center gap-2.5">
            <Keyboard className="w-5 h-5 text-white" />
            <h3 className="text-base font-semibold text-white tracking-tight">
              VLC Keyboard Shortcuts
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close shortcuts modal"
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2 mb-5">
          {SHORTCUTS.map((sc, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-white/5 transition"
            >
              <span className="text-xs text-zinc-300">{sc.desc}</span>
              <kbd className="px-2 py-1 rounded bg-black/80 border border-white/15 text-[11px] font-mono text-white shadow-sm">
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-2 border-t border-white/5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-white text-black font-semibold text-xs hover:bg-zinc-200 transition"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
