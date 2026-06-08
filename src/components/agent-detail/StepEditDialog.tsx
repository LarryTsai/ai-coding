import { useState } from 'react';
import { normalizeEditStatus } from '../../utils/editStatus';
import { MONO } from './constants';
import type { AgentDetailSurface, PhaseStep } from './types';

interface StepEditDialogProps {
  step: PhaseStep;
  accent: string;
  surface: AgentDetailSurface;
  submitError: string | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (instructions: string) => Promise<void>;
}

export function StepEditDialog({
  step,
  accent,
  surface,
  submitError,
  isSubmitting,
  onClose,
  onSubmit,
}: StepEditDialogProps) {
  const isWaiting = normalizeEditStatus(step.editStatus) === 'waiting';
  const [instructions, setInstructions] = useState('');

  async function submit() {
    if (!instructions.trim()) return;
    await onSubmit(instructions.trim());
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 700, background: 'rgba(15, 23, 42, 0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: 'min(560px, 100%)', background: surface.panelBg, border: `1px solid ${surface.border}`, borderRadius: 12, boxShadow: '0 24px 70px rgba(15,23,42,0.34)', padding: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, color: surface.text3, fontSize: 11, fontFamily: MONO, fontWeight: 800 }}>{step.id}</p>
            <h3 style={{ margin: '3px 0 0', color: surface.text1, fontSize: 16 }}>
              {isWaiting ? 'Respond to OpenClaw' : step.title}
            </h3>
          </div>
          <button type="button" onClick={onClose} style={{ border: `1px solid ${surface.border}`, background: surface.logBg, color: surface.text2, borderRadius: 8, width: 32, height: 32, cursor: 'pointer' }}>
            x
          </button>
        </div>

        {isWaiting && (
          <div style={{ border: '1px solid rgba(245,158,11,0.35)', background: 'rgba(245,158,11,0.08)', color: surface.text1, borderRadius: 10, padding: 12, marginBottom: 12 }}>
            <p style={{ margin: '0 0 6px', color: '#f59e0b', fontSize: 11, fontWeight: 900, textTransform: 'uppercase' }}>
              OpenClaw question
            </p>
            <p style={{ margin: 0, fontSize: 13, lineHeight: 1.5 }}>
              {step.editInstruction ?? step.content}
            </p>
          </div>
        )}

        <textarea
          value={instructions}
          onChange={event => setInstructions(event.target.value)}
          placeholder={isWaiting ? 'Reply with your decision...' : 'Tell the remote agent what to change...'}
          rows={7}
          style={{ width: '100%', boxSizing: 'border-box', resize: 'vertical', borderRadius: 10, border: `1px solid ${surface.border}`, background: surface.logBg, color: surface.text1, padding: 12, fontSize: 13, lineHeight: 1.5, outline: 'none' }}
        />

        {submitError && (
          <p style={{ margin: '10px 0 0', color: '#EF4444', fontSize: 12, fontWeight: 700 }}>{submitError}</p>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 14 }}>
          <button type="button" onClick={onClose} style={{ border: `1px solid ${surface.border}`, background: surface.logBg, color: surface.text2, borderRadius: 8, padding: '8px 12px', fontWeight: 700, cursor: 'pointer' }}>
            Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={!instructions.trim() || isSubmitting}
            style={{ border: 0, background: accent, color: '#fff', borderRadius: 8, padding: '8px 12px', fontWeight: 800, cursor: instructions.trim() ? 'pointer' : 'not-allowed', opacity: !instructions.trim() || isSubmitting ? 0.55 : 1 }}
          >
            {isSubmitting ? 'Sending...' : isWaiting ? 'Send Response' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
}
