import type { Agent, WorkItem } from '../types';

export const formatTimeLabel = (now: number): string =>
  new Date(now).toLocaleTimeString('zh-TW', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

export const formatElapsed = (dateString: string | undefined, now: number): string => {
  if (!dateString) return 'unknown';

  const diff = Math.max(0, Math.floor((now - new Date(dateString).getTime()) / 1000));
  const hours = Math.floor(diff / 3600);
  const minutes = Math.floor((diff % 3600) / 60);
  const seconds = diff % 60;

  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
};

export const getLiveProgress = (
  workItem: WorkItem | undefined,
  _status: Agent['status'],
  _now: number
): number => {
  return workItem?.progress ?? 0;
};
