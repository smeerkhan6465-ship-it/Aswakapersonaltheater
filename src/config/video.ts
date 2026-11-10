/**
 * MinimalStream Central Video Configuration
 * All video URLs, metadata, posters, and subtitle tracks are defined here.
 * Never scatter video URLs across multiple components.
 */

export interface SubtitleTrack {
  id: string;
  label: string;
  srcLang: string;
  src: string;
  default?: boolean;
}

export interface VideoSourceConfig {
  id: string;
  title: string;
  description: string;
  src: string;
  poster: string;
  durationEstimate?: number; // fallback duration in seconds if metadata takes time
  subtitles?: SubtitleTrack[];
  sourceType: 'shorturl' | 'gdrive' | 'direct-mp4' | 'r2' | 'hls' | 'custom';
  tags?: string[];
  specs?: {
    resolution?: string;
    codec?: string;
    audio?: string;
    aspectRatio?: string;
  };
}

/**
 * Primary video configuration configured to the user requested URL:
 * https://shorturl.at/OD6Pz
 */
export const PRIMARY_VIDEO_CONFIG: VideoSourceConfig = {
  id: 'shorturl-stream-od6pz',
  title: 'MinimalStream Feed — shorturl.at/OD6Pz',
  description: 'Primary active video stream requested by user (https://shorturl.at/OD6Pz). MinimalStream streams media with progressive buffering and diagnostic redirect tracking.',
  src: 'https://shorturl.at/OD6Pz',
  poster: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1920&q=80',
  sourceType: 'shorturl',
  durationEstimate: 1200,
  tags: ['Short Link', 'Dynamic Stream', '1080p', 'Active Feed'],
  specs: {
    resolution: 'HD Stream',
    codec: 'Auto / Progressive HTTP',
    audio: 'Stereo AAC',
    aspectRatio: '16:9',
  },
};

/**
 * High-performance verified direct video sources (MP4 with progressive byte-range seeking)
 * and Google Drive source for easy switching and source testing.
 */
export const VERIFIED_STREAMING_SOURCES: VideoSourceConfig[] = [
  {
    id: 'gdrive-love-in-disguise',
    title: 'Love in Disguise — S01E08 (Google Drive)',
    description: 'Romantic drama series episode hosted on Google Drive. Demonstrates Google Drive 100MB virus scan gate handling and MKV container analysis.',
    src: 'https://drive.google.com/uc?export=download&id=19xb88h16d7IADJhfEv0TS6l8CCae7-Zs',
    poster: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1920&q=80',
    sourceType: 'gdrive',
    durationEstimate: 2700,
    tags: ['Google Drive', '720p', 'MKV', 'x265'],
    specs: {
      resolution: '1280x720',
      codec: 'HEVC / x265 (MKV Container)',
      audio: 'Hindi / Korean Dual Audio (AAC)',
      aspectRatio: '16:9',
    },
  },
  {
    id: 'blender-tears-of-steel',
    title: 'Tears of Steel — 4K Open Sci-Fi Project',
    description: 'A cinematic VFX film showcasing high-bitrate progressive MP4 streaming, multi-range seeking, and spatial audio in MinimalStream.',
    src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1920&q=80',
    sourceType: 'direct-mp4',
    durationEstimate: 734,
    tags: ['Sci-Fi', 'VFX', '1080p Progressive', 'Byte-Range'],
    specs: {
      resolution: '1920x1080',
      codec: 'H.264 / AVC (MP4 Container)',
      audio: 'Stereo AAC 192kbps',
      aspectRatio: '2.40:1 Cinematic',
    },
  },
  {
    id: 'blender-sintel',
    title: 'Sintel — Durian Open Animation Movie',
    description: 'Epic open-source fantasy short film featuring sweeping orchestral score and vibrant 1080p animation with full seeking support.',
    src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    poster: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1920&q=80',
    sourceType: 'direct-mp4',
    durationEstimate: 888,
    tags: ['Animation', 'Fantasy', '1080p Progressive', 'Byte-Range'],
    specs: {
      resolution: '1920x1080',
      codec: 'H.264 / AVC (MP4 Container)',
      audio: '5.1 / Stereo AAC',
      aspectRatio: '16:9',
    },
  },
  {
    id: 'blender-big-buck-bunny',
    title: 'Big Buck Bunny — Full HD Benchmark',
    description: 'Industry benchmark progressive media stream with keyframe alignment, ideal for testing scrubbing and buffer cache metrics.',
    src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    poster: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1920&q=80',
    sourceType: 'direct-mp4',
    durationEstimate: 596,
    tags: ['Benchmark', 'Animation', '1080p', 'Byte-Range'],
    specs: {
      resolution: '1920x1080',
      codec: 'H.264 / AVC (MP4 Container)',
      audio: 'Stereo AAC',
      aspectRatio: '16:9',
    },
  },
];
