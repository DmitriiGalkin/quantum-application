import { hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Routers from './Routers.tsx';
import './application.css';
import 'normalize.css';
import { AuthProvider } from './providers/AuthProvider.tsx';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from './theme/theme';

const queryClient = new QueryClient();

hydrateRoot(
  globalThis.document.getElementById('root') as HTMLElement,
  // <StrictMode>
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <AuthProvider>
          <Routers />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </QueryClientProvider>,
  // </StrictMode>,
);

if ('serviceWorker' in navigator) {
  globalThis.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(error => {
      console.error('Service Worker registration failed:', error);
    });
  });
}
