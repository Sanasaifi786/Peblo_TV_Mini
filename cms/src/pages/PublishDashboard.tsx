import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Send,
  RefreshCw,
  Shield,
  AlertCircle,
  CheckCircle2,
  Lock,
  Layers,
  FileCheck,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { api, getCurrentUserRole } from '../api/client';
import { ValidationReport } from '../components/ValidationReport';
import { RunHistoryTable } from '../components/RunHistoryTable';

interface PublishDashboardProps {
  onNavigateToEntity?: (type: 'show' | 'episode', id: number) => void;
}

export const PublishDashboard: React.FC<PublishDashboardProps> = ({ onNavigateToEntity }) => {
  const queryClient = useQueryClient();
  const role = getCurrentUserRole() || 'editor';
  const isAdmin = role === 'admin';

  const [publishFeedback, setPublishFeedback] = useState<{
    success: boolean;
    message: string;
    details?: any;
  } | null>(null);

  // Validation Report query
  const {
    data: report,
    isLoading: isReportLoading,
    refetch: refetchReport,
    isFetching: isReportFetching,
  } = useQuery({
    queryKey: ['validation_report'],
    queryFn: api.getValidationReport,
    refetchInterval: 15000,
  });

  // Publish Runs query
  const {
    data: runs,
    isLoading: isRunsLoading,
    refetch: refetchRuns,
  } = useQuery({
    queryKey: ['publish_runs'],
    queryFn: api.getPublishRuns,
  });

  // Publish Mutation (Admin only)
  const publishMutation = useMutation({
    mutationFn: api.publishCatalog,
    onSuccess: (data) => {
      setPublishFeedback({
        success: true,
        message: `Catalogue published atomically! Included ${data.show_count} shows and ${data.episode_count} episodes.`,
        details: data,
      });
      queryClient.invalidateQueries({ queryKey: ['validation_report'] });
      queryClient.invalidateQueries({ queryKey: ['publish_runs'] });
    },
    onError: (err: any) => {
      setPublishFeedback({
        success: false,
        message: err.message || 'Publish job failed.',
      });
    },
  });

  const canPublish = report?.can_publish && isAdmin;

  // Disabled reason
  let disabledReason = '';
  if (!isAdmin) {
    disabledReason = 'Admin role required to trigger publish (You are logged in as Editor).';
  } else if (!report?.can_publish) {
    disabledReason = `Cannot publish: ${report?.blocking_errors} blocking validation issue(s) detected.`;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
            <Send className="w-7 h-7 text-rose-500" />
            Publishing Control Center
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Builds <code className="text-rose-400 font-mono text-xs bg-slate-900 px-1.5 py-0.5 rounded">catalogue.json</code> atomically via temp-file swap for the consumer viewer app.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              refetchReport();
              refetchRuns();
            }}
            disabled={isReportFetching}
            className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors flex items-center gap-2 text-xs font-semibold"
          >
            <RefreshCw className={`w-4 h-4 ${isReportFetching ? 'animate-spin text-rose-500' : ''}`} />
            <span>Re-validate</span>
          </button>

          {/* Atomic Publish Trigger Button */}
          <div className="relative group">
            <button
              onClick={() => {
                setPublishFeedback(null);
                publishMutation.mutate();
              }}
              disabled={!canPublish || publishMutation.isPending}
              className={`font-bold px-6 py-2.5 rounded-xl text-sm transition-all shadow-xl flex items-center gap-2.5 ${
                canPublish && !publishMutation.isPending
                  ? 'bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white shadow-rose-950/60 cursor-pointer'
                  : 'bg-slate-800 text-slate-500 border border-slate-700/40 cursor-not-allowed opacity-75'
              }`}
            >
              {publishMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Publishing Job Running...</span>
                </>
              ) : (
                <>
                  <FileCheck className="w-4 h-4" />
                  <span>Publish Catalogue</span>
                </>
              )}
            </button>

            {/* Hover Tooltip when disabled */}
            {!canPublish && (
              <div className="absolute right-0 top-full mt-2 w-72 p-3 bg-slate-900 border border-rose-900/60 rounded-xl text-xs text-slate-300 shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30">
                <div className="font-semibold text-rose-400 flex items-center gap-1 mb-1">
                  <AlertCircle className="w-3.5 h-3.5" /> Publish Disabled
                </div>
                <div>{disabledReason}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Role permission info banner */}
      {!isAdmin && (
        <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-800/60 text-amber-300 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Lock className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              You are viewing as an <strong>Editor</strong>. Editors can resolve validation issues and inspect audit logs. To trigger a production publish job, sign in as an <strong>Admin</strong>.
            </span>
          </div>
          <span className="text-[10px] font-mono uppercase bg-amber-950 px-2 py-0.5 rounded border border-amber-700/50 shrink-0">
            Editor Read-Only Publish
          </span>
        </div>
      )}

      {/* Feedback Toast Banner */}
      {publishFeedback && (
        <div
          className={`p-4 rounded-2xl border text-sm flex items-start justify-between gap-3 animate-fadeIn ${
            publishFeedback.success
              ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-200'
              : 'bg-rose-950/40 border-rose-800/80 text-rose-200'
          }`}
        >
          <div className="flex items-center gap-3">
            {publishFeedback.success ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            )}
            <div>
              <div className="font-bold">{publishFeedback.success ? 'Publish Succeeded!' : 'Publish Failed'}</div>
              <p className="text-xs text-slate-300 mt-0.5">{publishFeedback.message}</p>
            </div>
          </div>
          <button
            onClick={() => setPublishFeedback(null)}
            className="text-xs text-slate-400 hover:text-white"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Section 1: Pre-Publish Validation Report */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>1. Pre-Publish Validation Audit</span>
          </h2>
          <span className="text-xs text-slate-400">
            Auto-checks duration &gt; 0, artwork presence, section assignment, and episode counts.
          </span>
        </div>

        {isReportLoading ? (
          <div className="p-12 text-center text-slate-500 bg-slate-900/40 rounded-3xl border border-slate-800 flex flex-col items-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-rose-500" />
            <span className="text-xs">Analyzing catalogue readiness...</span>
          </div>
        ) : report ? (
          <ValidationReport report={report} onSelectEntity={onNavigateToEntity} />
        ) : null}
      </div>

      {/* Section 2: Audit Trail / Publish History */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-white">2. Publish Audit History</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Historical log of every publish run with operator identity and item counts.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400 bg-slate-900 px-3 py-1 rounded-xl border border-slate-800">
            {runs?.length || 0} Runs Recorded
          </span>
        </div>

        <RunHistoryTable runs={runs || []} isLoading={isRunsLoading} />
      </div>
    </div>
  );
};
