import { supabase } from '@/lib/supabase';
import type { Track } from '@/data/sampleTracks';

export interface YouTubeSearchResult {
  videoId: string;
  title: string;
  channelTitle: string;
  thumbnail: string;
  duration: string;
}

export interface YouTubeSearchResponse {
  results: YouTubeSearchResult[];
  error?: string;
}

/**
 * Call our `youtube-search` edge function to query the YouTube Data API v3.
 * The API key stays server-side; the client only ever sees the parsed results.
 */
export async function searchYouTube(
  query: string,
  signal?: AbortSignal
): Promise<YouTubeSearchResponse> {
  const trimmed = query.trim();
  if (!trimmed) return { results: [] };

  // supabase.functions.invoke doesn't natively support AbortSignal in all SDK
  // versions, so we race it against a manual abort to support cancellation.
  const invocation = supabase.functions.invoke('youtube-search', {
    body: { query: trimmed, maxResults: 20 },
  });

  const aborted = new Promise<never>((_, reject) => {
    if (signal) {
      if (signal.aborted) reject(new DOMException('Aborted', 'AbortError'));
      signal.addEventListener('abort', () =>
        reject(new DOMException('Aborted', 'AbortError'))
      );
    }
  });

  const { data, error } = (await (signal
    ? Promise.race([invocation, aborted])
    : invocation)) as { data: any; error: any };

  if (error) {
    return { results: [], error: error.message || 'Search failed' };
  }
  if (data?.error) {
    return { results: [], error: data.error };
  }
  return { results: data?.results || [] };
}

/**
 * Convert a YouTube search result into the app's internal Track shape so it
 * can flow through the same playback / favorite / playlist pipeline.
 */
export function ytResultToTrack(r: YouTubeSearchResult): Track {
  return {
    id: `yt-${r.videoId}`,
    title: r.title,
    artist: r.channelTitle,
    thumbnail: r.thumbnail,
    videoId: r.videoId,
    duration: r.duration || undefined,
    source: 'youtube',
    downloadable: false,
  };
}
