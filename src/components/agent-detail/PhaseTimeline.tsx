import { PHASE_META } from '../../utils/dashboardPresentation';
import { MONO } from './constants';
import { fmtElapsed } from './phaseModel';
import type { AgentDetailSurface, PhaseData } from './types';

interface PhaseTimelineProps {
  phases: PhaseData[];
  activePhaseIdx: number;
  isDark: boolean;
  surface: AgentDetailSurface;
  onSelectPhase: (index: number) => void;
}

export function PhaseTimeline({ phases, activePhaseIdx, isDark, surface, onSelectPhase }: PhaseTimelineProps) {
  return (
    <div style={{ background: surface.headerBg, borderBottom: `1px solid ${surface.border}`, padding: '12px 20px', overflowX: 'auto', flexShrink: 0, display: 'flex', gap: 6, alignItems: 'stretch' }}>
      {phases.map((phase, index) => {
        const isActive = index === activePhaseIdx;
        const meta = PHASE_META[phase.name];
        const isDone = phase.status === 'done';
        const isRunning = phase.status === 'running';
        const isPending = phase.status === 'pending';

        return (
          <button key={phase.code} onClick={() => !isPending && onSelectPhase(index)} style={{ minWidth: 88, padding: '7px 12px', borderRadius: 8, cursor: isPending ? 'default' : 'pointer', border: `1.5px solid ${isActive ? meta.accent : surface.border}`, background: isActive ? surface.activePhaseBg : 'transparent', textAlign: 'left', fontFamily: 'inherit', transition: 'all 0.18s', opacity: isPending ? 0.38 : 1, borderLeft: isActive ? `3px solid ${meta.accent}` : undefined, outline: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
              <span style={{ width: 14, height: 14, borderRadius: 4, flexShrink: 0, border: `1.5px solid ${isDone || isRunning ? meta.accent : surface.border}`, background: isDone ? meta.accent : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {isDone && <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1.5 4L3.5 6L6.5 2" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                {isRunning && <span style={{ width: 5, height: 5, borderRadius: '50%', background: meta.accent, display: 'block', animation: 'adm-pulse 1.8s infinite' }} />}
              </span>
              <span style={{ fontSize: 9.5, fontWeight: 700, color: isDone || isRunning ? (isDark ? meta.textDark : meta.text) : surface.text3, fontFamily: MONO }}>
                {phase.code}
              </span>
            </div>
            <div style={{ fontSize: 11, fontWeight: 600, color: isActive ? surface.text1 : surface.text2, lineHeight: 1.2 }}>
              {phase.name}
            </div>
            {phase.duration > 0 && (
              <div style={{ fontSize: 10, color: surface.text3, fontFamily: MONO, marginTop: 3 }}>
                {fmtElapsed(phase.duration)}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
