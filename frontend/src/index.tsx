import './api/http';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { HelmetProvider } from 'react-helmet-async';
import { config } from '@fortawesome/fontawesome-svg-core';
import { store } from './store/store';
import './styles/bootstrap.scss';
import '@fortawesome/fontawesome-svg-core/styles.css';
import './index.css';
import App from './App';
import { registerAppServiceWorker } from './pwa/serviceWorkerRegistration';

config.autoAddCss = false;

registerAppServiceWorker();

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

createRoot(rootElement).render(
  <StrictMode>
    <HelmetProvider>
      <Provider store={store}>
        <App />
      </Provider>
    </HelmetProvider>
  </StrictMode>
);
