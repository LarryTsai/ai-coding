import React from 'react';
import type { Agent, WorkItem } from '../../types';
import { formatElapsed, getLiveProgress } from '../../utils/dashboardFormatters';
import {
  PHASES,
  PHASE_META,
  STATUS_META,
  agentCssVars,
  getAgentPresentation,
  getPhaseMeta,
  phaseCssVars,
  stageToPhaseIndex,
  statusCssVars,
  stepCssVars,
} from '../../utils/dashboardPresentation';

interface AgentBoardCardProps {
  agent: Agent;
  workItem?: WorkItem;
  tickNow: number;
  attentionPhaseIndex?: number | null;
  needsDecision?: boolean;
  onSelect: (agent: Agent) => void;
}

export const AgentBoardCard: React.FC<AgentBoardCardProps> = ({
  agent,
  workItem,
  tickNow,
  attentionPhaseIndex = null,
  needsDecision = false,
  onSelect,
}) => {
  const activePhaseIndex = attentionPhaseIndex ?? stageToPhaseIndex(workItem?.stage);
  const activePhaseMeta = getPhaseMeta(activePhaseIndex);
  const liveProgress = getLiveProgress(workItem, agent.status, tickNow);
  const statusMeta = STATUS_META[agent.status];
  const agentMeta = getAgentPresentation(agent);

  return (
    <article
      className={`agent-board-card agent-card-clickable ${needsDecision ? 'needs-decision' : ''}`}
      style={phaseCssVars(activePhaseMeta)}
      onClick={() => onSelect(agent)}
    >
      {needsDecision && (
        <div className="decision-alert-pill">
          Response needed
        </div>
      )}

      <div className="card-head">
        <div className="person-chip">
          <span className="person-avatar" style={agentCssVars(agent)}>
            {agentMeta.initials}
          </span>
          <div>
            <p className="person-name">{agent.name}</p>
            {agent.teamProject
              ? <p className="person-id agent-project-tag">📁 {agent.teamProject}</p>
              : <p className="person-id">{agent.id}</p>
            }
          </div>
        </div>
        <span
          className={`status-pill status-${agent.status.toLowerCase()}`}
          style={statusCssVars(agent.status)}
        >
          {statusMeta.icon && <span className="status-icon">{statusMeta.icon}</span>}
          {statusMeta.label}
        </span>
      </div>

      <p className="workitem-title">{workItem?.title ?? 'No assigned work item'}</p>

      <div className="phase-timeline">
        <div className="timeline-steps">
          {PHASES.map((phase, index) => {
            const phaseMeta = PHASE_META[phase];
            const state =
              index < activePhaseIndex ? 'done' : index === activePhaseIndex ? 'active' : 'idle';
            const connectorDone = index < activePhaseIndex;

            return (
              <React.Fragment key={phase}>
                <div
                  className={`timeline-step timeline-${state}`}
                  title={phase}
                  style={stepCssVars(phaseMeta)}
                >
                  <div className="step-circle">
                    {state === 'done' ? 'OK' : state === 'active' ? phaseMeta.icon : index + 1}
                  </div>
                </div>
                {index < PHASES.length - 1 && (
                  <div
                    className={`timeline-connector ${connectorDone ? 'is-complete' : ''}`}
                    style={stepCssVars(phaseMeta)}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      <div className="card-progress">
        <div className="progress-heading">
          <p className="progress-stage">
            <span className="progress-stage-icon">{activePhaseMeta.icon}</span>
            {activePhaseMeta.label}
          </p>
          <p className="progress-meta">
            {liveProgress}% at {formatElapsed(workItem?.updatedAt ?? agent.lastActiveAt, tickNow)}
          </p>
        </div>
        <div className="progress-bar-container">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${liveProgress}%` }} />
          </div>
        </div>
        <div className="card-foot-row">
          <p className="progress-total">total {liveProgress}%</p>
          <p className="card-foot-id">{agent.id}</p>
        </div>
      </div>
    </article>
  );
};
