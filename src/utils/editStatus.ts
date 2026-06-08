export type NormalizedEditStatus = 'none' | 'running' | 'waiting' | 'resolved' | 'submitted' | string;

export function normalizeEditStatus(status?: string | null): NormalizedEditStatus {
  const value = (status ?? '').trim().toLowerCase();

  switch (value) {
    case '':
    case 'none':
      return 'none';
    case 'running':
      return 'running';
    case 'waiting':
      return 'waiting';
    case 'resolved':
      return 'resolved';
    case 'submitted':
      return 'submitted';
    default:
      return value;
  }
}

export function isRunLockingEditStatus(status?: string | null): boolean {
  const normalized = normalizeEditStatus(status);
  return normalized === 'running' || normalized === 'submitted';
}
