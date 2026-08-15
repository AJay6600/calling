import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ConfigProvider, App as AntdApp } from 'antd';
import { ApolloProvider } from '@apollo/client/react';
import { App } from './app/app';
import { AppOidcProvider } from './component';
import { apolloClient } from './lib/apolloClient';
import 'antd/dist/reset.css';
import './styles.css';
import getAntdThemeConfig from './utils/antd-theme';
import { BrowserRouter } from 'react-router-dom';

const rootElement = document.getElementById('root');

if (rootElement === null) {
  throw new Error('Root element not found');
}

/**
 * Read once at startup - reflects whichever mode (.dark class present or
 * not) is active when the app first mounts. See antd-theme.ts for details
 * on why this isn't re-read reactively yet.
 */
const rootStyles = getComputedStyle(document.documentElement);

createRoot(rootElement).render(
  <StrictMode>
    <ApolloProvider client={apolloClient}>
      <BrowserRouter>
        <ConfigProvider theme={getAntdThemeConfig(rootStyles)}>
          <AppOidcProvider>
            <AntdApp>
              <App />
            </AntdApp>
          </AppOidcProvider>
        </ConfigProvider>
      </BrowserRouter>
    </ApolloProvider>
  </StrictMode>,
);
