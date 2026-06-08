import React from 'react';
import type { Agent } from '../../types';
import { getAgentPresentation, agentCssVars } from '../../utils/dashboardPresentation';
import { formatElapsed } from '../../utils/dashboardFormatters';

interface ProjectBoardCardProps {
  name: string;
  agents: Agent[];
  isSelected: boolean;
  tickNow: number;
  onSelect: () => void;
}

const AVATAR_SHOW_MAX = 4;

export const ProjectBoardCard: React.FC<ProjectBoardCardProps> = ({
  name,
  agents,
  isSelected,
  tickNow,
  onSelect,
}) => {
  const runningCount = agents.filter(a => a.status === 'Running').length;
  const waitingCount = agents.filter(a => a.status === 'WaitingReview').length;
  const failedCount = agents.filter(a => a.status === 'Failed').length;
  const idleCount = agents.filter(a => a.status === 'Idle' || a.status === 'Offline').length;

  const needsAttention = waitingCount > 0;

  const accentClass = needsAttention
    ? 'project-accent-waiting'
    : failedCount > 0
    ? 'project-accent-failed'
    : runningCount > 0
    ? 'project-accent-running'
    : 'project-accent-idle';

  const lastActiveAt = agents
    .map(a => new Date(a.lastActiveAt).getTime())
    .reduce((max, t) => Math.max(max, t), 0);

  const visibleAvatars = agents.slice(0, AVATAR_SHOW_MAX);
  const overflowCount = agents.length - AVATAR_SHOW_MAX;

  return (
    <article
      className={`project-board-card agent-card-clickable ${accentClass} ${isSelected ? 'is-selected' : ''} ${needsAttention ? 'project-needs-attention' : ''}`}
      onClick={onSelect}
    >
      {needsAttention && (
        <div className="project-alert-pill">Response needed</div>
      )}

      <div className="project-card-header">
        <span className="project-card-icon">📁</span>
        <p className="project-card-name">{name}</p>
      </div>

      <div className="project-avatar-row">
        <div className="project-avatar-strip">
          {visibleAvatars.map(agent => {
            const meta = getAgentPresentation(agent);
            return (
              <span
                key={agent.id}
                className="project-avatar"
                style={agentCssVars(agent)}
                title={agent.name}
              >
                {meta.initials}
              </span>
            );
          })}
          {overflowCount > 0 && (
            <span className="project-avatar-overflow">+{overflowCount}</span>
          )}
        </div>
        {lastActiveAt > 0 && (
          <span className="project-last-active">
            {formatElapsed(new Date(lastActiveAt).toISOString(), tickNow)} ago
          </span>
        )}
      </div>

      <div className="project-status-row">
        {runningCount > 0 && (
          <span className="project-status-pill project-status-running">
            {runningCount} Running
          </span>
        )}
        {waitingCount > 0 && (
          <span className="project-status-pill project-status-waiting">
            {waitingCount} Review
          </span>
        )}
        {failedCount > 0 && (
          <span className="project-status-pill project-status-failed">
            {failedCount} Failed
          </span>
        )}
        {idleCount > 0 && (
          <span className="project-status-pill project-status-idle">
            {idleCount} Idle
          </span>
        )}
      </div>

      <div className="project-card-footer">
        <span className="project-agent-count">{agents.length} agents</span>
        <span className="project-card-arrow">→</span>
      </div>
    </article>
  );
};
