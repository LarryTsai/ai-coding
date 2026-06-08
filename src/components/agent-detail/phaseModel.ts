import type { RunPhaseStep, WorkItemStage } from '../../types';
import { PHASES, phaseNameToPhaseIndex, type PhaseName, stageToPhaseIndex } from '../../utils/dashboardPresentation';
import type { PhaseData, PhaseStep, StepStatus } from './types';

const STAGE_DURATIONS = [42, 78, 1820, 310, 420, 390];

function normalizePhaseName(phase: string): PhaseName | null {
  const value = phase.trim().toLowerCase();

  if (value === 'plan' || value === 'planning') return 'Plan';
  if (value === 'design') return 'Design';
  if (value === 'implement' || value === 'implementation' || value === 'code') return 'Implement';
  if (value === 'security scan' || value === 'securityreview' || value === 'security review') return 'Security Scan';
  if (value === 'testing' || value === 'test') return 'Testing';
  if (value === 'code review' || value === 'codereview' || value === 'review' || value === 'pr' || value === 'pullrequest') return 'Code Review';

  return null;
}

export const getPriorityLabel = (priority: number): 'high' | 'medium' | 'low' =>
  priority === 1 ? 'high' : priority === 2 ? 'medium' : 'low';

export function fmtElapsed(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
}

export function getInitialPhaseIndex(stage?: WorkItemStage): number {
  return stageToPhaseIndex(stage);
}

export function getPhaseIndexFromStepPhase(phase: string): number | null {
  return phaseNameToPhaseIndex(phase);
}

export function buildAgentPhases(
  activeIdx: number,
  activeProgress: number,
  elapsedSecs: number,
  phaseSteps: RunPhaseStep[],
): PhaseData[] {
  return PHASES.map((phase, index) => {
    const isDone = index < activeIdx;
    const isActive = index === activeIdx;
    const rawSteps = phaseSteps.filter(step => normalizePhaseName(step.phase) === phase);

    let activeDuration = elapsedSecs;
    if (isActive && rawSteps.length > 0) {
      const timestamps = rawSteps
        .filter(s => s.startedAt)
        .map(s => new Date(s.startedAt!).getTime())
        .filter(t => !isNaN(t));
      if (timestamps.length > 0) {
        activeDuration = Math.max(0, Math.floor((Date.now() - Math.min(...timestamps)) / 1000));
      }
    }

    const duration = isDone ? STAGE_DURATIONS[index] : isActive ? activeDuration : 0;

    const steps: PhaseStep[] = rawSteps.map((step, stepIndex) => {
      let status: StepStatus = 'pending';

      if (isDone) {
        status = 'done';
      } else if (isActive) {
        const doneCount = Math.floor((activeProgress / 100) * rawSteps.length);
        if (stepIndex < doneCount) status = 'done';
        else if (stepIndex === doneCount) status = 'running';
      }

      return { ...step, status };
    });

    return {
      name: phase,
      code: `P${index + 1}`,
      status: isDone ? 'done' : isActive ? 'running' : 'pending',
      duration,
      steps,
    };
  });
}
