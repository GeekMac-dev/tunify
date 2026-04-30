import React from 'react';
import { MusicProvider, useMusic } from '@/contexts/MusicContext';
import Sidebar from './music/Sidebar';
import TopBar from './music/TopBar';
import Player from './music/Player';
import HomeView from './music/views/HomeView';
import SearchView from './music/views/SearchView';
import FavoritesView from './music/views/FavoritesView';
import PlaylistView from './music/views/PlaylistView';
import UploadsView from './music/views/UploadsView';
import LyricsView from './music/LyricsView';

const Main: React.FC = () => {
  const { view } = useMusic();

  let content: React.ReactNode = null;
  switch (view.type) {
    case 'home':
      content = <HomeView />;
      break;
    case 'search':
      content = <SearchView />;
      break;
    case 'favorites':
      content = <FavoritesView />;
      break;
    case 'uploads':
      content = <UploadsView />;
      break;
    case 'playlist':
      content = <PlaylistView playlistId={view.id} />;
      break;
    default:
      content = <HomeView />;
  }

  return (
    <div className="flex-1 flex flex-col min-w-0 min-h-0 bg-gradient-to-b from-neutral-900 to-black overflow-hidden rounded-lg md:m-2">
      <TopBar />
      <main className="flex-1 overflow-y-auto px-4 md:px-6 pt-4 scrollbar-thin">
        {content}
      </main>
    </div>
  );
};

const Shell: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-black text-white flex flex-col overflow-hidden">
      <div className="flex-1 flex min-h-0 relative overflow-hidden">
        <Sidebar />
        <Main />
        <LyricsView />
      </div>
      <Player />
    </div>
  );
};

const AppLayout: React.FC = () => {
  return (
    <MusicProvider>
      <Shell />
    </MusicProvider>
  );
};

export default AppLayout;
