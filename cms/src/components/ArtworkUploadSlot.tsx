import React, { useState, useRef } from 'react';
import { Upload, X, AlertCircle, CheckCircle2, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Artwork, api } from '../api/client';

interface ArtworkUploadSlotProps {
  episodeId: number;
  type: 'poster' | 'banner' | 'thumbnail';
  existingArtwork?: Artwork;
  onUploaded: (artwork: Artwork) => void;
  onDeleted: (artworkId: number) => void;
}

const SPEC_DETAILS = {
  poster: {
    label: 'Poster Artwork',
    ratio: '2:3 Portrait',
    rec: '400 × 600 px (or 600 × 900)',
    maxSize: '200 KB',
    aspectClass: 'aspect-[2/3] max-w-[170px]',
  },
  banner: {
    label: 'Banner Artwork',
    ratio: '16:9 Landscape',
    rec: '1280 × 720 px',
    maxSize: '200 KB',
    aspectClass: 'aspect-[16/9] w-full max-w-[320px]',
  },
  thumbnail: {
    label: 'Thumbnail Artwork',
    ratio: '16:9 Landscape',
    rec: '640 × 360 px',
    maxSize: '200 KB',
    aspectClass: 'aspect-[16/9] w-full max-w-[260px]',
  },
};

export const ArtworkUploadSlot: React.FC<ArtworkUploadSlotProps> = ({
  episodeId,
  type,
  existingArtwork,
  onUploaded,
  onDeleted,
}) => {
  const spec = SPEC_DETAILS[type];
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFileChange = async (file: File) => {
    setErrorMsg(null);

    // Client-side quick size check
    if (file.size > 200 * 1024) {
      setErrorMsg(`File is ${(file.size / 1024).toFixed(1)} KB. Max allowed is 200 KB.`);
      return;
    }

    setLoading(true);
    try {
      const art = await api.uploadArtwork(episodeId, type, file);
      onUploaded(art);
    } catch (err: any) {
      setErrorMsg(err.message || 'Artwork upload failed.');
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!existingArtwork) return;
    setLoading(true);
    try {
      await api.deleteArtwork(existingArtwork.id);
      onDeleted(existingArtwork.id);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to remove artwork');
    } finally {
      setLoading(false);
    }
  };

  const fullUrl = existingArtwork?.url.startsWith('http')
    ? existingArtwork.url
    : `http://localhost:8000${existingArtwork?.url}`;

  return (
    <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between">
      {/* Header Info */}
      <div className="mb-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-200 capitalize">{spec.label}</span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-rose-400 border border-slate-700/50">
            {spec.ratio}
          </span>
        </div>
        <div className="text-xs text-slate-400 mt-1 flex items-center justify-between">
          <span>Target: {spec.rec}</span>
          <span className="text-slate-500 font-mono">Max {spec.maxSize}</span>
        </div>
      </div>

      {/* Upload / Preview Box */}
      <div
        onClick={() => !loading && fileInputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (e.dataTransfer.files?.[0]) {
            handleFileChange(e.dataTransfer.files[0]);
          }
        }}
        className={`relative mx-auto rounded-xl overflow-hidden border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center p-3 text-center ${
          spec.aspectClass
        } ${
          dragOver
            ? 'border-rose-500 bg-rose-950/20'
            : existingArtwork
            ? 'border-slate-700/50 bg-slate-950/50'
            : 'border-slate-800 bg-slate-950/40 hover:border-slate-700 hover:bg-slate-900/30'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.[0]) handleFileChange(e.target.files[0]);
          }}
        />

        {loading ? (
          <div className="flex flex-col items-center gap-2 text-rose-400">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="text-xs">Processing...</span>
          </div>
        ) : existingArtwork ? (
          <div className="relative w-full h-full group">
            <img
              src={fullUrl}
              alt={type}
              className="w-full h-full object-cover rounded-lg shadow"
            />
            {/* Hover overlay with delete button */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex flex-col items-center justify-center gap-2 p-2">
              <span className="text-[11px] text-white font-medium">Click to replace</span>
              <button
                onClick={handleDelete}
                className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs flex items-center gap-1 shadow"
              >
                <X className="w-3.5 h-3.5" /> Remove
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-slate-500 hover:text-slate-300">
            <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center border border-slate-800">
              <Upload className="w-4 h-4 text-slate-400" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-300">Click or drop image</p>
              <p className="text-[10px] text-slate-500">PNG, JPG, or WebP</p>
            </div>
          </div>
        )}
      </div>

      {/* Dimensions badge if uploaded */}
      {existingArtwork && !errorMsg && (
        <div className="mt-2 text-center">
          <span className="text-[11px] text-emerald-400 font-mono flex items-center justify-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            {existingArtwork.width} × {existingArtwork.height} px
            {existingArtwork.file_size_bytes ? ` (${(existingArtwork.file_size_bytes / 1024).toFixed(0)} KB)` : ''}
          </span>
        </div>
      )}

      {/* Inline Validation Error */}
      {errorMsg && (
        <div className="mt-2.5 p-2 bg-rose-950/50 border border-rose-800/60 rounded-xl text-rose-300 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div className="leading-tight text-[11px]">{errorMsg}</div>
        </div>
      )}
    </div>
  );
};
