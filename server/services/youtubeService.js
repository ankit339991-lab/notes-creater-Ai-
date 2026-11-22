/**
 * YouTube Service
 * Handles YouTube URL validation, ID extraction, and metadata fetching
 * (using YouTube's public oEmbed endpoint - no API key required for basic info).
 */

/**
 * Extracts YouTube video ID from various URL formats:
 * - https://www.youtube.com/watch?v=dQw4w9WgXcQ
 * - https://youtu.be/dQw4w9WgXcQ?si=...
 * - https://www.youtube.com/shorts/dQw4w9WgXcQ
 * - https://www.youtube.com/live/dQw4w9WgXcQ (Live / Recorded live streams)
 * - https://www.youtube.com/embed/dQw4w9WgXcQ
 * - https://m.youtube.com/watch?v=dQw4w9WgXcQ
 * - Text containing a shared YouTube link
 * - Direct 11-character video ID
 *
 * @param {string} url
 * @returns {string|null} Video ID or null if invalid
 */
export function extractVideoId(url) {
  if (!url || typeof url !== 'string') return null;
  const cleanUrl = url.trim();

  // 1. Direct 11-character video ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(cleanUrl)) {
    return cleanUrl;
  }

  // 2. Comprehensive pattern matching
  const patterns = [
    // Standard and mobile youtu.be links: youtu.be/VIDEO_ID
    /youtu\.be\/([a-zA-Z0-9_-]{11})/i,
    // Standard watch links: ?v=VIDEO_ID or &v=VIDEO_ID (handles any query parameter order)
    /[?&]v=([a-zA-Z0-9_-]{11})/i,
    // YouTube Shorts: /shorts/VIDEO_ID
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/i,
    // YouTube Live Streams: /live/VIDEO_ID
    /youtube\.com\/live\/([a-zA-Z0-9_-]{11})/i,
    // Embed URLs: /embed/VIDEO_ID
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/i,
    // Legacy URLs: /v/VIDEO_ID
    /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/i
  ];

  for (const pattern of patterns) {
    const match = cleanUrl.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  // 3. Fallback URL object inspection for YouTube domains only
  try {
    const urlObj = new URL(cleanUrl.startsWith('http') ? cleanUrl : `https://${cleanUrl}`);
    const host = urlObj.hostname.toLowerCase();
    if (host.includes('youtube.com') || host.includes('youtu.be')) {
      if (urlObj.searchParams.has('v')) {
        const v = urlObj.searchParams.get('v');
        if (v && /^[a-zA-Z0-9_-]{11}$/.test(v)) return v;
      }
      const segments = urlObj.pathname.split('/').filter(Boolean);
      const lastSeg = segments[segments.length - 1];
      if (lastSeg && /^[a-zA-Z0-9_-]{11}$/.test(lastSeg)) {
        return lastSeg;
      }
    }
  } catch {}

  return null;
}

/**
 * Validates whether a string is a valid YouTube URL or ID
 * @param {string} url 
 * @returns {boolean}
 */
export function isValidYouTubeUrl(url) {
  return extractVideoId(url) !== null;
}

/**
 * Fetches video metadata.
 * Uses the free YouTube oEmbed endpoint to retrieve title, author, and thumbnail.
 * If offline or blocked, falls back gracefully to synthetic metadata.
 * 
 * @param {string} url 
 * @returns {Promise<object>} Video metadata
 */
export async function fetchVideoMetadata(url) {
  const videoId = extractVideoId(url);
  if (!videoId) {
    throw new Error('Invalid YouTube URL or video ID.');
  }

  const standardUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const defaultThumbnail = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  const maxResThumbnail = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(standardUrl)}&format=json`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000); // 4-second timeout

    const response = await fetch(oembedUrl, {
      signal: controller.signal,
      headers: { 'User-Agent': 'TubeNotesAI/1.0' }
    });
    clearTimeout(timeout);

    if (response.ok) {
      const data = await response.json();
      return {
        videoId,
        url: standardUrl,
        title: data.title || `YouTube Video (${videoId})`,
        authorName: data.author_name || 'YouTube Creator',
        authorUrl: data.author_url || '',
        thumbnailUrl: data.thumbnail_url || defaultThumbnail,
        maxResThumbnail,
        source: 'oembed'
      };
    }
  } catch (err) {
    // Graceful fallback for offline, network errors, or timeout
  }

  // Fallback metadata if oEmbed cannot be reached
  return {
    videoId,
    url: standardUrl,
    title: `Lecture on ${videoId.substring(0, 6).toUpperCase()} Concepts`,
    authorName: 'Academic Lecture Series',
    authorUrl: standardUrl,
    thumbnailUrl: defaultThumbnail,
    maxResThumbnail,
    source: 'fallback'
  };
}
