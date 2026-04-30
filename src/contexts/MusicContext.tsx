import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Track, allTracks as initialCatalog } from '@/data/sampleTracks';
import { toast } from '@/components/ui/use-toast';

export interface Playlist {
  id: string;
  name: string;
  cover?: string;
  trackIds: string[];
  createdAt: number;
}

type View =
  | { type: 'home' }
  | { type: 'search' }
  | { type: 'library' }
  | { type: 'favorites' }
  | { type: 'playlist'; id: string }
  | { type: 'uploads' };

export type RepeatMode = 'off' | 'all' | 'one';

interface MusicContextType {
  // Catalog
  catalog: Track[];
  uploads: Track[];

  // Playback
  currentTrack: Track | null;
  isPlaying: boolean;
  progress: number; // 0-1
  currentTime: number; // seconds
  duration: number; // seconds
  volume: number; // 0-100
  muted: boolean;
  shuffle: boolean;
  repeat: RepeatMode;
  queue: Track[];

  // Library
  favorites: string[];
  recentlyPlayed: string[];
  playlists: Playlist[];

  // Navigation
  view: View;
  setView: (v: View) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;

  // Sidebar
  sidebarOpen: boolean;
  toggleSidebar: () => void;

  // Actions
  playTrack: (track: Track, queue?: Track[]) => void;
  togglePlay: () => void;
  next: () => void;
  prev: () => void;
  seekTo: (frac: number) => void;
  setVolume: (v: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;

  toggleFavorite: (id: string) => void;

  createPlaylist: (name: string) => string;
  renamePlaylist: (id: string, name: string) => void;
  deletePlaylist: (id: string) => void;
  addToPlaylist: (playlistId: string, trackId: string) => void;
  removeFromPlaylist: (playlistId: string, trackId: string) => void;
  uploadFiles: (files: FileList) => void;
  removeUpload: (id: string) => void;
  downloadTrack: (track: Track) => void;
  // Persist a remote (YouTube search) track so it stays available for
  // favorites / playlists / recently-played after the search session ends.
  registerRemoteTrack: (track: Track) => void;


  // Internal player wiring
  _registerYTPlayer: (player: any) => void;
  _registerAudioEl: (el: HTMLAudioElement | null) => void;
  _setIsPlaying: (b: boolean) => void;
  _setProgress: (p: number, current: number, dur: number) => void;
}

const MusicContext = createContext<MusicContextType | null>(null);

export const useMusic = () => {
  const ctx = useContext(MusicContext);
  if (!ctx) throw new Error('useMusic must be used inside MusicProvider');
  return ctx;
};

const LS_KEYS = {
  favorites: 'music.favorites',
  recent: 'music.recent',
  playlists: 'music.playlists',
  volume: 'music.volume',
  remoteTracks: 'music.remoteTracks',
};

const loadLS = <T,>(key: string, fallback: T): T => {
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
};

export const MusicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Catalog & uploads
  const [uploads, setUploads] = useState<Track[]>([]);
  // Remote (YouTube search) tracks the user has interacted with — persisted so
  // favorites / playlists / recently-played continue to work after the search
  // session ends.
  const [remoteTracks, setRemoteTracks] = useState<Track[]>(
    loadLS<Track[]>(LS_KEYS.remoteTracks, [])
  );
  const catalog = [...initialCatalog, ...uploads, ...remoteTracks];


  // Playback state
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState<number>(loadLS(LS_KEYS.volume, 70));
  const [muted, setMuted] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState<RepeatMode>('off');
  const [queue, setQueue] = useState<Track[]>([]);

  // Library
  const [favorites, setFavorites] = useState<string[]>(loadLS(LS_KEYS.favorites, []));
  const [recentlyPlayed, setRecentlyPlayed] = useState<string[]>(loadLS(LS_KEYS.recent, []));
  const [playlists, setPlaylists] = useState<Playlist[]>(loadLS(LS_KEYS.playlists, []));

  // Navigation
  const [view, setView] = useState<View>({ type: 'home' });
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Player refs
  const ytPlayerRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Persist
  useEffect(() => {
    localStorage.setItem(LS_KEYS.favorites, JSON.stringify(favorites));
  }, [favorites]);
  useEffect(() => {
    localStorage.setItem(LS_KEYS.recent, JSON.stringify(recentlyPlayed));
  }, [recentlyPlayed]);
  useEffect(() => {
    localStorage.setItem(LS_KEYS.playlists, JSON.stringify(playlists));
  }, [playlists]);
  useEffect(() => {
    localStorage.setItem(LS_KEYS.volume, JSON.stringify(volume));
  }, [volume]);
  useEffect(() => {
    localStorage.setItem(LS_KEYS.remoteTracks, JSON.stringify(remoteTracks));
  }, [remoteTracks]);


  // Add a remote (YouTube search) track to the persisted catalog so it stays
  // playable / lookup-able when referenced by id from favorites or playlists.
  const registerRemoteTrack = (track: Track) => {
    setRemoteTracks((prev) => {
      if (prev.some((t) => t.id === track.id)) return prev;
      return [track, ...prev].slice(0, 200); // cap to avoid LS bloat
    });
  };


  const toggleSidebar = () => setSidebarOpen((p) => !p);

  // Add to recently played
  const pushRecent = (id: string) => {
    setRecentlyPlayed((prev) => {
      const filtered = prev.filter((x) => x !== id);
      return [id, ...filtered].slice(0, 30);
    });
  };

  const playTrack = (track: Track, q?: Track[]) => {
    setCurrentTrack(track);
    setIsPlaying(true);
    setProgress(0);
    setCurrentTime(0);
    if (q && q.length) setQueue(q);
    pushRecent(track.id);
  };

  const togglePlay = () => {
    if (!currentTrack) return;
    setIsPlaying((p) => {
      const next = !p;
      try {
        if (currentTrack.source === 'youtube' && ytPlayerRef.current) {
          if (next) ytPlayerRef.current.playVideo?.();
          else ytPlayerRef.current.pauseVideo?.();
        } else if (audioRef.current) {
          if (next) audioRef.current.play().catch(() => {});
          else audioRef.current.pause();
        }
      } catch {}
      return next;
    });
  };

  const getQueueWithCurrent = () => {
    const q = queue.length ? queue : catalog;
    const idx = currentTrack ? q.findIndex((t) => t.id === currentTrack.id) : -1;
    return { q, idx };
  };

  const next = useCallback(() => {
    const { q, idx } = getQueueWithCurrent();
    if (q.length === 0) return;
    let nextIdx;
    if (shuffle) {
      nextIdx = Math.floor(Math.random() * q.length);
    } else {
      nextIdx = idx + 1;
      if (nextIdx >= q.length) nextIdx = repeat === 'all' ? 0 : -1;
    }
    if (nextIdx >= 0) {
      const t = q[nextIdx];
      setCurrentTrack(t);
      setIsPlaying(true);
      setProgress(0);
      pushRecent(t.id);
    } else {
      setIsPlaying(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queue, currentTrack, shuffle, repeat, catalog]);

  const prev = () => {
    const { q, idx } = getQueueWithCurrent();
    if (q.length === 0) return;
    if (currentTime > 3) {
      // Restart current
      seekTo(0);
      return;
    }
    const prevIdx = idx > 0 ? idx - 1 : q.length - 1;
    const t = q[prevIdx];
    setCurrentTrack(t);
    setIsPlaying(true);
    setProgress(0);
    pushRecent(t.id);
  };

  const seekTo = (frac: number) => {
    if (!currentTrack) return;
    try {
      if (currentTrack.source === 'youtube' && ytPlayerRef.current) {
        const dur = ytPlayerRef.current.getDuration?.() || 0;
        ytPlayerRef.current.seekTo?.(dur * frac, true);
      } else if (audioRef.current) {
        audioRef.current.currentTime = (audioRef.current.duration || 0) * frac;
      }
    } catch {}
    setProgress(frac);
  };

  const setVolume = (v: number) => {
    setVolumeState(v);
    setMuted(v === 0);
    try {
      ytPlayerRef.current?.setVolume?.(v);
      if (audioRef.current) audioRef.current.volume = v / 100;
    } catch {}
  };

  const toggleMute = () => {
    setMuted((m) => {
      const newMuted = !m;
      try {
        if (newMuted) {
          ytPlayerRef.current?.mute?.();
          if (audioRef.current) audioRef.current.muted = true;
        } else {
          ytPlayerRef.current?.unMute?.();
          if (audioRef.current) audioRef.current.muted = false;
        }
      } catch {}
      return newMuted;
    });
  };

  const toggleShuffle = () => setShuffle((s) => !s);
  const cycleRepeat = () =>
    setRepeat((r) => (r === 'off' ? 'all' : r === 'all' ? 'one' : 'off'));

  const toggleFavorite = (id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const createPlaylist = (name: string) => {
    const id = 'pl-' + Date.now();
    const newPl: Playlist = { id, name, trackIds: [], createdAt: Date.now() };
    setPlaylists((p) => [newPl, ...p]);
    toast({ title: 'Playlist created', description: name });
    return id;
  };

  const renamePlaylist = (id: string, name: string) => {
    setPlaylists((p) => p.map((pl) => (pl.id === id ? { ...pl, name } : pl)));
  };

  const deletePlaylist = (id: string) => {
    setPlaylists((p) => p.filter((pl) => pl.id !== id));
    toast({ title: 'Playlist deleted' });
  };

  const addToPlaylist = (playlistId: string, trackId: string) => {
    setPlaylists((p) =>
      p.map((pl) =>
        pl.id === playlistId && !pl.trackIds.includes(trackId)
          ? { ...pl, trackIds: [...pl.trackIds, trackId] }
          : pl
      )
    );
    toast({ title: 'Added to playlist' });
  };

  const removeFromPlaylist = (playlistId: string, trackId: string) => {
    setPlaylists((p) =>
      p.map((pl) =>
        pl.id === playlistId
          ? { ...pl, trackIds: pl.trackIds.filter((t) => t !== trackId) }
          : pl
      )
    );
  };

  const uploadFiles = (files: FileList) => {
    const newUploads: Track[] = [];
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('audio/')) return;
      const url = URL.createObjectURL(file);
      const name = file.name.replace(/\.[^.]+$/, '');
      newUploads.push({
        id: 'up-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
        title: name,
        artist: 'Your Library',
        thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400',
        audioUrl: url,
        source: 'upload',
        downloadable: true,
      });
    });
    if (newUploads.length) {
      setUploads((u) => [...newUploads, ...u]);
      toast({
        title: `${newUploads.length} file${newUploads.length > 1 ? 's' : ''} uploaded`,
        description: 'Available for offline playback & download.',
      });
    } else {
      toast({ title: 'No audio files found', description: 'Please select MP3/FLAC/WAV files.' });
    }
  };

  const removeUpload = (id: string) => {
    setUploads((u) => u.filter((t) => t.id !== id));
  };

  const downloadTrack = (track: Track) => {
    if (!track.downloadable || !track.audioUrl) {
      toast({
        title: 'Download not allowed',
        description: 'Only royalty-free or uploaded tracks can be downloaded.',
      });
      return;
    }
    const a = document.createElement('a');
    a.href = track.audioUrl;
    a.download = `${track.title}.mp3`;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast({ title: 'Download started', description: track.title });
  };

  // Internal wiring for the player components
  const _registerYTPlayer = (p: any) => {
    ytPlayerRef.current = p;
    try {
      p?.setVolume?.(volume);
    } catch {}
  };
  const _registerAudioEl = (el: HTMLAudioElement | null) => {
    audioRef.current = el;
    if (el) el.volume = volume / 100;
  };
  const _setIsPlaying = (b: boolean) => setIsPlaying(b);
  const _setProgress = (p: number, current: number, dur: number) => {
    setProgress(p);
    setCurrentTime(current);
    setDuration(dur);
  };

  return (
    <MusicContext.Provider
      value={{
        catalog,
        uploads,
        currentTrack,
        isPlaying,
        progress,
        currentTime,
        duration,
        volume,
        muted,
        shuffle,
        repeat,
        queue,
        favorites,
        recentlyPlayed,
        playlists,
        view,
        setView,
        searchQuery,
        setSearchQuery,
        sidebarOpen,
        toggleSidebar,
        playTrack,
        togglePlay,
        next,
        prev,
        seekTo,
        setVolume,
        toggleMute,
        toggleShuffle,
        cycleRepeat,
        toggleFavorite,
        createPlaylist,
        renamePlaylist,
        deletePlaylist,
        addToPlaylist,
        removeFromPlaylist,
        uploadFiles,
        removeUpload,
        downloadTrack,
        registerRemoteTrack,

        _registerYTPlayer,
        _registerAudioEl,
        _setIsPlaying,
        _setProgress,
      }}
    >
      {children}
    </MusicContext.Provider>
  );
};
