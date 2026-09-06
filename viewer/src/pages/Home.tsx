import React from 'react';
import { CatalogueFile, CatalogueShow } from '../api/catalog';
import { HeroBanner } from '../components/HeroBanner';
import { ShowRow } from '../components/ShowRow';
import { SleepTimerBar } from '../components/SleepTimerBar';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface HomePageProps {
  catalogue: CatalogueFile | null;
  isLoading: boolean;
  error: string | null;
  onSelectShow: (show: CatalogueShow) => void;
  onRetry: () => void;
}

export const Home: React.FC<HomePageProps> = ({
  catalogue,
  isLoading,
  error,
  onSelectShow,
  onRetry,
}) => {
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b0f19]">
        <div className="flex flex-col items-center gap-4 text-center p-8">
          <div className="w-12 h-12 rounded-full border-4 border-t-amber-400 border-indigo-950 animate-spin" />
          <p className="text-sm font-semibold text-slate-400">Opening bedtime dreamland...</p>
        </div>
      </div>
    );
  }

  if (error || !catalogue) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b0f19] p-4">
        <div className="max-w-md w-full bg-[#121626] border border-white/10 rounded-3xl p-8 text-center space-y-4 shadow-2xl">
          <AlertCircle className="w-12 h-12 text-amber-400 mx-auto" />
          <h2 className="text-xl font-bold text-white">Catalogue Not Published Yet</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            {error || 'The streaming catalogue is currently empty or has not been published from the CMS.'}
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={onRetry}
              className="w-full bg-[#F6C543] hover:bg-amber-400 text-zinc-950 font-bold py-2.5 px-4 rounded-xl text-xs transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retry Fetching Catalogue</span>
            </button>
            <a
              href="http://localhost:5173"
              target="_blank"
              rel="noreferrer"
              className="w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-2.5 px-4 rounded-xl text-xs transition-colors"
            >
              Open CMS to Publish
            </a>
          </div>
        </div>
      </div>
    );
  }

  const shows = catalogue.shows || [];
  // Find Luna for the hero banner if present, otherwise default to first show
  const featuredShow =
    shows.find((s) => s.title.toLowerCase().includes('luna')) ||
    shows[0];

  // Group shows by section
  const sectionMap: Record<string, CatalogueShow[]> = {};
  for (const show of shows) {
    const sec = show.section || 'Bedtime Stories';
    if (!sectionMap[sec]) sectionMap[sec] = [];
    sectionMap[sec].push(show);
  }

  // Ensure sections matching Image 3 order:
  // 1. New Releases
  // 2. Bedtime Stories & Calming Sounds
  // 3. Learning & Discovery
  const orderedSections = [
    'New Releases',
    'Bedtime Stories & Calming Sounds',
    'Bedtime Stories',
    'Learning & Discovery',
    'Learning & Wonder',
    'Music & Lullabies',
  ];

  const sortedSectionKeys = Object.keys(sectionMap).sort((a, b) => {
    const idxA = orderedSections.findIndex((s) => a.toLowerCase().includes(s.toLowerCase()));
    const idxB = orderedSections.findIndex((s) => b.toLowerCase().includes(s.toLowerCase()));
    return (idxA >= 0 ? idxA : 99) - (idxB >= 0 ? idxB : 99);
  });

  return (
    <div className="min-h-screen pb-32 bg-[#0b0f19]">
      {/* Featured Hero Banner */}
      {featuredShow && (
        <HeroBanner
          show={featuredShow}
          onPlay={onSelectShow}
          onMoreInfo={onSelectShow}
        />
      )}

      {/* Rows per Section matching Image 3 */}
      <div className="-mt-16 sm:-mt-24 relative z-20 space-y-4">
        {sortedSectionKeys.map((sectionTitle) => (
          <ShowRow
            key={sectionTitle}
            title={sectionTitle}
            shows={sectionMap[sectionTitle]}
            onSelectShow={onSelectShow}
            onQuickPlay={onSelectShow}
          />
        ))}
      </div>

      {/* Floating Bottom Sleep Timer Bar */}
      <SleepTimerBar />
    </div>
  );
};
