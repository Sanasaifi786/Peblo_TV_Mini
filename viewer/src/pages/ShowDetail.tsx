import React, { useState } from 'react';
import {
  X,
  Play,
  Video,
  Bookmark,
  Moon,
  Clock,
  Volume2,
  Sparkles,
  Headphones,
} from 'lucide-react';
import { CatalogueShow, CollapsedEpisode, resolveMediaUrl } from '../api/catalog';
import { VideoPlayerModal } from '../components/VideoPlayerModal';
import { bedtimeSoundscape } from '../utils/audioEngine';

interface ShowDetailProps {
  show: CatalogueShow;
  onClose: () => void;
}

export const ShowDetail: React.FC<ShowDetailProps> = ({ show, onClose }) => {
  const standardSeasons = show.seasons?.filter((s) => s.season_number > 0) || [];
  const trailers = show.trailers || [];

  const [activeSeasonNum, setActiveSeasonNum] = useState<number>(
    standardSeasons[0]?.season_number || 1
  );
  const [selectedLang, setSelectedLang] = useState<'en' | 'hi'>('en');
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [screenOffMode, setScreenOffMode] = useState(false);

  // Video Player state
  const [activePlayingEpisode, setActivePlayingEpisode] = useState<CollapsedEpisode | null>(null);

  const currentSeason =
    standardSeasons.find((s) => s.season_number === activeSeasonNum) ||
    standardSeasons[0];
  const episodes = currentSeason?.episodes || [];

  const bannerUrl = resolveMediaUrl(show.banner_url || show.poster_url);

  // Soundscape titles for episodes
  const soundscapeTags = [
    '♪ Gentle River Lullaby',
    '♪ Soft Chimes & Hush',
    '♪ Acoustic Strings & Night Winds',
    '♪ Calming Ambient Rain',
    '♪ Starry Breeze Melody',
  ];

  const handlePlayFirst = () => {
    if (episodes.length > 0) {
      setActivePlayingEpisode(episodes[0]);
    }
  };

  const handleStartScreenOffMode = () => {
    bedtimeSoundscape.startNightWind();
    setScreenOffMode(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-2 sm:p-6 overflow-y-auto">
      {/* Screen-Off Mode Overlay if triggered */}
      {screenOffMode && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-6 text-center space-y-6">
          <Moon className="w-16 h-16 text-amber-300 animate-pulse" />
          <h2 className="text-2xl font-bold text-slate-200">Screen-Off Sleep Mode Active</h2>
          <p className="text-sm text-slate-400 max-w-md">
            The screen will stay dark while soothing ambient lullabies play. Sweet dreams!
          </p>
          <button
            onClick={() => {
              bedtimeSoundscape.stop();
              setScreenOffMode(false);
            }}
            className="px-6 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20"
          >
            Wake Screen &amp; Stop Sound
          </button>
        </div>
      )}

      <div className="relative bg-[#0e1222] border border-white/10 rounded-3xl w-full max-w-5xl max-h-[92vh] overflow-y-auto shadow-2xl my-auto text-white">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 z-30 p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md transition-colors border border-white/10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Header Section matching Image 4 */}
        <div className="p-6 sm:p-10 pb-4 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center border-b border-white/5">
          {/* Left Column: Metadata & Controls */}
          <div className="lg:col-span-7 space-y-4">
            {/* Tag / Category Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-slate-300">
              <Moon className="w-3.5 h-3.5 text-teal-300" />
              <span className="font-bold uppercase tracking-wider text-teal-300">
                Calm Bedtime Series
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-300">Lullaby Rhythm</span>
            </div>

            {/* Show Title */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.15]">
              {show.title}
            </h1>

            {/* Metadata Pills */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
              <span className="px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 font-bold">
                Bedtime Calm
              </span>
              <span>• Season {activeSeasonNum} ({episodes.length} Episodes)</span>
              <span>• All Ages</span>
              <span>• Ultra HD</span>
              <span>• Audio in EN &amp; HI</span>
            </div>

            {/* Language Selector Buttons */}
            <div className="flex items-center gap-2.5 pt-1">
              <button
                onClick={() => setSelectedLang('en')}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                  selectedLang === 'en'
                    ? 'bg-white/15 text-white border-amber-400/80 shadow-sm'
                    : 'bg-white/5 text-slate-400 border-white/5 hover:text-white'
                }`}
              >
                ✓ English (EN)
              </button>
              <button
                onClick={() => setSelectedLang('hi')}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                  selectedLang === 'hi'
                    ? 'bg-white/15 text-white border-amber-400/80 shadow-sm'
                    : 'bg-white/5 text-slate-400 border-white/5 hover:text-white'
                }`}
              >
                文A Hindi (हिंदी)
              </button>
            </div>

            {/* Synopsis */}
            <p className="text-xs sm:text-sm text-slate-300/90 leading-relaxed max-w-xl">
              {show.description}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={handlePlayFirst}
                className="bg-[#F6C543] hover:bg-[#ffcf52] text-zinc-950 font-black px-6 py-3 rounded-full text-sm transition-all shadow-lg shadow-amber-500/25 flex items-center gap-2 hover:scale-105 active:scale-95"
              >
                <Play className="w-4 h-4 fill-zinc-950" />
                <span>Play Next: Ep 1 "{episodes[0]?.title || 'Bedtime'}"</span>
              </button>

              {trailers.length > 0 ? (
                <button
                  onClick={() => setActivePlayingEpisode(trailers[0])}
                  className="bg-white/10 hover:bg-white/20 text-white font-semibold px-5 py-3 rounded-full text-sm transition-all border border-white/15 flex items-center gap-2"
                >
                  <Video className="w-4 h-4 text-amber-300" />
                  <span>Watch Trailer 2m 15s</span>
                </button>
              ) : (
                <button
                  onClick={handlePlayFirst}
                  className="bg-white/10 hover:bg-white/20 text-white font-semibold px-5 py-3 rounded-full text-sm transition-all border border-white/15 flex items-center gap-2"
                >
                  <Video className="w-4 h-4 text-amber-300" />
                  <span>Watch Trailer</span>
                </button>
              )}

              <button
                onClick={() => setIsBookmarked(!isBookmarked)}
                className={`p-3 rounded-full border transition-colors ${
                  isBookmarked
                    ? 'bg-amber-400/20 border-amber-400/50 text-amber-300'
                    : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300'
                }`}
                title="Save to Bedtime Favorites"
              >
                <Bookmark className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right Column: Hero Artwork matching Image 4 */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black group">
              <div className="aspect-[4/3] w-full overflow-hidden">
                {bannerUrl ? (
                  <img
                    src={bannerUrl}
                    alt={show.title}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-800" />
                )}
              </div>

              {/* Sub-bar inside artwork */}
              <div className="bg-[#0b0e1b]/90 backdrop-blur-md px-4 py-2.5 flex items-center justify-between text-[11px] text-slate-300 border-t border-white/10">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="font-semibold text-emerald-300">Soft soundscapes active</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-slate-400">Sleep-friendly colors</span>
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-white" />
                    <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
                    <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Season & Audio Tabs matching Image 4 */}
        <div className="px-6 sm:px-10 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5">
          <div className="flex items-center gap-6 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveSeasonNum(1)}
              className={`pb-2 text-sm font-bold transition-all relative ${
                activeSeasonNum === 1
                  ? 'text-white border-b-2 border-amber-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Season 1 ({episodes.length || 12})
            </button>

            <button className="pb-2 text-sm font-medium text-slate-400 hover:text-slate-300 flex items-center gap-1.5">
              <span>Season 2: Starlight Journey</span>
              <span className="text-[10px] uppercase font-bold bg-white/10 text-amber-200 px-1.5 py-0.5 rounded">
                Soon
              </span>
            </button>

            <button
              onClick={handleStartScreenOffMode}
              className="pb-2 text-sm font-medium text-slate-400 hover:text-teal-300 flex items-center gap-1.5"
            >
              <Headphones className="w-3.5 h-3.5" />
              <span>Bedtime Audio Only</span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Clock className="w-3.5 h-3.5 text-teal-300" />
            <span>Auto-Sleep Timer: 30 min set</span>
          </div>
        </div>

        {/* Episodes 2x2 Grid matching Image 4 */}
        <div className="p-6 sm:p-10 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {episodes.map((ep, idx) => {
              const epVariant =
                ep.variants?.find((v) => v.language === selectedLang) ||
                ep.variants?.[0] || {
                  title: ep.title,
                  description: ep.description,
                  language: 'en',
                  video_url: undefined,
                  artwork: [],
                };

              const epThumb = resolveMediaUrl(
                ep.artwork?.thumbnail || ep.artwork?.banner || show.banner_url
              );

              const durationMins = Math.floor(ep.duration_seconds / 60) || 15;
              const soundTag = soundscapeTags[idx % soundscapeTags.length];

              return (
                <div
                  key={ep.content_group || idx}
                  onClick={() => setActivePlayingEpisode(ep)}
                  className="group relative bg-[#13182b]/80 hover:bg-[#181e36] border border-white/5 hover:border-amber-400/30 rounded-2xl p-3.5 flex gap-4 cursor-pointer transition-all duration-200 shadow-md"
                >
                  {/* Thumbnail */}
                  <div className="relative w-36 sm:w-44 aspect-[16/10] rounded-xl overflow-hidden bg-slate-900 shrink-0">
                    {epThumb ? (
                      <img
                        src={epThumb}
                        alt={epVariant.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-800" />
                    )}

                    {idx === 0 && (
                      <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded bg-amber-400 text-zinc-950 font-black text-[9px] uppercase tracking-wide">
                        Now Playing Next
                      </div>
                    )}

                    <div className="absolute bottom-1.5 right-1.5 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-[10px] font-semibold text-slate-200">
                      {durationMins} min
                    </div>
                  </div>

                  {/* Content details */}
                  <div className="flex flex-col justify-between flex-1 min-w-0 py-0.5">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold text-amber-200/80 uppercase">
                          Episode {ep.episode_number || idx + 1}
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-white/10 text-slate-300">
                          EN / HI Available
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-1">
                        {epVariant.title}
                      </h4>
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {epVariant.description ||
                          'Pip searches for the softest cloud of moss as twilight stars begin to twinkle...'}
                      </p>
                    </div>

                    {/* Ambient Soundscape and Golden Play Button */}
                    <div className="flex items-center justify-between pt-2 border-t border-white/5">
                      <span className="text-[11px] font-semibold text-teal-300 flex items-center gap-1 truncate">
                        {soundTag}
                      </span>

                      <button
                        className="w-8 h-8 rounded-full bg-[#F6C543] hover:bg-[#ffd153] text-zinc-950 flex items-center justify-center shadow-md hover:scale-110 active:scale-95 transition-all shrink-0 ml-2"
                        title="Play Episode"
                      >
                        <Play className="w-3.5 h-3.5 fill-zinc-950 ml-0.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Need Sound-Only For Sleep Banner matching Image 4 */}
        <div className="p-6 sm:p-8 pt-0">
          <div className="bg-[#141b30] border border-teal-500/20 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-full bg-teal-500/20 text-teal-300 flex items-center justify-center shrink-0 border border-teal-500/30">
                <Moon className="w-5 h-5 fill-teal-300" />
              </div>
              <div className="space-y-0.5">
                <h4 className="font-bold text-sm text-white">Need sound-only for sleep?</h4>
                <p className="text-xs text-slate-300">
                  Switch to screen-off mode with continuous forest ambient white noise &amp; whispered lullabies.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <button
                onClick={() => bedtimeSoundscape.startNightWind()}
                className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/10 transition-colors"
              >
                Preview Audio Track
              </button>
              <button
                onClick={handleStartScreenOffMode}
                className="px-5 py-2 rounded-full bg-[#5EEAD4] hover:bg-teal-300 text-zinc-950 text-xs font-black transition-transform hover:scale-105 active:scale-95 shadow-lg shadow-teal-500/20"
              >
                Start Screen-Off Mode
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Full Video Player Modal */}
      {activePlayingEpisode && (
        <VideoPlayerModal
          showTitle={show.title}
          episode={activePlayingEpisode}
          initialLanguage={selectedLang}
          onClose={() => setActivePlayingEpisode(null)}
        />
      )}
    </div>
  );
};
