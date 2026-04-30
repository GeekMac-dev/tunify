import React, { useRef, useState } from 'react';
import { useMusic } from '@/contexts/MusicContext';
import TrackRow from '../TrackRow';
import { Upload, FileMusic, Shield } from 'lucide-react';

const UploadsView: React.FC = () => {
  const { uploads, uploadFiles, removeUpload } = useMusic();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files) uploadFiles(e.dataTransfer.files);
  };

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-1">
          Your Uploads
        </h1>
        <p className="text-neutral-400 text-sm">
          Personal music library — fully downloadable for offline listening
        </p>
      </div>

      {/* Upload zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${
          dragOver
            ? 'border-green-500 bg-green-500/10'
            : 'border-neutral-700 hover:border-neutral-500 bg-neutral-900/40'
        }`}
      >
        <Upload className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
        <p className="text-white font-semibold">
          Drop audio files here or click to browse
        </p>
        <p className="text-xs text-neutral-500 mt-2">
          MP3, FLAC, WAV, OGG · Stored locally in your browser
        </p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="audio/*"
          onChange={(e) => e.target.files && uploadFiles(e.target.files)}
          className="hidden"
        />
      </div>

      {/* Safety notice */}
      <div className="flex items-start gap-3 bg-neutral-900/40 border border-neutral-800 rounded-lg p-4">
        <Shield className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-neutral-300 leading-relaxed">
          <strong className="text-white">Safe download policy:</strong> Only
          tracks you upload yourself or licensed royalty-free music can be
          downloaded for offline listening. YouTube tracks are streamed only —
          we never download or convert them, in compliance with platform terms.
        </div>
      </div>

      {/* Uploaded tracks */}
      {uploads.length === 0 ? (
        <div className="text-center py-12">
          <FileMusic className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
          <p className="text-neutral-400">No uploads yet</p>
        </div>
      ) : (
        <div className="bg-neutral-900/40 rounded-lg p-2">
          {uploads.map((t, i) => (
            <TrackRow
              key={t.id}
              track={t}
              index={i}
              queue={uploads}
              onRemove={() => removeUpload(t.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default UploadsView;
