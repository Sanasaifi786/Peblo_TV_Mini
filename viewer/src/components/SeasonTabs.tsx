import React from 'react';
import { CatalogueSeason } from '../api/catalog';

interface SeasonTabsProps {
  seasons: CatalogueSeason[];
  activeSeasonNumber: number;
  onSelectSeason: (seasonNumber: number) => void;
}

export const SeasonTabs: React.FC<SeasonTabsProps> = ({
  seasons,
  activeSeasonNumber,
  onSelectSeason,
}) => {
  // STRICT RULE: Exclude Season 0 (trailers) from the normal list
  const standardSeasons = seasons.filter(s => s.season_number > 0);

  if (standardSeasons.length <= 1) {
    return (
      <div className="text-sm font-bold text-slate-300">
        {standardSeasons[0]?.title || `Season 1`}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
      {standardSeasons.map((s) => {
        const isActive = s.season_number === activeSeasonNumber;
        return (
          <button
            key={s.season_number}
            onClick={() => onSelectSeason(s.season_number)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border shrink-0 ${
              isActive
                ? 'bg-white text-black border-white shadow-lg'
                : 'bg-zinc-900 text-slate-400 border-zinc-800 hover:text-white hover:bg-zinc-800'
            }`}
          >
            {s.title || `Season ${s.season_number}`}
          </button>
        );
      })}
    </div>
  );
};
