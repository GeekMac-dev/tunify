import React from 'react';
import { useMusic } from '@/contexts/MusicContext';
import TrackCard from '../TrackCard';
import { ListMusic, Sparkles } from 'lucide-react';

const HomeView: React.FC = () => {
  const { catalog, recentlyPlayed, playlists, setView } = useMusic();

  const recentTracks = recentlyPlayed
    .map((id) => catalog.find((t) => t.id === id))
    .filter(Boolean) as any[];

  const featured = catalog.slice(0, 6);
  const royaltyFree = catalog.filter((t) => t.source === 'royalty-free');
  const newReleases = catalog.slice(6, 12);

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  })();

  return (
    <div className="space-y-8 pb-8">
      {/* Greeting */}
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-1">
          {greeting}
        </h1>
        <p className="text-neutral-400 text-sm">Pick up where you left off</p>
      </div>

      {/* Quick picks */}
      {/* Quick picks */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {featured.map((t) => (
          <QuickCard key={t.id} track={t} />
        ))}
      </div>


      {/* Recently played */}
      {recentTracks.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">Recently Played</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {recentTracks.slice(0, 12).map((t) => (
              <TrackCard key={t.id} track={t} queue={recentTracks} />
            ))}
          </div>
        </section>
      )}

      {/* Featured Royalty-Free */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-green-500" />
              Royalty-Free Picks
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Free to download for offline listening
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {royaltyFree.map((t) => (
            <TrackCard key={t.id} track={t} queue={royaltyFree} />
          ))}
        </div>
      </section>

      {/* Trending */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-4">Trending Now</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {newReleases.map((t) => (
            <TrackCard key={t.id} track={t} queue={newReleases} />
          ))}
        </div>
      </section>

      {/* Your Playlists */}
      {playlists.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-white mb-4">Your Playlists</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {playlists.map((pl) => (
              <button
                key={pl.id}
                onClick={() => setView({ type: 'playlist', id: pl.id })}
                className="text-left bg-neutral-900/40 hover:bg-neutral-800/80 p-4 rounded-lg transition-all"
              >
                <div className="aspect-square mb-3 rounded-md overflow-hidden bg-gradient-to-br from-purple-700 via-pink-600 to-orange-500 flex items-center justify-center">
                  <ListMusic className="w-12 h-12 text-white/80" />
                </div>
                <h3 className="font-semibold text-white truncate text-sm">
                  {pl.name}
                </h3>
                <p className="text-xs text-neutral-400 mt-1">
                  {pl.trackIds.length} {pl.trackIds.length === 1 ? 'song' : 'songs'}
                </p>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

const QuickCard: React.FC<{ track: any }> = ({ track }) => {
  const { playTrack, currentTrack, isPlaying, togglePlay } = useMusic();
  const isCurrent = currentTrack?.id === track.id;
  const handle = () => {
    if (isCurrent) togglePlay();
    else playTrack(track);
  };
  return (
    <div
      className="group flex items-center gap-3 w-full cursor-pointer bg-white/5 hover:bg-white/10 rounded-md overflow-hidden transition-colors"
      onClick={handle}
    >
      <img
        src={track.thumbnail}
        alt={track.title}
        className="w-16 h-16 object-cover flex-shrink-0"
      />
      <span className="font-semibold text-white text-sm truncate pr-3 flex-1">
        {track.title}
      </span>
    </div>
  );
};


export default HomeView;
