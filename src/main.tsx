import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import './index.css';
import App from './App.tsx';

// Register PWA Service Worker
registerSW({
  immediate: true,
  onNeedRefresh() {
    console.info('[PWA] New application version available.');
  },
  onOfflineReady() {
    console.info('[PWA] Application shell cached. Ready for offline operation.');
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
