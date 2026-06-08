import { useState, useEffect } from 'react';
import {
  Agent,
  WorkItem,
  AgentRun,
  CurrentUser,
  WorkItemStatus,
  WorkItemStage,
  AgentRunStatus,
} from '../types';
import { agentService } from '../api/services/agentService';
import { workItemService } from '../api/services/workItemService';
import { agentRunService } from '../api/services/agentRunService';
import apiClient from '../api/client';
import { API_PATHS } from '../api/api-paths';

const AUTH_ME_LOGIN_REDIRECT_KEY = 'auth_me_login_redirected';

interface UseDataState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export const useAgents = () => {
  const [state, setState] = useState<UseDataState<Agent[]>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setState(prev => ({ ...prev, loading: prev.data === null, error: null }));
        const data = await agentService.getAll();
        setState({ data, loading: false, error: null });
      } catch (error) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to fetch agents',
        }));
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  return state;
};

export const useWorkItems = (filters?: {
  status?: WorkItemStatus;
  stage?: WorkItemStage;
  assignedAgentId?: string;
}) => {
  const [state, setState] = useState<UseDataState<WorkItem[]>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setState(prev => ({ ...prev, loading: prev.data === null, error: null }));
        const data = await workItemService.getAll(filters);
        setState({ data, loading: false, error: null });
      } catch (error) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to fetch work items',
        }));
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, [filters?.status, filters?.stage, filters?.assignedAgentId]);

  return state;
};

export const useWorkItemById = (id: string) => {
  const [state, setState] = useState<UseDataState<WorkItem>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }));
        const data = await workItemService.getById(id);
        setState({ data, loading: false, error: null });
      } catch (error) {
        setState({
          data: null,
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to fetch work item',
        });
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  return state;
};

export const useAgentRuns = (filters?: {
  workItemId?: string;
  agentId?: string;
  status?: AgentRunStatus;
}) => {
  const [state, setState] = useState<UseDataState<AgentRun[]>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setState(prev => ({ ...prev, loading: prev.data === null, error: null }));
        const data = await agentRunService.getAll(filters);
        setState({ data, loading: false, error: null });
      } catch (error) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to fetch agent runs',
        }));
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [filters?.workItemId, filters?.agentId, filters?.status]);

  return state;
};

export const useAgentRunById = (id: string) => {
  const [state, setState] = useState<UseDataState<AgentRun>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }));
        const data = await agentRunService.getById(id);
        setState({ data, loading: false, error: null });
      } catch (error) {
        setState({
          data: null,
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to fetch agent run',
        });
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  return state;
};


export const useCurrentUser = () => {
  const [state, setState] = useState<UseDataState<CurrentUser>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    apiClient.get<CurrentUser>(API_PATHS.auth.me)
      .then(data => {
        console.info('[auth/me] current user', {
          userId: data.userId,
          displayName: data.displayName,
          email: data.email,
          isAuthenticated: data.isAuthenticated,
        });

        if (!data.isAuthenticated) {
          // Trigger login redirect once to avoid retry loops.
          const redirected = sessionStorage.getItem(AUTH_ME_LOGIN_REDIRECT_KEY);
          if (!redirected) {
            sessionStorage.setItem(AUTH_ME_LOGIN_REDIRECT_KEY, '1');
            window.dispatchEvent(new Event('auth:unauthorized'));
          }
        }
        else {
          sessionStorage.removeItem(AUTH_ME_LOGIN_REDIRECT_KEY);
        }

        setState({ data, loading: false, error: null });
      })
      .catch(error => setState({
        data: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch user',
      }));
  }, []);

  return state;
};
