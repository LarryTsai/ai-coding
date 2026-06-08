import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWorkItemById, useAgentRuns } from '../hooks/useApi';
import { LoadingSpinner, ErrorMessage, ProgressBar } from '../components/Common';
import { StatusBadge } from '../components/StatusBadge';
import './DetailPage.css';

export const WorkItemDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: workItem, loading: workItemLoading, error: workItemError } = useWorkItemById(id || '');
  const { data: runs, loading: runsLoading, error: runsError } = useAgentRuns({
    workItemId: id,
  });

  const isLoading = workItemLoading || runsLoading;
  const hasError = workItemError || runsError;

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="detail-page">
      <header className="detail-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <h1>Work Item Details</h1>
      </header>

      <main className="detail-content">
        {isLoading && (
          <div className="loading-container">
            <LoadingSpinner />
            <p>Loading work item details...</p>
          </div>
        )}

        {hasError && (
          <div>
            {workItemError && <ErrorMessage error={workItemError} />}
            {runsError && <ErrorMessage error={runsError} />}
          </div>
        )}

        {!isLoading && workItem && (
          <>
            <section className="detail-section">
              <h2>{workItem.title}</h2>
              <div className="detail-grid">
                <div className="detail-item">
                  <label>ID</label>
                  <p>{workItem.id}</p>
                </div>
                <div className="detail-item">
                  <label>Status</label>
                  <p>
                    <StatusBadge status={workItem.status} type="workitem" />
                  </p>
                </div>
                <div className="detail-item">
                  <label>Stage</label>
                  <p>
                    <StatusBadge status={workItem.stage} type="stage" />
                  </p>
                </div>
                <div className="detail-item">
                  <label>Priority</label>
                  <p>{workItem.priority}</p>
                </div>
                <div className="detail-item">
                  <label>Progress</label>
                  <p>
                    <ProgressBar progress={workItem.progress} />
                    <span style={{ marginLeft: '0.5rem' }}>{workItem.progress}%</span>
                  </p>
                </div>
                <div className="detail-item">
                  <label>Assigned Agent</label>
                  <p>{workItem.assignedAgentId || 'Unassigned'}</p>
                </div>
                <div className="detail-item">
                  <label>Created</label>
                  <p>{formatDate(workItem.createdAt)}</p>
                </div>
                <div className="detail-item">
                  <label>Updated</label>
                  <p>{formatDate(workItem.updatedAt)}</p>
                </div>
              </div>
            </section>

            {workItem.description && (
              <section className="detail-section">
                <h2>Description</h2>
                <div className="summary-box">{workItem.description}</div>
              </section>
            )}

            <section className="detail-section">
              <h2>Agent Runs</h2>
              {runs && runs.length > 0 ? (
                <div className="runs-list">
                  {runs.map(run => (
                    <div
                      key={run.id}
                      className="run-list-item"
                      onClick={() => navigate(`/runs/${run.id}`)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="run-list-info">
                        <p className="run-list-id">Run ID: {run.id}</p>
                        <p className="run-list-agent">Agent: {run.agentId}</p>
                        <p className="run-list-status">
                          <StatusBadge status={run.status} type="run" />
                        </p>
                      </div>
                      <div className="run-list-time">
                        <p className="run-list-started">{formatDate(run.startedAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="empty-state">No runs for this work item</p>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
};
