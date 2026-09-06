import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, Moon, GraduationCap, Music } from 'lucide-react';
import { CatalogueShow } from '../api/catalog';
import { PosterCard } from './PosterCard';

interface ShowRowProps {
  title: string;
  shows: CatalogueShow[];
  onSelectShow: (show: CatalogueShow) => void;
  onQuickPlay?: (show: CatalogueShow) => void;
}

export const ShowRow: React.FC<ShowRowProps> = ({ title, shows, onSelectShow, onQuickPlay }) => {
  const rowRef = useRef<HTMLDivElement>(null);

  const handleScroll = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const scrollAmount = direction === 'left' ? -600 : 600;
      rowRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (!shows || shows.length === 0) return null;

  // Choose icon based on section title
  const getSectionIcon = () => {
    const lower = title.toLowerCase();
    if (lower.includes('new release')) return <Sparkles className="w-4 h-4 text-amber-300" />;
    if (lower.includes('bedtime') || lower.includes('calm') || lower.includes('lullab'))
      return <Moon className="w-4 h-4 text-teal-300" />;
    if (lower.includes('learning') || lower.includes('wonder') || lower.includes('discovery'))
      return <GraduationCap className="w-4 h-4 text-sky-300" />;
    return <Music className="w-4 h-4 text-indigo-300" />;
  };

  return (
    <div className="relative group px-4 sm:px-10 py-3">
      {/* Row Header with Navigation Arrows matching Image 3 */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg sm:text-xl font-black tracking-tight text-white flex items-center gap-2">
          {getSectionIcon()}
          <span>{title}</span>
        </h2>

        {/* Circular carousel control arrows */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handleScroll('left')}
            className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-slate-300 flex items-center justify-center transition-colors active:scale-90"
            aria-label="Previous Shows"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleScroll('right')}
            className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-slate-300 flex items-center justify-center transition-colors active:scale-90"
            aria-label="Next Shows"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Cards Row */}
      <div
        ref={rowRef}
        className="flex items-center gap-4 overflow-x-auto no-scrollbar py-2 scroll-smooth"
      >
        {shows.map((show) => (
          <PosterCard
            key={show.id}
            show={show}
            onSelect={onSelectShow}
            onQuickPlay={onQuickPlay}
            variant="landscape"
          />
        ))}
      </div>
    </div>
  );
};
