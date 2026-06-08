import type { RunPhaseStep } from '../../types';
import type { PhaseName } from '../../utils/dashboardPresentation';

export type StepStatus = 'done' | 'running' | 'pending';
export type StageName = PhaseName;

export interface PhaseStep extends RunPhaseStep {
  status: StepStatus;
}

export interface PhaseData {
  name: StageName;
  code: string;
  status: StepStatus;
  duration: number;
  steps: PhaseStep[];
}

export interface AgentDetailSurface {
  overlay: string;
  panelBg: string;
  headerBg: string;
  logBg: string;
  logTermBg: string;
  border: string;
  text1: string;
  text2: string;
  text3: string;
  activePhaseBg: string;
}
