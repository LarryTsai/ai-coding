import React from 'react';
import type { Agent, WorkItem } from '../../types';
import { AgentBoardCard } from './AgentBoardCard';

interface AgentBoardGridProps {
  agents: Agent[];
  tickNow: number;
  getWorkItemForAgent: (agent: Agent) => WorkItem | undefined;
  getAttentionPhaseIndexForAgent?: (agent: Agent) => number | null;
  needsDecisionForAgent?: (agent: Agent) => boolean;
  onSelectAgent: (agent: Agent) => void;
}

export const AgentBoardGrid: React.FC<AgentBoardGridProps> = ({
  agents,
  tickNow,
  getWorkItemForAgent,
  getAttentionPhaseIndexForAgent,
  needsDecisionForAgent,
  onSelectAgent,
}) => {
  if (agents.length === 0) {
    return <p className="board-empty">No agents to display.</p>;
  }

  const attentionCount = agents.filter(a => needsDecisionForAgent?.(a) ?? false).length;

  return (
    <div className="agent-board-section">
      <div className="agent-grid-summary">
        <span className="project-grid-stat">{agents.length} agents</span>
        {attentionCount > 0 && (
          <>
            <span className="project-grid-divider">·</span>
            <span className="project-grid-stat project-grid-attention">
              {attentionCount} need attention
            </span>
          </>
        )}
      </div>
    <div className={`agent-boards ${agents.length === 1 ? 'is-single' : ''}`}>
      {agents.map(agent => (
        <AgentBoardCard
          key={agent.id}
          agent={agent}
          workItem={getWorkItemForAgent(agent)}
          tickNow={tickNow}
          attentionPhaseIndex={getAttentionPhaseIndexForAgent?.(agent) ?? null}
          needsDecision={needsDecisionForAgent?.(agent) ?? false}
          onSelect={onSelectAgent}
        />
      ))}
    </div>
    </div>
  );
};
