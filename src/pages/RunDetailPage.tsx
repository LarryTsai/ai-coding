import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAgentRunById } from '../hooks/useApi';
import { LoadingSpinner, ErrorMessage } from '../components/Common';
import { StatusBadge } from '../components/StatusBadge';
import './DetailPage.css';

export const RunDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: run, loading: runLoading, error: runError } = useAgentRunById(id || '');

  const isLoading = runLoading;
  const hasError = runError;

  const formatDateTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getDurationText = (): string => {
    if (!run) return '-';
    if (run.status === 'Running') {
      return 'In progress...';
    }
    if (run.durationSeconds > 0) {
      const hours = Math.floor(run.durationSeconds / 3600);
      const minutes = Math.floor((run.durationSeconds % 3600) / 60);
      const seconds = run.durationSeconds % 60;
      if (hours > 0) {
        return `${hours}h ${minutes}m ${seconds}s`;
      }
      if (minutes > 0) {
        return `${minutes}m ${seconds}s`;
      }
      return `${seconds}s`;
    }
    return '-';
  };

  return (
    <div className="detail-page">
      <header className="detail-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <h1>Agent Run Details</h1>
      </header>

      <main className="detail-content">
        {isLoading && (
          <div className="loading-container">
            <LoadingSpinner />
            <p>Loading run details...</p>
          </div>
        )}

        {hasError && (
          <div>
            {runError && <ErrorMessage error={runError} />}
          </div>
        )}

        {!isLoading && run && (
          <>
            <section className="detail-section">
              <h2>Run Information</h2>
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Run ID</label>
                  <p>{run.id}</p>
                </div>
                <div className="detail-item">
                  <label>Status</label>
                  <p>
                    <StatusBadge status={run.status} type="run" />
                  </p>
                </div>
                <div className="detail-item">
                  <label>Work Item ID</label>
                  <p>{run.workItemId}</p>
                </div>
                <div className="detail-item">
                  <label>Agent ID</label>
                  <p>{run.agentId}</p>
                </div>
                <div className="detail-item">
                  <label>Started At</label>
                  <p>{formatDateTime(run.startedAt)}</p>
                </div>
                <div className="detail-item">
                  <label>Finished At</label>
                  <p>{run.finishedAt ? formatDateTime(run.finishedAt) : 'N/A'}</p>
                </div>
                <div className="detail-item">
                  <label>Duration</label>
                  <p>{getDurationText()}</p>
                </div>
                {run.prUrl && (
                  <div className="detail-item">
                    <label>Pull Request</label>
                    <p>
                      <a href={run.prUrl} target="_blank" rel="noopener noreferrer">
                        {run.prUrl}
                      </a>
                    </p>
                  </div>
                )}
              </div>
            </section>

            {run.inputSummary && (
              <section className="detail-section">
                <h2>Input Summary</h2>
                <div className="summary-box">{run.inputSummary}</div>
              </section>
            )}

            {run.outputSummary && (
              <section className="detail-section">
                <h2>Output Summary</h2>
                <div className="summary-box">{run.outputSummary}</div>
              </section>
            )}

            {run.errorMessage && (
              <section className="detail-section">
                <h2>Error Message</h2>
                <div className="error-box">{run.errorMessage}</div>
              </section>
            )}

          </>
        )}
      </main>
    </div>
  );
};
