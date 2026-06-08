import { useEffect, useState } from 'react';
import { PHASE_META } from '../../utils/dashboardPresentation';
import { isRunLockingEditStatus, normalizeEditStatus } from '../../utils/editStatus';
import { PhaseStepCard } from './PhaseStepCard';
import { StepEditDialog } from './StepEditDialog';
import type { AgentDetailSurface, PhaseData } from './types';

const DESIGN_SUB_TABS = ['Proposal', 'Design', 'Tasks'] as const;
type DesignSubTab = typeof DESIGN_SUB_TABS[number];
type ActionNotice = {
  tone: 'info' | 'warn' | 'success' | 'muted';
  title: string;
  detail: string;
};

function isEditableStatus(editStatus?: string): boolean {
  return normalizeEditStatus(editStatus) === 'resolved';
}

function isResolvedStatus(editStatus?: string): boolean {
  return normalizeEditStatus(editStatus) === 'resolved';
}

function getStepActionNotice(
  step: { editStatus?: string; title: string },
  isOwner: boolean,
): ActionNotice | null {
  const status = normalizeEditStatus(step.editStatus);
  const ownerPrefix = isOwner ? '' : 'Owner action needed. ';

  if (status === 'waiting') {
    return {
      tone: 'warn',
      title: 'Response needed',
      detail: `${ownerPrefix}OpenClaw needs an answer for "${step.title}" before it can continue.`,
    };
  }

  if (status === 'resolved') {
    return {
      tone: 'success',
      title: 'Ready to confirm',
      detail: `${ownerPrefix}OpenClaw finished "${step.title}". Confirm to continue, or edit to request changes.`,
    };
  }

  if (status === 'submitted' || status === 'running') {
    return {
      tone: 'muted',
      title: 'OpenClaw is working',
      detail: `No action is available right now. OpenClaw is working on "${step.title}" and will unlock the run when it reports the next state.`,
    };
  }

  return null;
}

function getRunningNotice(step: { title: string }): ActionNotice {
  return {
    tone: 'muted',
    title: 'OpenClaw is running',
    detail: `No action is needed right now. OpenClaw is working on "${step.title}".`,
  };
}

function getAwaitingNotice(step: { title: string }): ActionNotice {
  return {
    tone: 'muted',
    title: 'Awaiting OpenClaw',
    detail: `Your request for "${step.title}" was sent. Waiting for OpenClaw to pick it up and respond.`,
  };
}

function getDesignSubTab(stepTitle: string): DesignSubTab {
  const title = stepTitle.trim().toLowerCase();

  if (title.includes('proposal') || title.includes('context') || title.includes('goals')) {
    return 'Proposal';
  }

  if (title.includes('task') || title.includes('breakdown') || title.includes('scaffold') || title.includes('implementation')) {
    return 'Tasks';
  }

  if (title.includes('spec') || title.includes('schema') || title.includes('contract') || title.includes('model') || title.includes('validation')) {
    return 'Design';
  }

  return 'Design';
}

interface PhaseStepsListProps {
  activePhase: PhaseData;
  isDark: boolean;
  surface: AgentDetailSurface;
  runId?: string;
  lockedStepIds: Set<string>;
  isRunRemotePending: boolean;
  submittingStepId: string | null;
  advancingStepId: string | null;
  submitError: string | null;
  runErrorMessage?: string | null;
  canManageStepEdits: boolean;
  onSubmitStepEdit: (stepId: string, instructions: string, relatedStepIds?: string[]) => Promise<void>;
  onConfirmStep: (stepId: string) => Promise<void>;
}

export function PhaseStepsList({
  activePhase,
  isDark,
  surface,
  runId,
  lockedStepIds,
  isRunRemotePending,
  submittingStepId,
  advancingStepId,
  submitError,
  runErrorMessage,
  canManageStepEdits,
  onSubmitStepEdit,
  onConfirmStep,
}: PhaseStepsListProps) {
  const meta = PHASE_META[activePhase.name];
  const metaText = isDark ? meta.textDark : meta.text;
  const [editingStepId, setEditingStepId] = useState<string | null>(null);
  const [activeDesignSubTab, setActiveDesignSubTab] = useState<DesignSubTab>('Proposal');

  const isDesignPhase = activePhase.name === 'Design';
  const designStepIds = isDesignPhase ? activePhase.steps.map(step => step.id) : [];
  const designGroupKey = runId ? `${runId}:phase:Design` : 'phase:Design';
  const designWaitingStep = isDesignPhase
    ? activePhase.steps.find(step => normalizeEditStatus(step.editStatus) === 'waiting')
    : undefined;
  const designResolvedStep = isDesignPhase
    ? activePhase.steps.find(step => isResolvedStatus(step.editStatus))
    : undefined;
  const designResolvedActionStep = isDesignPhase
    ? designWaitingStep ?? activePhase.steps.find(step => isEditableStatus(step.editStatus))
    : undefined;
  const designActionStep = designWaitingStep
    ?? designResolvedStep
    ?? designResolvedActionStep;
  const isDesignGroupBlocked = isDesignPhase && activePhase.steps.some(step => {
    const lockKey = runId ? `${runId}:${step.id}` : step.id;
    const editStatus = normalizeEditStatus(step.editStatus);

    return (
      lockedStepIds.has(lockKey) ||
      lockedStepIds.has(designGroupKey) ||
      isRunLockingEditStatus(editStatus) ||
      submittingStepId === step.id ||
      advancingStepId === step.id
    );
  });
  const isDesignGroupWaiting = Boolean(designWaitingStep);
  const isDesignGroupAdvancing = isDesignPhase && activePhase.steps.some(step => advancingStepId === step.id);
  const isDesignGroupResolvedForEdit = isDesignPhase && activePhase.steps.some(step => isEditableStatus(step.editStatus));
  const isDesignGroupResolved = Boolean(designResolvedStep);
  const isDesignActionBlocked = isDesignGroupBlocked && !isDesignGroupWaiting;
  const isDesignConfirmAction = !isDesignGroupWaiting && isDesignGroupResolved;
  const canUseDesignConfirm =
    Boolean(designResolvedStep) &&
    !isDesignGroupWaiting &&
    !isDesignActionBlocked &&
    !isRunRemotePending &&
    !isDesignGroupAdvancing;
  const canUseDesignEdit =
    Boolean(designActionStep) &&
    (isDesignGroupResolvedForEdit || isDesignGroupWaiting || isDesignGroupResolved) &&
    !isDesignActionBlocked &&
    !isRunRemotePending;
  const canUseDesignAction = isDesignConfirmAction ? canUseDesignConfirm : canUseDesignEdit;
  const visibleSteps = isDesignPhase
    ? activePhase.steps.filter(step => getDesignSubTab(step.title) === activeDesignSubTab)
    : activePhase.steps;
  const activeEditStep = activePhase.steps.find(step => step.id === editingStepId);
  const designPendingStep = isDesignPhase
    ? activePhase.steps.find(step => {
      const status = normalizeEditStatus(step.editStatus);
      return status === 'submitted' || status === 'running';
    })
    : undefined;
  // "locally awaiting" = we've sent the request but OpenClaw hasn't pushed back yet
  const isDesignGroupLocallyAwaiting =
    isDesignPhase && isDesignGroupBlocked && !isDesignGroupWaiting && !designPendingStep;
  const locallyAwaitingStep = !isDesignPhase
    ? activePhase.steps.find(step => {
        const lockKey = runId ? `${runId}:${step.id}` : step.id;
        const status = normalizeEditStatus(step.editStatus);
        return (
          (submittingStepId === step.id || advancingStepId === step.id || lockedStepIds.has(lockKey)) &&
          status !== 'submitted' && status !== 'running'
        );
      })
    : undefined;
  const actionNotice = isDesignGroupLocallyAwaiting
    ? getAwaitingNotice(designActionStep ?? activePhase.steps[0])
    : locallyAwaitingStep
      ? getAwaitingNotice(locallyAwaitingStep)
      : isDesignPhase
        ? designActionStep
          ? getStepActionNotice(designActionStep, canManageStepEdits)
          : designPendingStep
            ? getStepActionNotice(designPendingStep, canManageStepEdits)
            : null
        : activePhase.steps
            .map(step => getStepActionNotice(step, canManageStepEdits))
            .find((notice): notice is ActionNotice => notice !== null) ?? null;
  const runningStep = activePhase.steps.find(step => step.status === 'running');
  const phaseNotice = actionNotice ?? (runningStep ? getRunningNotice(runningStep) : null);
  const noticeColors = phaseNotice
    ? {
      info: { border: `${meta.accent}55`, background: `${meta.accent}10`, title: metaText },
      warn: { border: 'rgba(245,158,11,0.5)', background: 'rgba(245,158,11,0.12)', title: '#b45309' },
      success: { border: 'rgba(34,197,94,0.42)', background: 'rgba(34,197,94,0.10)', title: '#16a34a' },
      muted: { border: surface.border, background: surface.logBg, title: surface.text2 },
    }[phaseNotice.tone]
    : null;

  useEffect(() => {
    if (!isDesignPhase) {
      setActiveDesignSubTab('Proposal');
      return;
    }

    const waitingStep = activePhase.steps.find(step => normalizeEditStatus(step.editStatus) === 'waiting');
    if (waitingStep) {
      setActiveDesignSubTab(getDesignSubTab(waitingStep.title));
    }
  }, [activePhase.steps, isDesignPhase]);

  async function submitEditRequest(instructions: string) {
    if (!activeEditStep) return;

    try {
      await onSubmitStepEdit(activeEditStep.id, instructions, isDesignPhase ? designStepIds : undefined);
      setEditingStepId(null);
    } catch {
      // Parent owns the error message so the dialog can stay open for retry.
    }
  }

  function runDesignAction() {
    if (!designActionStep) return;

    if (isDesignGroupWaiting) {
      setEditingStepId(designActionStep.id);
      return;
    }

    if (isDesignGroupResolved) {
      void onConfirmStep(designActionStep.id);
      return;
    }

    if (isDesignGroupResolvedForEdit) {
      setEditingStepId(designActionStep.id);
    }
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      {isDesignPhase && (
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', flex: 1 }}>
            {DESIGN_SUB_TABS.map(subTab => {
              const isActive = subTab === activeDesignSubTab;

              return (
                <button
                  key={subTab}
                  type="button"
                  onClick={() => setActiveDesignSubTab(subTab)}
                  style={{
                    border: `1px solid ${isDesignGroupWaiting ? 'rgba(245,158,11,0.65)' : isDesignGroupResolved ? 'rgba(34,197,94,0.42)' : isActive ? `${meta.accent}66` : surface.border}`,
                    background: isDesignGroupWaiting ? 'rgba(245,158,11,0.14)' : isDesignGroupResolved ? 'rgba(34,197,94,0.10)' : isActive ? `${meta.accent}12` : surface.logBg,
                    color: isDesignGroupWaiting ? '#b45309' : isDesignGroupResolved ? '#16a34a' : isActive ? metaText : surface.text2,
                    borderRadius: 999,
                    padding: '6px 12px',
                    fontSize: 11,
                    fontWeight: 800,
                    boxShadow: isDesignGroupWaiting ? '0 0 0 2px rgba(245,158,11,0.10)' : isDesignGroupResolved ? '0 0 0 2px rgba(34,197,94,0.08)' : 'none',
                    cursor: 'pointer',
                  }}
                >
                  {subTab}{isDesignGroupWaiting ? ' - Response needed' : ''}
                </button>
              );
            })}
          </div>
          {canManageStepEdits && designActionStep && (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
              {isDesignGroupResolved && (
                <button
                  type="button"
                  onClick={() => setEditingStepId(designActionStep.id)}
                  disabled={!canUseDesignEdit}
                  style={{ border: `1px solid ${meta.accent}55`, background: canUseDesignEdit ? `${meta.accent}12` : surface.logBg, color: canUseDesignEdit ? metaText : surface.text3, borderRadius: 8, padding: '7px 12px', fontSize: 11, fontWeight: 900, cursor: canUseDesignEdit ? 'pointer' : 'not-allowed', opacity: canUseDesignEdit ? 1 : 0.55 }}
                >
                  Edit
                </button>
              )}
              <button
                type="button"
                onClick={runDesignAction}
                disabled={!canUseDesignAction}
                style={{ border: `1px solid ${isDesignGroupWaiting ? 'rgba(245,158,11,0.7)' : meta.accent + '55'}`, background: isDesignGroupWaiting && canUseDesignAction ? '#f59e0b' : canUseDesignAction ? `${meta.accent}12` : surface.logBg, color: isDesignGroupWaiting && canUseDesignAction ? '#fff' : canUseDesignAction ? metaText : surface.text3, borderRadius: 8, padding: '7px 12px', fontSize: 11, fontWeight: 900, cursor: canUseDesignAction ? 'pointer' : 'not-allowed', opacity: canUseDesignAction ? 1 : 0.55, boxShadow: isDesignGroupWaiting && canUseDesignAction ? '0 6px 16px rgba(245,158,11,0.28)' : 'none' }}
              >
                {isDesignGroupWaiting ? 'Respond' : isDesignGroupAdvancing ? 'Confirming...' : isDesignGroupLocallyAwaiting ? 'Awaiting...' : isDesignGroupResolved ? 'Confirm' : 'Edit'}
              </button>
            </div>
          )}
        </div>
      )}

      {runErrorMessage && (
        <div style={{ border: '1px solid rgba(239,68,68,0.45)', background: 'rgba(239,68,68,0.10)', borderRadius: 8, padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 3 }}>
          <div style={{ color: '#dc2626', fontSize: 12, fontWeight: 900 }}>Run failed</div>
          <div style={{ color: '#ef4444', fontSize: 12, fontWeight: 600, lineHeight: 1.45 }}>{runErrorMessage}</div>
        </div>
      )}
      {submitError && (
        <div style={{ border: '1px solid rgba(239,68,68,0.32)', background: 'rgba(239,68,68,0.08)', color: '#ef4444', borderRadius: 8, padding: '8px 10px', fontSize: 12, fontWeight: 700 }}>
          {submitError}
        </div>
      )}

      {phaseNotice && noticeColors && (
        <div style={{ border: `1px solid ${noticeColors.border}`, background: noticeColors.background, borderRadius: 8, padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 3 }}>
          <div style={{ color: noticeColors.title, fontSize: 12, fontWeight: 900 }}>
            {phaseNotice.title}
          </div>
          <div style={{ color: surface.text2, fontSize: 12, fontWeight: 600, lineHeight: 1.45 }}>
            {phaseNotice.detail}
          </div>
        </div>
      )}

      {visibleSteps.map(step => {
        const lockKey = runId ? `${runId}:${step.id}` : step.id;
        const editStatus = normalizeEditStatus(step.editStatus);
        const isWaiting = editStatus === 'waiting' || (isDesignPhase && isDesignGroupWaiting);
        const isBlockedByRunRemote = isRunRemotePending;
        const isBlockedByRemote =
          isBlockedByRunRemote ||
          isDesignGroupBlocked ||
          lockedStepIds.has(lockKey) ||
          editStatus === 'submitted' ||
          editStatus === 'running' ||
          submittingStepId === step.id;
        const displayStep = step;
        const isEditable =
          isEditableStatus(displayStep.editStatus) &&
          !isBlockedByRemote;

        return (
          <PhaseStepCard
            key={step.id}
            step={displayStep}
            accent={meta.accent}
            glow={meta.glow}
            metaText={metaText}
            surface={surface}
            isDark={isDark}
            isBlockedByRemote={isBlockedByRemote}
            isEditable={isEditable}
            isWaiting={isWaiting}
            isAdvancing={isDesignGroupAdvancing || advancingStepId === step.id}
            isSending={submittingStepId === step.id}
            canManageStepEdits={canManageStepEdits}
            showEditAction={!isDesignPhase}
            showConfirmAction={!isDesignPhase}
            onEdit={() => setEditingStepId(step.id)}
            onConfirm={() => onConfirmStep(step.id)}
          />
        );
      })}

      {canManageStepEdits && activeEditStep && (
        <StepEditDialog
          step={activeEditStep}
          accent={meta.accent}
          surface={surface}
          submitError={submitError}
          isSubmitting={submittingStepId === activeEditStep.id}
          onClose={() => setEditingStepId(null)}
          onSubmit={submitEditRequest}
        />
      )}
    </div>
  );
}
