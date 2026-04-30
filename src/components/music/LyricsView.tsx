import React, { useEffect, useState, useRef } from 'react';
import { useMusic } from '@/contexts/MusicContext';
import { ChevronDown, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LrclibResponse {
  plainLyrics: string | null;
  syncedLyrics: string | null;
}

interface ParsedLine {
  time: number; // in seconds
  text: string;
}

const LyricsView: React.FC = () => {
  const { currentTrack, currentTime, showLyrics, toggleLyrics } = useMusic();
  const [lyrics, setLyrics] = useState<ParsedLine[] | string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [render, setRender] = useState(showLyrics);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const activeLineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!currentTrack || !showLyrics) return;
    
    // reset
    setLyrics(null);
    setError(null);
    setLoading(true);

    const controller = new AbortController();

    const fetchLyrics = async () => {
      try {
        const url = new URL('https://lrclib.net/api/get');
        url.searchParams.set('track_name', currentTrack.title);
        url.searchParams.set('artist_name', currentTrack.artist);

        const res = await fetch(url.toString(), { signal: controller.signal });
        if (!res.ok) {
          if (res.status === 404) {
            setError("We couldn't find lyrics for this song.");
          } else {
            setError("Failed to load lyrics.");
          }
          setLoading(false);
          return;
        }

        const data: LrclibResponse = await res.json();
        
        if (data.syncedLyrics) {
          // Parse synced lyrics
          const lines = data.syncedLyrics.split('\n');
          const parsed: ParsedLine[] = [];
          // [mm:ss.xx] text
          const regex = /^\[(\d{2}):(\d{2}(?:\.\d{2})?)\]\s*(.*)$/;
          
          for (const line of lines) {
            const match = line.match(regex);
            if (match) {
              const minutes = parseInt(match[1], 10);
              const seconds = parseFloat(match[2]);
              const text = match[3];
              parsed.push({
                time: minutes * 60 + seconds,
                text: text || ' ' // keep empty lines for pacing
              });
            }
          }
          setLyrics(parsed);
        } else if (data.plainLyrics) {
          setLyrics(data.plainLyrics);
        } else {
          setError("No lyrics available.");
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          setError("An error occurred while fetching lyrics.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchLyrics();

    return () => controller.abort();
  }, [currentTrack?.id, showLyrics]);

  // Auto-scroll logic
  useEffect(() => {
    if (activeLineRef.current && containerRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [currentTime, lyrics]);

  // Determine active line index
  let activeIdx = -1;
  if (Array.isArray(lyrics)) {
    // Find the last line whose time is <= currentTime
    for (let i = lyrics.length - 1; i >= 0; i--) {
      if (currentTime >= lyrics[i].time - 0.2) { // 0.2s lookahead/fudge factor
        activeIdx = i;
        break;
      }
    }
  }

  useEffect(() => {
    if (showLyrics) {
      setRender(true);
    } else {
      const t = setTimeout(() => setRender(false), 500);
      return () => clearTimeout(t);
    }
  }, [showLyrics]);

  if (!render) return null;

  // Animation and display
  return (
    <div
      className={cn(
        'absolute inset-0 z-40 bg-gradient-to-b from-neutral-800 to-black flex flex-col transition-all duration-500 ease-in-out',
        showLyrics ? 'translate-y-0 opacity-100 pointer-events-auto' : 'translate-y-full opacity-0 pointer-events-none'
      )}
    >
      <div className="flex items-center justify-between p-6">
        <button
          onClick={toggleLyrics}
          className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
        >
          <ChevronDown className="w-6 h-6 text-white" />
        </button>
        <div className="text-center">
          <div className="text-xs uppercase font-bold text-neutral-400 tracking-wider">
            Lyrics
          </div>
          <div className="text-sm font-semibold text-white truncate max-w-[200px] md:max-w-md">
            {currentTrack?.title} - {currentTrack?.artist}
          </div>
        </div>
        <div className="w-10" /> {/* Spacer */}
      </div>

      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto px-6 pb-32 pt-10 scrollbar-hide"
      >
        <div className="max-w-3xl mx-auto flex flex-col gap-6">
          {loading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
          )}

          {error && (
            <div className="text-center text-neutral-400 py-20 text-lg">
              {error}
            </div>
          )}

          {typeof lyrics === 'string' && (
            <div className="text-2xl font-bold text-white whitespace-pre-wrap leading-relaxed text-center md:text-left">
              {lyrics}
            </div>
          )}

          {Array.isArray(lyrics) && lyrics.map((line, i) => {
            const isActive = i === activeIdx;
            const isPassed = i < activeIdx;
            
            return (
              <div
                key={i}
                ref={isActive ? activeLineRef : null}
                className={cn(
                  "text-3xl md:text-5xl font-extrabold transition-all duration-300 min-h-[1em]",
                  isActive ? "text-white md:scale-105 origin-left" : 
                  isPassed ? "text-white/50" : "text-white/20"
                )}
              >
                {line.text}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LyricsView;
