import apiClient from '../client';
import { Agent } from '../../types';
import { API_PATHS } from '../api-paths';

export const agentService = {
  async getAll(): Promise<Agent[]> {
    return apiClient.get<Agent[]>(API_PATHS.agents.root);
  },

  async getById(id: string): Promise<Agent> {
    return apiClient.get<Agent>(API_PATHS.agents.byId(id));
  },

  async create(agent: Omit<Agent, 'id'>): Promise<Agent> {
    return apiClient.post<Agent>(API_PATHS.agents.root, agent);
  },

  async update(id: string, agent: Agent): Promise<Agent> {
    return apiClient.put<Agent>(API_PATHS.agents.byId(id), agent);
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete<object>(API_PATHS.agents.byId(id));
  },
};
