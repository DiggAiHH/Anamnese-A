/// <reference lib="dom" />
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './presentation/App';

const renderFatalError = (error: unknown): void => {
  const rootElement = document.getElementById('root');
  if (!rootElement) return;

  const message = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : '';

  rootElement.innerHTML = `
    <div style="font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; padding: 24px;">
      <h1 style="color:#b91c1c; font-size:20px;">Es ist ein Fehler aufgetreten</h1>
      <p style="color:#111827;">${message}</p>
      <pre style="white-space: pre-wrap; color:#6b7280;">${stack ?? ''}</pre>
    </div>
  `;
};

window.addEventListener('error', (event) => {
  renderFatalError(event.error ?? event.message);
});

window.addEventListener('unhandledrejection', (event) => {
  renderFatalError(event.reason);
});

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

const root = createRoot(rootElement);
try {
  root.render(<App />);
  if (typeof window !== 'undefined') {
    window.__APP_READY__ = true;
  }
} catch (error) {
  renderFatalError(error);
}
