import React, { useRef, useState } from 'react';
import { useMsal } from '@azure/msal-react';
import { formatTimeLabel } from '../../utils/dashboardFormatters';
import { statusCssVars } from '../../utils/dashboardPresentation';
import { CurrentUser } from '../../types';
import { authService } from '../../api/authService';
import { isAadConfigured } from '../../auth/aadConfig';

export type ViewMode = 'agents' | 'projects';

interface DashboardTopbarProps {
  runningCount: number;
  waitingReviewCount: number;
  idleCount: number;
  tickNow: number;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  currentUser?: CurrentUser | null;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export const DashboardTopbar: React.FC<DashboardTopbarProps> = ({
  runningCount,
  waitingReviewCount,
  idleCount,
  tickNow,
  isDarkMode,
  onToggleDarkMode,
  currentUser,
  viewMode,
  onViewModeChange,
}) => {
  const { instance, accounts } = useMsal();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const displayName =
    currentUser?.displayName
    ?? currentUser?.email
    ?? 'Anonymous';
  const email = currentUser?.email;
  const isBackendAuthenticated = currentUser?.isAuthenticated === true;
  const hasAadAccount = accounts.length > 0;
  const canLogout = isAadConfigured && (isBackendAuthenticated || hasAadAccount);
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('');

  const handleLogout = () => {
    authService.logout();
    sessionStorage.removeItem('aad_redirect_attempted');
    sessionStorage.removeItem('aad_acquire_redirect_attempted');
    sessionStorage.removeItem('auth_me_login_redirected');
    if (isAadConfigured) {
      instance.logoutRedirect({ postLogoutRedirectUri: window.location.origin });
    } else {
      window.location.reload();
    }
  };

  // Close menu when clicking outside
  const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    if (!menuRef.current?.contains(e.relatedTarget as Node)) {
      setMenuOpen(false);
    }
  };

  return (
    <header className="board-topbar">
      <div className="brand-block">
        <div className="brand-icon">AI</div>
        <div>
          <p className="brand-title">AI-Coding Dashboard</p>
          <p className="brand-subtitle">AI agent execution monitor</p>
        </div>
      </div>

      <nav className="topbar-nav" aria-label="View mode">
        <button
          type="button"
          className={`topbar-nav-btn ${viewMode === 'agents' ? 'is-active' : ''}`}
          onClick={() => onViewModeChange('agents')}
        >
          By Agent
        </button>
        <button
          type="button"
          className={`topbar-nav-btn ${viewMode === 'projects' ? 'is-active' : ''}`}
          onClick={() => onViewModeChange('projects')}
        >
          By Project
        </button>
      </nav>

      <div className="topbar-right">
        <div className="runtime-status-group">
          <span className="runtime-text" style={statusCssVars('Running')}>
            {runningCount} running
          </span>
          {waitingReviewCount > 0 && (
            <span className="runtime-text" style={statusCssVars('WaitingReview')}>
              {waitingReviewCount} waiting
            </span>
          )}
          {idleCount > 0 && (
            <span className="runtime-text" style={statusCssVars('Idle')}>
              {idleCount} idle
            </span>
          )}
          <span className="runtime-clock">at {formatTimeLabel(tickNow)}</span>
        </div>
        <button type="button" className="dark-btn" onClick={onToggleDarkMode}>
          {isDarkMode ? 'Light' : 'Dark'}
        </button>
        <div className="profile-menu-wrap" ref={menuRef} onBlur={handleBlur}>
          <button
            type="button"
            className="profile-btn"
            onClick={() => setMenuOpen(o => !o)}
            aria-haspopup="true"
            aria-expanded={menuOpen}
          >
            <span className="profile-avatar">{initials}</span>
            <span>{displayName}</span>
            <span className="profile-chevron">{menuOpen ? "▲" : "▼"}</span>
          </button>
          {menuOpen && (
            <div className="profile-dropdown">
              <div className="profile-dropdown-info">
                <p className="profile-dropdown-name">{displayName}</p>
                {email && (
                  <p className="profile-dropdown-email">{email}</p>
                )}
              </div>
              <hr className="profile-dropdown-divider" />
              {canLogout && (
                <button
                  type="button"
                  className="profile-dropdown-item profile-dropdown-logout"
                  onClick={handleLogout}
                >
                  登出
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
