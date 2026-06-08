import React from 'react';
import type { Agent } from '../../types';
import { getAgentPresentation, agentCssVars } from '../../utils/dashboardPresentation';
import { formatElapsed } from '../../utils/dashboardFormatters';

interface ProjectDrilldownHeaderProps {
  name: string;
  agents: Agent[];
  tickNow: number;
  onBack: () => void;
}

const AVATAR_SHOW_MAX = 6;

export const ProjectDrilldownHeader: React.FC<ProjectDrilldownHeaderProps> = ({
  name,
  agents,
  tickNow,
  onBack,
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
    <div className="project-drilldown-wrap">
      <button type="button" className="project-back-btn" onClick={onBack}>
        ← All Projects
      </button>

      <div className={`project-drilldown-banner ${accentClass} ${needsAttention ? 'project-needs-attention' : ''}`}>
        {needsAttention && (
          <div className="project-alert-pill">Response needed</div>
        )}

        <div className="drilldown-banner-top">
          <div className="drilldown-title-row">
            <span className="project-card-icon">📁</span>
            <h2 className="drilldown-project-name">{name}</h2>
          </div>
          <span className="drilldown-agent-total">{agents.length} agents</span>
        </div>

        <div className="drilldown-banner-bottom">
          <div className="drilldown-left">
            <div className="project-avatar-strip">
              {visibleAvatars.map(agent => {
                const meta = getAgentPresentation(agent);
                return (
                  <span
                    key={agent.id}
                    className="project-avatar drilldown-avatar"
                    style={agentCssVars(agent)}
                    title={agent.name}
                  >
                    {meta.initials}
                  </span>
                );
              })}
              {overflowCount > 0 && (
                <span className="project-avatar-overflow drilldown-avatar">+{overflowCount}</span>
              )}
            </div>

            {lastActiveAt > 0 && (
              <span className="project-last-active">
                active {formatElapsed(new Date(lastActiveAt).toISOString(), tickNow)} ago
              </span>
            )}
          </div>

          <div className="project-status-row drilldown-status-row">
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
        </div>
      </div>
    </div>
  );
};
