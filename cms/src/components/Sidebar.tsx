import React from 'react';
import {
  FileText,
  Layers,
  CheckCircle2,
  FolderOpen,
  Globe,
  ChevronsUpDown,
  MoreVertical,
  LogOut,
  ExternalLink,
} from 'lucide-react';
import { getCurrentUserEmail, getCurrentUserRole, clearAuthSession } from '../api/client';

export type CmsTab = 'catalogue' | 'episodes' | 'publish' | 'assets' | 'localization';

interface SidebarProps {
  activeTab: CmsTab;
  onSelectTab: (tab: CmsTab) => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onSelectTab, onLogout }) => {
  const email = getCurrentUserEmail() || 'elena.vance@peblo.tv';
  const role = getCurrentUserRole() || 'admin';

  return (
    <aside className="w-64 bg-[#0d101e] border-r border-[#1a1f38] flex flex-col justify-between shrink-0 h-screen sticky top-0 select-none text-slate-300">
      {/* Top Brand Header */}
      <div className="p-4 space-y-5">
        {/* Workspace Switcher */}
        <div className="flex items-center justify-between p-2 rounded-xl bg-[#13172b] border border-white/5 hover:border-white/10 transition-colors cursor-pointer">
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src="/peblo-logo.png"
              alt="Peblo Star Logo"
              className="w-7 h-7 object-contain drop-shadow-[0_0_8px_rgba(246,197,67,0.4)]"
            />
            <div className="min-w-0">
              <div className="font-bold text-sm text-white tracking-tight leading-tight truncate">
                Peblo CMS
              </div>
              <div className="text-[11px] text-slate-400 leading-tight truncate">
                Global Video Desk
              </div>
            </div>
          </div>
          <ChevronsUpDown className="w-4 h-4 text-slate-400 shrink-0" />
        </div>

        {/* Sync Status Badge matching Image 5 */}
        <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-[#14182e] border border-[#1e2547] text-xs font-semibold">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse" />
            <span className="text-[11px] tracking-wider uppercase text-slate-300 font-bold">
              Catalogue Sync
            </span>
          </div>
          <span className="font-mono text-emerald-400 font-bold">99.98%</span>
        </div>

        {/* Editorial Operations Navigation */}
        <div className="space-y-1">
          <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400">
            Editorial Operations
          </div>

          <button
            onClick={() => onSelectTab('catalogue')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'catalogue'
                ? 'bg-[#1b213d] text-white shadow-md border border-indigo-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <Layers className="w-4 h-4 text-indigo-400" />
            <span>Content Catalogue</span>
          </button>

          <button
            onClick={() => onSelectTab('episodes')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'episodes'
                ? 'bg-[#1b213d] text-white shadow-md border border-indigo-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <FileText className="w-4 h-4 text-slate-400" />
            <span>Episode Editor</span>
          </button>

          <button
            onClick={() => onSelectTab('publish')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'publish'
                ? 'bg-[#1b213d] text-white shadow-md border border-indigo-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Publish &amp; Validation</span>
          </button>
        </div>

        {/* Media & Region Navigation */}
        <div className="space-y-1 pt-3">
          <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400">
            Media &amp; Region
          </div>

          <button
            onClick={() => onSelectTab('assets')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'assets'
                ? 'bg-[#1b213d] text-white shadow-md border border-indigo-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <FolderOpen className="w-4 h-4 text-amber-400" />
            <span>Asset Library</span>
          </button>

          <button
            onClick={() => onSelectTab('localization')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'localization'
                ? 'bg-[#1b213d] text-white shadow-md border border-indigo-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <Globe className="w-4 h-4 text-teal-400" />
            <span>Localization (EN/HI)</span>
          </button>
        </div>
      </div>

      {/* Bottom Profile & Viewer Link matching Image 5 */}
      <div className="p-3 border-t border-[#1a1f38] space-y-2">
        <a
          href="http://localhost:5174"
          target="_blank"
          rel="noreferrer"
          className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-slate-300 transition-colors"
        >
          <span className="flex items-center gap-2">
            <span>Open Viewer App</span>
          </span>
          <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
        </a>

        <div className="flex items-center justify-between p-2 rounded-xl bg-[#13172b] border border-white/5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative shrink-0">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white text-xs font-bold shadow">
                EV
              </div>
              <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-400 border border-[#13172b]" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-white truncate">Elena Vance</div>
              <div className="text-[10px] text-slate-400 truncate">Content Lead</div>
            </div>
          </div>

          <button
            onClick={onLogout}
            title="Log Out"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-white/5 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
