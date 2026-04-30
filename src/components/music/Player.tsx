import React, { useEffect, useRef, useState } from 'react';
import { useMusic } from '@/contexts/MusicContext';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  VolumeX,
  Volume1,
  Heart,
  Download,
  Menu,
} from 'lucide-react';
import { cn } from '@/lib/utils';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: any;
  }
}

const formatTime = (s: number) => {
  if (!isFinite(s) || s <= 0) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
};

const Player: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    progress,
    currentTime,
    duration,
    volume,
    muted,
    shuffle,
    repeat,
    favorites,
    togglePlay,
    next,
    prev,
    seekTo,
    setVolume,
    toggleMute,
    toggleShuffle,
    cycleRepeat,
    toggleFavorite,
    downloadTrack,
    toggleSidebar,
    _registerYTPlayer,
    _registerAudioEl,
    _setIsPlaying,
    _setProgress,
  } = useMusic();

  const ytContainerRef = useRef<HTMLDivElement>(null);
  const ytPlayerRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const intervalRef = useRef<number | null>(null);
  const [ytReady, setYtReady] = useState(false);

  // Load YT iframe API once
  useEffect(() => {
    if (window.YT && window.YT.Player) {
      setYtReady(true);
      return;
    }
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.body.appendChild(tag);
    (window as any).onYouTubeIframeAPIReady = () => setYtReady(true);
  }, []);

  // Initialize YT player when ready
  useEffect(() => {
    if (!ytReady || !ytContainerRef.current || ytPlayerRef.current) return;
    ytPlayerRef.current = new window.YT.Player(ytContainerRef.current, {
      height: '0',
      width: '0',
      playerVars: { playsinline: 1, controls: 0 },
      events: {
        onReady: (e: any) => {
          _registerYTPlayer(e.target);
          e.target.setVolume(volume);
        },
        onStateChange: (e: any) => {
          // 0=ended, 1=playing, 2=paused
          if (e.data === 0) {
            if (repeat === 'one') {
              e.target.seekTo(0);
              e.target.playVideo();
            } else {
              next();
            }
          } else if (e.data === 1) {
            _setIsPlaying(true);
          } else if (e.data === 2) {
            _setIsPlaying(false);
          }
        },
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ytReady]);

  // Register audio element
  useEffect(() => {
    _registerAudioEl(audioRef.current);
  }, [_registerAudioEl]);

  // Handle track change
  useEffect(() => {
    if (!currentTrack) return;

    if (currentTrack.source === 'youtube' && currentTrack.videoId) {
      // Pause audio if any
      if (audioRef.current) audioRef.current.pause();
      if (ytPlayerRef.current && ytPlayerRef.current.loadVideoById) {
        ytPlayerRef.current.loadVideoById(currentTrack.videoId);
        if (isPlaying) ytPlayerRef.current.playVideo();
      }
    } else if (currentTrack.audioUrl) {
      // Pause YT
      try {
        ytPlayerRef.current?.pauseVideo?.();
      } catch {}
      if (audioRef.current) {
        audioRef.current.src = currentTrack.audioUrl;
        if (isPlaying) audioRef.current.play().catch(() => {});
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTrack?.id]);

  // Progress polling for YT
  useEffect(() => {
    if (intervalRef.current) window.clearInterval(intervalRef.current);
    if (currentTrack?.source === 'youtube') {
      intervalRef.current = window.setInterval(() => {
        try {
          const p = ytPlayerRef.current;
          if (p && p.getCurrentTime && p.getDuration) {
            const cur = p.getCurrentTime();
            const dur = p.getDuration();
            if (dur > 0) _setProgress(cur / dur, cur, dur);
          }
        } catch {}
      }, 500);
    }
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTrack?.id]);

  const handleAudioTimeUpdate = () => {
    const a = audioRef.current;
    if (!a) return;
    const cur = a.currentTime;
    const dur = a.duration || 0;
    if (dur > 0) _setProgress(cur / dur, cur, dur);
  };

  const handleAudioEnded = () => {
    if (repeat === 'one' && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    } else {
      next();
    }
  };

  const handleSeekClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const frac = (e.clientX - rect.left) / rect.width;
    seekTo(Math.max(0, Math.min(1, frac)));
  };

  const isFav = currentTrack ? favorites.includes(currentTrack.id) : false;
  const VolumeIcon = muted || volume === 0 ? VolumeX : volume < 50 ? Volume1 : Volume2;

  return (
    <>
      {/* Hidden YouTube iframe container */}
      <div className="fixed -bottom-10 -right-10 w-1 h-1 overflow-hidden pointer-events-none opacity-0">
        <div ref={ytContainerRef} />
      </div>

      {/* Hidden audio element for uploads / royalty-free */}
      <audio
        ref={audioRef}
        onTimeUpdate={handleAudioTimeUpdate}
        onEnded={handleAudioEnded}
        onPlay={() => _setIsPlaying(true)}
        onPause={() => _setIsPlaying(false)}
      />

      {/* Player Bar */}
      <div className="h-20 md:h-24 bg-neutral-950 border-t border-neutral-800 px-3 md:px-6 flex items-center gap-3 md:gap-6">
        {/* Now Playing */}
        <div className="flex items-center gap-3 w-1/4 min-w-0">
          <button
            className="md:hidden text-white"
            onClick={toggleSidebar}
          >
            <Menu className="w-5 h-5" />
          </button>
          {currentTrack ? (
            <>
              <img
                src={currentTrack.thumbnail}
                alt={currentTrack.title}
                className="w-12 h-12 md:w-14 md:h-14 rounded object-cover shadow-lg"
              />
              <div className="min-w-0 hidden sm:block">
                <div className="text-sm font-medium text-white truncate">
                  {currentTrack.title}
                </div>
                <div className="text-xs text-neutral-400 truncate">
                  {currentTrack.artist}
                </div>
              </div>
              <button
                onClick={() => toggleFavorite(currentTrack.id)}
                className={cn(
                  'hidden sm:block transition-colors',
                  isFav ? 'text-pink-500' : 'text-neutral-400 hover:text-white'
                )}
              >
                <Heart className={cn('w-4 h-4', isFav && 'fill-pink-500')} />
              </button>
            </>
          ) : (
            <div className="text-xs text-neutral-500 hidden sm:block">
              Select a track to play
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex-1 flex flex-col items-center gap-1.5 max-w-2xl">
          <div className="flex items-center gap-3 md:gap-5">
            <button
              onClick={toggleShuffle}
              className={cn(
                'transition-colors hidden sm:block',
                shuffle ? 'text-green-500' : 'text-neutral-400 hover:text-white'
              )}
              title="Shuffle"
            >
              <Shuffle className="w-4 h-4" />
            </button>
            <button
              onClick={prev}
              className="text-neutral-300 hover:text-white"
              title="Previous"
            >
              <SkipBack className="w-5 h-5 fill-current" />
            </button>
            <button
              onClick={togglePlay}
              className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-black" />
              ) : (
                <Play className="w-5 h-5 fill-black ml-0.5" />
              )}
            </button>
            <button
              onClick={next}
              className="text-neutral-300 hover:text-white"
              title="Next"
            >
              <SkipForward className="w-5 h-5 fill-current" />
            </button>
            <button
              onClick={cycleRepeat}
              className={cn(
                'transition-colors hidden sm:block',
                repeat !== 'off' ? 'text-green-500' : 'text-neutral-400 hover:text-white'
              )}
              title={`Repeat: ${repeat}`}
            >
              {repeat === 'one' ? (
                <Repeat1 className="w-4 h-4" />
              ) : (
                <Repeat className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Progress */}
          <div className="w-full flex items-center gap-2">
            <span className="text-[10px] text-neutral-400 w-10 text-right tabular-nums">
              {formatTime(currentTime)}
            </span>
            <div
              className="flex-1 h-1 bg-neutral-700 rounded-full cursor-pointer group"
              onClick={handleSeekClick}
            >
              <div
                className="h-full bg-white group-hover:bg-green-500 rounded-full relative transition-colors"
                style={{ width: `${progress * 100}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100" />
              </div>
            </div>
            <span className="text-[10px] text-neutral-400 w-10 tabular-nums">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Volume + extras */}
        <div className="hidden md:flex items-center gap-2 w-1/4 justify-end">
          {currentTrack?.downloadable && (
            <button
              onClick={() => currentTrack && downloadTrack(currentTrack)}
              className="text-neutral-400 hover:text-green-500 transition-colors"
              title="Download"
            >
              <Download className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={toggleMute}
            className="text-neutral-300 hover:text-white"
          >
            <VolumeIcon className="w-4 h-4" />
          </button>
          <input
            type="range"
            min={0}
            max={100}
            value={muted ? 0 : volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="w-24 accent-green-500 h-1"
          />
        </div>
      </div>
    </>
  );
};

export default Player;
