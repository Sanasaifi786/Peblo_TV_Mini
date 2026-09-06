import React from 'react';
import { CheckCircle2, XCircle, Clock, Calendar, User, Film } from 'lucide-react';
import { PublishRun } from '../api/client';

interface RunHistoryTableProps {
  runs: PublishRun[];
  isLoading?: boolean;
}

export const RunHistoryTable: React.FC<RunHistoryTableProps> = ({ runs, isLoading }) => {
  if (isLoading) {
    return (
      <div className="p-8 text-center text-slate-500 bg-slate-900/40 rounded-2xl border border-slate-800">
        Loading publish audit history...
      </div>
    );
  }

  if (runs.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500 bg-slate-900/40 rounded-2xl border border-slate-800">
        No publish history records yet.
      </div>
    );
  }

  return (
    <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-950/40">
              <th className="px-5 py-3.5">Run ID</th>
              <th className="px-5 py-3.5">Outcome</th>
              <th className="px-5 py-3.5">Triggered By</th>
              <th className="px-5 py-3.5">Timestamp</th>
              <th className="px-5 py-3.5">Shows / Episodes</th>
              <th className="px-5 py-3.5">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {runs.map((run) => {
              const isSuccess = run.outcome === 'success';
              const dateStr = new Date(run.started_at).toLocaleString();

              return (
                <tr key={run.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-5 py-3.5 font-mono text-xs text-slate-400">
                    #{run.id}
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                        isSuccess
                          ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60'
                          : 'bg-rose-950/80 text-rose-300 border-rose-800/60'
                      }`}
                    >
                      {isSuccess ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                      <span className="capitalize">{run.outcome}</span>
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-slate-300 text-xs font-medium">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-500" />
                      <span>{run.user_email || 'System'}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-slate-400 text-xs font-mono">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span>{dateStr}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-slate-300 text-xs">
                    <span className="font-semibold text-white">{run.show_count}</span> shows /{' '}
                    <span className="font-semibold text-white">{run.episode_count}</span> eps
                  </td>
                  <td className="px-5 py-3.5 text-xs text-slate-400 max-w-xs truncate">
                    {run.error_message ? (
                      <span className="text-rose-400 font-mono text-[11px]" title={run.error_message}>
                        {run.error_message}
                      </span>
                    ) : (
                      <span className="text-emerald-500/80">catalogue.json generated atomically</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
