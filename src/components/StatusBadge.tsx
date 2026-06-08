import React from 'react';
import { AgentStatus, WorkItemStatus, WorkItemStage, AgentRunStatus, LogLevel } from '../types';
import './StatusBadge.css';

interface StatusBadgeProps {
  status: AgentStatus | WorkItemStatus | AgentRunStatus | WorkItemStage | LogLevel;
  type?: 'agent' | 'workitem' | 'run' | 'stage' | 'log';
}

const getStatusClass = (status: string, type?: string): string => {
  const baseClass = 'status-badge';

  if (type === 'agent') {
    switch (status) {
      case 'Running':
        return `${baseClass} status-running`;
      case 'Idle':
        return `${baseClass} status-idle`;
      case 'WaitingReview':
        return `${baseClass} status-waiting`;
      case 'Failed':
        return `${baseClass} status-failed`;
      case 'Completed':
        return `${baseClass} status-completed`;
      case 'Offline':
        return `${baseClass} status-offline`;
      default:
        return baseClass;
    }
  }

  if (type === 'workitem') {
    switch (status) {
      case 'InProgress':
        return `${baseClass} status-running`;
      case 'Done':
        return `${baseClass} status-completed`;
      case 'Failed':
        return `${baseClass} status-failed`;
      case 'Review':
        return `${baseClass} status-waiting`;
      case 'Blocked':
        return `${baseClass} status-blocked`;
      case 'New':
        return `${baseClass} status-new`;
      default:
        return baseClass;
    }
  }

  if (type === 'run') {
    switch (status) {
      case 'Running':
        return `${baseClass} status-running`;
      case 'Succeeded':
        return `${baseClass} status-completed`;
      case 'Failed':
        return `${baseClass} status-failed`;
      case 'Pending':
        return `${baseClass} status-new`;
      case 'Cancelled':
        return `${baseClass} status-offline`;
      default:
        return baseClass;
    }
  }

  if (type === 'log') {
    switch (status) {
      case 'Error':
        return `${baseClass} status-failed`;
      case 'Warning':
        return `${baseClass} status-waiting`;
      case 'Info':
        return `${baseClass} status-idle`;
      case 'Debug':
        return `${baseClass} status-new`;
      default:
        return baseClass;
    }
  }

  return baseClass;
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type }) => {
  return <span className={getStatusClass(status, type)}>{status}</span>;
};
