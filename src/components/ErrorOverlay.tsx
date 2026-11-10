import React from 'react';
import { PlayerError } from '../types/player';
import { AlertCircle, RefreshCw, ExternalLink } from 'lucide-react';

interface ErrorOverlayProps {
  error: PlayerError;
  onRetry: () => void;
  sourceUrl?: string;
  onChangeUrl?: () => void;
}

export const ErrorOverlay: React.FC<ErrorOverlayProps> = ({
  error,
  onRetry,
  sourceUrl,
  onChangeUrl,
}) => {
  return (
    <div className="absolute inset-0 z-30 bg-black/90 backdrop-blur-sm flex items-center justify-center p-6 text-center animate-in fade-in duration-200">
      <div className="max-w-md w-full bg-[#151515] border border-[#292929] rounded-xl p-6 sm:p-7 shadow-2xl text-left">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-lg bg-white/5 border border-white/10 text-zinc-300">
            <AlertCircle className="w-5 h-5 text-zinc-300" />
          </div>
          <h3 className="text-base font-semibold text-white tracking-tight">
            {error.title}
          </h3>
        </div>

        <p className="text-xs sm:text-sm text-[#999999] leading-relaxed mb-4">
          {error.message}
        </p>

        {error.remedy && (
          <div className="text-xs text-zinc-400 bg-black/40 border border-[#292929] rounded-lg p-3 mb-5 leading-normal">
            <span className="text-zinc-200 font-medium">Tip:</span> {error.remedy}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={onRetry}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-white text-black font-semibold text-xs hover:bg-zinc-200 active:scale-95 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry
          </button>

          {onChangeUrl && (
            <button
              type="button"
              onClick={onChangeUrl}
              className="flex-1 px-4 py-2 rounded-lg bg-white/5 text-white hover:bg-white/10 text-xs border border-white/10 transition text-center"
            >
              Change URL
            </button>
          )}

          {sourceUrl && (
            <a
              href={sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-lg bg-white/5 text-zinc-300 hover:text-white hover:bg-white/10 text-xs border border-white/10 transition inline-flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open Link</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
