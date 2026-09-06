import React from 'react';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const s = status.toLowerCase();

  let styles = 'bg-slate-800/80 text-slate-300 border-slate-700/60';
  let dotColor = 'bg-slate-400';

  if (s === 'published') {
    styles = 'bg-emerald-950/60 text-emerald-400 border-emerald-500/30';
    dotColor = 'bg-emerald-400';
  } else if (s === 'draft') {
    styles = 'bg-amber-950/60 text-amber-300 border-amber-500/30';
    dotColor = 'bg-amber-400';
  } else if (s === 'blocked' || s === 'error') {
    styles = 'bg-rose-950/60 text-rose-400 border-rose-500/30';
    dotColor = 'bg-rose-400';
  } else if (s === 'archived') {
    styles = 'bg-zinc-800/60 text-zinc-400 border-zinc-700/40';
    dotColor = 'bg-zinc-500';
  }

  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-xs px-2.5 py-1';

  return (
    <span className={`inline-flex items-center gap-1.5 font-medium rounded-full border shadow-sm ${sizeClass} ${styles}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor} animate-pulse`} />
      <span className="capitalize">{status}</span>
    </span>
  );
};
