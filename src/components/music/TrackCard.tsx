import React from 'react';
import { Track } from '@/data/sampleTracks';
import { useMusic } from '@/contexts/MusicContext';
import { Play, Pause } from 'lucide-react';

interface Props {
  track: Track;
  queue?: Track[];
  large?: boolean;
}

const TrackCard: React.FC<Props> = ({ track, queue, large }) => {
  const { playTrack, currentTrack, isPlaying, togglePlay, registerRemoteTrack } = useMusic();
  const isCurrent = currentTrack?.id === track.id;

  const handleClick = () => {
    if (isCurrent) {
      togglePlay();
    } else {
      // Persist remote (YouTube search) tracks so they remain referenceable
      // by id from favorites / playlists / recently-played later.
      if (track.source === 'youtube') registerRemoteTrack(track);
      playTrack(track, queue);
    }
  };


  return (
    <div
      className="group relative bg-neutral-900/40 hover:bg-neutral-800/80 p-4 rounded-lg cursor-pointer transition-all duration-300"
      onClick={handleClick}
    >
      <div className="relative aspect-square mb-3 rounded-md overflow-hidden shadow-2xl">
        <img
          src={track.thumbnail}
          alt={track.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <button
          className={`absolute bottom-2 right-2 w-12 h-12 rounded-full bg-green-500 text-black shadow-xl flex items-center justify-center transform transition-all duration-300 ${
            isCurrent && isPlaying
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0'
          } hover:scale-110`}
          onClick={(e) => {
            e.stopPropagation();
            handleClick();
          }}
        >
          {isCurrent && isPlaying ? (
            <Pause className="w-5 h-5 fill-black" />
          ) : (
            <Play className="w-5 h-5 fill-black ml-0.5" />
          )}
        </button>
      </div>
      <h3
        className={`font-semibold text-white truncate ${large ? 'text-base' : 'text-sm'}`}
      >
        {track.title}
      </h3>
      <p className="text-xs text-neutral-400 truncate mt-1">{track.artist}</p>
    </div>
  );
};

export default TrackCard;
