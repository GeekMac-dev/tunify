import React, { useState } from 'react';
import { Track } from '@/data/sampleTracks';
import { useMusic } from '@/contexts/MusicContext';
import { Play, Pause, Heart, Download, MoreHorizontal, Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  track: Track;
  index: number;
  queue?: Track[];
  showAlbum?: boolean;
  onRemove?: () => void;
}

const TrackRow: React.FC<Props> = ({ track, index, queue, onRemove }) => {
  const {
    playTrack,
    currentTrack,
    isPlaying,
    togglePlay,
    favorites,
    toggleFavorite,
    downloadTrack,
    playlists,
    addToPlaylist,
    registerRemoteTrack,
  } = useMusic();
  const [menuOpen, setMenuOpen] = useState(false);
  const isCurrent = currentTrack?.id === track.id;
  const isFav = favorites.includes(track.id);

  // Persist remote (YouTube search) tracks before they become id-only
  // references in favorites / playlists / recent — without this, refreshing
  // the page would lose the metadata needed to play them again.
  const ensurePersisted = () => {
    if (track.source === 'youtube') registerRemoteTrack(track);
  };

  const handlePlay = () => {
    if (isCurrent) {
      togglePlay();
    } else {
      ensurePersisted();
      playTrack(track, queue);
    }
  };

  const handleToggleFav = () => {
    ensurePersisted();
    toggleFavorite(track.id);
  };

  const handleAddToPlaylist = (playlistId: string) => {
    ensurePersisted();
    addToPlaylist(playlistId, track.id);
  };


  return (
    <div
      className={cn(
        'group grid grid-cols-[40px_1fr_40px_40px] sm:grid-cols-[40px_1fr_40px_60px_40px] md:grid-cols-[40px_1fr_40px_120px_100px_80px_40px] items-center gap-2 md:gap-4 px-2 md:px-4 py-2 rounded-md hover:bg-white/10 transition-colors',
        isCurrent && 'bg-white/5'
      )}
    >
      {/* Index / Play */}
      <div className="flex items-center justify-center text-neutral-400 text-sm">
        <span className="group-hover:hidden">
          {isCurrent && isPlaying ? (
            <span className="flex gap-0.5 items-end h-4">
              <span className="w-0.5 bg-green-500 h-2 animate-pulse" />
              <span className="w-0.5 bg-green-500 h-3 animate-pulse" style={{ animationDelay: '0.2s' }} />
              <span className="w-0.5 bg-green-500 h-1 animate-pulse" style={{ animationDelay: '0.4s' }} />
            </span>
          ) : (
            index + 1
          )}
        </span>
        <button
          onClick={handlePlay}
          className="hidden group-hover:flex text-white"
        >
          {isCurrent && isPlaying ? (
            <Pause className="w-4 h-4 fill-white" />
          ) : (
            <Play className="w-4 h-4 fill-white" />
          )}
        </button>
      </div>

      {/* Title */}
      <div
        className="flex items-center gap-3 min-w-0 cursor-pointer"
        onClick={handlePlay}
      >
        <img
          src={track.thumbnail}
          alt={track.title}
          className="w-10 h-10 rounded object-cover"
          loading="lazy"
        />
        <div className="min-w-0">
          <div className={cn('font-medium truncate', isCurrent ? 'text-green-500' : 'text-white')}>
            {track.title}
          </div>
          <div className="text-xs text-neutral-400 truncate">{track.artist}</div>
        </div>
      </div>

      {/* Favorite */}
      <button
        onClick={handleToggleFav}
        className={cn(
          'transition-colors',
          isFav ? 'text-pink-500' : 'text-neutral-400 opacity-0 group-hover:opacity-100 hover:text-white'
        )}
      >
        <Heart className={cn('w-4 h-4', isFav && 'fill-pink-500')} />
      </button>


      {/* Source */}
      <div className="text-xs text-neutral-400 truncate hidden md:block">
        {track.source === 'youtube' ? 'YouTube' : track.source === 'upload' ? 'Uploaded' : 'Royalty-Free'}
      </div>

      {/* Download */}
      <div className="hidden md:flex justify-center">
        {track.downloadable ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              downloadTrack(track);
            }}
            className="text-neutral-400 hover:text-green-500 transition-colors"
            title="Download (offline)"
          >
            <Download className="w-4 h-4" />
          </button>
        ) : (
          <span className="text-[10px] text-neutral-600" title="Streaming only">—</span>
        )}
      </div>

      {/* Duration */}
      <div className="hidden sm:block text-xs text-neutral-400 text-right">{track.duration || '—'}</div>

      {/* More menu */}
      <div className="relative">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpen((m) => !m);
          }}
          className="text-neutral-400 hover:text-white opacity-0 group-hover:opacity-100"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
        {menuOpen && (
          <>
            <div
              className="fixed inset-0 z-30"
              onClick={() => setMenuOpen(false)}
            />
            <div className="absolute right-0 top-full mt-1 z-40 bg-neutral-800 rounded-md shadow-2xl border border-neutral-700 py-1 w-56">
              {onRemove && (
                <button
                  onClick={() => {
                    onRemove();
                    setMenuOpen(false);
                  }}
                  className="w-full px-4 py-2 text-sm text-left text-white hover:bg-neutral-700 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" /> Remove from list
                </button>
              )}
              <div className="px-4 py-1.5 text-xs text-neutral-400 uppercase">
                Add to playlist
              </div>
              {playlists.length === 0 && (
                <div className="px-4 py-2 text-xs text-neutral-500">
                  No playlists yet
                </div>
              )}
              {playlists.map((pl) => (
                <button
                  key={pl.id}
                  onClick={() => {
                    handleAddToPlaylist(pl.id);
                    setMenuOpen(false);
                  }}
                  className="w-full px-4 py-2 text-sm text-left text-white hover:bg-neutral-700 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" /> {pl.name}
                </button>
              ))}
            </div>

          </>
        )}
      </div>
    </div>
  );
};

export default TrackRow;
