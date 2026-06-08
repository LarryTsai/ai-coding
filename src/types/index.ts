// Agent types
export type AgentStatus = 'Idle' | 'Running' | 'WaitingReview' | 'Failed' | 'Completed' | 'Offline';

export interface Agent {
  id: string;
  name: string;
  role: string;
  ownerEmail?: string;
  status: AgentStatus;
  currentWorkItemId?: string;
  avatarUrl?: string;
  lastActiveAt: string;
  teamProject?: string;
}

// Work Item types
export type WorkItemStatus = 'New' | 'InProgress' | 'Blocked' | 'Review' | 'Done' | 'Failed';
export type WorkItemStage = 
  | 'Requirement' 
  | 'Design' 
  | 'FrontendCoding' 
  | 'BackendCoding' 
  | 'SecurityReview' 
  | 'Testing'
  | 'CodeReview' 
  | 'PullRequest' 
  | 'Completed';

export interface WorkItem {
  id: string;
  title: string;
  description?: string;
  source?: string;
  externalId?: string;
  status: WorkItemStatus;
  stage: WorkItemStage;
  priority: number;
  progress: number;
  assignedAgentId?: string;
  createdAt: string;
  updatedAt: string;
  createdByUserId?: string;
  createdByDisplayName?: string;
  updatedByUserId?: string;
  updatedByDisplayName?: string;
}

// Current user
export interface CurrentUser {
  userId: string;
  tenantId?: string;
  displayName?: string;
  email?: string;
  isAuthenticated: boolean;
}

// Agent Run types
export type AgentRunStatus = 'Pending' | 'Running' | 'Succeeded' | 'Failed' | 'Cancelled';

export type LogLevel = 'Error' | 'Warning' | 'Info' | 'Debug';

export interface RunPhaseStep {
  phase: string;
  id: string;
  title: string;
  content: string;
  editStatus?: 'none' | 'running' | 'waiting' | 'resolved' | 'submitted' | string;
  editInstruction?: string;
  editRequestedAt?: string;
  editResolvedAt?: string;
  startedAt?: string;
}

export interface AgentRun {
  id: string;
  traceId?: string;
  workItemId: string;
  agentId: string;
  status: AgentRunStatus;
  startedAt: string;
  finishedAt?: string;
  durationSeconds: number;
  inputSummary?: string;
  outputSummary?: string;
  errorMessage?: string;
  prUrl?: string;
  teamProject?: string;
  phaseSteps: RunPhaseStep[];
}

export interface StepEditRequest {
  instructions: string;
}

export interface StepEditSubmissionResult {
  run: AgentRun;
  remoteAccepted: boolean;
  remoteStatus: string;
}

