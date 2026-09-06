import React from 'react';
import { Play, Star, Clock } from 'lucide-react';
import { CatalogueShow, resolveMediaUrl } from '../api/catalog';

interface PosterCardProps {
  show: CatalogueShow;
  onSelect: (show: CatalogueShow) => void;
  onQuickPlay?: (show: CatalogueShow) => void;
  variant?: 'landscape' | 'portrait';
}

export const PosterCard: React.FC<PosterCardProps> = ({
  show,
  onSelect,
  onQuickPlay,
  variant = 'landscape',
}) => {
  const imageUrl = resolveMediaUrl(
    variant === 'landscape' ? (show.banner_url || show.poster_url) : (show.poster_url || show.banner_url)
  );

  const lang = show.available_languages?.[0]?.toUpperCase() || 'EN';
  const isHindi = lang === 'HI';

  // Extract a soothing subtitle/tagline if description has one
  const cleanDescription = show.description || '';
  const firstSentence = cleanDescription.split('.')[0] + '.';

  // Random rating & vote count based on show ID for aesthetic authenticity matching images
  const ratingVal = ((show.id % 4) * 0.1 + 4.7).toFixed(1);
  const reviewsCount = `${(show.id * 230 + 520) % 3000}`;

  if (variant === 'portrait') {
    // Image 1 Portrait Show Card
    return (
      <div
        onClick={() => onSelect(show)}
        className="group flex flex-col bg-[#121626]/80 hover:bg-[#181d33] border border-white/5 hover:border-amber-400/30 rounded-2xl overflow-hidden cursor-pointer card-zoom transition-all duration-300"
      >
        {/* Artwork with Top Badges & Duration Pill */}
        <div className="relative aspect-[4/3] sm:aspect-[1/1] w-full overflow-hidden bg-slate-900">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={show.title}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs text-slate-500 bg-slate-800">
              {show.title}
            </div>
          )}

          {/* Top Badges */}
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
            <span
              className={`text-[10px] font-black px-1.5 py-0.5 rounded ${
                isHindi ? 'bg-orange-600 text-white' : 'bg-red-600 text-white'
              }`}
            >
              {lang}
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-slate-200 border border-white/10">
              Ages 3+
            </span>
          </div>

          {/* Bottom Right Duration Pill */}
          <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-[11px] font-semibold text-slate-200 flex items-center gap-1 border border-white/10">
            <Clock className="w-3 h-3 text-amber-300" />
            <span>15m</span>
          </div>
        </div>

        {/* Details Below Matching Image 1 */}
        <div className="p-3.5 flex flex-col flex-1 justify-between gap-2.5">
          <div className="space-y-1">
            <h4 className="font-bold text-sm text-white group-hover:text-amber-300 transition-colors line-clamp-1">
              {show.title}
            </h4>
            <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
              {show.description}
            </p>
          </div>

          {/* Rating & Golden Circular Play Button */}
          <div className="flex items-center justify-between pt-1 border-t border-white/5">
            <div className="flex items-center gap-1 text-xs text-amber-300 font-bold">
              <Star className="w-3.5 h-3.5 fill-amber-300" />
              <span>{ratingVal}</span>
              <span className="text-slate-500 font-normal">({reviewsCount})</span>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onQuickPlay) onQuickPlay(show);
                else onSelect(show);
              }}
              className="w-8 h-8 rounded-full bg-[#F6C543] hover:bg-[#ffd153] text-zinc-950 flex items-center justify-center shadow-md hover:scale-110 active:scale-95 transition-all"
              title="Play Now"
            >
              <Play className="w-3.5 h-3.5 fill-zinc-950 ml-0.5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Image 3 Landscape Card (Home Page Rows)
  return (
    <div
      onClick={() => onSelect(show)}
      className="group relative flex-none w-[240px] sm:w-[280px] cursor-pointer card-zoom rounded-2xl overflow-hidden bg-[#121626]/70 hover:bg-[#181d33] border border-white/5 hover:border-amber-400/30 transition-all duration-300"
    >
      {/* Landscape Image */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-900 rounded-t-2xl">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={show.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs text-slate-500 bg-slate-800">
            {show.title}
          </div>
        )}

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
          <span
            className={`text-[10px] font-black px-1.5 py-0.5 rounded ${
              isHindi ? 'bg-orange-600 text-white' : 'bg-red-600 text-white'
            }`}
          >
            {lang}
          </span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-slate-200 border border-white/10">
            18m
          </span>
        </div>

        {/* Quick Play Hover Button */}
        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-[#F6C543] text-zinc-950 flex items-center justify-center shadow-xl transform scale-90 group-hover:scale-100 transition-transform">
            <Play className="w-4 h-4 fill-zinc-950 ml-0.5" />
          </div>
        </div>
      </div>

      {/* Info Below Image */}
      <div className="p-3">
        <h4 className="font-bold text-sm text-white group-hover:text-amber-300 transition-colors truncate">
          {show.title}
        </h4>
        <p className="text-xs text-slate-400 truncate mt-0.5">
          {show.category || 'Gentle story'} • Soothing
        </p>
      </div>
    </div>
  );
};
