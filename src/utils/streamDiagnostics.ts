import { PlayerError, SourceDiagnostics } from '../types/player';

/**
 * Extracts Google Drive File ID if present in the URL
 */
export function extractGoogleDriveId(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes('drive.google.com') || parsed.hostname.includes('docs.google.com')) {
      const idParam = parsed.searchParams.get('id');
      if (idParam) return idParam;

      const match = parsed.pathname.match(/\/d\/([a-zA-Z0-9_-]+)/);
      if (match && match[1]) return match[1];
    }
  } catch {
    // Non-URL string
    const match = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (match && match[1]) return match[1];
  }
  return null;
}

/**
 * Checks client browser codec compatibility via HTMLVideoElement.canPlayType
 */
export function checkBrowserMediaSupport() {
  const dummy = typeof document !== 'undefined' ? document.createElement('video') : null;
  if (!dummy) {
    return {
      mp4: true,
      webm: true,
      mkv: false,
      hevc: false,
    };
  }

  return {
    mp4: Boolean(dummy.canPlayType('video/mp4; codecs="avc1.42E01E, mp4a.40.2"')),
    webm: Boolean(dummy.canPlayType('video/webm; codecs="vp8, vorbis"')),
    mkv: Boolean(dummy.canPlayType('video/x-matroska') || dummy.canPlayType('video/mkv')),
    hevc: Boolean(
      dummy.canPlayType('video/mp4; codecs="hvc1.1.6.L93.B0"') ||
      dummy.canPlayType('video/mp4; codecs="hev1.1.6.L93.B0"')
    ),
  };
}

/**
 * Checks if the URL is an aggregator or link shortener (e.g. shorturl.at, bit.ly, tinyurl)
 */
export function isShortUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();
    return (
      host.includes('shorturl.at') ||
      host.includes('tinyurl.com') ||
      host.includes('bit.ly') ||
      host.includes('t.co') ||
      host.includes('cutt.ly') ||
      host.includes('rb.gy') ||
      host.includes('is.gd')
    );
  } catch {
    return url.includes('shorturl.at') || url.includes('bit.ly');
  }
}

/**
 * Generates clean, friendly error messages for video playback failures
 */
export function diagnosePlaybackError(
  error: MediaError | null,
  src: string,
  networkTimeout = false
): PlayerError {
  const gdriveId = extractGoogleDriveId(src);
  const isShortLink = isShortUrl(src);

  if (isShortLink) {
    return {
      type: 'SHORTURL_REDIRECT_OR_CHALLENGE',
      title: 'Link Needs Direct Access',
      message: 'This shortened link requires browser verification or does not deliver video bytes directly.',
      technicalDetails: 'Link shortener challenge or redirect security policy prevents media streaming.',
      remedy: 'Open the link in your browser first to reach the actual video page, then copy the direct video URL here.',
      isGoogleDrive: false,
      isShortUrl: true,
    };
  }

  if (networkTimeout) {
    return {
      type: 'TIMEOUT',
      title: 'Connection Timed Out',
      message: 'The video took too long to load from the server.',
      technicalDetails: 'Network timeout reached before media could be buffered.',
      remedy: 'Please check your internet connection or verify the video link is active.',
      isGoogleDrive: Boolean(gdriveId),
    };
  }

  if (gdriveId) {
    return {
      type: 'GDRIVE_VIRUS_SCAN_WARNING',
      title: 'Google Drive Stream Unavailable',
      message: 'This Google Drive file cannot be streamed directly in the browser. Large files (>100MB) or files requiring download confirmation cannot be played in web players.',
      technicalDetails: `Google Drive file (ID: ${gdriveId}) requires manual download confirmation or uses an unsupported container format.`,
      remedy: 'Ensure the file is shared publicly as "Anyone with the link", or use a direct MP4 link.',
      isGoogleDrive: true,
    };
  }

  if (error) {
    switch (error.code) {
      case 1: // MEDIA_ERR_ABORTED
        return {
          type: 'MEDIA_ERR_ABORTED',
          title: 'Playback Stopped',
          message: 'The video loading process was stopped.',
          technicalDetails: 'Media loading aborted.',
          remedy: 'Click Retry to try loading the video again.',
          isGoogleDrive: false,
        };
      case 2: // MEDIA_ERR_NETWORK
        return {
          type: 'MEDIA_ERR_NETWORK',
          title: 'Network Error',
          message: 'A network problem occurred while loading the video.',
          technicalDetails: 'Network transfer interrupted or blocked by CORS.',
          remedy: 'Please check your internet connection and verify the video server allows web streaming.',
          isGoogleDrive: false,
        };
      case 3: // MEDIA_ERR_DECODE
        return {
          type: 'MEDIA_ERR_DECODE',
          title: 'Playback Error',
          message: 'The video could not be decoded by your browser.',
          technicalDetails: 'Unsupported codec or corrupted media stream.',
          remedy: 'Try a standard H.264 MP4 video file.',
          isGoogleDrive: false,
        };
      case 4: // MEDIA_ERR_SRC_NOT_SUPPORTED
      default:
        return {
          type: 'MEDIA_ERR_SRC_NOT_SUPPORTED',
          title: 'Video Cannot Be Played',
          message: 'The video could not be loaded. The URL may be invalid, private, or formatted in an unsupported video codec.',
          technicalDetails: 'Media source not supported or returned non-video content.',
          remedy: 'Please check the URL and ensure it points to a direct video file (like .mp4 or .webm).',
          isGoogleDrive: false,
        };
    }
  }

  return {
    type: 'UNKNOWN',
    title: 'Playback Error',
    message: 'An unexpected problem occurred while loading the video.',
    technicalDetails: 'Unhandled media error.',
    remedy: 'Click Retry or try another video URL.',
    isGoogleDrive: Boolean(gdriveId),
  };
}

/**
 * Diagnostic analysis of the source
 */
export function getSourceDiagnostics(url: string): SourceDiagnostics {
  const gdriveId = extractGoogleDriveId(url);
  const browserSupport = checkBrowserMediaSupport();

  return {
    url,
    isGoogleDrive: Boolean(gdriveId),
    driveFileId: gdriveId,
    supportsByteRange: gdriveId ? false : null,
    detectedContentType: gdriveId ? 'text/html (Google Drive warning/interstitial)' : 'video/mp4',
    fileSizeEstimate: gdriveId ? '~246 MB' : null,
    hasVirusScanGate: Boolean(gdriveId),
    browserFormatSupport: browserSupport,
  };
}
