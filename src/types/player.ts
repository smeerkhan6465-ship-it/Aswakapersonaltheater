/**
 * MinimalStream Player Type Definitions
 */

export interface BufferedRange {
  start: number;
  end: number;
}

export type PlaybackRate = 0.25 | 0.5 | 0.75 | 1 | 1.25 | 1.5 | 1.75 | 2;

export interface PlayerState {
  isPlaying: boolean;
  isPaused: boolean;
  currentTime: number;
  duration: number;
  bufferedRanges: BufferedRange[];
  bufferedPercent: number;
  volume: number; // 0.0 to 1.0
  isMuted: boolean;
  playbackRate: PlaybackRate;
  isFullscreen: boolean;
  isPiP: boolean;
  isLoading: boolean;
  isBuffering: boolean;
  hasStarted: boolean;
  error: PlayerError | null;
}

export interface PlayerError {
  type:
    | 'SHORTURL_REDIRECT_OR_CHALLENGE'
    | 'GDRIVE_VIRUS_SCAN_WARNING'
    | 'GDRIVE_PERMISSION_DENIED'
    | 'FORMAT_OR_CODEC_UNSUPPORTED'
    | 'MEDIA_ERR_SRC_NOT_SUPPORTED'
    | 'MEDIA_ERR_NETWORK'
    | 'MEDIA_ERR_DECODE'
    | 'MEDIA_ERR_ABORTED'
    | 'TIMEOUT'
    | 'UNKNOWN';
  title: string;
  message: string;
  technicalDetails: string;
  remedy: string;
  isGoogleDrive: boolean;
  isShortUrl?: boolean;
  shortUrlDestination?: string;
  rawError?: any;
}

export interface SourceDiagnostics {
  url: string;
  isGoogleDrive: boolean;
  driveFileId: string | null;
  supportsByteRange: boolean | null;
  detectedContentType: string | null;
  fileSizeEstimate: string | null;
  hasVirusScanGate: boolean | null;
  browserFormatSupport: {
    mp4: boolean;
    webm: boolean;
    mkv: boolean;
    hevc: boolean;
  };
}
