import { useCallback, useMemo, useState } from 'react';
import { useAgentRuns } from '../../hooks/useApi';
import type { Agent, AgentRun, WorkItem } from '../../types';
import { getAgentPresentation } from '../../utils/dashboardPresentation';
import { normalizeEditStatus } from '../../utils/editStatus';
import { buildAgentPhases, getInitialPhaseIndex, getPhaseIndexFromStepPhase, getPriorityLabel } from './phaseModel';

function getAttentionPhaseIndex(currentRun: AgentRun): number | null {
  const waitingDecisionStep = currentRun.phaseSteps.find(step =>
    normalizeEditStatus(step.editStatus) === 'waiting'
  );
  if (waitingDecisionStep) return getPhaseIndexFromStepPhase(waitingDecisionStep.phase);

  const editablePhaseIndexes = currentRun.phaseSteps
    .filter(step => normalizeEditStatus(step.editStatus) === 'resolved')
    .map(step => getPhaseIndexFromStepPhase(step.phase))
    .filter((index): index is number => index !== null);

  return editablePhaseIndexes.length > 0 ? Math.max(...editablePhaseIndexes) : null;
}

function hasAttentionStep(currentRun: AgentRun): boolean {
  return currentRun.phaseSteps.some(step => {
    const editStatus = normalizeEditStatus(step.editStatus);
    return editStatus === 'waiting' || editStatus === 'resolved';
  });
}

function parseStepTimestamp(value?: string): number {
  if (!value) return 0;

  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function shouldUseRunOverride(fetchedRun: AgentRun, overrideRun?: AgentRun): overrideRun is AgentRun {
  if (!overrideRun) return false;

  return overrideRun.phaseSteps.some(overrideStep => {
    const overrideStatus = normalizeEditStatus(overrideStep.editStatus);
    if (overrideStatus !== 'submitted' && overrideStatus !== 'running') return false;

    const fetchedStep = fetchedRun.phaseSteps.find(step => step.id === overrideStep.id);
    return parseStepTimestamp(overrideStep.editRequestedAt) > parseStepTimestamp(fetchedStep?.editRequestedAt);
  });
}

export function useAgentDetailData(agent: Agent, workItem?: WorkItem, selectedRunId?: string | null) {
  const { data: fetchedRuns } = useAgentRuns({ agentId: agent.id });
  const [runOverrides, setRunOverrides] = useState<Record<string, AgentRun>>({});
  const runs = useMemo(() => {
    const mergedRuns = (fetchedRuns ?? []).map(run => {
      const overrideRun = runOverrides[run.id];
      return shouldUseRunOverride(run, overrideRun) ? overrideRun : run;
    });
    const fetchedIds = new Set(mergedRuns.map(run => run.id));
    const localOnlyRuns = Object.values(runOverrides).filter(run => !fetchedIds.has(run.id));

    return [...mergedRuns, ...localOnlyRuns];
  }, [fetchedRuns, runOverrides]);
  const updateRun = useCallback((run: AgentRun) => {
    setRunOverrides(previous => ({ ...previous, [run.id]: run }));
  }, []);
  const currentRun = runs.find(run => run.status === 'Running' || run.status === 'Pending') ?? runs[0] ?? null;
  const viewingRun = selectedRunId
    ? (runs.find(run => run.id === selectedRunId) ?? currentRun)
    : currentRun;

  const initialPhaseIndex = viewingRun && hasAttentionStep(viewingRun)
    ? getAttentionPhaseIndex(viewingRun) ?? getInitialPhaseIndex(workItem?.stage)
    : getInitialPhaseIndex(workItem?.stage);
  const elapsedSecs = viewingRun
    ? Math.max(0, Math.floor((Date.now() - new Date(viewingRun.startedAt).getTime()) / 1000))
    : 0;

  return {
    currentRun,
    viewingRun,
    runs,
    updateRun,
    agentMeta: getAgentPresentation(agent),
    featureId: workItem?.externalId ?? agent.currentWorkItemId ?? agent.id,
    featureTitle: workItem?.title ?? 'Unassigned work item',
    priorityLabel: getPriorityLabel(workItem?.priority ?? 3),
    initialPhaseIndex,
    phases: buildAgentPhases(
      initialPhaseIndex,
      workItem?.progress ?? 0,
      elapsedSecs,
      viewingRun?.phaseSteps ?? [],
    ),
  };
}
