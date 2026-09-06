import React from 'react';
import { Search, BookOpen, Bell } from 'lucide-react';

interface TopHeaderProps {
  onSearchQuickId?: (query: string) => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({ onSearchQuickId }) => {
  return (
    <header className="h-14 bg-[#0a0c16] border-b border-[#1a1f38] px-6 flex items-center justify-between sticky top-0 z-30 select-none">
      {/* Breadcrumb matching Image 5 */}
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <span>Peblo CMS</span>
        <span>›</span>
        <span>Workspace</span>
        <span>›</span>
        <span className="px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold">
          PRODUCTION CATALOGUE
        </span>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* Quick Search ID */}
        <div className="relative w-64 sm:w-80">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Quick search ID (e.g. EP-204)..."
            onChange={(e) => onSearchQuickId && onSearchQuickId(e.target.value)}
            className="w-full bg-[#12162a] border border-[#1e2547] rounded-lg pl-9 pr-8 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
          />
          <kbd className="absolute right-2.5 top-2 text-[10px] font-mono bg-black/40 text-slate-400 px-1 py-0.5 rounded border border-white/5">
            ⌘K
          </kbd>
        </div>

        {/* Documentation Link */}
        <button className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white transition-colors">
          <BookOpen className="w-4 h-4 text-slate-400" />
          <span className="hidden md:inline">Documentation</span>
        </button>

        {/* User Avatar */}
        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white text-xs font-bold shadow">
          EV
        </div>
      </div>
    </header>
  );
};
