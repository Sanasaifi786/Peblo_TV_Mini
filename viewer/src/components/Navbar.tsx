import React, { useState, useEffect } from 'react';
import { Search as SearchIcon, Volume2, VolumeX, Sparkles } from 'lucide-react';
import { bedtimeSoundscape } from '../utils/audioEngine';

interface NavbarProps {
  currentView: 'home' | 'search';
  onNavigate: (view: 'home' | 'search', filter?: string) => void;
  activeFilter?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate, activeFilter }) => {
  const [scrolled, setScrolled] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [lang, setLang] = useState<'EN' | 'HI'>('EN');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleSound = () => {
    if (bedtimeSoundscape.active()) {
      bedtimeSoundscape.stop();
      setIsMuted(true);
    } else {
      bedtimeSoundscape.startNightWind();
      setIsMuted(false);
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 px-4 sm:px-10 py-3 flex items-center justify-between ${
        scrolled
          ? 'bg-[#0b0f19]/95 backdrop-blur-xl shadow-2xl shadow-black/70 border-b border-white/5'
          : 'bg-gradient-to-b from-[#0b0f19]/90 via-[#0b0f19]/50 to-transparent'
      }`}
    >
      {/* Brand & Nav */}
      <div className="flex items-center gap-6 lg:gap-8">
        {/* Brand Logo & Name */}
        <div
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2.5 cursor-pointer group shrink-0"
        >
          <img
            src="/peblo-logo.png"
            alt="Peblo Star Logo"
            className="w-9 h-9 object-contain group-hover:rotate-6 transition-transform filter drop-shadow-[0_0_10px_rgba(246,197,67,0.5)]"
          />
          <span className="text-2xl font-black tracking-tight text-[#F6C543]">
            Peblo
          </span>
        </div>

        {/* Nav Links Matching Image 3 */}
        <nav className="hidden md:flex items-center gap-2 text-sm font-medium">
          <button
            onClick={() => onNavigate('home')}
            className={`px-4 py-1.5 rounded-full transition-all duration-200 ${
              currentView === 'home' && !activeFilter
                ? 'bg-[#F6C543] text-zinc-950 font-bold shadow-md shadow-amber-500/20'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            Home
          </button>

          <button
            onClick={() => onNavigate('search')}
            className={`px-4 py-1.5 rounded-full transition-all duration-200 ${
              currentView === 'search'
                ? 'bg-[#F6C543] text-zinc-950 font-bold shadow-md shadow-amber-500/20'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            Explore &amp; Search
          </button>

          <button
            onClick={() => onNavigate('search', 'Bedtime Stories')}
            className={`px-4 py-1.5 rounded-full transition-all duration-200 ${
              activeFilter === 'Bedtime Stories'
                ? 'bg-[#F6C543] text-zinc-950 font-bold shadow-md shadow-amber-500/20'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            Bedtime Stories
          </button>

          <button
            onClick={() => onNavigate('search', 'Learning & Wonder')}
            className={`px-4 py-1.5 rounded-full transition-all duration-200 ${
              activeFilter === 'Learning & Wonder'
                ? 'bg-[#F6C543] text-zinc-950 font-bold shadow-md shadow-amber-500/20'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            Learning
          </button>

          <button
            onClick={() => onNavigate('search', 'Music & Lullabies')}
            className="px-4 py-1.5 rounded-full text-slate-300 hover:text-white hover:bg-white/5 transition-all"
          >
            Favorites
          </button>
        </nav>
      </div>

      {/* Right Controls Matching Image 3 */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Search magic tales ⌘K Pill */}
        <button
          onClick={() => onNavigate('search')}
          className="hidden sm:flex items-center gap-2.5 bg-white/10 hover:bg-white/15 border border-white/10 px-3.5 py-1.5 rounded-full text-xs text-slate-300 transition-all shadow-inner"
        >
          <SearchIcon className="w-3.5 h-3.5 text-amber-300" />
          <span className="font-medium text-slate-300">Search magic tales</span>
          <kbd className="text-[10px] font-mono bg-black/40 text-slate-400 px-1.5 py-0.5 rounded border border-white/10">
            ⌘K
          </kbd>
        </button>

        {/* Mobile Search Icon */}
        <button
          onClick={() => onNavigate('search')}
          className="sm:hidden p-2 rounded-full bg-white/10 text-slate-200"
        >
          <SearchIcon className="w-4 h-4 text-amber-300" />
        </button>

        {/* EN / HI language pill */}
        <div className="flex items-center bg-black/40 border border-white/10 rounded-full p-0.5 text-xs font-bold">
          <button
            onClick={() => setLang('EN')}
            className={`px-2 py-0.5 rounded-full transition-colors ${
              lang === 'EN'
                ? 'bg-[#10b981] text-zinc-950 font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            EN
          </button>
          <button
            onClick={() => setLang('HI')}
            className={`px-2 py-0.5 rounded-full transition-colors ${
              lang === 'HI'
                ? 'bg-[#10b981] text-zinc-950 font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            HI
          </button>
        </div>

        {/* Sound toggle button */}
        <button
          onClick={toggleSound}
          className="p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-amber-300 transition-colors"
          title="Toggle ambient night soundscape"
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>

        {/* Child Profile Avatar: Leo with golden glowing ring */}
        <div className="flex items-center gap-2 pl-1">
          <div className="relative">
            <div className="w-8 h-8 rounded-full p-[2px] bg-gradient-to-tr from-amber-400 to-amber-200 shadow-[0_0_12px_rgba(246,197,67,0.4)]">
              <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center overflow-hidden">
                <span className="text-xs font-black text-amber-200">🦁</span>
              </div>
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-slate-900" />
          </div>
          <span className="text-xs font-bold text-slate-200 hidden lg:inline">Leo</span>
        </div>
      </div>
    </header>
  );
};
