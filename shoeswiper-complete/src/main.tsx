import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { registerServiceWorker } from './lib/pwaUtils';
import App from './App';
import './index.css';

// Register service worker for PWA support
if ('serviceWorker' in navigator) {
  // Register after the page loads to not block initial render
  window.addEventListener('load', () => {
    registerServiceWorker().catch((error) => {
      // Only log in development
      if (import.meta.env.DEV) {
        console.error('[PWA] Service worker registration failed:', error);
      }
    });
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
