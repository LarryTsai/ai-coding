import React, { useEffect, useState } from 'react';
import { InteractionRequiredAuthError, InteractionStatus } from '@azure/msal-browser';
import { AuthenticatedTemplate, UnauthenticatedTemplate, useMsal } from '@azure/msal-react';
import { aadLoginRequest } from './aadConfig';
import { authService } from '../api/authService';
import { resetRedirectFlag } from '../api/interceptors';

interface Props {
  children: React.ReactNode;
}

export const AadAuthGate: React.FC<Props> = ({ children }) => {
  const { instance, accounts, inProgress } = useMsal();
  const [tokenReady, setTokenReady] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);

  // When the API reports unauthorized, redirect to login once and avoid retry loops.
  useEffect(() => {
    const handleUnauthorized = () => {
      setTokenReady(false);
      const account = accounts[0];

      // Redirect once per tab session.
      const redirectedFlag = sessionStorage.getItem('aad_redirect_attempted');
      if (redirectedFlag) {
        setTokenError('登入已失效，請重新登入。');
        return;
      }

      sessionStorage.setItem('aad_redirect_attempted', '1');
      if (account) {
        instance.acquireTokenRedirect({ ...aadLoginRequest, account });
      } else {
        instance.loginRedirect(aadLoginRequest);
      }
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, [instance, accounts]);

  useEffect(() => {
    const account = accounts[0];
    if (!account || inProgress !== InteractionStatus.None) return;

    instance.setActiveAccount(account);
    setTokenError(null);

    instance.acquireTokenSilent({ ...aadLoginRequest, account })
      .then(result => {
        authService.setToken(result.accessToken);
        sessionStorage.removeItem('aad_redirect_attempted');
        resetRedirectFlag();
        setTokenReady(true);
      })
      .catch(error => {
        if (error instanceof InteractionRequiredAuthError) {
          // Guard against redirect loop: if we already redirected for token acquisition
          // and still get InteractionRequired, the scope is not consented — show error.
          const acquireRedirectFlag = sessionStorage.getItem('aad_acquire_redirect_attempted');
          if (acquireRedirectFlag) {
            sessionStorage.removeItem('aad_acquire_redirect_attempted');
            setTokenError(
              'AAD Token 取得失敗。請確認 api_access scope 已在 Azure AD 完成 Admin Consent，或聯絡系統管理員。'
            );
            return;
          }
          sessionStorage.setItem('aad_acquire_redirect_attempted', '1');
          instance.acquireTokenRedirect({ ...aadLoginRequest, account });
          return;
        }

        setTokenReady(false);
        setTokenError(error instanceof Error ? error.message : 'Acquire token failed');
      });
  }, [accounts, inProgress, instance]);

  const login = () => {
    instance.loginRedirect(aadLoginRequest);
  };

  return (
    <>
      <AuthenticatedTemplate>
        {tokenReady ? children : (
          <div className="aad-auth-page">
            <div className="aad-auth-panel">
              <p className="aad-auth-title">正在取得 AAD Token</p>
              <p className="aad-auth-text">{tokenError ?? '請稍候，正在準備 API 存取權限。'}</p>
              {tokenError && <button type="button" onClick={login}>重新登入</button>}
            </div>
          </div>
        )}
      </AuthenticatedTemplate>
      <UnauthenticatedTemplate>
        <div className="aad-auth-page">
          <div className="aad-auth-panel">
            <p className="aad-auth-kicker">AI-Coding Dashboard</p>
            <h1>使用 Azure AD 登入</h1>
            <p className="aad-auth-text">請用公司帳號登入後，再存取 Agent Dashboard API。</p>
            <button type="button" onClick={login}>Sign in with Azure AD</button>
          </div>
        </div>
      </UnauthenticatedTemplate>
    </>
  );
};
