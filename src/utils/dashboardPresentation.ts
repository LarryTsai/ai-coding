import type { CSSProperties } from 'react';
import type { Agent, AgentStatus, WorkItemStage } from '../types';

export const PHASES = ['Plan', 'Design', 'Implement', 'Security Scan', 'Testing', 'Code Review'] as const;

export type PhaseName = typeof PHASES[number];

export type PhaseMeta = {
  label: PhaseName;
  icon: string;
  accent: string;
  accentSoft: string;
  accentBorder: string;
  text: string;
  textDark: string;
  glow: string;
};

export const PHASE_META: Record<PhaseName, PhaseMeta> = {
  Plan: {
    label: 'Plan',
    icon: 'PL',
    accent: '#6366f1',
    accentSoft: 'rgba(99, 102, 241, 0.18)',
    accentBorder: 'rgba(99, 102, 241, 0.42)',
    text: '#4f46e5',
    textDark: '#a5b4fc',
    glow: 'rgba(99, 102, 241, 0.25)',
  },
  Design: {
    label: 'Design',
    icon: 'DE',
    accent: '#0ea5e9',
    accentSoft: 'rgba(14, 165, 233, 0.18)',
    accentBorder: 'rgba(14, 165, 233, 0.42)',
    text: '#0284c7',
    textDark: '#7dd3fc',
    glow: 'rgba(14, 165, 233, 0.25)',
  },
  Implement: {
    label: 'Implement',
    icon: 'IM',
    accent: '#8b5cf6',
    accentSoft: 'rgba(139, 92, 246, 0.18)',
    accentBorder: 'rgba(139, 92, 246, 0.42)',
    text: '#7c3aed',
    textDark: '#c4b5fd',
    glow: 'rgba(139, 92, 246, 0.25)',
  },
  'Security Scan': {
    label: 'Security Scan',
    icon: 'SC',
    accent: '#f59e0b',
    accentSoft: 'rgba(245, 158, 11, 0.2)',
    accentBorder: 'rgba(245, 158, 11, 0.46)',
    text: '#b45309',
    textDark: '#fcd34d',
    glow: 'rgba(245, 158, 11, 0.25)',
  },
  Testing: {
    label: 'Testing',
    icon: 'TE',
    accent: '#10b981',
    accentSoft: 'rgba(16, 185, 129, 0.18)',
    accentBorder: 'rgba(16, 185, 129, 0.42)',
    text: '#047857',
    textDark: '#6ee7b7',
    glow: 'rgba(16, 185, 129, 0.24)',
  },
  'Code Review': {
    label: 'Code Review',
    icon: 'CR',
    accent: '#ec4899',
    accentSoft: 'rgba(236, 72, 153, 0.18)',
    accentBorder: 'rgba(236, 72, 153, 0.42)',
    text: '#db2777',
    textDark: '#f9a8d4',
    glow: 'rgba(236, 72, 153, 0.25)',
  },
};

export type StatusMeta = {
  label: string;
  icon?: string;
  accent: string;
  background: string;
  text: string;
};

export type AgentPresentation = {
  color: string;
  initials: string;
};

export const AGENT_COLORS: Record<string, string> = {
  'agent-01': '#818cf8',
  'agent-02': '#c084fc',
  'agent-03': '#34d399',
  'agent-04': '#fb923c',
  'agent-05': '#f472b6',
};

export const DEFAULT_AGENT_COLOR = '#94a3b8';

export const getAgentInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'AI';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return parts.map(part => part[0]).join('').slice(0, 2).toUpperCase();
};

export const getAgentPresentation = (agent: Pick<Agent, 'id' | 'name'>): AgentPresentation => ({
  color: AGENT_COLORS[agent.id] ?? DEFAULT_AGENT_COLOR,
  initials: getAgentInitials(agent.name),
});

export const STATUS_META: Record<AgentStatus, StatusMeta> = {
  Running: {
    label: 'Running',
    accent: '#4ade80',
    background: '#dcfce7',
    text: '#166534',
  },
  Idle: {
    label: 'Idle',
    accent: '#94a3b8',
    background: '#e2e8f0',
    text: '#475569',
  },
  WaitingReview: {
    label: 'Waiting Review',
    icon: 'RV',
    accent: '#f59e0b',
    background: '#fef3c7',
    text: '#92400e',
  },
  Failed: {
    label: 'Failed',
    accent: '#ef4444',
    background: '#fee2e2',
    text: '#991b1b',
  },
  Completed: {
    label: 'Completed',
    accent: '#06b6d4',
    background: '#cffafe',
    text: '#155e75',
  },
  Offline: {
    label: 'Offline',
    accent: '#94a3b8',
    background: '#e2e8f0',
    text: '#475569',
  },
};

export const stageToPhaseIndex = (stage?: WorkItemStage): number => {
  switch (stage) {
    case 'Requirement':
      return 0;
    case 'Design':
      return 1;
    case 'FrontendCoding':
    case 'BackendCoding':
      return 2;
    case 'SecurityReview':
      return 3;
    case 'Testing':
      return 4;
    case 'CodeReview':
    case 'PullRequest':
    case 'Completed':
      return 5;
    default:
      return 0;
  }
};

export const phaseNameToPhaseIndex = (phase?: string): number | null => {
  const value = phase?.trim().toLowerCase();

  switch (value) {
    case 'plan':
    case 'planning':
      return 0;
    case 'design':
      return 1;
    case 'implement':
    case 'implementation':
    case 'code':
      return 2;
    case 'security scan':
    case 'securityreview':
    case 'security review':
      return 3;
    case 'testing':
    case 'test':
      return 4;
    case 'code review':
    case 'codereview':
    case 'review':
    case 'pr':
    case 'pullrequest':
      return 5;
    default:
      return null;
  }
};

export const getPhaseMeta = (phaseIndex: number): PhaseMeta =>
  PHASE_META[PHASES[Math.max(0, Math.min(PHASES.length - 1, phaseIndex))]];

export const phaseCssVars = (meta: PhaseMeta): CSSProperties =>
  ({
    '--phase-accent': meta.accent,
    '--phase-accent-soft': meta.accentSoft,
    '--phase-accent-border': meta.accentBorder,
    '--phase-text': meta.text,
    '--phase-glow': meta.glow,
  } as CSSProperties);

export const stepCssVars = (meta: PhaseMeta): CSSProperties =>
  ({
    '--step-accent': meta.accent,
    '--step-accent-soft': meta.accentSoft,
    '--step-accent-border': meta.accentBorder,
    '--step-text': meta.text,
    '--step-glow': meta.glow,
  } as CSSProperties);

export const statusCssVars = (status: AgentStatus): CSSProperties => {
  const meta = STATUS_META[status];
  return {
    '--status-accent': meta.accent,
    '--status-bg': meta.background,
    '--status-text': meta.text,
  } as CSSProperties;
};

export const agentCssVars = (agent: Pick<Agent, 'id' | 'name'>): CSSProperties => {
  const meta = getAgentPresentation(agent);
  return {
    '--agent-color': meta.color,
    '--agent-color-soft': `${meta.color}20`,
    '--agent-color-border': `${meta.color}45`,
  } as CSSProperties;
};
