import { LogLevel, PublicClientApplication } from '@azure/msal-browser';

const tenantId = import.meta.env.VITE_AAD_TENANT_ID as string | undefined;
const clientId = import.meta.env.VITE_AAD_CLIENT_ID as string | undefined;
const apiClientId = import.meta.env.VITE_AAD_API_CLIENT_ID as string | undefined;
const configuredScopes = import.meta.env.VITE_AAD_SCOPES as string | undefined;

const useAadFlag = import.meta.env.VITE_USE_AAD as string | undefined;
// VITE_USE_AAD=false 明確關閉；未設定或其他值則以 credentials 有無為準
export const isAadConfigured =
  useAadFlag === 'false' ? false : Boolean(tenantId && clientId);

export const aadApiScopes = configuredScopes
  ? configuredScopes.split(',').map(scope => scope.trim()).filter(Boolean)
  : [`api://${apiClientId || clientId}/access_as_user`];

export const aadLoginRequest = {
  scopes: aadApiScopes,
};

export const aadMsalInstance = isAadConfigured
  ? new PublicClientApplication({
      auth: {
        clientId: clientId!,
        authority: `https://login.microsoftonline.com/${tenantId}`,
        redirectUri: import.meta.env.VITE_AAD_REDIRECT_URI || window.location.origin,
        postLogoutRedirectUri: window.location.origin,
      },
      cache: {
        cacheLocation: 'localStorage',
      },
      system: {
        loggerOptions: {
          logLevel: LogLevel.Warning,
          loggerCallback: (_level, message, containsPii) => {
            if (!containsPii) console.debug(message);
          },
        },
      },
    })
  : null;
