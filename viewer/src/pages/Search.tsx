import React, { useState, useEffect } from 'react';
import {
  Search as SearchIcon,
  X,
  Mic,
  Moon,
  ChevronDown,
  Sparkles,
  Heart,
  RotateCcw,
  Sliders,
} from 'lucide-react';
import { CatalogueShow, CatalogueFile, catalogApi } from '../api/catalog';
import { PosterCard } from '../components/PosterCard';

interface SearchPageProps {
  initialCatalogue?: CatalogueFile | null;
  onSelectShow: (show: CatalogueShow) => void;
  defaultFilter?: string;
}

export const Search: React.FC<SearchPageProps> = ({
  initialCatalogue,
  onSelectShow,
  defaultFilter,
}) => {
  const [query, setQuery] = useState('');
  const [selectedCollection, setSelectedCollection] = useState<string>(
    defaultFilter || 'Bedtime Stories'
  );
  const [selectedTheme, setSelectedTheme] = useState<string>('All Themes');
  const [selectedAudio, setSelectedAudio] = useState<string>('EN');
  const [sortBy, setSortBy] = useState<string>('Most Soothing First');

  const [searchResults, setSearchResults] = useState<CatalogueShow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);

  // Collections matching Image 1
  const collections = [
    'All Sections',
    'Bedtime Stories',
    'Learning & Wonder',
    'Music & Lullabies',
  ];

  // Themes matching Image 1
  const themes = [
    { label: 'All Themes', icon: '' },
    { label: 'Animals', icon: '🐾' },
    { label: 'Cosmic Dreams', icon: '✨' },
    { label: 'Nature Sounds', icon: '🌿' },
    { label: 'Gentle Adventures', icon: '⛺' },
  ];

  const executeSearch = async () => {
    setIsLoading(true);
    try {
      const secParam =
        selectedCollection === 'All Sections' ? undefined : selectedCollection;
      const langParam =
        selectedAudio === 'All' ? undefined : selectedAudio.toLowerCase();

      const data = await catalogApi.searchCatalogue({
        q: query || undefined,
        section: secParam,
        language: langParam,
      });

      let res = data.shows || [];

      // Theme filter on client side if specific theme picked
      if (selectedTheme !== 'All Themes') {
        const tLower = selectedTheme.toLowerCase();
        res = res.filter(
          (s) =>
            s.title.toLowerCase().includes(tLower) ||
            s.description.toLowerCase().includes(tLower) ||
            s.category.toLowerCase().includes(tLower)
        );
      }

      setSearchResults(res);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    executeSearch();
  }, [query, selectedCollection, selectedTheme, selectedAudio, sortBy]);

  const handleVoiceSearch = () => {
    setIsListening(true);
    setTimeout(() => {
      setQuery('starlight bedtime stories');
      setIsListening(false);
    }, 1200);
  };

  const handleResetSearch = () => {
    setQuery('');
    setSelectedCollection('All Sections');
    setSelectedTheme('All Themes');
    setSelectedAudio('All');
  };

  return (
    <div className="min-h-screen pt-24 pb-28 px-4 sm:px-10 max-w-7xl mx-auto space-y-7 bg-[#0b0f19]">
      {/* Prominent Search Pill matching Image 1 */}
      <div className="relative max-w-4xl mx-auto">
        <div className="relative flex items-center bg-[#15192c] border border-white/10 rounded-full px-5 py-3 shadow-2xl focus-within:border-amber-400/50 transition-colors">
          <SearchIcon className="w-5 h-5 text-slate-400 shrink-0 mr-3" />
          <input
            type="text"
            placeholder="Search magic tales, sleepy animals, lullabies..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-white placeholder-slate-400 text-sm sm:text-base focus:outline-none"
          />

          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-full text-slate-400 hover:text-white mr-2"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Voice Search Pill */}
          <button
            onClick={handleVoiceSearch}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 ${
              isListening
                ? 'bg-red-500 text-white animate-pulse'
                : 'bg-white/5 hover:bg-white/15 text-amber-300 border border-amber-400/20'
            }`}
          >
            <Mic className="w-3.5 h-3.5 text-amber-300" />
            <span className="hidden sm:inline">Voice Search</span>
          </button>
        </div>
      </div>

      {/* COLLECTIONS Filter Chips matching Image 1 */}
      <div className="flex flex-wrap items-center gap-2.5 pt-2">
        <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 mr-2">
          COLLECTIONS:
        </span>
        {collections.map((coll) => {
          const isSelected = selectedCollection === coll;
          return (
            <button
              key={coll}
              onClick={() => setSelectedCollection(coll)}
              className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold transition-all ${
                isSelected
                  ? 'bg-[#F6C543] text-zinc-950 shadow-md shadow-amber-500/20 scale-105'
                  : 'bg-[#15192c] text-slate-300 hover:text-white hover:bg-[#1f2540] border border-white/5'
              }`}
            >
              {coll}
            </button>
          );
        })}
      </div>

      {/* THEMES & Audio Row matching Image 1 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1">
        {/* Themes */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 mr-2">
            THEMES:
          </span>
          {themes.map((t) => {
            const isSelected = selectedTheme === t.label;
            return (
              <button
                key={t.label}
                onClick={() => setSelectedTheme(t.label)}
                className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  isSelected
                    ? 'bg-[#252b48] text-white border border-indigo-400/40'
                    : 'bg-[#15192c] text-slate-400 hover:text-slate-200 border border-white/5'
                }`}
              >
                {t.icon && <span>{t.icon}</span>}
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Audio Language Filter */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 font-medium">Audio:</span>
          <div className="flex items-center bg-[#15192c] border border-white/10 rounded-full p-0.5">
            {['All', 'EN', 'HI'].map((langOpt) => {
              const active = selectedAudio === langOpt;
              return (
                <button
                  key={langOpt}
                  onClick={() => setSelectedAudio(langOpt)}
                  className={`px-2.5 py-1 rounded-full font-bold text-xs transition-colors ${
                    active
                      ? 'bg-emerald-500 text-zinc-950'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {langOpt === 'HI' ? 'हिंदी (HI)' : langOpt}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Results Header Bar matching Image 1 */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/5">
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(246,197,67,0.8)]" />
          <h2 className="text-base sm:text-lg font-bold text-white">
            {searchResults.length} gentle shows found
          </h2>
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-teal-500/15 text-teal-300 border border-teal-500/30">
            Sleep-Safe Filter ON
          </span>
        </div>

        {/* Sort dropdown */}
        <div className="flex items-center gap-1.5 text-xs text-slate-400 cursor-pointer hover:text-white bg-[#15192c] border border-white/10 px-3 py-1.5 rounded-full">
          <span>Sort:</span>
          <span className="font-semibold text-slate-200">{sortBy}</span>
          <ChevronDown className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* Grid of 8 Bedtime Shows matching Image 1 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {searchResults.map((show) => (
          <PosterCard
            key={show.id}
            show={show}
            onSelect={onSelectShow}
            onQuickPlay={onSelectShow}
            variant="portrait"
          />
        ))}
      </div>

      {/* Discovery Assistant Card matching Image 1 Bottom Box */}
      <div className="bg-[#12162a]/95 border border-white/10 rounded-3xl p-6 sm:p-8 mt-12 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-center gap-6 sm:gap-8">
          {/* Sleepy Helper Moon Character Card on Left */}
          <div className="w-36 sm:w-44 h-36 sm:h-44 rounded-2xl bg-gradient-to-tr from-[#1a213e] to-[#252e55] border border-white/10 flex flex-col items-center justify-center p-3 relative shrink-0 shadow-lg group">
            <div className="text-5xl animate-bounce duration-1000">🌙</div>
            <div className="text-3xl -mt-4">😴</div>
            <span className="mt-2 text-[10px] font-black uppercase tracking-wider bg-black/50 text-amber-200 px-2 py-0.5 rounded-full border border-amber-400/30">
              Sleepy Helper
            </span>
          </div>

          {/* Discovery Assistant Text on Right */}
          <div className="space-y-3 flex-1 text-center md:text-left">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                DISCOVERY ASSISTANT
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-200 border border-indigo-500/30">
                Safe Bedtime Mode
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-white flex items-center justify-center md:justify-start gap-2">
              <span>No sleepy friends found for "alien rocket race"</span>
              <span className="text-amber-300">🌙</span>
            </h3>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
              High-speed rockets might keep little eyes awake! For peaceful dreams,
              let's try exploring soothing tales of cuddly friends, starry night skies,
              or gentle rolling oceans.
            </p>

            {/* Suggested Chips */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-2">
              <span className="text-xs text-slate-400">Try searching:</span>
              <button
                onClick={() => setQuery('teddy bear')}
                className="px-3 py-1 rounded-full bg-white/5 hover:bg-white/15 text-xs text-slate-200 border border-white/10 transition-colors"
              >
                🧸 teddy bear
              </button>
              <button
                onClick={() => setQuery('moon')}
                className="px-3 py-1 rounded-full bg-white/5 hover:bg-white/15 text-xs text-slate-200 border border-white/10 transition-colors"
              >
                🌙 moon
              </button>
              <button
                onClick={() => setQuery('calm oceans')}
                className="px-3 py-1 rounded-full bg-white/5 hover:bg-white/15 text-xs text-slate-200 border border-white/10 transition-colors"
              >
                🌊 calm oceans
              </button>

              <button
                onClick={handleResetSearch}
                className="px-4 py-1.5 rounded-full bg-[#F6C543] hover:bg-[#ffcf52] text-zinc-950 font-black text-xs transition-transform hover:scale-105 active:scale-95 shadow-md shadow-amber-500/20 ml-2"
              >
                Reset Search
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
