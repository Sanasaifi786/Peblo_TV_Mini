import React, { useState } from 'react';
import { Play, Info, Sparkles, Moon } from 'lucide-react';
import { CatalogueShow, resolveMediaUrl } from '../api/catalog';
import { bedtimeSoundscape } from '../utils/audioEngine';

interface HeroBannerProps {
  show: CatalogueShow;
  onPlay: (show: CatalogueShow) => void;
  onMoreInfo: (show: CatalogueShow) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ show, onPlay, onMoreInfo }) => {
  const [nightWindActive, setNightWindActive] = useState(false);
  const bannerUrl = resolveMediaUrl(show.banner_url || show.poster_url);

  const toggleNightWind = () => {
    const isNowActive = bedtimeSoundscape.toggle();
    setNightWindActive(isNowActive);
  };

  return (
    <div className="relative w-full h-[75vh] sm:h-[85vh] min-h-[540px] overflow-hidden bg-[#0b0f19]">
      {/* Background Banner Artwork */}
      {bannerUrl ? (
        <img
          src={bannerUrl}
          alt={show.title}
          className="absolute inset-0 w-full h-full object-cover object-center transform scale-105 transition-transform duration-1000"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-r from-[#0d1428] via-[#161c36] to-[#0b0f19]" />
      )}

      {/* Bedtime Vignette & Soft Gradient Overlay */}
      <div className="absolute inset-0 hero-vignette" />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-10 h-full flex flex-col justify-end pb-20 sm:pb-28">
        <div className="max-w-2xl space-y-4">
          {/* Staff Pick Badge matching Image 3 */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs text-slate-200">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span className="font-semibold text-amber-300">STAFF PICK</span>
            <span className="text-slate-400">•</span>
            <span>{show.category || 'Bedtime Wonder'}</span>
            <span className="text-slate-400">•</span>
            <span className="text-amber-200">Ages 3–7</span>
          </div>

          {/* Show Title */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)] leading-[1.1]">
            {show.title}
          </h1>

          {/* Synopsis */}
          <p className="text-sm sm:text-base text-slate-200/90 line-clamp-3 max-w-xl font-normal drop-shadow leading-relaxed">
            {show.description}
          </p>

          {/* CTA Action Buttons matching Image 3 */}
          <div className="flex flex-wrap items-center gap-3.5 pt-3">
            {/* Play Episode 1 Golden Button */}
            <button
              onClick={() => onPlay(show)}
              className="bg-[#F6C543] hover:bg-[#ffcf52] text-zinc-950 font-black px-6 py-2.5 sm:py-3 rounded-full text-sm sm:text-base transition-all shadow-lg shadow-amber-500/25 flex items-center gap-2 hover:scale-105 active:scale-95"
            >
              <Play className="w-4 h-4 fill-zinc-950" />
              <span>Play Episode 1</span>
            </button>

            {/* More Info Frosted Button */}
            <button
              onClick={() => onMoreInfo(show)}
              className="bg-white/10 hover:bg-white/20 text-white font-semibold px-5 py-2.5 sm:py-3 rounded-full text-sm sm:text-base transition-all backdrop-blur-md flex items-center gap-2 border border-white/15 hover:scale-105 active:scale-95"
            >
              <Info className="w-4 h-4 text-slate-300" />
              <span>More Info</span>
            </button>

            {/* Night Wind Audio Switch matching Image 3 */}
            <div
              onClick={toggleNightWind}
              className="cursor-pointer bg-black/40 hover:bg-black/60 border border-white/10 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-3 transition-colors select-none"
            >
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
                <Moon className="w-3.5 h-3.5 text-teal-300" />
                <span>Night Wind Audio</span>
              </div>
              <div
                className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-300 flex items-center ${
                  nightWindActive ? 'bg-[#14b8a6] justify-end' : 'bg-slate-700 justify-start'
                }`}
              >
                <div className="w-4 h-4 rounded-full bg-white shadow-md transform transition-transform" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
