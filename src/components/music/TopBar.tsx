import React from 'react';
import { useMusic } from '@/contexts/MusicContext';
import { Search, Menu, ChevronLeft, ChevronRight } from 'lucide-react';

const TopBar: React.FC = () => {
  const { view, setView, searchQuery, setSearchQuery, toggleSidebar } = useMusic();

  return (
    <div className="sticky top-0 z-30 bg-gradient-to-b from-black/80 to-black/40 backdrop-blur px-4 md:px-6 py-3 flex items-center gap-3">
      <button
        className="md:hidden text-white"
        onClick={toggleSidebar}
      >
        <Menu className="w-5 h-5" />
      </button>

      <div className="hidden md:flex items-center gap-2">
        <button
          className="w-8 h-8 rounded-full bg-black/60 flex items-center justify-center text-neutral-300 hover:text-white"
          onClick={() => setView({ type: 'home' })}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          className="w-8 h-8 rounded-full bg-black/60 flex items-center justify-center text-neutral-300 hover:text-white"
          onClick={() => setView({ type: 'search' })}
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {view.type === 'search' ? (
        <div className="flex-1 max-w-md relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
          <input
            autoFocus
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="What do you want to listen to?"
            className="w-full pl-10 pr-4 py-2.5 bg-white text-black rounded-full outline-none text-sm font-medium placeholder:text-neutral-500"
          />
        </div>
      ) : (
        <button
          onClick={() => setView({ type: 'search' })}
          className="flex-1 max-w-md flex items-center gap-2 px-4 py-2 bg-neutral-800/80 hover:bg-neutral-700 rounded-full text-sm text-neutral-400 min-w-0"
        >
          <Search className="w-4 h-4 flex-shrink-0" />
          <span className="truncate">Search songs, artists...</span>
        </button>
      )}

      <div className="hidden sm:block flex-1" />

      <button
        onClick={() => setView({ type: 'uploads' })}
        className="hidden sm:block px-4 py-1.5 text-sm font-bold text-black bg-white rounded-full hover:scale-105 transition-transform"
      >
        Upload
      </button>
    </div>
  );
};

export default TopBar;
