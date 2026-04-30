import React, { useState } from 'react';
import { useMusic } from '@/contexts/MusicContext';
import TrackRow from '../TrackRow';
import { Play, Trash2, Edit2, Check, ListMusic, Plus } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface Props {
  playlistId: string;
}

const PlaylistView: React.FC<Props> = ({ playlistId }) => {
  const {
    playlists,
    catalog,
    playTrack,
    renamePlaylist,
    deletePlaylist,
    removeFromPlaylist,
    setView,
    addToPlaylist,
  } = useMusic();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [addQuery, setAddQuery] = useState('');

  const pl = playlists.find((p) => p.id === playlistId);
  if (!pl) {
    return (
      <div className="text-center py-16 text-neutral-400">
        Playlist not found.
      </div>
    );
  }

  const tracks = pl.trackIds
    .map((id) => catalog.find((t) => t.id === id))
    .filter(Boolean) as any[];

  const handleSaveName = () => {
    if (name.trim()) {
      renamePlaylist(pl.id, name.trim());
      toast({ title: 'Playlist renamed' });
    }
    setEditing(false);
  };

  const handleDelete = () => {
    if (confirm(`Delete "${pl.name}"?`)) {
      deletePlaylist(pl.id);
      setView({ type: 'home' });
    }
  };

  const filteredCatalog = catalog.filter((t) => {
    const q = addQuery.toLowerCase();
    return (
      !pl.trackIds.includes(t.id) &&
      (t.title.toLowerCase().includes(q) || t.artist.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end gap-6 -mt-6 -mx-6 p-6 bg-gradient-to-b from-purple-700/40 to-transparent">
        <div className="w-40 h-40 md:w-52 md:h-52 bg-gradient-to-br from-purple-500 via-pink-600 to-orange-500 rounded-md shadow-2xl flex items-center justify-center flex-shrink-0">
          <ListMusic className="w-20 h-20 text-white/80" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs uppercase font-semibold text-white">Playlist</p>
          {editing ? (
            <div className="flex items-center gap-2 my-2">
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                className="text-3xl md:text-5xl font-extrabold text-white bg-transparent border-b-2 border-white/40 outline-none w-full"
              />
              <button
                onClick={handleSaveName}
                className="text-green-500 hover:text-green-400"
              >
                <Check className="w-6 h-6" />
              </button>
            </div>
          ) : (
            <h1 className="text-3xl md:text-6xl font-extrabold text-white my-2 truncate">
              {pl.name}
            </h1>
          )}
          <p className="text-sm text-neutral-300">
            {tracks.length} {tracks.length === 1 ? 'song' : 'songs'}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 flex-wrap">
        {tracks.length > 0 && (
          <button
            onClick={() => playTrack(tracks[0], tracks)}
            className="w-14 h-14 rounded-full bg-green-500 text-black flex items-center justify-center hover:scale-105 transition-transform shadow-xl"
          >
            <Play className="w-6 h-6 fill-black ml-0.5" />
          </button>
        )}
        <button
          onClick={() => setShowAdd(true)}
          className="px-4 py-2 rounded-full border border-neutral-600 text-white text-sm font-semibold hover:border-white flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add songs
        </button>
        <button
          onClick={() => {
            setName(pl.name);
            setEditing(true);
          }}
          className="text-neutral-400 hover:text-white"
          title="Rename"
        >
          <Edit2 className="w-5 h-5" />
        </button>
        <button
          onClick={handleDelete}
          className="text-neutral-400 hover:text-red-500"
          title="Delete"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      {/* Tracks */}
      {tracks.length === 0 ? (
        <div className="text-center py-16">
          <ListMusic className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
          <p className="text-neutral-400">This playlist is empty</p>
          <button
            onClick={() => setShowAdd(true)}
            className="mt-4 px-5 py-2 bg-green-500 text-black font-bold rounded-full hover:scale-105 transition-transform"
          >
            Add songs
          </button>
        </div>
      ) : (
        <div className="bg-neutral-900/40 rounded-lg p-2">
          {tracks.map((t, i) => (
            <TrackRow
              key={t.id}
              track={t}
              index={i}
              queue={tracks}
              onRemove={() => removeFromPlaylist(pl.id, t.id)}
            />
          ))}
        </div>
      )}

      {/* Add songs modal */}
      {showAdd && (
        <div
          className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4"
          onClick={() => setShowAdd(false)}
        >
          <div
            className="bg-neutral-900 rounded-xl w-full max-w-2xl max-h-[80vh] flex flex-col border border-neutral-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-neutral-800">
              <h3 className="text-xl font-bold text-white mb-3">
                Add songs to "{pl.name}"
              </h3>
              <input
                autoFocus
                value={addQuery}
                onChange={(e) => setAddQuery(e.target.value)}
                placeholder="Search your library..."
                className="w-full px-4 py-2.5 bg-neutral-800 rounded-md text-white outline-none focus:ring-2 ring-green-500"
              />
            </div>
            <div className="overflow-y-auto p-2 flex-1">
              {filteredCatalog.slice(0, 30).map((t) => (
                <div
                  key={t.id}
                  className="flex items-center gap-3 p-2 hover:bg-white/5 rounded"
                >
                  <img
                    src={t.thumbnail}
                    alt={t.title}
                    className="w-10 h-10 rounded object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white truncate">
                      {t.title}
                    </div>
                    <div className="text-xs text-neutral-400 truncate">
                      {t.artist}
                    </div>
                  </div>
                  <button
                    onClick={() => addToPlaylist(pl.id, t.id)}
                    className="px-4 py-1.5 text-xs font-bold border border-neutral-600 text-white rounded-full hover:border-white"
                  >
                    Add
                  </button>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-neutral-800 flex justify-end">
              <button
                onClick={() => setShowAdd(false)}
                className="px-5 py-2 bg-white text-black font-bold rounded-full hover:scale-105 transition-transform"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlaylistView;
