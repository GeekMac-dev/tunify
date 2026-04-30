import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useMusic } from '@/contexts/MusicContext';
import TrackCard from '../TrackCard';
import TrackRow from '../TrackRow';
import { Search as SearchIcon, AlertCircle } from 'lucide-react';
import { Track } from '@/data/sampleTracks';
import { searchYouTube, ytResultToTrack } from '@/services/youtubeSearch';

const browseGenres = [
  { name: 'Pop', color: 'from-pink-500 to-purple-600' },
  { name: 'Rock', color: 'from-red-500 to-orange-600' },
  { name: 'Hip-Hop', color: 'from-yellow-500 to-red-600' },
  { name: 'Electronic', color: 'from-blue-500 to-cyan-500' },
  { name: 'Jazz', color: 'from-amber-700 to-yellow-500' },
  { name: 'Classical', color: 'from-indigo-700 to-purple-500' },
  { name: 'Indie', color: 'from-green-500 to-teal-500' },
  { name: 'R&B', color: 'from-rose-600 to-fuchsia-700' },
  { name: 'Country', color: 'from-orange-500 to-amber-600' },
  { name: 'Lo-Fi', color: 'from-violet-500 to-pink-500' },
  { name: 'Workout', color: 'from-lime-500 to-green-700' },
  { name: 'Chill', color: 'from-sky-400 to-blue-700' },
];

// --- Skeleton placeholders ------------------------------------------------

const SkeletonCard: React.FC = () => (
  <div className="bg-neutral-900/40 p-4 rounded-lg animate-pulse">
    <div className="aspect-square bg-neutral-800 rounded-md mb-3" />
    <div className="h-4 bg-neutral-800 rounded w-3/4 mb-2" />
    <div className="h-3 bg-neutral-800 rounded w-1/2" />
  </div>
);

const SkeletonRow: React.FC = () => (
  <div className="flex items-center gap-4 px-4 py-2 animate-pulse">
    <div className="w-4 h-4 bg-neutral-800 rounded" />
    <div className="w-10 h-10 bg-neutral-800 rounded" />
    <div className="flex-1 space-y-2">
      <div className="h-3 bg-neutral-800 rounded w-2/3" />
      <div className="h-2.5 bg-neutral-800 rounded w-1/3" />
    </div>
    <div className="w-12 h-3 bg-neutral-800 rounded" />
  </div>
);

// --- View -----------------------------------------------------------------

const SearchView: React.FC = () => {
  const { searchQuery, catalog, setSearchQuery } = useMusic();


  // Local results state (we don't put this in context — it would force every
  // consumer to re-render on every keystroke).
  const [remoteResults, setRemoteResults] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Track the latest query so out-of-order responses don't overwrite results.
  const latestQueryRef = useRef('');

  // Debounced YouTube fetch
  useEffect(() => {
    const q = searchQuery.trim();
    latestQueryRef.current = q;

    if (!q) {
      setRemoteResults([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const res = await searchYouTube(q, controller.signal);
        // Drop the response if the user has typed something newer
        if (latestQueryRef.current !== q) return;
        if (res.error) {
          setError(res.error);
          setRemoteResults([]);
        } else {
          setRemoteResults(res.results.map(ytResultToTrack));
        }
      } catch (err: any) {
        if (err?.name === 'AbortError') return;
        setError(err?.message || 'Search failed');
        setRemoteResults([]);
      } finally {
        if (latestQueryRef.current === q) setLoading(false);
      }
    }, 300); // 300ms debounce

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [searchQuery]);

  // Local catalog matches (uploads, royalty-free, etc.)
  const localResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return catalog.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.artist.toLowerCase().includes(q)
    );
  }, [searchQuery, catalog]);

  // Combined queue, with local first then remote (deduped)
  const combinedQueue = useMemo(() => {
    const seen = new Set<string>();
    const out: Track[] = [];
    for (const t of [...localResults, ...remoteResults]) {
      if (!seen.has(t.id)) {
        seen.add(t.id);
        out.push(t);
      }
    }
    return out;
  }, [localResults, remoteResults]);

  // Empty state — show genre browse grid
  if (!searchQuery.trim()) {
    return (
      <div className="space-y-6 pb-8">
        <h1 className="text-3xl font-bold text-white">Browse all</h1>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {browseGenres.map((g) => (
            <button
              key={g.name}
              onClick={() => setSearchQuery(g.name)}
              className={`relative aspect-[16/10] rounded-lg overflow-hidden bg-gradient-to-br ${g.color} cursor-pointer hover:scale-[1.02] transition-transform text-left`}
            >
              <h3 className="absolute top-3 left-4 text-xl md:text-2xl font-bold text-white drop-shadow">
                {g.name}
              </h3>
            </button>
          ))}
        </div>
      </div>
    );
  }


  return (
    <div className="space-y-6 pb-8">
      <h2 className="text-2xl font-bold text-white">
        Results for "{searchQuery}"
      </h2>

      {/* Error banner */}
      {error && (
        <div className="flex items-start gap-3 bg-red-900/30 border border-red-800/60 rounded-lg p-4">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-red-200">
            <strong>YouTube search unavailable.</strong>{' '}
            <span className="opacity-80">{error}</span>
            <div className="text-xs mt-1 opacity-70">
              Add a <code>YOUTUBE_API_KEY</code> secret in your Supabase project
              settings to enable real-time search.
            </div>
          </div>
        </div>
      )}

      {/* Loading skeletons */}
      {loading && remoteResults.length === 0 && localResults.length === 0 && (
        <>
          <section>
            <h3 className="text-xl font-bold text-white mb-3">Top results</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          </section>
          <section>
            <h3 className="text-xl font-bold text-white mb-3">Songs</h3>
            <div className="bg-neutral-900/40 rounded-lg p-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonRow key={i} />
              ))}
            </div>
          </section>
        </>
      )}

      {/* No results */}
      {!loading && !error && combinedQueue.length === 0 && (
        <div className="text-center py-16">
          <SearchIcon className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
          <p className="text-neutral-400">No results found</p>
          <p className="text-sm text-neutral-500 mt-1">
            Try searching for something else
          </p>
        </div>
      )}

      {/* Results */}
      {combinedQueue.length > 0 && (
        <>
          <section>
            <h3 className="text-xl font-bold text-white mb-3">Top results</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {combinedQueue.slice(0, 6).map((t) => (
                <TrackCard key={t.id} track={t} queue={combinedQueue} />
              ))}
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xl font-bold text-white">Songs</h3>
              {loading && (
                <span className="text-xs text-neutral-400 animate-pulse">
                  Updating…
                </span>
              )}
            </div>
            <div className="bg-neutral-900/40 rounded-lg p-2">
              {combinedQueue.map((t, i) => (
                <TrackRow key={t.id} track={t} index={i} queue={combinedQueue} />
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default SearchView;
