import React, { useState, useEffect } from 'react';
import { X, AlertCircle, CheckCircle2, Info, Loader2, Play } from 'lucide-react';
import { Episode, Season, Artwork, api } from '../api/client';
import { ArtworkUploadSlot } from '../components/ArtworkUploadSlot';

interface EpisodeFormProps {
  showId: number;
  showTitle: string;
  seasons: Season[];
  episode?: Episode | null;
  onClose: () => void;
  onSuccess: (savedEpisode: Episode) => void;
}

const LANGUAGES = [
  { code: 'en', label: 'English (en)' },
  { code: 'es', label: 'Spanish (es)' },
  { code: 'hi', label: 'Hindi (hi)' },
  { code: 'fr', label: 'French (fr)' },
  { code: 'ja', label: 'Japanese (ja)' },
  { code: 'de', label: 'German (de)' },
  { code: 'it', label: 'Italian (it)' },
];

export const EpisodeForm: React.FC<EpisodeFormProps> = ({
  showId,
  showTitle,
  seasons,
  episode,
  onClose,
  onSuccess,
}) => {
  const isEditing = !!episode;

  const [seasonId, setSeasonId] = useState<number>(
    episode?.season_id || seasons[0]?.id || 0
  );
  const [title, setTitle] = useState(episode?.title || '');
  const [description, setDescription] = useState(episode?.description || '');
  const [episodeNumber, setEpisodeNumber] = useState(episode?.episode_number || 1);
  const [contentGroup, setContentGroup] = useState(episode?.content_group || '');
  const [language, setLanguage] = useState(episode?.language || 'en');
  const [durationSeconds, setDurationSeconds] = useState(episode?.duration_seconds || 0);
  const [status, setStatus] = useState<'draft' | 'published' | 'archived'>(
    episode?.status || 'draft'
  );
  const [videoUrl, setVideoUrl] = useState(
    episode?.video_url || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
  );

  const [artworkList, setArtworkList] = useState<Artwork[]>(episode?.artwork || []);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Auto-generate a suggested content_group if new
  useEffect(() => {
    if (!isEditing && !contentGroup && title) {
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      setContentGroup(`cg-${slug}-s01e${episodeNumber}`);
    }
  }, [title, episodeNumber, isEditing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Frontend pre-check for published rule
    if (status === 'published') {
      if (durationSeconds <= 0) {
        setErrorMsg('An episode cannot be published with duration 0. Please enter the duration in seconds.');
        return;
      }
      if (isEditing && artworkList.length === 0) {
        setErrorMsg('An episode cannot be published without at least one uploaded artwork.');
        return;
      }
    }

    setLoading(true);
    try {
      let saved: Episode;
      if (isEditing && episode) {
        saved = await api.updateEpisode(episode.id, {
          title,
          description,
          episode_number: episodeNumber,
          content_group: contentGroup,
          language,
          duration_seconds: durationSeconds,
          status,
          video_url: videoUrl,
        });
      } else {
        saved = await api.createEpisode({
          season_id: Number(seasonId),
          title,
          description,
          episode_number: Number(episodeNumber),
          content_group: contentGroup,
          language,
          duration_seconds: Number(durationSeconds),
          status,
          video_url: videoUrl,
        });
      }
      onSuccess(saved);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save episode');
    } finally {
      setLoading(false);
    }
  };

  const getArtworkByType = (type: 'poster' | 'banner' | 'thumbnail') => {
    return artworkList.find(a => a.type === type);
  };

  const handleArtworkUploaded = (art: Artwork) => {
    setArtworkList(prev => {
      const filtered = prev.filter(a => a.type !== art.type);
      return [...filtered, art];
    });
  };

  const handleArtworkDeleted = (artworkId: number) => {
    setArtworkList(prev => prev.filter(a => a.id !== artworkId));
  };

  const formatMinutes = (seconds: number) => {
    if (!seconds) return '0 min';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#0f1118] border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-400">
              {showTitle}
            </span>
            <h2 className="text-lg font-bold text-white">
              {isEditing ? `Edit Episode: ${episode?.title}` : 'Add New Episode'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {errorMsg && (
            <div className="p-3.5 bg-rose-950/60 border border-rose-800/80 rounded-2xl text-rose-300 text-xs flex items-center gap-3">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form id="episode-form" onSubmit={handleSubmit} className="space-y-6">
            {/* Row 1: Season & Episode Number */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Target Season
                </label>
                <select
                  disabled={isEditing}
                  value={seasonId}
                  onChange={(e) => setSeasonId(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-rose-500"
                >
                  {seasons.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.season_number === 0 ? 'Season 0 (Trailers & Teasers)' : s.title || `Season ${s.season_number}`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Episode Number
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={episodeNumber}
                  onChange={(e) => setEpisodeNumber(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Publishing Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-rose-500"
                >
                  <option value="draft">Draft (Private)</option>
                  <option value="published">Published (Ready for Catalogue)</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>

            {/* Row 2: Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Episode Title
              </label>
              <input
                type="text"
                required
                placeholder="e.g. The Awakening (English Dub)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-rose-500"
              />
            </div>

            {/* Row 3: Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Description / Synopsis
              </label>
              <textarea
                rows={2}
                placeholder="Plot synopsis for this episode..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-rose-500"
              />
            </div>

            {/* Row 4: Language & Content Group Collapsing Architecture */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950/40 p-4 rounded-2xl border border-slate-800/80">
              <div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Content Group Identifier
                  </label>
                  <span title="Episodes with the exact same content_group are collapsed into a single card on the viewer with language pills!">
                    <Info className="w-3.5 h-3.5 text-rose-400 cursor-help" />
                  </span>
                </div>
                <input
                  type="text"
                  required
                  placeholder="e.g. cg-aethelgard-s01e01"
                  value={contentGroup}
                  onChange={(e) => setContentGroup(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-rose-500"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Unique per (Content Group, Language) combination.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Audio / Dub Language
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-rose-500"
                >
                  {LANGUAGES.map((l) => (
                    <option key={l.code} value={l.code}>
                      {l.label}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-500 mt-1">
                  Surfaced as language selector pills on the viewer card.
                </p>
              </div>
            </div>

            {/* Row 5: Duration & Video URL */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Duration (Seconds)
                  </label>
                  <span className="text-xs font-mono text-rose-400">
                    {formatMinutes(durationSeconds)}
                  </span>
                </div>
                <input
                  type="number"
                  min="0"
                  required
                  value={durationSeconds}
                  onChange={(e) => setDurationSeconds(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-rose-500"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Duration &gt; 0 is strictly enforced before publishing.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Stream Video URL (MP4 / HLS)
                </label>
                <input
                  type="url"
                  placeholder="https://.../video.mp4"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-100 focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            {/* Row 6: Three Artwork Upload Slots */}
            {isEditing && (
              <div className="border-t border-slate-800 pt-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-white">Episode Artwork Slots</h3>
                    <p className="text-xs text-slate-400">
                      Enforces aspect ratio, dimension limits, and 200 KB ceiling.
                    </p>
                  </div>
                  <span className="text-xs font-mono text-slate-400 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
                    {artworkList.length} / 3 Uploaded
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <ArtworkUploadSlot
                    episodeId={episode!.id}
                    type="thumbnail"
                    existingArtwork={getArtworkByType('thumbnail')}
                    onUploaded={handleArtworkUploaded}
                    onDeleted={handleArtworkDeleted}
                  />
                  <ArtworkUploadSlot
                    episodeId={episode!.id}
                    type="banner"
                    existingArtwork={getArtworkByType('banner')}
                    onUploaded={handleArtworkUploaded}
                    onDeleted={handleArtworkDeleted}
                  />
                  <ArtworkUploadSlot
                    episodeId={episode!.id}
                    type="poster"
                    existingArtwork={getArtworkByType('poster')}
                    onUploaded={handleArtworkUploaded}
                    onDeleted={handleArtworkDeleted}
                  />
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 flex items-center justify-between bg-slate-950/60">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            form="episode-form"
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-600 text-white font-semibold px-6 py-2 rounded-xl text-sm transition-all shadow-lg shadow-rose-950/50 flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Episode...</span>
              </>
            ) : (
              <span>{isEditing ? 'Save Changes' : 'Create Episode'}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
