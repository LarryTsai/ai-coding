import type { AgentDetailSurface } from './types';

export const SURFACES = {
  dark: {
    overlay: 'rgba(0,0,0,0.72)',
    panelBg: '#0D1117',
    headerBg: '#161B22',
    logBg: '#111520',
    logTermBg: '#0A0D14',
    border: 'rgba(255,255,255,0.08)',
    text1: '#E8EFF8',
    text2: '#8B949E',
    text3: '#6E7681',
    activePhaseBg: 'rgba(99,102,241,0.12)',
  },
  light: {
    overlay: 'rgba(0,0,0,0.35)',
    panelBg: '#FAFBFC',
    headerBg: '#FFFFFF',
    logBg: '#FFFFFF',
    logTermBg: '#F0F2F7',
    border: 'rgba(0,0,0,0.09)',
    text1: '#1A2035',
    text2: '#596179',
    text3: '#8899AA',
    activePhaseBg: 'rgba(99,102,241,0.07)',
  },
} as const satisfies Record<'dark' | 'light', AgentDetailSurface>;

export const PRIORITY_COLORS = { high: '#F87171', medium: '#FB923C' } as const;
export const MONO = "'JetBrains Mono', 'Fira Code', monospace";
