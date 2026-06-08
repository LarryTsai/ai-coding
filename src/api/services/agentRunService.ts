import apiClient from '../client';
import { AgentRun, AgentRunStatus, StepEditSubmissionResult } from '../../types';
import { API_PATHS } from '../api-paths';

export const agentRunService = {
  async getAll(filters?: {
    workItemId?: string;
    agentId?: string;
    status?: AgentRunStatus;
  }): Promise<AgentRun[]> {
    return apiClient.get<AgentRun[]>(API_PATHS.agentRuns.root, filters);
  },

  async getById(id: string): Promise<AgentRun> {
    return apiClient.get<AgentRun>(API_PATHS.agentRuns.byId(id));
  },

  async create(run: Omit<AgentRun, 'id' | 'startedAt'>): Promise<AgentRun> {
    return apiClient.post<AgentRun>(API_PATHS.agentRuns.root, run);
  },

  async update(id: string, run: AgentRun): Promise<AgentRun> {
    return apiClient.put<AgentRun>(API_PATHS.agentRuns.byId(id), run);
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete<object>(API_PATHS.agentRuns.byId(id));
  },

  async rerun(id: string): Promise<void> {
    await apiClient.post<object>(API_PATHS.agentRuns.rerunById(id));
  },

  async submitStepEditRequest(runId: string, stepId: string, instructions: string): Promise<StepEditSubmissionResult> {
    return apiClient.post<StepEditSubmissionResult>(
      API_PATHS.agentRuns.stepEditRequests(runId, stepId),
      { instructions },
    );
  },

  async submitStepAdvanceRequest(runId: string, stepId: string, instructions?: string): Promise<StepEditSubmissionResult> {
    return apiClient.post<StepEditSubmissionResult>(
      API_PATHS.agentRuns.stepAdvanceRequests(runId, stepId),
      { instructions },
    );
  },
};
