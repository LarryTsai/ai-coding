import { useState } from 'react';
import type { Agent } from '../../types';
import { agentCssVars, type AgentPresentation } from '../../utils/dashboardPresentation';
import { PRIORITY_COLORS } from './constants';
import { ModalStatusBadge } from './ModalStatusBadge';
import type { AgentDetailSurface } from './types';

interface AgentDetailHeaderProps {
  agent: Agent;
  agentMeta: AgentPresentation;
  featureId: string;
  featureTitle: string;
  priorityLabel: 'high' | 'medium' | 'low';
  isDark: boolean;
  surface: AgentDetailSurface;
  showHistory: boolean;
  canDeleteAgent: boolean;
  onClose: () => void;
  onToggleHistory: () => void;
  onDeleteAgent: () => Promise<void>;
}

export function AgentDetailHeader({
  agent,
  agentMeta,
  featureId,
  featureTitle,
  priorityLabel,
  isDark,
  surface,
  showHistory,
  canDeleteAgent,
  onClose,
  onToggleHistory,
  onDeleteAgent,
}: AgentDetailHeaderProps) {
  const priorityColors: Record<string, string> = { ...PRIORITY_COLORS, low: surface.text3 };
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDeleteAgent() {
    setDeleting(true);
    try {
      await onDeleteAgent();
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  }

  return (
    <div style={{ background: surface.headerBg, borderBottom: `1px solid ${surface.border}`, padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
      <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: 7, border: `1px solid ${surface.border}`, background: 'transparent', cursor: 'pointer', color: surface.text2, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }} aria-label="Close details">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M9 2L4 7L9 12" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <div style={{ ...agentCssVars(agent), width: 28, height: 28, borderRadius: 8, flexShrink: 0, background: 'var(--agent-color-soft)', border: '1.5px solid var(--agent-color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: 'var(--agent-color)' }}>
        {agentMeta.initials}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: surface.text1 }}>
          {agent.name} / {featureId}
        </div>
        <div style={{ fontSize: 11, color: surface.text2, marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {featureTitle}
        </div>
      </div>

      <ModalStatusBadge status={agent.status} isDark={isDark} />

      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 9px', borderRadius: 20, fontSize: 10, fontWeight: 700, background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)', color: priorityColors[priorityLabel] }}>
        <span style={{ width: 5, height: 5, borderRadius: '50%', background: priorityColors[priorityLabel] }} />
        {priorityLabel}
      </span>

      <button
        type="button"
        onClick={onToggleHistory}
        title="Run history"
        style={{ width: 28, height: 28, borderRadius: 7, border: `1px solid ${showHistory ? surface.text2 + '88' : surface.border}`, background: showHistory ? (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)') : 'transparent', cursor: 'pointer', color: showHistory ? surface.text1 : surface.text2, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
        aria-label="Run history"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5" />
          <path d="M7 4.5V7L8.5 8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {canDeleteAgent && !confirmDelete && (
        <button
          type="button"
          onClick={() => setConfirmDelete(true)}
          title="Delete agent"
          style={{ width: 28, height: 28, borderRadius: 7, border: '1px solid rgba(239,68,68,0.35)', background: 'transparent', cursor: 'pointer', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
          aria-label="Delete agent"
        >
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path d="M2 3.5H11M4.5 3.5V2.5C4.5 2.22 4.72 2 5 2H8C8.28 2 8.5 2.22 8.5 2.5V3.5M5.5 6V10M7.5 6V10M3 3.5L3.5 11H9.5L10 3.5H3Z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}

      {canDeleteAgent && confirmDelete && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          <span style={{ fontSize: 11, color: '#ef4444', fontWeight: 700, whiteSpace: 'nowrap' }}>Delete agent?</span>
          <button
            type="button"
            onClick={handleDeleteAgent}
            disabled={deleting}
            style={{ border: '1px solid rgba(239,68,68,0.5)', background: deleting ? 'rgba(239,68,68,0.08)' : '#ef4444', color: '#fff', borderRadius: 7, padding: '4px 9px', fontSize: 11, fontWeight: 800, cursor: deleting ? 'not-allowed' : 'pointer' }}
          >
            {deleting ? '...' : 'Yes'}
          </button>
          <button
            type="button"
            onClick={() => setConfirmDelete(false)}
            disabled={deleting}
            style={{ border: `1px solid ${surface.border}`, background: 'transparent', color: surface.text2, borderRadius: 7, padding: '4px 9px', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}
          >
            No
          </button>
        </div>
      )}
    </div>
  );
}
