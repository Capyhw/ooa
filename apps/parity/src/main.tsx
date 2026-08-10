import '@ooa/tokens/theme.css';
import 'antd/dist/reset.css';
import '@ooa/components';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app';
import './styles.css';

const root = document.querySelector('#root');

if (root) {
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
