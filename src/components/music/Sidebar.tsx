import React, { useState } from 'react';
import { useMusic } from '@/contexts/MusicContext';
import {
  Home,
  Search,
  Library,
  Heart,
  Plus,
  Music2,
  Upload,
  ListMusic,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const NavItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}> = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={cn(
      'w-full flex items-center gap-4 px-3 py-2.5 rounded-md transition-all duration-200 text-sm font-semibold',
      active
        ? 'bg-neutral-800 text-white'
        : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
    )}
  >
    {icon}
    <span>{label}</span>
  </button>
);

const Sidebar: React.FC = () => {
  const {
    view,
    setView,
    playlists,
    createPlaylist,
    sidebarOpen,
    toggleSidebar,
  } = useMusic();
  const [showNewModal, setShowNewModal] = useState(false);
  const [newName, setNewName] = useState('');

  const handleCreate = () => {
    const name = newName.trim() || `My Playlist #${playlists.length + 1}`;
    createPlaylist(name);
    setNewName('');
    setShowNewModal(false);
  };

  const isActive = (t: string, id?: string) =>
    view.type === t && (id ? (view as any).id === id : true);

  return (
    <>
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      <aside
        className={cn(
          'fixed md:relative z-50 md:z-auto top-0 left-0 h-full md:h-auto w-64 bg-black flex flex-col gap-2 p-2 transition-transform duration-300',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        {/* Brand */}
        <div className="flex items-center justify-between px-3 py-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
              <Music2 className="w-5 h-5 text-black" />
            </div>
            <span className="font-bold text-white text-lg">Tunify</span>
          </div>
          <button
            className="md:hidden text-neutral-400"
            onClick={toggleSidebar}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top nav */}
        <div className="bg-neutral-900 rounded-lg p-2 space-y-1">
          <NavItem
            icon={<Home className="w-5 h-5" />}
            label="Home"
            active={isActive('home')}
            onClick={() => setView({ type: 'home' })}
          />
          <NavItem
            icon={<Search className="w-5 h-5" />}
            label="Search"
            active={isActive('search')}
            onClick={() => setView({ type: 'search' })}
          />
        </div>

        {/* Library */}
        <div className="bg-neutral-900 rounded-lg p-2 flex-1 flex flex-col min-h-0">
          <div className="flex items-center justify-between px-3 py-2">
            <div className="flex items-center gap-3 text-neutral-400 text-sm font-semibold">
              <Library className="w-5 h-5" />
              Your Library
            </div>
            <button
              onClick={() => setShowNewModal(true)}
              className="text-neutral-400 hover:text-white transition-colors p-1 rounded-full hover:bg-neutral-800"
              title="Create playlist"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-1 mt-2 overflow-y-auto flex-1 scrollbar-thin">
            <NavItem
              icon={<Heart className="w-5 h-5 text-pink-500" />}
              label="Liked Songs"
              active={isActive('favorites')}
              onClick={() => setView({ type: 'favorites' })}
            />
            <NavItem
              icon={<Upload className="w-5 h-5 text-blue-400" />}
              label="Your Uploads"
              active={isActive('uploads')}
              onClick={() => setView({ type: 'uploads' })}
            />

            <div className="px-3 py-2 text-xs uppercase tracking-wider text-neutral-500 font-semibold">
              Playlists
            </div>
            {playlists.length === 0 && (
              <div className="px-3 py-2 text-xs text-neutral-500">
                No playlists yet. Click + to create one.
              </div>
            )}
            {playlists.map((pl) => (
              <NavItem
                key={pl.id}
                icon={<ListMusic className="w-5 h-5" />}
                label={pl.name}
                active={isActive('playlist', pl.id)}
                onClick={() => setView({ type: 'playlist', id: pl.id })}
              />
            ))}
          </div>
        </div>
      </aside>

      {/* Create Playlist Modal */}
      {showNewModal && (
        <div
          className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4"
          onClick={() => setShowNewModal(false)}
        >
          <div
            className="bg-neutral-900 rounded-xl p-6 max-w-sm w-full border border-neutral-800"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-white mb-4">New Playlist</h3>
            <input
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              placeholder="Playlist name"
              className="w-full px-4 py-2.5 bg-neutral-800 rounded-md text-white outline-none focus:ring-2 ring-green-500"
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setShowNewModal(false)}
                className="px-4 py-2 text-sm font-semibold text-white hover:underline"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                className="px-5 py-2 text-sm font-bold bg-green-500 text-black rounded-full hover:scale-105 transition-transform"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
