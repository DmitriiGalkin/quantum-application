import { hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App.tsx';
import 'normalize.css';
import { AuthProvider } from './providers/AuthProvider.tsx';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from './theme/theme';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ru } from 'date-fns/locale';

const queryClient = new QueryClient();

hydrateRoot(
  document.getElementById('root') as HTMLElement,
  // <StrictMode>
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ru}>
          <AuthProvider>
            <App />
          </AuthProvider>
        </LocalizationProvider>
      </ThemeProvider>
    </BrowserRouter>
  </QueryClientProvider>,
  // </StrictMode>,
);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(error => {
      console.error('Service Worker registration failed:', error);
    });
  });
}
