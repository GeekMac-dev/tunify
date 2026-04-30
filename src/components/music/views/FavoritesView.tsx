import React from 'react';
import { useMusic } from '@/contexts/MusicContext';
import TrackRow from '../TrackRow';
import { Heart, Play } from 'lucide-react';

const FavoritesView: React.FC = () => {
  const { favorites, catalog, playTrack } = useMusic();
  const favTracks = favorites
    .map((id) => catalog.find((t) => t.id === id))
    .filter(Boolean) as any[];

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col md:flex-row md:items-end gap-6 -mt-6 -mx-6 p-6 bg-gradient-to-b from-pink-700/40 to-transparent">
        <div className="w-40 h-40 md:w-52 md:h-52 bg-gradient-to-br from-pink-500 to-purple-700 rounded-md shadow-2xl flex items-center justify-center flex-shrink-0">
          <Heart className="w-20 h-20 text-white fill-white" />
        </div>
        <div>
          <p className="text-xs uppercase font-semibold text-white">Playlist</p>
          <h1 className="text-3xl md:text-6xl font-extrabold text-white my-2">
            Liked Songs
          </h1>
          <p className="text-sm text-neutral-300">
            {favTracks.length} {favTracks.length === 1 ? 'song' : 'songs'}
          </p>
        </div>
      </div>

      {favTracks.length > 0 && (
        <div className="flex items-center gap-4">
          <button
            onClick={() => playTrack(favTracks[0], favTracks)}
            className="w-14 h-14 rounded-full bg-green-500 text-black flex items-center justify-center hover:scale-105 transition-transform shadow-xl"
          >
            <Play className="w-6 h-6 fill-black ml-0.5" />
          </button>
        </div>
      )}

      {favTracks.length === 0 ? (
        <div className="text-center py-16">
          <Heart className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
          <p className="text-neutral-400">Songs you like will appear here</p>
          <p className="text-sm text-neutral-500 mt-1">
            Save tracks by tapping the heart icon
          </p>
        </div>
      ) : (
        <div className="bg-neutral-900/40 rounded-lg p-2">
          {favTracks.map((t, i) => (
            <TrackRow key={t.id} track={t} index={i} queue={favTracks} />
          ))}
        </div>
      )}
    </div>
  );
};

export default FavoritesView;
