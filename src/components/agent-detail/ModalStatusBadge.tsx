import type { AgentStatus } from '../../types';

const STATUS_CONFIG: Record<AgentStatus, { label: string; bg: (isDark: boolean) => string; fg: (isDark: boolean) => string }> = {
  Running: {
    label: 'Running',
    bg: isDark => (isDark ? 'rgba(74,222,128,0.12)' : 'rgba(74,222,128,0.15)'),
    fg: () => '#4ADE80',
  },
  WaitingReview: {
    label: 'PR Review',
    bg: () => 'rgba(99,102,241,0.12)',
    fg: () => '#818CF8',
  },
  Idle: {
    label: 'Idle',
    bg: () => 'rgba(255,255,255,0.06)',
    fg: isDark => (isDark ? '#8B949E' : '#596179'),
  },
  Failed: {
    label: 'Failed',
    bg: () => 'rgba(239,68,68,0.12)',
    fg: () => '#F87171',
  },
  Completed: {
    label: 'Completed',
    bg: () => 'rgba(6,182,212,0.12)',
    fg: () => '#06B6D4',
  },
  Offline: {
    label: 'Offline',
    bg: () => 'rgba(255,255,255,0.06)',
    fg: isDark => (isDark ? '#8B949E' : '#596179'),
  },
};

export function ModalStatusBadge({ status, isDark }: { status: AgentStatus; isDark: boolean }) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.Idle;
  const color = config.fg(isDark);

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 700, letterSpacing: '0.04em', color, background: config.bg(isDark), flexShrink: 0 }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: color, flexShrink: 0, animation: 'adm-pulse 1.8s ease-in-out infinite' }} />
      {config.label}
    </span>
  );
}
