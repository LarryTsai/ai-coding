import { PHASE_META } from '../../utils/dashboardPresentation';
import { MONO } from './constants';
import type { AgentDetailSurface, PhaseData } from './types';

interface PhaseDetailHeaderProps {
  activePhase: PhaseData;
  activePhaseIdx: number;
  phaseCount: number;
  isDark: boolean;
  surface: AgentDetailSurface;
  onSelectPhase: (index: number) => void;
}

export function PhaseDetailHeader({
  activePhase,
  activePhaseIdx,
  phaseCount,
  isDark,
  surface,
  onSelectPhase,
}: PhaseDetailHeaderProps) {
  const meta = PHASE_META[activePhase.name];
  const metaText = isDark ? meta.textDark : meta.text;

  return (
    <div style={{ padding: '9px 20px', borderBottom: `1px solid ${surface.border}`, display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0, background: surface.headerBg }}>
      <span style={{ fontSize: 10, fontWeight: 700, color: surface.text3, fontFamily: MONO }}>{activePhase.code}</span>
      <span style={{ fontSize: 14, fontWeight: 800, color: surface.text1 }}>{activePhase.name}</span>
      <span style={{ fontSize: 11, color: surface.text3 }}>/</span>
      <span style={{ fontSize: 11, color: surface.text2 }}>
        {activePhase.steps.filter(step => step.status === 'done').length}/{activePhase.steps.length} steps
      </span>
      <div style={{ marginLeft: 4 }}>
        {activePhase.status === 'done' && (
          <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: 'rgba(74,222,128,0.12)', color: '#4ADE80' }}>COMPLETED</span>
        )}
        {activePhase.status === 'running' && (
          <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: `${meta.accent}20`, color: metaText, animation: 'adm-pulse 1.8s infinite' }}>IN PROGRESS</span>
        )}
        {activePhase.status === 'pending' && (
          <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)', color: surface.text3 }}>PENDING</span>
        )}
      </div>
      <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
        {(['<', '>'] as const).map((arrow, arrowIndex) => (
          <button key={arrow} onClick={() => {
            const next = activePhaseIdx + (arrowIndex === 0 ? -1 : 1);
            if (next >= 0 && next < phaseCount) onSelectPhase(next);
          }} style={{ width: 26, height: 26, borderRadius: 6, border: `1px solid ${surface.border}`, background: 'transparent', cursor: 'pointer', color: surface.text2, fontSize: 11, fontFamily: 'inherit', outline: 'none' }} aria-label={arrowIndex === 0 ? 'Previous phase' : 'Next phase'}>
            {arrow}
          </button>
        ))}
      </div>
    </div>
  );
}
