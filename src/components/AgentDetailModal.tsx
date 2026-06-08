import React, { useEffect, useMemo, useState } from 'react';
import type { Agent, CurrentUser, WorkItem } from '../types';
import { agentRunService } from '../api/services/agentRunService';
import { agentService } from '../api/services/agentService';
import { isRunLockingEditStatus } from '../utils/editStatus';
import './AgentDetailModal.css';
import { AgentDetailHeader } from './agent-detail/AgentDetailHeader';
import { SURFACES } from './agent-detail/constants';
import { PhaseDetailHeader } from './agent-detail/PhaseDetailHeader';
import { PhaseStepsList } from './agent-detail/PhaseStepsList';
import { PhaseTimeline } from './agent-detail/PhaseTimeline';
import { RunHistoryPanel } from './agent-detail/RunHistoryPanel';
import { useAgentDetailData } from './agent-detail/useAgentDetailData';

interface Props {
  agent: Agent;
  workItem?: WorkItem;
  currentUser?: CurrentUser | null;
  onClose: () => void;
}

export const AgentDetailModal: React.FC<Props> = ({ agent, workItem, currentUser, onClose }) => {
  const [showHistory, setShowHistory] = useState(false);
  const [viewingRunId, setViewingRunId] = useState<string | null>(null);

  const {
    agentMeta,
    featureId,
    featureTitle,
    priorityLabel,
    initialPhaseIndex,
    phases,
    currentRun,
    viewingRun,
    runs,
    updateRun,
  } = useAgentDetailData(agent, workItem, viewingRunId);

  const [activePhaseIdx, setActivePhaseIdx] = useState(initialPhaseIndex);
  const [lockedStepIds, setLockedStepIds] = useState<Set<string>>(new Set());
  const [submittingStepId, setSubmittingStepId] = useState<string | null>(null);
  const [advancingStepId, setAdvancingStepId] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const surface = isDark ? SURFACES.dark : SURFACES.light;
  const isOwner = Boolean(
    currentUser?.email
    && agent.ownerEmail
    && currentUser.email.trim().toLowerCase() === agent.ownerEmail.trim().toLowerCase()
  );
  const isViewingHistoricalRun = viewingRunId !== null && viewingRunId !== currentRun?.id;
  const canManageStepEdits = isOwner && !isViewingHistoricalRun;
  const displayPhases = phases;
  const activePhase = displayPhases[activePhaseIdx] ?? displayPhases[0];
  const isRunRemotePending = useMemo(
    () =>
      lockedStepIds.size > 0 ||
      submittingStepId !== null ||
      advancingStepId !== null ||
      displayPhases.some(phase =>
        phase.steps.some(step => isRunLockingEditStatus(step.editStatus))
      ),
    [advancingStepId, displayPhases, lockedStepIds, submittingStepId],
  );

  useEffect(() => {
    setActivePhaseIdx(initialPhaseIndex);
  }, [initialPhaseIndex]);

  useEffect(() => {
    setLockedStepIds(previous => {
      const next = new Set(previous);
      const designSteps = currentRun?.phaseSteps.filter(step => step.phase.trim().toLowerCase() === 'design') ?? [];
      const shouldReleaseDesignGroup = designSteps.length > 0 && designSteps.every(step => {
        return !isRunLockingEditStatus(step.editStatus);
      });

      if (currentRun && shouldReleaseDesignGroup) {
        for (const step of designSteps) {
          next.delete(`${currentRun.id}:${step.id}`);
        }
      }

      for (const step of currentRun?.phaseSteps ?? []) {
        const key = `${currentRun?.id}:${step.id}`;
        if (!isRunLockingEditStatus(step.editStatus)) {
          next.delete(key);
        }
      }
      return next;
    });
  }, [currentRun]);

  async function handleSubmitStepEdit(stepId: string, instructions: string, relatedStepIds: string[] = [stepId]) {
    if (!currentRun) {
      setSubmitError('No active run is available for this step.');
      return;
    }

    setSubmitError(null);
    setSubmittingStepId(stepId);

    try {
      const result = await agentRunService.submitStepEditRequest(currentRun.id, stepId, instructions);
      updateRun(result.run);
      if (!result.remoteAccepted) {
        setSubmitError(`Response saved but remote agent was not notified (${result.remoteStatus}). Check backend RemoteAgent configuration.`);
      }
      setLockedStepIds(previous => {
        const next = new Set(previous);
        for (const relatedStepId of relatedStepIds) {
          next.add(`${currentRun.id}:${relatedStepId}`);
        }
        return next;
      });
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Failed to submit edit request.');
      throw error;
    } finally {
      setSubmittingStepId(null);
    }
  }

  async function handleConfirmStep(stepId: string) {
    if (!currentRun) {
      setSubmitError('No active run is available for this step.');
      return;
    }

    setSubmitError(null);
    setAdvancingStepId(stepId);

    try {
      const step = currentRun.phaseSteps.find(phaseStep => phaseStep.id === stepId);
      const phase = step?.phase.trim().toLowerCase();
      const instructions =
        phase === 'implement' || phase === 'implementation' || phase === 'code'
          ? 'Confirm this implementation step and advance the OpenClaw run to the Testing phase. Generate test cases, test scripts, validation steps, and a concise test report from the specs, tasks, and implementation content.'
          : 'Confirm this step and advance the OpenClaw run to the next step.';

      const result = await agentRunService.submitStepAdvanceRequest(
        currentRun.id,
        stepId,
        instructions,
      );
      updateRun(result.run);
      if (!result.remoteAccepted) {
        setSubmitError(`Confirmation saved but remote agent was not notified (${result.remoteStatus}). Check backend RemoteAgent configuration.`);
      }
      setLockedStepIds(previous => new Set(previous).add(`${currentRun.id}:${stepId}`));
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Failed to confirm step.');
      throw error;
    } finally {
      setAdvancingStepId(null);
    }
  }

  async function handleDeleteRun(runId: string) {
    await agentRunService.delete(runId);
    if (viewingRunId === runId) {
      setViewingRunId(null);
    }
  }

  async function handleDeleteAgent() {
    await agentService.delete(agent.id);
    onClose();
  }

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 500, background: surface.overlay, display: 'flex', alignItems: 'flex-end' }}
      onClick={event => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div style={{ width: '100%', height: '90vh', background: surface.panelBg, borderRadius: '16px 16px 0 0', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 -8px 48px rgba(0,0,0,0.28)', animation: 'adm-slide-up 0.22s ease' }}>
        <AgentDetailHeader
          agent={agent}
          agentMeta={agentMeta}
          featureId={featureId}
          featureTitle={featureTitle}
          priorityLabel={priorityLabel}
          isDark={isDark}
          surface={surface}
          showHistory={showHistory}
          canDeleteAgent={isOwner}
          onClose={onClose}
          onToggleHistory={() => setShowHistory(prev => !prev)}
          onDeleteAgent={handleDeleteAgent}
        />

        {isViewingHistoricalRun && (
          <div style={{ background: isDark ? 'rgba(245,158,11,0.1)' : 'rgba(245,158,11,0.08)', borderBottom: `1px solid rgba(245,158,11,0.3)`, padding: '6px 20px', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ color: '#b45309', flexShrink: 0 }}>
              <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.4" />
              <path d="M6 4V6L7 7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#b45309', flex: 1 }}>
              Viewing historical run — {viewingRun ? new Date(viewingRun.startedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
            </span>
            <button
              type="button"
              onClick={() => setViewingRunId(null)}
              style={{ fontSize: 11, fontWeight: 800, color: '#b45309', background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.4)', borderRadius: 6, padding: '3px 8px', cursor: 'pointer' }}
            >
              ← Back to current
            </button>
          </div>
        )}

        {showHistory ? (
          <RunHistoryPanel
            runs={runs}
            currentRunId={currentRun?.id}
            viewingRunId={viewingRunId}
            canDelete={isOwner}
            surface={surface}
            isDark={isDark}
            onSelectRun={runId => {
              setViewingRunId(runId);
              setShowHistory(false);
            }}
            onDeleteRun={handleDeleteRun}
          />
        ) : (
          <>
            <PhaseTimeline
              phases={phases}
              activePhaseIdx={activePhaseIdx}
              isDark={isDark}
              surface={surface}
              onSelectPhase={setActivePhaseIdx}
            />

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <PhaseDetailHeader
                activePhase={activePhase}
                activePhaseIdx={activePhaseIdx}
                phaseCount={phases.length}
                isDark={isDark}
                surface={surface}
                onSelectPhase={setActivePhaseIdx}
              />

              <PhaseStepsList
                activePhase={activePhase}
                isDark={isDark}
                surface={surface}
                runId={viewingRun?.id}
                lockedStepIds={lockedStepIds}
                isRunRemotePending={isRunRemotePending}
                submittingStepId={submittingStepId}
                advancingStepId={advancingStepId}
                submitError={submitError}
                runErrorMessage={viewingRun?.status === 'Failed' ? viewingRun.errorMessage : null}
                canManageStepEdits={canManageStepEdits}
                onSubmitStepEdit={handleSubmitStepEdit}
                onConfirmStep={handleConfirmStep}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};
