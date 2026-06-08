export const API_PATHS = {
  auth: {
    me: '/auth/me',
  },
  agents: {
    root: '/agents',
    byId: (id: string) => `/agents/${id}`,
  },
  workItems: {
    root: '/workitems',
    byId: (id: string) => `/workitems/${id}`,
  },
  agentRuns: {
    root: '/agentruns',
    byId: (id: string) => `/agentruns/${id}`,
stepEditRequests: (runId: string, stepId: string) => `/agentruns/${runId}/steps/${stepId}/edit-requests`,
    stepAdvanceRequests: (runId: string, stepId: string) => `/agentruns/${runId}/steps/${stepId}/advance-requests`,
    rerunById: (id: string) => `/agentruns/${id}/rerun`,
  },
} as const;
