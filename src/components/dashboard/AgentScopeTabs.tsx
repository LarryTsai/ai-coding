import React from 'react';

export type AgentScope = 'mine' | 'all' | 'completed';

interface AgentScopeTabsProps {
  scope: AgentScope;
  activeCount: number;
  mineCount: number;
  totalCount: number;
  completedCount: number;
  runningCount: number;
  waitingReviewCount: number;
  failedCount: number;
  idleCount: number;
  onScopeChange: (scope: AgentScope) => void;
}

export const AgentScopeTabs: React.FC<AgentScopeTabsProps> = ({
  scope,
  activeCount,
  mineCount,
  totalCount,
  completedCount,
  runningCount,
  waitingReviewCount,
  failedCount,
  idleCount,
  onScopeChange,
}) => (
  <div className="panel-summary-box">
    <div className={`panel-summary ${waitingReviewCount > 0 ? 'panel-summary-attention' : scope === 'completed' ? 'panel-summary-completed' : ''}`}>
      <div className="summary-icon">AI</div>
      <span className="summary-label">Active Agents</span>
      <span className="summary-sep">·</span>
      <strong className="summary-value-inline">{activeCount}</strong>
      <span className="summary-caption">/ {totalCount}</span>

      <div className="summary-status-pills">
        {runningCount > 0 && (
          <span className="project-status-pill project-status-running">{runningCount} Running</span>
        )}
        {waitingReviewCount > 0 && (
          <span className="project-status-pill project-status-waiting">{waitingReviewCount} Review</span>
        )}
        {failedCount > 0 && (
          <span className="project-status-pill project-status-failed">{failedCount} Failed</span>
        )}
        {idleCount > 0 && (
          <span className="project-status-pill project-status-idle">{idleCount} Idle</span>
        )}
      </div>
    </div>

    <div className="panel-tabs" role="tablist" aria-label="Agent scope">
      <button
        type="button"
        onClick={() => onScopeChange('mine')}
        role="tab"
        aria-selected={scope === 'mine'}
        className={`tab-btn ${scope === 'mine' ? 'is-active' : ''}`}
      >
        My Agents
        <span className="tab-count">{mineCount}</span>
      </button>
      <button
        type="button"
        onClick={() => onScopeChange('all')}
        role="tab"
        aria-selected={scope === 'all'}
        className={`tab-btn ${scope === 'all' ? 'is-active' : ''}`}
      >
        All Agents
        <span className="tab-count">{totalCount}</span>
      </button>
      <button
        type="button"
        onClick={() => onScopeChange('completed')}
        role="tab"
        aria-selected={scope === 'completed'}
        className={`tab-btn ${scope === 'completed' ? 'is-active' : ''}`}
      >
        Completed
        <span className="tab-count">{completedCount}</span>
      </button>
    </div>
  </div>
);
