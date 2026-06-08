import React from 'react';
import ReactDOM from 'react-dom/client';
import { MsalProvider } from '@azure/msal-react';
import App from './App';
import { AadAuthGate } from './auth/AadAuthGate';
import { aadMsalInstance, isAadConfigured } from './auth/aadConfig';
import './auth/AadAuthGate.css';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root')!);

const renderApp = async () => {
  if (isAadConfigured && aadMsalInstance) {
    await aadMsalInstance.initialize();

    root.render(
      <React.StrictMode>
        <MsalProvider instance={aadMsalInstance}>
          <AadAuthGate>
            <App />
          </AadAuthGate>
        </MsalProvider>
      </React.StrictMode>
    );
    return;
  }

  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
};

renderApp();
