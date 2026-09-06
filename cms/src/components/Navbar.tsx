import React from 'react';
import { Film, Send, LogOut, Shield, User as UserIcon, ExternalLink } from 'lucide-react';
import { getCurrentUserEmail, getCurrentUserRole, clearAuthSession } from '../api/client';

interface NavbarProps {
  activeTab: 'shows' | 'publish';
  onSelectTab: (tab: 'shows' | 'publish') => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, onSelectTab, onLogout }) => {
  const email = getCurrentUserEmail() || 'editor@peblo.tv';
  const role = getCurrentUserRole() || 'editor';

  const handleLogout = () => {
    clearAuthSession();
    onLogout();
  };

  return (
    <header className="sticky top-0 z-40 bg-[#0c0e14]/90 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand & Logo */}
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => onSelectTab('shows')}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 via-rose-500 to-amber-500 flex items-center justify-center shadow-lg shadow-rose-900/30">
              <Film className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-white flex items-center gap-1.5">
                PEBLO<span className="text-rose-500">TV</span>
                <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-rose-950/80 text-rose-300 border border-rose-800/50">
                  CMS
                </span>
              </span>
            </div>
          </div>

          {/* Nav Tabs */}
          <nav className="hidden md:flex items-center gap-1.5 bg-slate-900/80 p-1 rounded-xl border border-slate-800/60">
            <button
              onClick={() => onSelectTab('shows')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'shows'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-950/50'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Film className="w-4 h-4" />
              Shows & Episodes
            </button>
            <button
              onClick={() => onSelectTab('publish')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'publish'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-950/50'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Send className="w-4 h-4" />
              Publish Center
            </button>
          </nav>
        </div>

        {/* User profile & Actions */}
        <div className="flex items-center gap-4">
          <a
            href="http://localhost:5174"
            target="_blank"
            rel="noreferrer"
            className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-lg transition-colors"
          >
            <span>Open Viewer App</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
          </a>

          <div className="flex items-center gap-2.5 bg-slate-900/60 border border-slate-800/80 px-3 py-1.5 rounded-xl">
            <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300">
              <UserIcon className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="text-xs font-semibold text-slate-200 max-w-[130px] truncate">{email}</div>
              <div className="flex items-center gap-1">
                {role === 'admin' ? (
                  <span className="text-[10px] font-bold uppercase text-purple-400 flex items-center gap-0.5">
                    <Shield className="w-2.5 h-2.5" /> Admin
                  </span>
                ) : (
                  <span className="text-[10px] font-medium text-sky-400">Editor</span>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            title="Log Out"
            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-xl border border-slate-800 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
