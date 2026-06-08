import React, { useEffect, useMemo, useState } from 'react';
import { AgentDetailModal } from '../components/AgentDetailModal';
import { AgentBoardGrid } from '../components/dashboard/AgentBoardGrid';
import { AgentScope, AgentScopeTabs } from '../components/dashboard/AgentScopeTabs';
import { DashboardTopbar, ViewMode } from '../components/dashboard/DashboardTopbar';
import { ProjectBoardGrid, ProjectGroup } from '../components/dashboard/ProjectBoardGrid';
import { ProjectDrilldownHeader } from '../components/dashboard/ProjectDrilldownHeader';
import { ErrorMessage, LoadingSpinner } from '../components/Common';
import { useAgents, useWorkItems, useCurrentUser, useAgentRuns } from '../hooks/useApi';
import { Agent, WorkItem } from '../types';
import { phaseNameToPhaseIndex } from '../utils/dashboardPresentation';
import { normalizeEditStatus } from '../utils/editStatus';
import './DashboardPage.css';

export const DashboardPage: React.FC = () => {
  const { data: agents, loading: agentsLoading, error: agentsError } = useAgents();
  const { data: workItems, loading: workItemsLoading, error: workItemsError } = useWorkItems();
  const { data: agentRuns } = useAgentRuns();
  const { data: currentUser } = useCurrentUser();
  const [scope, setScope] = useState<AgentScope>('mine');
  const [viewMode, setViewMode] = useState<ViewMode>('agents');
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [tickNow, setTickNow] = useState<number>(() => Date.now());
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() =>
    typeof window !== 'undefined' && localStorage.getItem('dashboard-theme') === 'dark'
  );

  useEffect(() => {
    const timer = window.setInterval(() => setTickNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!selectedAgent) return;

    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelectedAgent(null);
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selectedAgent]);

  const toggleDarkMode = () => {
    const next = !isDarkMode;
    setIsDarkMode(next);
    localStorage.setItem('dashboard-theme', next ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light');
  };

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    setSelectedProject(null);
    // 'completed' tab doesn't exist in project view — reset to 'all'
    if (mode === 'projects' && scope === 'completed') setScope('all');
  };

  const isLoading = agentsLoading || workItemsLoading;
  const hasError = agentsError || workItemsError;

  const workItemMap = useMemo(
    () => new Map((workItems ?? []).map(item => [item.id, item])),
    [workItems]
  );

  const activeAgents = useMemo(
    () => (agents ?? []).filter(agent => agent.status !== 'Completed'),
    [agents]
  );

  const completedAgents = useMemo(
    () => (agents ?? []).filter(agent => agent.status === 'Completed'),
    [agents]
  );

  const idleAgents = useMemo(
    () => activeAgents.filter(agent =>
      agent.status === 'Idle' || agent.status === 'Offline' || agent.status === 'Failed'
    ),
    [activeAgents]
  );

  const myAgents = useMemo(() => {
    if (!currentUser?.email) return [];
    const currentUserEmail = currentUser.email.trim().toLowerCase();
    return activeAgents.filter(agent => agent.ownerEmail?.trim().toLowerCase() === currentUserEmail);
  }, [activeAgents, currentUser]);

  const visibleAgents = useMemo(() => {
    if (scope === 'mine') return myAgents;
    if (scope === 'completed') return completedAgents;
    return activeAgents;
  }, [activeAgents, myAgents, completedAgents, scope]);

  const projectKey = (agent: Agent) => agent.teamProject ?? 'Unassigned';

  const myProjectCount = useMemo(
    () => new Set(myAgents.map(projectKey)).size,
    [myAgents]
  );

  const allProjectCount = useMemo(
    () => new Set(activeAgents.map(projectKey)).size,
    [activeAgents]
  );

  const projectScopedAgents = useMemo(
    () => scope === 'mine' ? myAgents : activeAgents,
    [scope, myAgents, activeAgents]
  );

  const projectGroups = useMemo<ProjectGroup[]>(() => {
    const map = new Map<string, Agent[]>();
    projectScopedAgents.forEach(agent => {
      const key = projectKey(agent);
      const list = map.get(key) ?? [];
      list.push(agent);
      map.set(key, list);
    });
    return Array.from(map.entries())
      .map(([name, agentList]) => ({ name, agents: agentList }))
      .sort((a, b) => {
        if (a.name === 'Unassigned') return 1;
        if (b.name === 'Unassigned') return -1;
        return a.name.localeCompare(b.name);
      });
  }, [projectScopedAgents]);

  const projectAgents = useMemo(
    () => selectedProject
      ? projectScopedAgents.filter(a => projectKey(a) === selectedProject)
      : [],
    [projectScopedAgents, selectedProject]
  );

  const runningCount = useMemo(
    () => (agents ?? []).filter(agent => agent.status === 'Running').length,
    [agents]
  );
  const waitingReviewCount = useMemo(
    () => (agents ?? []).filter(agent => agent.status === 'WaitingReview').length,
    [agents]
  );

  const visibleRunningCount = useMemo(
    () => visibleAgents.filter(a => a.status === 'Running').length,
    [visibleAgents]
  );
  const visibleWaitingCount = useMemo(
    () => visibleAgents.filter(a => a.status === 'WaitingReview').length,
    [visibleAgents]
  );
  const visibleFailedCount = useMemo(
    () => visibleAgents.filter(a => a.status === 'Failed').length,
    [visibleAgents]
  );
  const visibleIdleCount = useMemo(
    () => visibleAgents.filter(a => a.status === 'Idle' || a.status === 'Offline').length,
    [visibleAgents]
  );

  function getWorkItemForAgent(agent: Agent): WorkItem | undefined {
    if (agent.currentWorkItemId) return workItemMap.get(agent.currentWorkItemId);
    return (workItems ?? []).find(item => item.assignedAgentId === agent.id);
  }

  function needsDecisionForAgent(agent: Agent): boolean {
    return (agentRuns ?? []).some(run =>
      run.agentId === agent.id &&
      run.phaseSteps.some(step => normalizeEditStatus(step.editStatus) === 'waiting')
    );
  }

  function getAttentionPhaseIndexForAgent(agent: Agent): number | null {
    const run = (agentRuns ?? []).find(candidate => candidate.agentId === agent.id);
    const waitingDecisionStep = run?.phaseSteps.find(step =>
      normalizeEditStatus(step.editStatus) === 'waiting'
    );
    if (waitingDecisionStep) return phaseNameToPhaseIndex(waitingDecisionStep.phase);

    const editablePhaseIndexes = run?.phaseSteps
      .filter(step => normalizeEditStatus(step.editStatus) === 'resolved')
      .map(step => phaseNameToPhaseIndex(step.phase))
      .filter((index): index is number => index !== null) ?? [];

    return editablePhaseIndexes.length > 0 ? Math.max(...editablePhaseIndexes) : null;
  }

  return (
    <div className="agent-board-page" data-theme={isDarkMode ? 'dark' : 'light'}>
      <DashboardTopbar
        runningCount={runningCount}
        waitingReviewCount={waitingReviewCount}
        idleCount={idleAgents.length}
        tickNow={tickNow}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
        currentUser={currentUser}
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
      />

      <main className="board-main">
        {isLoading && (
          <div className="board-loading">
            <LoadingSpinner />
            <p>Loading dashboard...</p>
          </div>
        )}

        {hasError && (
          <div className="board-errors">
            {agentsError && <ErrorMessage error={agentsError} />}
            {workItemsError && <ErrorMessage error={workItemsError} />}
          </div>
        )}

        {!isLoading && !hasError && (
          <section className="board-panel">
            {/* By Agent view — existing layout unchanged */}
            {viewMode === 'agents' && (
              <>
                <AgentScopeTabs
                  scope={scope}
                  activeCount={visibleRunningCount + visibleWaitingCount}
                  mineCount={myAgents.length}
                  totalCount={activeAgents.length}
                  completedCount={completedAgents.length}
                  runningCount={visibleRunningCount}
                  waitingReviewCount={visibleWaitingCount}
                  failedCount={visibleFailedCount}
                  idleCount={visibleIdleCount}
                  onScopeChange={setScope}
                />
                <AgentBoardGrid
                  agents={visibleAgents}
                  tickNow={tickNow}
                  getWorkItemForAgent={getWorkItemForAgent}
                  getAttentionPhaseIndexForAgent={getAttentionPhaseIndexForAgent}
                  needsDecisionForAgent={needsDecisionForAgent}
                  onSelectAgent={setSelectedAgent}
                />
              </>
            )}

            {/* Project view scope selector — Mine / All */}
            {viewMode === 'projects' && (
              <div className="project-scope-row">
                <button
                  type="button"
                  className={`tab-btn ${scope === 'mine' ? 'is-active' : ''}`}
                  onClick={() => { setScope('mine'); setSelectedProject(null); }}
                >
                  My Projects
                  <span className="tab-count">{myProjectCount}</span>
                </button>
                <button
                  type="button"
                  className={`tab-btn ${scope === 'all' ? 'is-active' : ''}`}
                  onClick={() => { setScope('all'); setSelectedProject(null); }}
                >
                  All Projects
                  <span className="tab-count">{allProjectCount}</span>
                </button>
              </div>
            )}

            {/* By Project view — project cards */}
            {viewMode === 'projects' && !selectedProject && (
              <ProjectBoardGrid
                projectGroups={projectGroups}
                selectedProject={selectedProject}
                tickNow={tickNow}
                onSelectProject={setSelectedProject}
              />
            )}

            {/* By Project view — drilled into a project */}
            {viewMode === 'projects' && selectedProject && (
              <>
                <ProjectDrilldownHeader
                  name={selectedProject}
                  agents={projectAgents}
                  tickNow={tickNow}
                  onBack={() => setSelectedProject(null)}
                />
                <AgentBoardGrid
                  agents={projectAgents}
                  tickNow={tickNow}
                  getWorkItemForAgent={getWorkItemForAgent}
                  getAttentionPhaseIndexForAgent={getAttentionPhaseIndexForAgent}
                  needsDecisionForAgent={needsDecisionForAgent}
                  onSelectAgent={setSelectedAgent}
                />
              </>
            )}
          </section>
        )}
      </main>

      <footer className="board-footer">
        <span className="board-footer-version">
          v{import.meta.env.VITE_APP_VERSION ?? 'dev'}
        </span>
      </footer>

      {selectedAgent && (
        <AgentDetailModal
          agent={selectedAgent}
          workItem={getWorkItemForAgent(selectedAgent)}
          currentUser={currentUser}
          onClose={() => setSelectedAgent(null)}
        />
      )}
    </div>
  );
};
