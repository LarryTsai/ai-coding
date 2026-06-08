import React from 'react';
import type { Agent } from '../../types';
import { ProjectBoardCard } from './ProjectBoardCard';

export interface ProjectGroup {
  name: string;
  agents: Agent[];
}

interface ProjectBoardGridProps {
  projectGroups: ProjectGroup[];
  selectedProject: string | null;
  tickNow: number;
  onSelectProject: (name: string) => void;
}

export const ProjectBoardGrid: React.FC<ProjectBoardGridProps> = ({
  projectGroups,
  selectedProject,
  tickNow,
  onSelectProject,
}) => {
  if (projectGroups.length === 0) {
    return <p className="board-empty">No projects to display.</p>;
  }

  const totalAgents = projectGroups.reduce((sum, g) => sum + g.agents.length, 0);
  const attentionCount = projectGroups.reduce(
    (sum, g) => sum + g.agents.filter(a => a.status === 'WaitingReview').length,
    0
  );

  return (
    <div className="project-board-section">
      <div className="project-grid-summary">
        <span className="project-grid-stat">{projectGroups.length} projects</span>
        <span className="project-grid-divider">·</span>
        <span className="project-grid-stat">{totalAgents} agents</span>
        {attentionCount > 0 && (
          <>
            <span className="project-grid-divider">·</span>
            <span className="project-grid-stat project-grid-attention">
              {attentionCount} need attention
            </span>
          </>
        )}
      </div>

      <div className="project-boards">
        {projectGroups.map(group => (
          <ProjectBoardCard
            key={group.name}
            name={group.name}
            agents={group.agents}
            isSelected={selectedProject === group.name}
            tickNow={tickNow}
            onSelect={() => onSelectProject(group.name)}
          />
        ))}
      </div>
    </div>
  );
};
