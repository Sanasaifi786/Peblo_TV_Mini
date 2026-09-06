import React, { useState } from 'react';
import { X, Volume2, Globe, Film } from 'lucide-react';
import { CollapsedEpisode, resolveMediaUrl } from '../api/catalog';
import { LanguagePills } from './LanguagePills';

interface VideoPlayerModalProps {
  showTitle: string;
  episode: CollapsedEpisode;
  initialLanguage?: string;
  onClose: () => void;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  showTitle,
  episode,
  initialLanguage,
  onClose,
}) => {
  const [activeLang, setActiveLang] = useState<string>(
    initialLanguage || episode.default_language || episode.languages[0] || 'en'
  );

  const currentVariant = episode.variants?.find(v => v.language === activeLang) || episode.variants?.[0];
  const videoStreamUrl = currentVariant?.video_url || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col justify-between">
      {/* Top Overlay Header */}
      <div className="px-6 py-4 flex items-center justify-between bg-gradient-to-b from-black/90 to-transparent z-20">
        <div>
          <span className="text-xs font-semibold text-rose-500 uppercase tracking-wider">
            {showTitle}
          </span>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span>Ep {episode.episode_number}: {currentVariant?.title || episode.title}</span>
            <span className="text-xs font-mono uppercase bg-rose-950/80 text-rose-400 px-2 py-0.5 rounded border border-rose-800/60">
              {activeLang}
            </span>
          </h3>
        </div>

        <div className="flex items-center gap-4">
          {/* Audio Language Switcher */}
          {episode.languages?.length > 1 && (
            <LanguagePills
              availableLanguages={episode.languages}
              activeLanguage={activeLang}
              onSelectLanguage={setActiveLang}
              size="sm"
            />
          )}

          <button
            onClick={onClose}
            className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Close Player"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Video Container */}
      <div className="flex-1 flex items-center justify-center p-4">
        <video
          key={videoStreamUrl}
          src={videoStreamUrl}
          controls
          autoPlay
          playsInline
          className="max-h-[80vh] w-full max-w-5xl rounded-2xl shadow-2xl bg-black border border-white/10"
        />
      </div>

      {/* Bottom Subtitle/Audio Indicator */}
      <div className="px-6 py-4 flex items-center justify-between text-xs text-zinc-400 bg-gradient-to-t from-black/90 to-transparent z-20">
        <div className="flex items-center gap-2">
          <Film className="w-4 h-4 text-rose-500" />
          <span>Playing {episode.content_group} ({activeLang.toUpperCase()} stream)</span>
        </div>
        <div>
          <span>Press ESC or click close to return</span>
        </div>
      </div>
    </div>
  );
};
