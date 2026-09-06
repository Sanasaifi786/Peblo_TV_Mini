import React, { useState } from 'react';
import { Play, Clock, Volume2 } from 'lucide-react';
import { CollapsedEpisode, resolveMediaUrl } from '../api/catalog';
import { LanguagePills } from './LanguagePills';

interface EpisodeListProps {
  episodes: CollapsedEpisode[];
  onPlayEpisode: (episode: CollapsedEpisode, selectedLanguage?: string) => void;
}

export const EpisodeList: React.FC<EpisodeListProps> = ({ episodes, onPlayEpisode }) => {
  // Store selected language variant per episode content_group
  const [selectedLanguages, setSelectedLanguages] = useState<Record<string, string>>({});

  const getActiveVariant = (ep: CollapsedEpisode) => {
    const chosenLang = selectedLanguages[ep.content_group] || ep.default_language || ep.languages[0];
    const match = ep.variants?.find(v => v.language === chosenLang);
    return match || ep.variants?.[0] || {
      title: ep.title,
      description: ep.description,
      language: ep.default_language,
      video_url: undefined,
      artwork: [],
    };
  };

  const handleSelectLanguage = (contentGroup: string, lang: string) => {
    setSelectedLanguages(prev => ({ ...prev, [contentGroup]: lang }));
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    return `${mins}m`;
  };

  return (
    <div className="space-y-4">
      {episodes.map((ep) => {
        const variant = getActiveVariant(ep);
        const thumbUrl = resolveMediaUrl(
          ep.artwork?.thumbnail || ep.artwork?.banner || ep.artwork?.poster
        );

        return (
          <div
            key={ep.content_group}
            onClick={() => onPlayEpisode(ep, variant.language)}
            className="group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-zinc-900/50 hover:bg-zinc-800/80 border border-zinc-800/60 hover:border-zinc-700 transition-all cursor-pointer"
          >
            <div className="flex items-start sm:items-center gap-4 w-full sm:w-auto">
              {/* Episode Number */}
              <span className="text-lg font-black text-zinc-500 group-hover:text-white transition-colors w-6 text-center shrink-0">
                {ep.episode_number}
              </span>

              {/* Thumbnail with hover play overlay */}
              <div className="relative aspect-[16/9] w-36 sm:w-44 rounded-xl overflow-hidden bg-black shrink-0 shadow-md">
                {thumbUrl ? (
                  <img
                    src={thumbUrl}
                    alt={variant.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-xs text-zinc-500">
                    No preview
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 flex items-center justify-center transition-colors">
                  <div className="w-9 h-9 rounded-full bg-white/90 text-black flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Play className="w-4 h-4 fill-black ml-0.5" />
                  </div>
                </div>
              </div>

              {/* Episode Details */}
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="font-bold text-base text-white group-hover:text-rose-400 transition-colors line-clamp-1">
                    {variant.title}
                  </h4>
                  <span className="text-xs font-mono font-medium text-zinc-400 shrink-0 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-zinc-500" />
                    {formatDuration(ep.duration_seconds)}
                  </span>
                </div>

                <p className="text-xs text-zinc-400 line-clamp-2 max-w-xl">
                  {variant.description || 'No episode description.'}
                </p>

                {/* Episode Language Variants Selector */}
                {ep.languages?.length > 1 && (
                  <div className="pt-1" onClick={(e) => e.stopPropagation()}>
                    <LanguagePills
                      availableLanguages={ep.languages}
                      activeLanguage={variant.language}
                      onSelectLanguage={(l) => handleSelectLanguage(ep.content_group, l)}
                      size="sm"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
