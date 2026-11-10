import React, { useState, useRef } from 'react';
import { VideoPlayer } from './components/VideoPlayer';
import { VideoSourceConfig } from './config/video';
import { Play, ArrowRight, Film } from 'lucide-react';

export default function App() {
  const [urlInput, setUrlInput] = useState('');
  const [inputError, setInputError] = useState<string | null>(null);
  const [loadedVideo, setLoadedVideo] = useState<VideoSourceConfig | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateUrl = (url: string): boolean => {
    try {
      const parsed = new URL(url.trim());
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const handleLoadUrl = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setInputError(null);

    const trimmed = urlInput.trim();

    if (!trimmed) {
      setInputError('Please enter a video URL.');
      inputRef.current?.focus();
      return;
    }

    if (!validateUrl(trimmed)) {
      setInputError('Please enter a valid URL starting with http:// or https://');
      inputRef.current?.focus();
      return;
    }

    // Prevent duplicate reload if already loaded and active
    if (loadedVideo && loadedVideo.src === trimmed) {
      return;
    }

    setIsSubmitting(true);

    const isGoogleDrive =
      trimmed.includes('drive.google.com') || trimmed.includes('docs.google.com');
    const isShortUrl =
      trimmed.includes('shorturl.at') ||
      trimmed.includes('tinyurl.com') ||
      trimmed.includes('bit.ly');

    const newConfig: VideoSourceConfig = {
      id: `theatre-${Date.now()}`,
      title: 'Aswa Ka Personal Theatre',
      description: 'Personal cinema playback.',
      src: trimmed,
      poster: '',
      sourceType: isGoogleDrive ? 'gdrive' : isShortUrl ? 'shorturl' : 'custom',
    };

    setLoadedVideo(newConfig);

    // Brief timeout to avoid rapid duplicate clicks
    setTimeout(() => {
      setIsSubmitting(false);
    }, 400);
  };

  const handleChangeUrlFocus = () => {
    inputRef.current?.focus();
    inputRef.current?.select();
  };

  return (
    <div className="min-h-screen bg-[#090909] text-white flex flex-col justify-between font-sans selection:bg-white selection:text-black">
      {/* Main Content Area */}
      <main className="w-full max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 flex-1 flex flex-col items-center justify-center">
        {/* Header Branding */}
        <div className="text-center space-y-2 mb-8 sm:mb-10 w-full">
          <div className="flex items-center justify-center gap-2 mb-2 text-zinc-500">
            <Film className="w-5 h-5 text-zinc-400" />
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white uppercase">
            Aswa Ka Personal Theatre
          </h1>
          <p className="text-sm sm:text-base text-[#999999] font-normal">
            Your personal corner of cinema.
          </p>
        </div>

        {/* Video Player Display (appears after URL is loaded) */}
        {loadedVideo && (
          <div className="w-full mb-8 animate-in fade-in duration-300">
            <VideoPlayer
              config={loadedVideo}
              onChangeUrl={handleChangeUrlFocus}
              className="w-full shadow-2xl"
            />
          </div>
        )}

        {/* URL Input Form */}
        <div className="w-full max-w-xl mx-auto">
          <form
            onSubmit={handleLoadUrl}
            className="flex flex-col sm:flex-row items-stretch gap-2.5 w-full"
          >
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={urlInput}
                onChange={(e) => {
                  setUrlInput(e.target.value);
                  if (inputError) setInputError(null);
                }}
                placeholder="Paste your video URL here..."
                aria-label="Video URL input"
                className={`w-full px-4 py-3 text-sm bg-[#151515] text-white placeholder-[#999999] rounded-lg border transition-colors focus:outline-none focus:ring-1 focus:ring-white ${
                  inputError ? 'border-red-500/60' : 'border-[#292929] hover:border-zinc-700'
                }`}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 rounded-lg bg-white text-black font-semibold text-sm hover:bg-zinc-200 active:scale-95 transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer disabled:opacity-50"
            >
              <span>Load URL</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Validation Feedback */}
          {inputError && (
            <p className="text-xs text-red-400 mt-2 px-1 text-center sm:text-left">
              {inputError}
            </p>
          )}
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="w-full py-8 text-center border-t border-[#292929]/40 text-xs text-[#999999]">
        <p className="tracking-wide">Made for Aswa.</p>
      </footer>
    </div>
  );
}
