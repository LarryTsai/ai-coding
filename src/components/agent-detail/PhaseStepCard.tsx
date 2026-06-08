import { MONO } from './constants';
import { MarkdownView } from './MarkdownView';
import type { AgentDetailSurface, PhaseStep } from './types';
import { normalizeEditStatus } from '../../utils/editStatus';

interface PhaseStepCardProps {
  step: PhaseStep;
  accent: string;
  glow: string;
  metaText: string;
  surface: AgentDetailSurface;
  isBlockedByRemote: boolean;
  isEditable: boolean;
  isWaiting: boolean;
  isAdvancing: boolean;
  isSending?: boolean;
  canManageStepEdits: boolean;
  showEditAction?: boolean;
  showConfirmAction?: boolean;
  onEdit: () => void;
  onConfirm: () => void;
  isDark: boolean;
}

export function PhaseStepCard({
  step,
  accent,
  glow,
  metaText,
  surface,
  isBlockedByRemote,
  isEditable,
  isWaiting,
  isAdvancing,
  isSending = false,
  canManageStepEdits,
  showEditAction = true,
  showConfirmAction = true,
  onEdit,
  onConfirm,
  isDark,
}: PhaseStepCardProps) {
  const isDone = step.status === 'done';
  const isRunning = step.status === 'running';
  const isPending = step.status === 'pending';
  const normalizedEditStatus = normalizeEditStatus(step.editStatus);
  const hasResolvedEdit = normalizedEditStatus === 'resolved';
  const isThisStepWaiting = normalizedEditStatus === 'waiting';
  const isActionable = isEditable || (isThisStepWaiting && !isBlockedByRemote);
  const canConfirm = canManageStepEdits && !isWaiting && hasResolvedEdit && !isBlockedByRemote && !isAdvancing;

  return (
    <div style={{ borderRadius: 10, border: `1px solid ${isRunning ? accent + '50' : isThisStepWaiting ? 'rgba(245,158,11,0.45)' : surface.border}`, background: isRunning ? `${accent}08` : isThisStepWaiting ? 'rgba(245,158,11,0.06)' : surface.logBg, padding: '12px 16px', opacity: isPending && !isThisStepWaiting ? 0.4 : 1, transition: 'all 0.2s', boxShadow: isRunning ? `0 0 12px ${glow}` : isThisStepWaiting ? '0 0 10px rgba(245,158,11,0.15)' : 'none' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: isDone || isRunning || isThisStepWaiting || hasResolvedEdit ? 8 : 0 }}>
        <span style={{ fontSize: 12, fontWeight: 800, color: metaText, fontFamily: MONO, flexShrink: 0 }}>
          {step.id}
        </span>
        <span style={{ fontSize: 13, fontWeight: 700, color: surface.text1 }}>{step.title}</span>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          {isRunning && (
            <span style={{ fontSize: 10, color: metaText, fontWeight: 600, animation: 'adm-pulse 1.8s infinite' }}>
              running
            </span>
          )}
          {isDone && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: '#4ADE80', fontWeight: 600 }}>
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5L4.5 7.5L8 2.5" stroke="#4ADE80" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              done
            </span>
          )}
          {(isAdvancing || isSending) && (
            <span style={{ fontSize: 10, color: '#F59E0B', fontWeight: 700 }}>
              Sending...
            </span>
          )}
          {isBlockedByRemote && !isAdvancing && !isSending && (() => {
            const s = normalizeEditStatus(step.editStatus);
            const label = s === 'submitted' || s === 'running' ? 'OpenClaw working' : 'Awaiting OpenClaw';
            return <span style={{ fontSize: 10, color: '#F59E0B', fontWeight: 700 }}>{label}</span>;
          })()}
          {isThisStepWaiting && (
            <span style={{ fontSize: 10, color: '#F59E0B', fontWeight: 700 }}>
              waiting
            </span>
          )}
          {canManageStepEdits && showEditAction && (isEditable || isThisStepWaiting) && (
            <button
              type="button"
              onClick={onEdit}
              disabled={!isActionable}
              style={{ border: `1px solid ${isThisStepWaiting ? 'rgba(245,158,11,0.7)' : accent + '55'}`, background: isThisStepWaiting && isActionable ? '#f59e0b' : isActionable ? `${accent}12` : surface.logBg, color: isThisStepWaiting && isActionable ? '#fff' : isActionable ? metaText : surface.text3, borderRadius: 8, padding: '6px 10px', fontSize: 11, fontWeight: 900, cursor: isActionable ? 'pointer' : 'not-allowed', opacity: isActionable ? 1 : 0.55, boxShadow: isThisStepWaiting && isActionable ? '0 6px 16px rgba(245,158,11,0.28)' : 'none' }}
            >
              {isThisStepWaiting ? 'Respond' : 'Edit'}
            </button>
          )}
          {canManageStepEdits && showConfirmAction && (canConfirm || isAdvancing) && (
            <button
              type="button"
              onClick={onConfirm}
              disabled={!canConfirm}
              style={{ border: `1px solid ${accent}66`, background: canConfirm ? `${accent}18` : surface.logBg, color: canConfirm ? metaText : surface.text3, borderRadius: 8, padding: '6px 10px', fontSize: 11, fontWeight: 800, cursor: canConfirm ? 'pointer' : 'not-allowed', opacity: canConfirm ? 1 : 0.55 }}
            >
              {isAdvancing ? 'Confirming...' : 'Confirm'}
            </button>
          )}
        </div>
      </div>
      {(isDone || isRunning || isThisStepWaiting || hasResolvedEdit) && (
        <div style={{ marginTop: 8 }}>
          <MarkdownView content={step.content} isDark={isDark} />
        </div>
      )}
    </div>
  );
}
