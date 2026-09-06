import React, { useState } from 'react';
import { AlertTriangle, XCircle, CheckCircle, ChevronDown, ChevronRight, ExternalLink, HelpCircle } from 'lucide-react';
import { ValidationReport as ReportType, ValidationIssue } from '../api/client';

interface ValidationReportProps {
  report: ReportType;
  onSelectEntity?: (type: 'show' | 'episode', id: number) => void;
}

const ISSUE_LABELS: Record<string, { label: string; description: string }> = {
  missing_section: {
    label: 'Missing Show Section',
    description: 'Shows marked published must have an assigned display section (e.g. Trending Now, Peblo Originals).',
  },
  missing_duration: {
    label: 'Missing Episode Duration',
    description: 'Published episodes must have duration > 0 seconds.',
  },
  missing_artwork: {
    label: 'Missing Episode Artwork',
    description: 'Published episodes must have at least one valid uploaded artwork.',
  },
  no_published_episodes: {
    label: 'Empty Published Show',
    description: 'A show is marked published but contains 0 published episodes.',
  },
};

export const ValidationReport: React.FC<ValidationReportProps> = ({ report, onSelectEntity }) => {
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  const toggleGroup = (key: string) => {
    setCollapsedGroups(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const hasBlockers = report.blocking_errors > 0;

  return (
    <div className="space-y-6">
      {/* Top Banner Status */}
      <div
        className={`p-5 rounded-2xl border transition-all ${
          hasBlockers
            ? 'bg-rose-950/30 border-rose-800/60'
            : 'bg-emerald-950/30 border-emerald-800/60'
        }`}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${
                hasBlockers
                  ? 'bg-rose-600 text-white shadow-rose-950/50'
                  : 'bg-emerald-600 text-white shadow-emerald-950/50'
              }`}
            >
              {hasBlockers ? <XCircle className="w-6 h-6" /> : <CheckCircle className="w-6 h-6" />}
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                {hasBlockers ? 'Publish Blocked' : 'Catalogue Ready to Publish'}
              </h3>
              <p className="text-sm text-slate-400 mt-0.5">
                {hasBlockers
                  ? `${report.blocking_errors} blocking issue${report.blocking_errors > 1 ? 's' : ''} preventing catalog generation.`
                  : 'All published shows and episodes meet the streaming platform criteria.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3.5 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
              <div className="text-xs text-slate-500 font-medium">Blocking Errors</div>
              <div className={`text-lg font-black ${hasBlockers ? 'text-rose-400' : 'text-emerald-400'}`}>
                {report.blocking_errors}
              </div>
            </div>
            <div className="px-3.5 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
              <div className="text-xs text-slate-500 font-medium">Warnings</div>
              <div className="text-lg font-black text-amber-400">{report.warnings}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Grouped Issues Accordions */}
      {Object.keys(report.grouped_issues).length === 0 ? (
        <div className="text-center py-10 bg-slate-900/30 rounded-2xl border border-slate-800/60 text-slate-400">
          <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-2 opacity-80" />
          <p className="text-sm font-medium text-slate-200">Zero issues detected across all shows</p>
          <p className="text-xs text-slate-500 mt-1">Ready for atomic catalogue generation</p>
        </div>
      ) : (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider px-1">
            Issues Grouped by Type
          </h4>

          {Object.entries(report.grouped_issues).map(([groupKey, issues]) => {
            const isCollapsed = collapsedGroups[groupKey];
            const meta = ISSUE_LABELS[groupKey] || {
              label: groupKey.replace(/_/g, ' '),
              description: 'Rules requiring resolution before publication.',
            };
            const errorCount = issues.filter(i => i.severity === 'error').length;

            return (
              <div
                key={groupKey}
                className="bg-slate-900/60 border border-slate-800/80 rounded-2xl overflow-hidden transition-colors"
              >
                {/* Header */}
                <button
                  onClick={() => toggleGroup(groupKey)}
                  className="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-800/30 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-1 text-slate-400">
                      {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-200 text-sm">{meta.label}</span>
                        <span
                          className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                            errorCount > 0
                              ? 'bg-rose-950 text-rose-300 border border-rose-800/50'
                              : 'bg-amber-950 text-amber-300 border border-amber-800/50'
                          }`}
                        >
                          {issues.length} {issues.length === 1 ? 'item' : 'items'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{meta.description}</p>
                    </div>
                  </div>
                </button>

                {/* Body Item List */}
                {!isCollapsed && (
                  <div className="px-5 pb-4 pt-1 divide-y divide-slate-800/60 border-t border-slate-800/60">
                    {issues.map((issue, idx) => (
                      <div
                        key={idx}
                        className="py-3 flex items-center justify-between gap-4 first:pt-3"
                      >
                        <div className="flex items-start gap-3">
                          {issue.severity === 'error' ? (
                            <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                          )}
                          <div>
                            <div className="text-sm font-medium text-slate-200">
                              {issue.entity_title}
                              {issue.show_title && issue.entity_type === 'episode' && (
                                <span className="text-slate-500 font-normal ml-2">
                                  (in show: {issue.show_title})
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-400 mt-0.5">{issue.message}</p>
                          </div>
                        </div>

                        {onSelectEntity && (
                          <button
                            onClick={() => onSelectEntity(issue.entity_type, issue.entity_id)}
                            className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 font-medium shrink-0 bg-rose-950/40 hover:bg-rose-900/50 border border-rose-800/40 px-2.5 py-1 rounded-lg transition-colors"
                          >
                            <span>Fix</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
