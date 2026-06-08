import apiClient from '../client';
import { WorkItem, WorkItemStatus, WorkItemStage } from '../../types';
import { API_PATHS } from '../api-paths';

export const workItemService = {
  async getAll(filters?: {
    status?: WorkItemStatus;
    stage?: WorkItemStage;
    assignedAgentId?: string;
    mine?: boolean;
  }): Promise<WorkItem[]> {
    return apiClient.get<WorkItem[]>(API_PATHS.workItems.root, filters);
  },

  async getById(id: string): Promise<WorkItem> {
    return apiClient.get<WorkItem>(API_PATHS.workItems.byId(id));
  },

  async create(item: Omit<WorkItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<WorkItem> {
    return apiClient.post<WorkItem>(API_PATHS.workItems.root, item);
  },

  async update(id: string, item: WorkItem): Promise<WorkItem> {
    return apiClient.put<WorkItem>(API_PATHS.workItems.byId(id), item);
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete<object>(API_PATHS.workItems.byId(id));
  },
};
