import { useState } from 'react';
import type { AgentRun } from '../../types';
import type { AgentDetailSurface } from './types';

const RUN_STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  Running:   { label: 'Running',   color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
  Pending:   { label: 'Pending',   color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  Succeeded: { label: 'Succeeded', color: '#16a34a', bg: 'rgba(34,197,94,0.12)'  },
  Failed:    { label: 'Failed',    color: '#dc2626', bg: 'rgba(239,68,68,0.12)'  },
  Cancelled: { label: 'Cancelled', color: '#6b7280', bg: 'rgba(107,114,128,0.1)' },
};

function fmtDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    + ' ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

function fmtDuration(secs: number): string {
  if (secs <= 0) return '—';
  if (secs < 60) return `${secs}s`;
  if (secs < 3600) return `${Math.floor(secs / 60)}m ${secs % 60}s`;
  return `${Math.floor(secs / 3600)}h ${Math.floor((secs % 3600) / 60)}m`;
}

interface RunHistoryPanelProps {
  runs: AgentRun[];
  currentRunId?: string;
  viewingRunId: string | null;
  canDelete: boolean;
  surface: AgentDetailSurface;
  isDark: boolean;
  onSelectRun: (runId: string) => void;
  onDeleteRun: (runId: string) => Promise<void>;
}

export function RunHistoryPanel({
  runs,
  currentRunId,
  viewingRunId,
  canDelete,
  surface,
  isDark,
  onSelectRun,
  onDeleteRun,
}: RunHistoryPanelProps) {
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(runId: string) {
    setDeletingId(runId);
    try {
      await onDeleteRun(runId);
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  }

  if (runs.length === 0) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: surface.text3, fontSize: 13 }}>
        No runs found for this agent.
      </div>
    );
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: surface.text3, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>
        {runs.length} run{runs.length !== 1 ? 's' : ''}
      </div>

      {runs.map(run => {
        const statusMeta = RUN_STATUS_META[run.status] ?? RUN_STATUS_META['Cancelled'];
        const isViewing = run.id === viewingRunId;
        const isCurrent = run.id === currentRunId;
        const isConfirming = confirmDeleteId === run.id;
        const isDeleting = deletingId === run.id;

        return (
          <div
            key={run.id}
            style={{
              border: `1px solid ${isViewing ? statusMeta.color + '88' : surface.border}`,
              background: isViewing ? statusMeta.bg : isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
              borderRadius: 10,
              padding: '10px 12px',
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{
                padding: '2px 8px',
                borderRadius: 20,
                fontSize: 10,
                fontWeight: 800,
                color: statusMeta.color,
                background: statusMeta.bg,
                border: `1px solid ${statusMeta.color}44`,
                flexShrink: 0,
              }}>
                {statusMeta.label}
              </span>

              {isCurrent && (
                <span style={{ fontSize: 10, fontWeight: 700, color: surface.text3, background: surface.logBg, padding: '2px 7px', borderRadius: 20, border: `1px solid ${surface.border}` }}>
                  current
                </span>
              )}

              <span style={{ flex: 1 }} />

              <span style={{ fontSize: 11, color: surface.text3, flexShrink: 0 }}>
                {fmtDuration(run.durationSeconds)}
              </span>
            </div>

            <div style={{ fontSize: 11, color: surface.text2, fontWeight: 600 }}>
              {fmtDate(run.startedAt)}
            </div>

            {run.outputSummary && (
              <div style={{ fontSize: 11, color: surface.text2, lineHeight: 1.45, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                {run.outputSummary}
              </div>
            )}

            {run.errorMessage && (
              <div style={{ fontSize: 11, color: '#ef4444', lineHeight: 1.45, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                {run.errorMessage}
              </div>
            )}

            <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 2 }}>
              <button
                type="button"
                onClick={() => onSelectRun(run.id)}
                style={{
                  border: `1px solid ${isViewing ? statusMeta.color + '66' : surface.border}`,
                  background: isViewing ? statusMeta.color + '18' : surface.logBg,
                  color: isViewing ? statusMeta.color : surface.text2,
                  borderRadius: 7,
                  padding: '5px 10px',
                  fontSize: 11,
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                {isViewing ? 'Viewing' : 'View'}
              </button>

              <span style={{ flex: 1 }} />

              {canDelete && !isConfirming && (
                <button
                  type="button"
                  onClick={() => setConfirmDeleteId(run.id)}
                  disabled={isDeleting}
                  style={{ border: `1px solid rgba(239,68,68,0.3)`, background: 'transparent', color: '#ef4444', borderRadius: 7, padding: '5px 10px', fontSize: 11, fontWeight: 700, cursor: 'pointer', opacity: isDeleting ? 0.5 : 1 }}
                >
                  Delete
                </button>
              )}

              {canDelete && isConfirming && (
                <>
                  <span style={{ fontSize: 11, color: surface.text2, fontWeight: 600 }}>Delete this run?</span>
                  <button
                    type="button"
                    onClick={() => handleDelete(run.id)}
                    disabled={isDeleting}
                    style={{ border: '1px solid rgba(239,68,68,0.5)', background: isDeleting ? 'rgba(239,68,68,0.08)' : '#ef4444', color: '#fff', borderRadius: 7, padding: '5px 10px', fontSize: 11, fontWeight: 800, cursor: isDeleting ? 'not-allowed' : 'pointer' }}
                  >
                    {isDeleting ? 'Deleting...' : 'Yes, delete'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteId(null)}
                    disabled={isDeleting}
                    style={{ border: `1px solid ${surface.border}`, background: surface.logBg, color: surface.text2, borderRadius: 7, padding: '5px 10px', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
